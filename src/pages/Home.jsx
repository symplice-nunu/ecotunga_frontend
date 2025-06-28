// Home.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Truck, RefreshCcw, Clock, MapPin, CheckCircle, Info, Tag, FileText, XCircle, Plus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/userApi';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { Link } from 'react-router-dom';

// Function to transform waste collection data into activities (moved outside component)
const transformCollectionsToActivities = (collectionsData, t) => {
  if (!Array.isArray(collectionsData) || collectionsData.length === 0) {
    return [];
  }

  return collectionsData.slice(0, 7).map((collection) => {
    const pickupDate = new Date(collection.pickup_date);
    const formattedDate = pickupDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });

    let activityLabel = '';
    let link = false;

    switch (collection.status) {
      case 'approved':
        activityLabel = t('home.recentActivity.wasteCollected', { 
          name: `${collection.name} ${collection.last_name}`
        });
        link = true;
        break;
      case 'pending':
        activityLabel = t('home.recentActivity.pendingCollection', { 
          name: `${collection.name} ${collection.last_name}`,
          location: collection.sector || collection.district
        });
        link = true;
        break;
      case 'denied':
        activityLabel = t('home.recentActivity.collectionDenied', { 
          name: `${collection.name} ${collection.last_name}`,
          reason: collection.admin_notes || 'No reason provided'
        });
        link = false;
        break;
      default:
        activityLabel = t('home.recentActivity.wasteCollected', { 
          name: `${collection.name} ${collection.last_name}`
        });
        link = true;
    }

    return {
      label: activityLabel,
      date: formattedDate,
      link: link,
      collection: collection // Store the full collection data for reference
    };
  });
};

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [nextPickup, setNextPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupLoading, setPickupLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [activities, setActivities] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    users: 0,
    totalWasteCollections: 0,
    companies: 0,
    wasteCollectionsByStatus: {}
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter collections based on status
  const filteredCollections = collections.filter(collection => {
    if (statusFilter === 'all') return true;
    return collection.status === statusFilter;
  });

  // Get unique statuses for filter options
  const availableStatuses = [...new Set(collections.map(collection => collection.status))].filter(Boolean);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching collections...');
        
        let response;
        if (user?.role === 'admin') {
          // For admin users, get all waste collections without limits
          response = await wasteCollectionApi.getAllWasteCollections();
        } else if (user?.role === 'waste_collector') {
          // For waste collectors, get collections assigned to their company
          response = await wasteCollectionApi.getWasteCollectionsByCompany();
        } else {
          // For regular users and others, get their own collections
          response = await wasteCollectionApi.getUserWasteCollections();
        }
        
        // The API returns data directly, not wrapped in a data property
        setCollections(response || []);
        
        // Transform collections into activities
        const transformedActivities = transformCollectionsToActivities(response || [], t);
        setActivities(transformedActivities);
        
        console.log('Collections data:', response);
        console.log('Transformed activities:', transformedActivities);
      } catch (err) {
        setError('Failed to load waste collections');
        console.error('Error fetching collections:', err);
        // Set empty array on error to prevent undefined issues
        setCollections([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchNextPickup = async () => {
      try {
        setPickupLoading(true);
        setPickupError('');
        console.log('Fetching next pickup...');
        
        let response;
        if (user?.role === 'admin') {
          // For admin users, get all waste collections
          response = await wasteCollectionApi.getAllWasteCollections();
        } else if (user?.role === 'waste_collector') {
          // For waste collectors, get collections assigned to their company
          response = await wasteCollectionApi.getWasteCollectionsByCompany();
        } else {
          // For regular users, get their own collections
          response = await wasteCollectionApi.getUserWasteCollections();
        }
        
        console.log('Collections response for next pickup:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Filter for approved collections and find the next upcoming pickup
          const now = new Date();
          const upcomingPickups = response
            .filter(collection => 
              collection.status === 'approved' && 
              new Date(collection.pickup_date) > now
            )
            .sort((a, b) => new Date(a.pickup_date) - new Date(b.pickup_date));
          
          if (upcomingPickups.length > 0) {
            const nextPickup = upcomingPickups[0];
            const pickupDate = new Date(nextPickup.pickup_date);
            
            // Format the date and time
            const formattedDate = pickupDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            const formattedTime = nextPickup.time_slot || 'TBD';
            
            setNextPickup({
              hasUpcoming: true,
              pickup: {
                date: formattedDate,
                time: formattedTime,
                location: nextPickup.street || `${nextPickup.sector}, ${nextPickup.district}`,
                sector: nextPickup.sector,
                district: nextPickup.district,
                company: nextPickup.company_name
              }
            });
          } else {
            setNextPickup({
              hasUpcoming: false,
              message: 'No upcoming waste pickups scheduled'
            });
          }
        } else {
          setNextPickup({
            hasUpcoming: false,
            message: 'No waste collections found'
          });
        }
      } catch (err) {
        console.error('Error fetching next pickup:', err);
        console.error('Error details:', err.response?.data);
        setPickupError(`Failed to load next pickup information: ${err.response?.data?.error || err.message}`);
      } finally {
        setPickupLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await getDashboardStats();
        setDashboardStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setDashboardStats({
          users: 0,
          totalWasteCollections: 0,
          companies: 0,
          wasteCollectionsByStatus: {}
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchCollections();
      fetchNextPickup();
      fetchDashboardStats();
    }
  }, [user]);

  // Helper function to safely get collections count
  const getCollectionsCount = () => {
    return Array.isArray(collections) ? collections.length : 0;
  };

  // Helper function to safely filter collections by status
  const getCollectionsByStatus = (status) => {
    return Array.isArray(collections) ? collections.filter(c => c.status === status).length : 0;
  };

  // Waste collection bar chart data (months) - moved before the function that uses it
  const wasteData = [
    { month: 'Sept 2024', thisPeriod: 80, lastPeriod: 60 },
    { month: 'Nov 2024', thisPeriod: 70, lastPeriod: 50 },
    { month: 'Dec 2024', thisPeriod: 60, lastPeriod: 80 },
    { month: 'Jan 2025', thisPeriod: 50, lastPeriod: 70 },
    { month: 'Feb 2025', thisPeriod: 70, lastPeriod: 50 },
    { month: 'March 2025', thisPeriod: 90, lastPeriod: 60 },
    { month: 'April 2025', thisPeriod: 85, lastPeriod: 45 },
  ];

  // Generate chart data for waste collectors based on their collections
  const generateWasteCollectorChartData = () => {
    if (!Array.isArray(collections) || collections.length === 0) {
      return wasteData.map(item => ({
        month: item.month,
        completed: 0,
        pending: 0,
        denied: 0
      }));
    }

    // Group collections by month
    const collectionsByMonth = {};
    
    collections.forEach(collection => {
      if (collection.pickup_date) {
        const date = new Date(collection.pickup_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!collectionsByMonth[monthKey]) {
          collectionsByMonth[monthKey] = { completed: 0, pending: 0, denied: 0 };
        }
        
        if (collection.status === 'completed' || collection.status === 'approved') {
          collectionsByMonth[monthKey].completed++;
        } else if (collection.status === 'pending') {
          collectionsByMonth[monthKey].pending++;
        } else if (collection.status === 'denied' || collection.status === 'rejected') {
          collectionsByMonth[monthKey].denied++;
        }
      }
    });

    // Map to chart data format
    return wasteData.map(item => ({
      month: item.month,
      completed: collectionsByMonth[item.month]?.completed || 0,
      pending: collectionsByMonth[item.month]?.pending || 0,
      denied: collectionsByMonth[item.month]?.denied || 0
    }));
  };

  const wasteCollectorChartData = generateWasteCollectorChartData();

  // Stats cards data (updated)
  const stats = [
    {
      title: t('home.stats.users'),
      value: statsLoading ? '...' : dashboardStats.users.toString(),
      icon: <Users className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
    {
      title: t('home.stats.totalAmount'),
      value: statsLoading ? '...' : dashboardStats.companies.toString(),
      icon: <Tag className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
    {
      title: t('home.stats.totalWastePickups'),
      value: statsLoading ? '...' : dashboardStats.totalWasteCollections.toString(),
      icon: <Truck className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
    {
      title: t('home.stats.totalRecycledMaterials'),
      value: statsLoading ? '...' : (dashboardStats.wasteCollectionsByStatus.approved || 0).toString(),
      icon: <RefreshCcw className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
  ];

  // Recent activity - now managed by state from API data
  // Activities are transformed from waste collection data in useEffect

  // Next pickups and events
  const nextDropoff = {
    location: 'Cyivugiza Center (KG 50 St)',
    date: 'Saturday, June 15, 2025',
    time: '9:00 AM – 4:00 PM',
  };
  const events = [
    {
      title: t('home.events.umuganda'),
      date: 'July 5, 2025',
      location: 'Nyamirambo Rwanda, Kigali',
      color: 'green',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      title: t('home.events.youthLedCleanups'),
      date: 'July 5, 2025',
      location: 'Rafiki Rwanda, Kigali',
      color: 'orange',
      icon: <Info className="w-4 h-4" />,
    },
    {
      title: t('home.events.carFreeDays'),
      date: 'July 5, 2025',
      location: 'Kigali',
      color: 'red',
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  // Sorting guidelines
  const guidelines = [
    {
      icon: <RefreshCcw className="w-6 h-6 text-green-500" />,
      title: t('home.guidelines.separateBins.title'),
      desc: t('home.guidelines.separateBins.desc'),
    },
    {
      icon: <Tag className="w-6 h-6 text-yellow-500" />,
      title: t('home.guidelines.clearLabeling.title'),
      desc: t('home.guidelines.clearLabeling.desc'),
    },
    {
      icon: <Truck className="w-6 h-6 text-indigo-500" />,
      title: t('home.guidelines.foldFlatten.title'),
      desc: t('home.guidelines.foldFlatten.desc'),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('home.dashboard')}</h1>
      
      {/* Error Display for Collections */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards - Only show for admin users */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-teal-50 rounded-lg p-2 flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className="text-xs text-gray-500 font-medium">{stat.title}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
              <button className="mt-2 text-xs text-teal-600 font-semibold flex items-center gap-1 hover:underline">
                {stat.details}
                <span className="ml-1">&rarr;</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Waste Collection Stats Cards for Admin Users */}
      {user?.role === 'admin' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">All Requests</p>
                <p className="text-3xl font-bold text-gray-800">{getCollectionsCount()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {getCollectionsByStatus('pending')}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {getCollectionsByStatus('approved')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Denied</p>
                <p className="text-3xl font-bold text-red-600">
                  {getCollectionsByStatus('denied')}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for admin stats cards */}
      {user?.role === 'admin' && loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Waste Collection Stats Cards - Only show for users with role 'user' */}
      {user?.role === 'user' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {user?.role === 'admin' ? 'All Requests' : 
                   user?.role === 'waste_collector' ? 'Assigned Requests' : 'Total Requests'}
                </p>
                <p className="text-3xl font-bold text-gray-800">{getCollectionsCount()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {getCollectionsByStatus('pending')}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {getCollectionsByStatus('approved')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Denied</p>
                <p className="text-3xl font-bold text-red-600">
                  {getCollectionsByStatus('denied')}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for stats cards */}
      {user?.role === 'user' && loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Waste Collection Stats Cards for Waste Collectors */}
      {user?.role === 'waste_collector' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Assigned Requests</p>
                <p className="text-3xl font-bold text-gray-800">{getCollectionsCount()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {getCollectionsByStatus('pending')}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {getCollectionsByStatus('approved')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Denied</p>
                <p className="text-3xl font-bold text-red-600">
                  {getCollectionsByStatus('denied')}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for waste collector stats cards */}
      {user?.role === 'waste_collector' && loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Chart & Activity */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Book Waste Collection Button - Only show for users with role 'user' */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2'>
          {user?.role === 'user' && (
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{t('home.bookCollection.title')}</h2>
                  <p className="text-teal-100 text-sm mb-4">
                    {t('home.bookCollection.description')}
                  </p>
                  <Link
                    to="/collection"
                    className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    {t('home.bookCollection.button')}
                  </Link>
                </div>
                <div className="hidden sm:block">
                  <Truck className="w-16 h-16 text-teal-200" />
                </div>
              </div>
            </div>
          )}

          {/* Find Recycling Centers Button - Only show for users with role 'user' */}
          {user?.role === 'user' && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{t('home.recyclingCenter.title')}</h2>
                  <p className="text-green-100 text-sm mb-4">
                    {t('home.recyclingCenter.description')}
                  </p>
                  <Link
                    to="/recycling-center"
                    className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 shadow-sm"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    {t('home.recyclingCenter.button')}
                  </Link>
                </div>
                <div className="hidden sm:block">
                  <RefreshCcw className="w-16 h-16 text-green-200" />
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Bar Chart - Only show for admin users */}
          {user?.role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{t('home.wasteCollection.title')}</h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-teal-400"></span>
                    {t('home.wasteCollection.thisPeriod')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-amber-200"></span>
                    {t('home.wasteCollection.lastPeriod')}
                  </span>
                </div>
              </div>
              {/* Bar Chart Representation */}
              <div className="flex items-end gap-2 sm:gap-4 h-32 sm:h-48 overflow-x-auto">
                {wasteData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
                    <div className="flex items-end gap-1 h-24 sm:h-40">
                      <div
                        className="w-4 sm:w-6 rounded-t bg-teal-400"
                        style={{ height: `${(item.thisPeriod / 100) * 96}px` }}
                      ></div>
                      <div
                        className="w-4 sm:w-6 rounded-t bg-amber-200"
                        style={{ height: `${(item.lastPeriod / 100) * 96}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collection Performance Chart - Only show for waste collectors */}
          {user?.role === 'waste_collector' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold text-gray-900">My Collection Performance</h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-blue-500"></span>
                    Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-yellow-500"></span>
                    Pending
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-red-500"></span>
                    Denied
                  </span>
                </div>
              </div>
              
              {/* Graph Container */}
              <div className="relative h-64 sm:h-80 bg-gray-50 rounded-lg p-4">
                {/* Grid Lines */}
                <div className="absolute inset-0 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: `${(i * 25)}%` }}
                    ></div>
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-full border-l border-gray-200"
                      style={{ left: `${(i * 16.66)}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 p-4">
                  <span>30</span>
                  <span>24</span>
                  <span>18</span>
                  <span>12</span>
                  <span>6</span>
                  <span>0</span>
                </div>
                
                {/* Graph Lines */}
                <div className="relative h-full flex items-end justify-between px-8">
                  {wasteCollectorChartData.map((item, idx) => {
                    const maxValue = 30; // Maximum value for scaling
                    const completedHeight = (item.completed / maxValue) * 100;
                    const pendingHeight = (item.pending / maxValue) * 100;
                    const deniedHeight = (item.denied / maxValue) * 100;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center relative group">
                        {/* Completed Collections Bar */}
                        <div
                          className="w-6 sm:w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                          style={{ height: `${completedHeight}%` }}
                          title={`${item.completed} completed in ${item.month}`}
                        >
                          {/* Value label on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {item.completed}
                          </div>
                        </div>
                        
                        {/* Pending Collections Bar */}
                        <div
                          className="w-6 sm:w-8 bg-yellow-500 rounded-t transition-all duration-300 hover:bg-yellow-600 cursor-pointer"
                          style={{ height: `${pendingHeight}%` }}
                          title={`${item.pending} pending in ${item.month}`}
                        >
                          {/* Value label on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {item.pending}
                          </div>
                        </div>
                        
                        {/* Denied Collections Bar */}
                        <div
                          className="w-6 sm:w-8 bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600 cursor-pointer"
                          style={{ height: `${deniedHeight}%` }}
                          title={`${item.denied} denied in ${item.month}`}
                        >
                          {/* Value label on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {item.denied}
                          </div>
                        </div>
                        
                        {/* Month label */}
                        <span className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* X-axis */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                
                {/* Y-axis */}
                <div className="absolute top-0 bottom-0 left-8 w-px bg-gray-300"></div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Showing your collection performance over the last 7 months
                </p>
              </div>
              
              {/* Performance Summary for Waste Collectors */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {wasteCollectorChartData.reduce((sum, item) => sum + item.completed, 0)}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">Total Completed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {wasteCollectorChartData.reduce((sum, item) => sum + item.pending, 0)}
                  </div>
                  <div className="text-xs text-yellow-700 font-medium">Total Pending</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {wasteCollectorChartData.reduce((sum, item) => sum + item.denied, 0)}
                  </div>
                  <div className="text-xs text-red-700 font-medium">Total Denied</div>
                </div>
              </div>
              
              {/* Efficiency Rate */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Efficiency Rate</span>
                  <span className="text-lg font-bold text-green-600">
                    {(() => {
                      const totalCompleted = wasteCollectorChartData.reduce((sum, item) => sum + item.completed, 0);
                      const totalPending = wasteCollectorChartData.reduce((sum, item) => sum + item.pending, 0);
                      const totalDenied = wasteCollectorChartData.reduce((sum, item) => sum + item.denied, 0);
                      const total = totalCompleted + totalPending + totalDenied;
                      return total > 0 ? Math.round((totalCompleted / total) * 100) : 0;
                    })()}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(() => {
                        const totalCompleted = wasteCollectorChartData.reduce((sum, item) => sum + item.completed, 0);
                        const totalPending = wasteCollectorChartData.reduce((sum, item) => sum + item.pending, 0);
                        const totalDenied = wasteCollectorChartData.reduce((sum, item) => sum + item.denied, 0);
                        const total = totalCompleted + totalPending + totalDenied;
                        return total > 0 ? (totalCompleted / total) * 100 : 0;
                      })()}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity - Only show for users with role 'user' or 'waste_collector' */}
          {(user?.role === 'user' || user?.role === 'waste_collector') && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('home.recentActivity.title')}</h2>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {activities.map((activity, idx) => (
                    <li key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm sm:text-base">
                        {activity.link ? (
                          <button onClick={() => {}} className="text-teal-600 hover:underline font-medium">
                            {activity.label}
                          </button>
                        ) : (
                          <span className="text-gray-700">{activity.label}</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{activity.date}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activities</p>
                  <p className="text-xs text-gray-400 mt-1">Your waste collection activities will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Next Pickup, Drop-off, Events */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Next Waste Pickup - Only show for users with role 'user' or 'waste_collector' */}
          {(user?.role === 'user' || user?.role === 'waste_collector') && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.nextPickup.title')}</h3>
              {pickupLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ) : pickupError ? (
                <div className="text-sm text-red-600">{pickupError}</div>
              ) : nextPickup && nextPickup.hasUpcoming ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nextPickup.pickup.date}</p>
                      <p className="text-xs text-gray-500">{nextPickup.pickup.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nextPickup.pickup.location}</p>
                      <p className="text-xs text-gray-500">
                        {nextPickup.pickup.sector && nextPickup.pickup.district 
                          ? `${nextPickup.pickup.sector}, ${nextPickup.pickup.district}`
                          : t('home.nextPickup.location')
                        }
                      </p>
                    </div>
                  </div>
                  {nextPickup.pickup.company && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{nextPickup.pickup.company}</p>
                        <p className="text-xs text-gray-500">Collection Company</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {nextPickup?.message || 'No upcoming waste pickup scheduled'}
                </div>
              )}
            </div>
          )}

          {/* Next Drop-off - Only show for regular users */}
          {user?.role === 'user' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.nextDropoff.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{nextDropoff.location}</p>
                    <p className="text-xs text-gray-500">{t('home.nextDropoff.location')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{nextDropoff.date}</p>
                    <p className="text-xs text-gray-500">{nextDropoff.time}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Events - Only show for regular users */}
          {user?.role === 'user' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.events.title')}</h3>
              <div className="space-y-3">
                {events.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      event.color === 'green' ? 'bg-green-100' :
                      event.color === 'orange' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      <div className={`${
                        event.color === 'green' ? 'text-green-600' :
                        event.color === 'orange' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {event.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                      <p className="text-xs text-gray-500 truncate">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Waste Collections Table - Only show for users with role 'user' */}
      {user?.role === 'user' && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('home.wasteCollections.title')}</h2>
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="statusFilter" className="text-sm text-gray-600">
                  {t('home.wasteCollections.filterByStatus') || 'Filter by status:'}
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">{t('home.wasteCollections.allStatuses') || 'All Statuses'}</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>
                      {t(`home.wasteCollections.statuses.${status}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500">
                {loading ? t('common.loading') : `${filteredCollections.length} ${t('home.wasteCollections.collections')}`}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">
                <AlertCircle className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : filteredCollections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('home.wasteCollections.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('home.wasteCollections.time')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('home.wasteCollections.location')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('home.wasteCollections.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('home.wasteCollections.company')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCollections.slice(0, 10).map((collection, index) => (
                    <tr key={collection.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {collection.pickup_date ? new Date(collection.pickup_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {collection.time_slot || 'TBD'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{collection.street || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">
                            {collection.sector && collection.district 
                              ? `${collection.sector}, ${collection.district}`
                              : t('home.wasteCollections.locationNotSpecified')
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          collection.status === 'approved' ? 'bg-green-100 text-green-800' :
                          collection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          collection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          collection.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {collection.status ? t(`home.wasteCollections.statuses.${collection.status}`) : t('home.wasteCollections.statuses.unknown')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {collection.company_name || t('home.wasteCollections.notAssigned')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCollections.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    {t('home.wasteCollections.showing', { shown: 10, total: filteredCollections.length })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">
                {statusFilter === 'all' 
                  ? t('home.wasteCollections.noCollectionsFound')
                  : t('home.wasteCollections.noCollectionsWithStatus', { status: t(`home.wasteCollections.statuses.${statusFilter}`) })
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {statusFilter === 'all' 
                  ? t('home.wasteCollections.noCollectionsMessage')
                  : t('home.wasteCollections.tryDifferentStatus')
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}