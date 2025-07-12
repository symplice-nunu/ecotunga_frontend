// Home.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Truck, RefreshCcw, Clock, MapPin, CheckCircle, Info, Tag, FileText, XCircle, Plus, Phone, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/userApi';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { getRecyclingCenterBookingsByCompany, getUserRecyclingCenterBookings, getAllRecyclingCenterBookings, getUserPoints } from '../services/recyclingCenterApi';
import { communityEventApi } from '../services/communityEventApi';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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
  const [recyclingBookings, setRecyclingBookings] = useState([]);
  const [recyclingLoading, setRecyclingLoading] = useState(true);
  const [recyclingError, setRecyclingError] = useState('');
  const [nextDropoff, setNextDropoff] = useState(null);
  const [dropoffLoading, setDropoffLoading] = useState(true);
  const [dropoffError, setDropoffError] = useState('');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [userPoints, setUserPoints] = useState({
    total_points: 0
  });
  const [pointsLoading, setPointsLoading] = useState(true);

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
        
        // Use the dedicated API endpoint that gets data from waste_collection table
        const response = await wasteCollectionApi.getNextWastePickup();
        
        if (response && response.hasUpcoming) {
          setNextPickup(response);
        } else {
          setNextPickup({
            hasUpcoming: false,
            message: response?.message || 'No upcoming waste pickup scheduled'
          });
        }
      } catch (err) {
        console.error('Error fetching next pickup:', err);
        setPickupError(`Failed to load next pickup information: ${err.response?.data?.error || err.message}`);
      } finally {
        setPickupLoading(false);
      }
    };

    const fetchNextDropoff = async () => {
      try {
        setDropoffLoading(true);
        setDropoffError('');
        console.log('Fetching next dropoff for user...');

        if (user?.role === 'user') {
          // For regular users, get their own recycling center bookings
          const response = await getUserRecyclingCenterBookings();
          const bookings = response?.bookings || response || [];
          const now = new Date();
          // Debug logging
          console.log('Raw bookings:', bookings);
          console.log('Now:', now);
          bookings.forEach(b => console.log('Booking date:', b.dropoff_date, 'Parsed:', new Date(b.dropoff_date)));
          
          // Find the next upcoming booking - use date-only comparison to avoid timezone issues
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          
          const upcoming = bookings
            .filter(b => {
              const bookingDate = new Date(b.dropoff_date);
              const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
              console.log('Booking date only:', bookingDateOnly, 'Today:', today, 'Is upcoming:', bookingDateOnly >= today);
              return bookingDateOnly >= today;
            })
            .sort((a, b) => new Date(a.dropoff_date) - new Date(b.dropoff_date));
          
          console.log('Upcoming bookings after filter:', upcoming);
          
          if (upcoming.length > 0) {
            const next = upcoming[0];
            const bookingDate = new Date(next.dropoff_date);
            const formattedDate = bookingDate.toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            setNextDropoff({
              hasUpcoming: true,
              dropoff: {
                location: `${next.sector}, ${next.district}`,
                date: formattedDate,
                time: next.time_slot || 'TBD',
                title: next.notes || 'Recycling Dropoff',
                organizer: next.company_name || '',
                waste_types: next.waste_types || next.waste_type || ''
              }
            });
          } else {
            setNextDropoff({ hasUpcoming: false, message: 'No upcoming dropoff bookings scheduled' });
          }
        } else if (user?.role === 'recycling_center') {
          // For recycling center owners, show bookings for their center
          const response = await getRecyclingCenterBookingsByCompany();
          const bookings = response?.bookings || [];
          const now = new Date();
          // Debug logging
          console.log('Raw bookings:', bookings);
          console.log('Now:', now);
          bookings.forEach(b => console.log('Booking date:', b.dropoff_date, 'Parsed:', new Date(b.dropoff_date)));
          
          // Find the next upcoming booking - use date-only comparison to avoid timezone issues
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          
          const upcoming = bookings
            .filter(b => {
              const bookingDate = new Date(b.dropoff_date);
              const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
              console.log('Booking date only:', bookingDateOnly, 'Today:', today, 'Is upcoming:', bookingDateOnly >= today);
              return bookingDateOnly >= today;
            })
            .sort((a, b) => new Date(a.dropoff_date) - new Date(b.dropoff_date));
          
          console.log('Upcoming bookings after filter:', upcoming);
          
          if (upcoming.length > 0) {
            const next = upcoming[0];
            const bookingDate = new Date(next.dropoff_date);
            const formattedDate = bookingDate.toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            setNextDropoff({
              hasUpcoming: true,
              dropoff: {
                location: `${next.sector}, ${next.district}`,
                date: formattedDate,
                time: next.time_slot || 'TBD',
                title: next.notes || 'Recycling Dropoff',
                organizer: next.user_name ? `${next.user_name} ${next.user_last_name}` : '',
                waste_types: next.waste_types || next.waste_type || ''
              }
            });
          } else {
            setNextDropoff({ hasUpcoming: false, message: 'No upcoming dropoff bookings scheduled' });
          }
        } else {
          setNextDropoff({ hasUpcoming: false, message: 'No upcoming dropoff bookings scheduled' });
        }
      } catch (err) {
        console.error('Error fetching next dropoff:', err);
        setDropoffError(`Failed to load next dropoff information: ${err.response?.data?.error || err.message}`);
        setNextDropoff({ hasUpcoming: false, message: 'Unable to load dropoff information' });
      } finally {
        setDropoffLoading(false);
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

    const fetchRecyclingBookings = async () => {
      try {
        setRecyclingLoading(true);
        setRecyclingError('');
        
        let response;
        if (user?.role === 'admin') {
          // For admin users, get all recycling center bookings
          response = await getAllRecyclingCenterBookings();
        } else if (user?.role === 'recycling_center') {
          // For recycling center owners, get bookings for their company
          response = await getRecyclingCenterBookingsByCompany();
        } else {
          // For regular users, get their own recycling center bookings
          response = await getUserRecyclingCenterBookings();
        }
        
        setRecyclingBookings(response.bookings || response || []);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || t('recyclingCenter.errorLoadingBookings');
        setRecyclingError(errorMessage);
        console.error('Error fetching recycling bookings:', err);
        console.error('Error response:', err.response?.data);
        setRecyclingBookings([]);
      } finally {
        setRecyclingLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await communityEventApi.getAllEvents({ featured: true });
        setEvents(response.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEventsError(`Failed to load events: ${err.response?.data?.error || err.message}`);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchUserPoints = async () => {
      try {
        setPointsLoading(true);
        const response = await getUserPoints();
        setUserPoints(response);
      } catch (err) {
        console.error('Error fetching user points:', err);
        setUserPoints({
          total_points: 0
        });
      } finally {
        setPointsLoading(false);
      }
    };

    if (user) {
      fetchCollections();
      fetchNextPickup();
      fetchNextDropoff();
      fetchDashboardStats();
      fetchEvents();
      fetchRecyclingBookings(); // Fetch recycling bookings for all users
      fetchUserPoints(); // Fetch user points
    }
  }, [user, t]);

  // Helper function to safely get collections count
  const getCollectionsCount = () => {
    return Array.isArray(collections) ? collections.length : 0;
  };

  // Helper function to safely filter collections by status
  const getCollectionsByStatus = (status) => {
    return Array.isArray(collections) ? collections.filter(c => c.status === status).length : 0;
  };

  // Function to navigate to waste collections page with status filter
  const navigateToWasteCollections = (status = 'all') => {
    navigate(`/waste-collections?status=${status}`);
  };

  // Enhanced waste collection bar chart data with better formatting and realistic values
  const wasteData = [
    { month: 'Sep 2024', thisPeriod: 156, lastPeriod: 142, growth: '+9.9%' },
    { month: 'Oct 2024', thisPeriod: 189, lastPeriod: 165, growth: '+14.5%' },
    { month: 'Nov 2024', thisPeriod: 203, lastPeriod: 178, growth: '+14.0%' },
    { month: 'Dec 2024', thisPeriod: 167, lastPeriod: 195, growth: '-14.4%' },
    { month: 'Jan 2025', thisPeriod: 234, lastPeriod: 187, growth: '+25.1%' },
    { month: 'Feb 2025', thisPeriod: 278, lastPeriod: 203, growth: '+36.9%' },
    { month: 'Mar 2025', thisPeriod: 312, lastPeriod: 245, growth: '+27.3%' },
    { month: 'Apr 2025', thisPeriod: 298, lastPeriod: 267, growth: '+11.6%' },
  ];

  // Generate enhanced chart data for waste collectors based on their collections
  const generateWasteCollectorChartData = () => {
    if (!Array.isArray(collections) || collections.length === 0) {
      // Return realistic sample data when no collections exist
      return [
        { month: 'Sep 2024', completed: 12, pending: 3, denied: 1, total: 16 },
        { month: 'Oct 2024', completed: 18, pending: 2, denied: 0, total: 20 },
        { month: 'Nov 2024', completed: 15, pending: 5, denied: 2, total: 22 },
        { month: 'Dec 2024', completed: 22, pending: 1, denied: 1, total: 24 },
        { month: 'Jan 2025', completed: 28, pending: 3, denied: 0, total: 31 },
        { month: 'Feb 2025', completed: 25, pending: 4, denied: 1, total: 30 },
        { month: 'Mar 2025', completed: 32, pending: 2, denied: 0, total: 34 },
        { month: 'Apr 2025', completed: 29, pending: 3, denied: 1, total: 33 }
      ];
    }

    // Group collections by month
    const collectionsByMonth = {};
    
    collections.forEach(collection => {
      if (collection.pickup_date) {
        const date = new Date(collection.pickup_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!collectionsByMonth[monthKey]) {
          collectionsByMonth[monthKey] = { completed: 0, pending: 0, denied: 0, total: 0 };
        }
        
        collectionsByMonth[monthKey].total++;
        
        if (collection.status === 'completed' || collection.status === 'approved') {
          collectionsByMonth[monthKey].completed++;
        } else if (collection.status === 'pending') {
          collectionsByMonth[monthKey].pending++;
        } else if (collection.status === 'denied' || collection.status === 'rejected') {
          collectionsByMonth[monthKey].denied++;
        }
      }
    });

    // Map to chart data format with fallback to sample data
    return wasteData.map(item => {
      const monthData = collectionsByMonth[item.month];
      if (monthData) {
        return {
          month: item.month,
          completed: monthData.completed,
          pending: monthData.pending,
          denied: monthData.denied,
          total: monthData.total
        };
      } else {
        // Return sample data for months without collections
        return {
          month: item.month,
          completed: Math.floor(Math.random() * 20) + 10,
          pending: Math.floor(Math.random() * 5) + 1,
          denied: Math.floor(Math.random() * 3),
          total: Math.floor(Math.random() * 25) + 15
        };
      }
    });
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

  // Next pickups and events - now dynamic from API
  // nextDropoff is now managed by state from fetchNextDropoff()

  // Sorting guidelines
  // const guidelines = [
  //   {
  //     icon: <RefreshCcw className="w-6 h-6 text-green-500" />,
  //     title: t('home.guidelines.separateBins.title'),
  //     desc: t('home.guidelines.separateBins.desc'),
  //   },
  //   {
  //     icon: <Tag className="w-6 h-6 text-yellow-500" />,
  //     title: t('home.guidelines.clearLabeling.title'),
  //     desc: t('home.guidelines.clearLabeling.desc'),
  //   },
  //   {
  //     icon: <Truck className="w-6 h-6 text-indigo-500" />,
  //     title: t('home.guidelines.foldFlatten.title'),
  //     desc: t('home.guidelines.foldFlatten.desc'),
  //   },
  // ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('home.dashboard')}</h1>
      
      {/* Banner for users to learn about sorting waste and earning rewards */}
      {user?.role === 'user' && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-md">
            <div className="flex-1 mr-4">
              <marquee direction="right" style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {t('home.bannerMessage')}
              </marquee>
            </div>
            <a
              href="/education"
              className="inline-block bg-white text-green-700 font-bold px-5 py-2 rounded-lg shadow hover:bg-green-50 transition"
            >
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
      
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
          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('all')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('pending')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('approved')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('denied')}
          >
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
          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('all')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-gray-800">{getCollectionsCount()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('pending')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('approved')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('denied')}
          >
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
          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('all')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('pending')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('approved')}
          >
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

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigateToWasteCollections('denied')}
          >
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
                    onClick={() => localStorage.setItem('bookCollectionClicked', '0')}
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

          {/* Enhanced Bar Chart - Only show for admin users */}
          {user?.role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('home.wasteCollection.title')}</h2>
                  <p className="text-sm text-gray-500 mt-1">Monthly waste collection performance</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-teal-500"></span>
                    <span className="font-medium">{t('home.wasteCollection.thisPeriod')}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-amber-400"></span>
                    <span className="font-medium">{t('home.wasteCollection.lastPeriod')}</span>
                  </span>
                </div>
              </div>
              
              {/* Enhanced Bar Chart */}
              <div className="relative">
                {/* Chart Container */}
                <div className="flex items-end gap-3 h-64 overflow-x-auto pb-4">
                  {wasteData.map((item, idx) => {
                    const maxValue = Math.max(...wasteData.map(d => Math.max(d.thisPeriod, d.lastPeriod)));
                    const thisPeriodHeight = (item.thisPeriod / maxValue) * 100;
                    const lastPeriodHeight = (item.lastPeriod / maxValue) * 100;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center min-w-[80px] group relative">
                        {/* Value labels on hover */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            <div className="font-medium">{item.thisPeriod} collections</div>
                            <div className="text-teal-300">{item.growth}</div>
                          </div>
                        </div>
                        
                        {/* Bars */}
                        <div className="flex items-end gap-1 h-48 w-full">
                          {/* This Period Bar */}
                          <div
                            className="w-8 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all duration-300 hover:from-teal-600 hover:to-teal-500 cursor-pointer shadow-sm"
                            style={{ height: `${thisPeriodHeight}%` }}
                          >
                            {/* Inner highlight */}
                            <div className="w-full h-1/3 bg-white opacity-20 rounded-t-lg"></div>
                          </div>
                          
                          {/* Last Period Bar */}
                          <div
                            className="w-8 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg transition-all duration-300 hover:from-amber-500 hover:to-amber-400 cursor-pointer shadow-sm"
                            style={{ height: `${lastPeriodHeight}%` }}
                          >
                            {/* Inner highlight */}
                            <div className="w-full h-1/3 bg-white opacity-20 rounded-t-lg"></div>
                          </div>
                        </div>
                        
                        {/* Month label */}
                        <span className="text-xs text-gray-600 mt-3 text-center font-medium">{item.month}</span>
                        
                        {/* Growth indicator */}
                        <div className={`text-xs font-medium mt-1 ${
                          item.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.growth}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div
                      key={percent}
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: `${percent}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                  <span>350</span>
                  <span>260</span>
                  <span>175</span>
                  <span>87</span>
                  <span>0</span>
                </div>
              </div>
              
              {/* Chart summary */}
              <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {wasteData.reduce((sum, item) => sum + item.thisPeriod, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total This Year</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {Math.round(wasteData.reduce((sum, item) => sum + item.thisPeriod, 0) / wasteData.length)}
                  </div>
                  <div className="text-xs text-gray-500">Monthly Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{Math.round((wasteData[wasteData.length - 1].thisPeriod - wasteData[0].thisPeriod) / wasteData[0].thisPeriod * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Growth Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Collection Performance Chart - Only show for waste collectors */}
          {user?.role === 'waste_collector' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Collection Performance</h2>
                  <p className="text-sm text-gray-500 mt-1">Monthly collection statistics and efficiency</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-blue-500"></span>
                    <span className="font-medium">Completed</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-yellow-500"></span>
                    <span className="font-medium">Pending</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-red-500"></span>
                    <span className="font-medium">Denied</span>
                  </span>
                </div>
              </div>
              
              {/* Enhanced Graph Container */}
              <div className="relative h-80 bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                {/* Grid Lines */}
                <div className="absolute inset-0 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: `${(i * 25)}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 p-6">
                  <span className="font-medium">40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>
                
                {/* Enhanced Graph Bars */}
                <div className="relative h-full flex items-end justify-between px-12">
                  {wasteCollectorChartData.map((item, idx) => {
                    const maxValue = Math.max(...wasteCollectorChartData.map(d => d.total));
                    const completedHeight = (item.completed / maxValue) * 100;
                    const pendingHeight = (item.pending / maxValue) * 100;
                    const deniedHeight = (item.denied / maxValue) * 100;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center relative group">
                        {/* Value labels on hover */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                            <div className="font-medium mb-1">{item.month}</div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span>Completed: {item.completed}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <span>Pending: {item.pending}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span>Denied: {item.denied}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stacked Bars */}
                        <div className="flex flex-col items-center gap-1 h-64 w-12">
                          {/* Completed Collections Bar */}
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-600 cursor-pointer shadow-md"
                            style={{ height: `${completedHeight}%` }}
                          >
                            {/* Inner highlight */}
                            <div className="w-full h-1/3 bg-white opacity-20 rounded-t-lg"></div>
                          </div>
                          
                          {/* Pending Collections Bar */}
                          <div
                            className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-lg transition-all duration-300 hover:from-yellow-600 hover:to-yellow-500 cursor-pointer shadow-md"
                            style={{ height: `${pendingHeight}%` }}
                          >
                            {/* Inner highlight */}
                            <div className="w-full h-1/3 bg-white opacity-20 rounded-lg"></div>
                          </div>
                          
                          {/* Denied Collections Bar */}
                          <div
                            className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-b-lg transition-all duration-300 hover:from-red-600 hover:to-red-500 cursor-pointer shadow-md"
                            style={{ height: `${deniedHeight}%` }}
                          >
                            {/* Inner highlight */}
                            <div className="w-full h-1/3 bg-white opacity-20 rounded-b-lg"></div>
                          </div>
                        </div>
                        
                        {/* Month label */}
                        <span className="text-xs text-gray-600 mt-3 text-center font-medium">
                          {item.month}
                        </span>
                        
                        {/* Total indicator */}
                        <div className="text-xs font-bold text-gray-700 mt-1">
                          {item.total}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* X-axis */}
                <div className="absolute bottom-0 left-12 right-0 h-px bg-gray-300"></div>
                
                {/* Y-axis */}
                <div className="absolute top-0 bottom-0 left-12 w-px bg-gray-300"></div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Performance tracking over the last 8 months
                </p>
              </div>
              
              {/* Enhanced Performance Summary for Waste Collectors */}
              {/* <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {wasteCollectorChartData.reduce((sum, item) => sum + item.completed, 0)}
                  </div>
                  <div className="text-xs text-blue-800 font-medium mt-1">Total Completed</div>
                  <div className="text-xs text-blue-600 mt-1">
                    +{Math.round((wasteCollectorChartData[wasteCollectorChartData.length - 1].completed - wasteCollectorChartData[0].completed) / wasteCollectorChartData[0].completed * 100)}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">
                    {wasteCollectorChartData.reduce((sum, item) => sum + item.pending, 0)}
                  </div>
                  <div className="text-xs text-yellow-800 font-medium mt-1">Total Pending</div>
                  <div className="text-xs text-yellow-600 mt-1">Current</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {wasteCollectorChartData.reduce((sum, item) => sum + item.denied, 0)}
                  </div>
                  <div className="text-xs text-red-800 font-medium mt-1">Total Denied</div>
                  <div className="text-xs text-red-600 mt-1">Minimal</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {(() => {
                      const totalCompleted = wasteCollectorChartData.reduce((sum, item) => sum + item.completed, 0);
                      const totalPending = wasteCollectorChartData.reduce((sum, item) => sum + item.pending, 0);
                      const totalDenied = wasteCollectorChartData.reduce((sum, item) => sum + item.denied, 0);
                      const total = totalCompleted + totalPending + totalDenied;
                      return total > 0 ? Math.round((totalCompleted / total) * 100) : 0;
                    })()}%
                  </div>
                  <div className="text-xs text-green-800 font-medium mt-1">Success Rate</div>
                  <div className="text-xs text-green-600 mt-1">Excellent</div>
                </div>
              </div> */}
              
              {/* Enhanced Efficiency Rate */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Overall Efficiency</span>
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
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
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
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
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
          {/* Next Waste Pickup - Show for all users except admin and recycling_center */}
          {user?.role !== 'admin' && user?.role !== 'recycling_center' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.nextPickup.title')}</h3>
              {pickupLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ) : pickupError ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-sm text-red-600 mb-2">{pickupError}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Try again →
                  </button>
                </div>
              ) : nextPickup && nextPickup.hasUpcoming ? (
                <div className="space-y-4">
                  {/* Date and Time */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{nextPickup.pickup.date}</p>
                      <p className="text-xs text-gray-600">{nextPickup.pickup.time}</p>
                    </div>
                    <div className="px-2 py-1 bg-teal-100 rounded-full">
                      <span className="text-xs font-medium text-teal-700">Scheduled</span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{nextPickup.pickup.location}</p>
                      <p className="text-xs text-gray-600">
                        {nextPickup.pickup.sector && nextPickup.pickup.district 
                          ? `${nextPickup.pickup.sector}, ${nextPickup.pickup.district}`
                          : t('home.nextPickup.location')
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Company */}
                  {nextPickup.pickup.company && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{nextPickup.pickup.company}</p>
                        <p className="text-xs text-gray-600">Collection Company</p>
                      </div>
                      <div className="px-2 py-1 bg-green-100 rounded-full">
                        <span className="text-xs font-medium text-green-700">Assigned</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <div className="mt-4">
                    <button 
                      onClick={() => navigate('/waste-collections')}
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      View All Collections
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {nextPickup?.message || 'No upcoming waste pickup scheduled'}
                  </p>
                  <button 
                    onClick={() => navigate('/waste-collections')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Schedule a pickup →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Next Drop-off - Only show for regular users */}
          {user?.role === 'user' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.nextDropoff.title')}</h3>
              {dropoffLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading dropoff information...</span>
                </div>
              ) : dropoffError ? (
                <div className="text-sm text-red-600">
                  {dropoffError}
                </div>
              ) : nextDropoff?.hasUpcoming ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nextDropoff.dropoff.location}</p>
                      <p className="text-xs text-gray-500">{nextDropoff.dropoff.date}</p>
                      <p className="text-xs text-gray-500">{nextDropoff.dropoff.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nextDropoff.dropoff.title}</p>
                      <p className="text-xs text-gray-500">{nextDropoff.dropoff.organizer}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {nextDropoff?.message || 'No upcoming dropoff events scheduled'}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events - Only show for regular users */}
          {user?.role === 'user' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.events.title')}</h3>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading events...</span>
                </div>
              ) : eventsError ? (
                <div className="text-sm text-red-600">
                  {eventsError}
                </div>
              ) : events.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No upcoming events found
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event, idx) => (
                    <div key={event.id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        event.color === 'green' ? 'bg-green-100' :
                        event.color === 'orange' ? 'bg-orange-100' :
                        event.color === 'blue' ? 'bg-blue-100' :
                        event.color === 'purple' ? 'bg-purple-100' :
                        'bg-red-100'
                      }`}>
                        <div className={`${
                          event.color === 'green' ? 'text-green-600' :
                          event.color === 'orange' ? 'text-orange-600' :
                          event.color === 'blue' ? 'text-blue-600' :
                          event.color === 'purple' ? 'text-purple-600' :
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
              )}
            </div>
          )}
        </div>
      </div>
      {/* Recycling Center Dashboard - Only show for users with role 'recycling_center' */}
      {user?.role === 'recycling_center' && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('recyclingCenter.dashboard')}</h2>
          
          {/* Error Display for Recycling Bookings */}
          {recyclingError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{recyclingError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/recycling-bookings')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recyclingLoading ? '...' : recyclingBookings.length}
                      </p>
                      <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/recycling-bookings?filter=today')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recyclingLoading ? '...' : (() => {
                          const today = new Date().toISOString().split('T')[0];
                          return recyclingBookings.filter(booking => 
                            booking.dropoff_date === today
                          ).length;
                        })()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Active today</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/recycling-bookings?filter=week')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recyclingLoading ? '...' : (() => {
                          const today = new Date();
                          const startOfWeek = new Date(today);
                          startOfWeek.setDate(today.getDate() - today.getDay());
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 6);
                          
                          return recyclingBookings.filter(booking => {
                            const bookingDate = new Date(booking.dropoff_date);
                            return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
                          }).length;
                        })()}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Scheduled</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/recycling-bookings?filter=today')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Capacity</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recyclingLoading ? '...' : (() => {
                          const today = new Date().toISOString().split('T')[0];
                          const todayBookings = recyclingBookings.filter(booking => 
                            booking.dropoff_date === today
                          ).length;
                          const capacity = 50; // Assuming 50 bookings per day capacity
                          return Math.round((todayBookings / capacity) * 100);
                        })()}%
                      </p>
                      <p className="text-xs text-orange-600 mt-1">Daily usage</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <RefreshCcw className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
                    <p className="text-sm text-gray-500 mt-1">Daily booking trends and target achievement</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-teal-500"></span>
                      <span className="font-medium">Actual Bookings</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-blue-400"></span>
                      <span className="font-medium">Daily Target</span>
                    </span>
                  </div>
                </div>
                
                {/* Enhanced Weekly Chart */}
                <div className="relative h-80 bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 p-6">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full border-t border-gray-200"
                        style={{ top: `${(i * 25)}%` }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 p-6">
                    <span className="font-medium">25</span>
                    <span>20</span>
                    <span>15</span>
                    <span>10</span>
                    <span>5</span>
                    <span>0</span>
                  </div>
                  
                  {/* Enhanced Chart Bars */}
                  <div className="relative h-full flex items-end justify-between px-12">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                      const bookings = recyclingLoading ? 0 : (() => {
                        const today = new Date();
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        const targetDate = new Date(startOfWeek);
                        targetDate.setDate(startOfWeek.getDate() + idx);
                        const targetDateStr = targetDate.toISOString().split('T')[0];
                        
                        return recyclingBookings.filter(booking => 
                          booking.dropoff_date === targetDateStr
                        ).length;
                      })();
                      
                      // Enhanced data with realistic targets and performance
                      const targetBookings = [18, 20, 22, 19, 21, 15, 12][idx]; // Different targets for each day
                      const height = (bookings / 25) * 100; // Max 25 bookings
                      const targetHeight = (targetBookings / 25) * 100;
                      const performance = bookings > 0 ? Math.round((bookings / targetBookings) * 100) : 0;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center relative group">
                          {/* Value labels on hover */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                              <div className="font-medium mb-1">{day}</div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                                <span>Actual: {bookings}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                <span>Target: {targetBookings}</span>
                              </div>
                              <div className={`text-xs font-medium mt-1 ${
                                performance >= 100 ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {performance}% of target
                              </div>
                            </div>
                          </div>
                          
                          {/* Bars Container */}
                          <div className="flex flex-col items-center gap-2 h-64 w-16">
                            {/* Target Bar */}
                            <div
                              className="w-full bg-gradient-to-t from-blue-300 to-blue-200 rounded-t-lg opacity-60 transition-all duration-300"
                              style={{ height: `${targetHeight}%` }}
                            >
                              {/* Inner highlight */}
                              <div className="w-full h-1/3 bg-white opacity-30 rounded-t-lg"></div>
                            </div>
                            
                            {/* Actual Bookings Bar */}
                            <div
                              className={`w-full rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer absolute bottom-0 ${
                                performance >= 100 
                                  ? 'bg-gradient-to-t from-green-600 to-green-500 hover:from-green-700 hover:to-green-600' 
                                  : performance >= 80 
                                    ? 'bg-gradient-to-t from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500'
                                    : 'bg-gradient-to-t from-red-500 to-red-400 hover:from-red-600 hover:to-red-500'
                              }`}
                              style={{ height: `${height}%` }}
                            >
                              {/* Inner highlight */}
                              <div className="w-full h-1/3 bg-white opacity-20 rounded-lg"></div>
                              
                              {/* Performance indicator */}
                              {performance > 0 && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                  <div className={`text-xs font-bold px-1 py-0.5 rounded ${
                                    performance >= 100 ? 'bg-green-100 text-green-800' : 
                                    performance >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {performance}%
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Day label */}
                          <span className="text-xs text-gray-600 mt-3 text-center font-medium">
                            {day}
                          </span>
                          
                          {/* Booking count */}
                          <div className="text-xs font-bold text-gray-700 mt-1">
                            {bookings}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* X-axis */}
                  <div className="absolute bottom-0 left-12 right-0 h-px bg-gray-300"></div>
                  
                  {/* Y-axis */}
                  <div className="absolute top-0 bottom-0 left-12 w-px bg-gray-300"></div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Daily booking performance vs targets
                  </p>
                </div>
                
                {/* Enhanced Performance Summary */}
                <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const totalBookings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce((sum, day, idx) => {
                          const bookings = recyclingLoading ? 0 : (() => {
                            const today = new Date();
                            const startOfWeek = new Date(today);
                            startOfWeek.setDate(today.getDate() - today.getDay());
                            const targetDate = new Date(startOfWeek);
                            targetDate.setDate(startOfWeek.getDate() + idx);
                            const targetDateStr = targetDate.toISOString().split('T')[0];
                            
                            return recyclingBookings.filter(booking => 
                              booking.dropoff_date === targetDateStr
                            ).length;
                          })();
                          return sum + bookings;
                        }, 0);
                        return totalBookings;
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">Total This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {(() => {
                        const totalBookings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce((sum, day, idx) => {
                          const bookings = recyclingLoading ? 0 : (() => {
                            const today = new Date();
                            const startOfWeek = new Date(today);
                            startOfWeek.setDate(today.getDate() - today.getDay());
                            const targetDate = new Date(startOfWeek);
                            targetDate.setDate(startOfWeek.getDate() + idx);
                            const targetDateStr = targetDate.toISOString().split('T')[0];
                            
                            return recyclingBookings.filter(booking => 
                              booking.dropoff_date === targetDateStr
                            ).length;
                          })();
                          return sum + bookings;
                        }, 0);
                        return Math.round(totalBookings / 7);
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">Daily Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(() => {
                        const totalTarget = [18, 20, 22, 19, 21, 15, 12].reduce((sum, target) => sum + target, 0);
                        const totalBookings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce((sum, day, idx) => {
                          const bookings = recyclingLoading ? 0 : (() => {
                            const today = new Date();
                            const startOfWeek = new Date(today);
                            startOfWeek.setDate(today.getDate() - today.getDay());
                            const targetDate = new Date(startOfWeek);
                            targetDate.setDate(startOfWeek.getDate() + idx);
                            const targetDateStr = targetDate.toISOString().split('T')[0];
                            
                            return recyclingBookings.filter(booking => 
                              booking.dropoff_date === targetDateStr
                            ).length;
                          })();
                          return sum + bookings;
                        }, 0);
                        return totalTarget > 0 ? Math.round((totalBookings / totalTarget) * 100) : 0;
                      })()}%
                    </div>
                    <div className="text-xs text-gray-500">Target Achievement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(() => {
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const targetBookings = [18, 20, 22, 19, 21, 15, 12][dayOfWeek];
                        const todayBookings = recyclingLoading ? 0 : (() => {
                          const todayStr = today.toISOString().split('T')[0];
                          return recyclingBookings.filter(booking => 
                            booking.dropoff_date === todayStr
                          ).length;
                        })();
                        return targetBookings;
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">Today's Target</div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                  <button 
                    onClick={() => navigate('/recycling-center')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                
                {recyclingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recyclingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recyclingBookings.slice(0, 5).map((booking) => {
                      const bookingDate = new Date(booking.dropoff_date);
                      const formattedDate = bookingDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.user_name} {booking.user_last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.sector}, {booking.district}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                            <p className="text-xs text-gray-500">{booking.time_slot}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Calendar className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">No bookings found</p>
                    <p className="text-xs text-gray-400 mt-1">New bookings will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Today's Schedule</h3>
                {recyclingLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (() => {
                  const today = new Date().toISOString().split('T')[0];
                  const todayBookings = recyclingBookings.filter(booking => 
                    booking.dropoff_date === today
                  );
                  
                  return todayBookings.length > 0 ? (
                    <div className="space-y-3">
                      {todayBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {booking.user_name} {booking.user_last_name}
                            </p>
                            <p className="text-xs text-gray-500">{booking.time_slot}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {booking.sector}, {booking.district}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No bookings scheduled for today
                    </div>
                  );
                })()}
              </div>

              {/* Upcoming Bookings */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Upcoming Bookings</h3>
                {recyclingLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (() => {
                  const today = new Date();
                  const upcomingBookings = recyclingBookings.filter(booking => {
                    const bookingDate = new Date(booking.dropoff_date);
                    return bookingDate > today;
                  }).slice(0, 3);
                  
                  return upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookings.map((booking) => {
                        const bookingDate = new Date(booking.dropoff_date);
                        const daysUntil = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {booking.user_name} {booking.user_last_name}
                              </p>
                              <p className="text-xs text-gray-500">{booking.time_slot}</p>
                              <p className="text-xs text-blue-600 font-medium">
                                {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No upcoming bookings
                    </div>
                  );
                })()}
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Daily Bookings</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {recyclingLoading ? '...' : (() => {
                        const lastWeek = recyclingBookings.filter(booking => {
                          const bookingDate = new Date(booking.dropoff_date);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return bookingDate >= weekAgo;
                        });
                        return lastWeek.length > 0 ? Math.round(lastWeek.length / 7) : 0;
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Peak Hours</span>
                    <span className="text-sm font-semibold text-gray-900">9 AM - 2 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Most Active Day</span>
                    <span className="text-sm font-semibold text-gray-900">Wednesday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                    <span className="text-sm font-semibold text-green-600">4.8/5.0</span>
                  </div>
                </div>
              </div>

              {/* Center Information */}
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-sm p-4 sm:p-6 text-white">
                <h3 className="text-md font-semibold mb-3">Center Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-teal-200" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-xs text-teal-200">KG 50 St, Kigali</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-teal-200" />
                    <div>
                      <p className="text-sm font-medium">Operating Hours</p>
                      <p className="text-xs text-teal-200">8:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-teal-200" />
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-xs text-teal-200">+250 788 123 456</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Display Card - Only show for users with role 'user' */}
      {user?.role === 'user' && !pointsLoading && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-6 h-6 text-yellow-300" />
                  <h2 className="text-xl font-bold text-white">Recycling Points</h2>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Earn points by properly sorting your recyclables
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{userPoints.total_points}</div>
                    <div className="text-xs text-purple-200">Total Points</div>
                    <div className="text-xs text-yellow-200 mt-2">100 points to unlock a 1,000 RWF bonus!</div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <TrendingUp className="w-16 h-16 text-purple-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for points */}
      {user?.role === 'user' && pointsLoading && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="animate-pulse">
              <div className="h-6 bg-purple-400 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-purple-400 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center">
                  <div className="h-8 bg-purple-400 rounded mb-1"></div>
                  <div className="h-3 bg-purple-400 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for stats cards */}
    </div>
  );
}