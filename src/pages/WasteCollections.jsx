import React, { useState, useEffect } from 'react';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { getReceiptsByWasteCollectionId } from '../services/receiptApi';
import { getUserRecyclingCenterBookings, getRecyclingCenterBookingsByCompany, getAllRecyclingCenterBookings, cancelRecyclingCenterBooking } from '../services/recyclingCenterApi';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, FileText, Calendar, Clock, MapPin, Building2, Filter, RefreshCw, TrendingUp, Plus, Truck, X, Users, Receipt, Recycle, Trash2, CheckCircle } from 'lucide-react';

export default function WasteCollections() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [recyclingBookings, setRecyclingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recyclingLoading, setRecyclingLoading] = useState(false);
  const [error, setError] = useState('');
  const [recyclingError, setRecyclingError] = useState('');
      const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('waste'); // 'waste' or 'recycling'
  
  // Recycling center modal state
  const [selectedRecyclingBooking, setSelectedRecyclingBooking] = useState(null);
  const [showRecyclingModal, setShowRecyclingModal] = useState(false);
  
  // Cancel booking modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch waste collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Fetching waste collections for user:', user);
        console.log('👤 User role:', user?.role);
        
        let response;
        if (user?.role === 'admin') {
          // For admin users, get all waste collections
          console.log('🔍 Admin user - fetching all waste collections');
          response = await wasteCollectionApi.getAllWasteCollections();
        } else if (user?.role === 'waste_collector') {
          // For waste collectors, get collections assigned to their company
          console.log('🔍 Waste collector - fetching collections by company');
          response = await wasteCollectionApi.getWasteCollectionsByCompany();
        } else {
          // For regular users, get their own collections
          console.log('🔍 Regular user - fetching user waste collections');
          response = await wasteCollectionApi.getUserWasteCollections();
        }
        
        console.log('✅ API response received:', response);
        // Ensure we always set an array, even if the response is not an array
        const collectionsArray = Array.isArray(response) ? response : (response?.collections || response?.data || []);
        setCollections(collectionsArray);
      } catch (err) {
        console.error('❌ Error fetching collections:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: err.config
        });
        
        let errorMessage = 'Failed to load waste collections';
        
        if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view these collections.';
        } else if (err.response?.status === 404) {
          errorMessage = 'No collections found for your account.';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollections();
    } else {
      console.log('⚠️ No user found, skipping fetch');
      setLoading(false);
    }
  }, [user]);

  // Fetch recycling center bookings
  useEffect(() => {
    const fetchRecyclingBookings = async () => {
      try {
        setRecyclingLoading(true);
        setRecyclingError('');
        
        console.log('🔍 Fetching recycling center bookings for user:', user);
        console.log('👤 User role:', user?.role);
        
        let response;
        if (user?.role === 'admin') {
          // For admin users, get all recycling center bookings
          console.log('🔍 Admin user - fetching all recycling center bookings');
          response = await getAllRecyclingCenterBookings();
        } else if (user?.role === 'recycling_center') {
          // For recycling center owners, get bookings for their center
          console.log('🔍 Recycling center owner - fetching bookings by company');
          response = await getRecyclingCenterBookingsByCompany();
        } else {
          // For regular users, get their own bookings
          console.log('🔍 Regular user - fetching user recycling center bookings');
          response = await getUserRecyclingCenterBookings();
        }
        
        console.log('✅ Recycling API response received:', response);
        // Ensure we always set an array, even if the response is not an array
        const bookingsArray = Array.isArray(response) ? response : (response?.bookings || response?.data || []);
        setRecyclingBookings(bookingsArray);
      } catch (err) {
        console.error('❌ Error fetching recycling bookings:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: err.config
        });
        
        let errorMessage = 'Failed to load recycling center bookings';
        
        if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view these bookings.';
        } else if (err.response?.status === 404) {
          errorMessage = 'No recycling center bookings found for your account.';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setRecyclingError(errorMessage);
      } finally {
        setRecyclingLoading(false);
      }
    };

    if (user) {
      fetchRecyclingBookings();
    } else {
      console.log('⚠️ No user found, skipping recycling fetch');
      setRecyclingLoading(false);
    }
  }, [user]);

  // Update status filter when URL parameters change
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams, user]);

  // Ensure only users with role 'user' can access recycling tab
  useEffect(() => {
    if (user && user.role !== 'user' && activeTab === 'recycling') {
      setActiveTab('waste');
    }
  }, [user, activeTab]);

  // Filter collections based on status
  const filteredCollections = collections.filter(collection => {
    // Don't show cancelled collections in the list
    if (collection.status === 'cancelled') return false;
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'denied') {
      return collection.status === 'denied' || collection.status === 'rejected';
    }
    return collection.status === statusFilter;
  });

  // Filter recycling bookings based on status
  const filteredRecyclingBookings = (Array.isArray(recyclingBookings) ? recyclingBookings : []).filter(booking => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'denied') {
      return booking.status === 'denied' || booking.status === 'rejected';
    }
    return booking.status === statusFilter;
  });

  // Get unique statuses for filter options (combine both collections and recycling bookings)
  const allStatuses = [
    ...(Array.isArray(collections) ? collections : []).map(collection => collection.status),
    ...(Array.isArray(recyclingBookings) ? recyclingBookings : []).map(booking => booking.status)
  ].filter(Boolean);
  const availableStatuses = [...new Set(allStatuses)];

  // Calculate statistics
  // const totalCollections = collections.length;
  // const approvedCollections = collections.filter(c => c.status === 'approved').length;
  // const pendingCollections = collections.filter(c => c.status === 'pending').length;
  // const completedCollections = collections.filter(c => c.status === 'completed').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'denied':
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✓';
      case 'pending': return '⏳';
      case 'denied':
      case 'rejected': return '✗';
      case 'completed': return '✓';
      case 'cancelled': return '🚫';
      default: return '?';
    }
  };

  const getPaymentStatusColor = (paymentStatus, collectionStatus) => {
    // Determine payment status based on collection status if payment_status is not set
    let effectivePaymentStatus = paymentStatus;
    if (!paymentStatus || paymentStatus === 'pending') {
      switch (collectionStatus) {
        case 'approved':
        case 'completed':
          effectivePaymentStatus = 'paid';
          break;
        case 'denied':
        case 'rejected':
          effectivePaymentStatus = 'cancelled';
          break;
        default:
          effectivePaymentStatus = 'pending';
      }
    }

    switch (effectivePaymentStatus) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (paymentStatus, collectionStatus) => {
    // Determine payment status based on collection status if payment_status is not set
    let effectivePaymentStatus = paymentStatus;
    if (!paymentStatus || paymentStatus === 'pending') {
      switch (collectionStatus) {
        case 'approved':
        case 'completed':
          effectivePaymentStatus = 'paid';
          break;
        case 'denied':
        case 'rejected':
          effectivePaymentStatus = 'cancelled';
          break;
        default:
          effectivePaymentStatus = 'pending';
      }
    }

    switch (effectivePaymentStatus) {
      case 'paid': return '💳';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      case 'refunded': return '↩️';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  const getEffectivePaymentStatus = (paymentStatus, collectionStatus) => {
    // Determine payment status based on collection status if payment_status is not set
    if (!paymentStatus || paymentStatus === 'pending') {
      switch (collectionStatus) {
        case 'approved':
        case 'completed':
          return 'paid';
        case 'denied':
        case 'rejected':
          return 'cancelled';
        default:
          return 'pending';
      }
    }
    return paymentStatus;
  };

  const handleRowClick = (collection) => {
    console.log('🔍 Collection data for modal:', collection);
    console.log('🏢 Company location fields:', {
      company_street: collection.company_street,
      company_village: collection.company_village,
      company_cell: collection.company_cell,
      company_sector: collection.company_sector,
      company_district: collection.company_district
    });
    console.log('🏢 All company fields:', Object.keys(collection).filter(key => key.startsWith('company_')));
    setSelectedCollection(collection);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCollection(null);
  };

  const handleViewReceipt = async (collection, event) => {
    event.stopPropagation(); // Prevent row click
    
    // Only show receipt for paid collections
    const effectivePaymentStatus = getEffectivePaymentStatus(collection.payment_status, collection.status);
    if (effectivePaymentStatus !== 'paid') {
      return;
    }

    try {
      setReceiptLoading(true);
      const response = await getReceiptsByWasteCollectionId(collection.id);
      
      if (response.receipts && response.receipts.length > 0) {
        setSelectedReceipt(response.receipts[0]); // Get the first receipt
        setShowReceiptModal(true);
      } else {
        alert('No receipt found for this collection.');
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Failed to load receipt. Please try again.');
    } finally {
      setReceiptLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedReceipt(null);
  };

  // Recycling center modal handlers
  const handleRecyclingRowClick = (booking) => {
    console.log('🔍 Recycling booking data for modal:', booking);
    setSelectedRecyclingBooking(booking);
    setShowRecyclingModal(true);
  };

  const closeRecyclingModal = () => {
    setShowRecyclingModal(false);
    setSelectedRecyclingBooking(null);
  };

  const handleCancelRecyclingBooking = async (bookingId, event) => {
    event.stopPropagation(); // Prevent row click
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleCancelWasteCollection = async (collectionId, event) => {
    event.stopPropagation(); // Prevent row click
    setCancelBookingId(collectionId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return;
    
    try {
      if (activeTab === 'recycling') {
        setRecyclingLoading(true);
        await cancelRecyclingCenterBooking(cancelBookingId);
        
        // Refresh the recycling bookings list after cancellation
        let response;
        if (user?.role === 'admin') {
          response = await getAllRecyclingCenterBookings();
        } else if (user?.role === 'recycling_center') {
          response = await getRecyclingCenterBookingsByCompany();
        } else {
          response = await getUserRecyclingCenterBookings();
        }
        
        const bookingsArray = Array.isArray(response) ? response : (response?.bookings || response?.data || []);
        setRecyclingBookings(bookingsArray);
      } else {
        setLoading(true);
        console.log('🔍 Attempting to cancel waste collection with ID:', cancelBookingId);
        try {
          const result = await wasteCollectionApi.cancelWasteCollection(cancelBookingId);
          console.log('✅ Cancel waste collection result:', result);
        } catch (error) {
          console.error('❌ Error in cancelWasteCollection:', error);
          console.error('❌ Error response:', error.response);
          throw error;
        }
        
        // Refresh the waste collections list after cancellation
        let response;
        if (user?.role === 'admin') {
          response = await wasteCollectionApi.getAllWasteCollections();
        } else if (user?.role === 'waste_collector') {
          response = await wasteCollectionApi.getWasteCollectionsByCompany();
        } else {
          response = await wasteCollectionApi.getUserWasteCollections();
        }
        
        const collectionsArray = Array.isArray(response) ? response : (response?.collections || response?.data || []);
        setCollections(collectionsArray);
      }
      
      setShowCancelModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      const errorMsg = err.response?.data?.error || 'Failed to cancel booking. Please try again.';
      setErrorMessage(errorMsg);
      setShowCancelModal(false);
      setShowErrorModal(true);
    } finally {
      setRecyclingLoading(false);
      setLoading(false);
    }
  };

  // Helper function to check if location data is valid (not placeholder)
  const isValidLocationData = (value) => {
    if (!value) return false;
    const placeholderValues = ['Unknown', 'Ratione voluptatem', 'N/A', 'TBD', ''];
    const isValid = !placeholderValues.includes(value.trim());
    console.log(`🔍 Location validation: "${value}" -> ${isValid}`);
    return isValid;
  };

  // Helper functions for recycling center bookings
  const getRecyclingStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'denied':
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRecyclingStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✓';
      case 'pending': return '⏳';
      case 'denied':
      case 'rejected': return '✗';
      case 'completed': return '✓';
      case 'cancelled': return '🚫';
      default: return '?';
    }
  };

  const formatRecyclingDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRecyclingTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  // Waste types mapping for display
  const wasteTypesMapping = {
    'plastic_bottles': { label: 'Plastic Bottles', icon: '🥤' },
    'plastic_bags': { label: 'Plastic Bags', icon: '🛍️' },
    'paper': { label: 'Paper & Cardboard', icon: '📄' },
    'glass': { label: 'Glass', icon: '🍾' },
    'aluminum': { label: 'Aluminum Cans', icon: '🥫' },
    'steel': { label: 'Steel/Metal', icon: '🔧' },
    'electronics': { label: 'Electronics (E-waste)', icon: '💻' },
    'batteries': { label: 'Batteries', icon: '🔋' },
    'textiles': { label: 'Textiles & Clothing', icon: '👕' },
    'organic': { label: 'Organic Waste', icon: '🍃' },
    'construction': { label: 'Construction Materials', icon: '🧱' },
    'automotive': { label: 'Automotive Parts', icon: '🚗' },
    'medical': { label: 'Medical Waste', icon: '🏥' },
    'hazardous': { label: 'Hazardous Materials', icon: '⚠️' },
    'other': { label: 'Other Materials', icon: '📦' }
  };

  const formatWasteType = (wasteType) => {
    if (!wasteType) return 'Not specified';
    
    // Try to parse as JSON array first (for multiple waste types)
    try {
      const wasteTypesArray = JSON.parse(wasteType);
      if (Array.isArray(wasteTypesArray)) {
        return wasteTypesArray.map(type => {
          const typeInfo = wasteTypesMapping[type];
          return typeInfo ? `${typeInfo.icon} ${typeInfo.label}` : type;
        });
      }
    } catch (e) {
      // If parsing fails, treat as single waste type
    }
    
    // Fallback to single waste type
    const typeInfo = wasteTypesMapping[wasteType];
    return typeInfo ? [`${typeInfo.icon} ${typeInfo.label}`] : [wasteType];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {user?.role === 'admin' ? t('home.wasteCollections.adminTitle') : (t('home.wasteCollections.title') || 'My Waste Collections')}
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                {user?.role === 'admin' ? t('home.wasteCollections.adminSubtitle') : t('home.wasteCollections.userSubtitle')}
              </p>
            </div>
          </div>
        {/* Book Collection Button - Only show for users with role 'user' */}
        {user?.role === 'user' && (
          <div className="mb-6">
            <Link
              to={activeTab === 'recycling' ? '/recycling-center' : '/collection'}
              onClick={() => {
                if (activeTab === 'recycling') {
                  localStorage.setItem('bookRecyclingClicked', '1');
                } else {
                  localStorage.setItem('bookCollectionClicked', '1');
                }
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'recycling' 
                ? (t('recyclingCenter.bookRecycling') || 'Book Recycling')
                : (t('home.bookCollection.button') || 'Book Collection')
              }
            </Link>
          </div>
        )}
        </div>

        

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.role === 'admin' ? t('home.wasteCollections.allWasteCollections') : (t('home.wasteCollections.title') || 'Waste Collections')}
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                    {t('home.wasteCollections.filterByStatus') || 'Filter by status:'}
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="all">{t('home.wasteCollections.allStatuses') || 'All Statuses'}</option>
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>
                        {t(`home.wasteCollections.statuses.${status}`) || status}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <RefreshCw className={`w-4 h-4 ${(loading || recyclingLoading) ? 'animate-spin' : ''}`} />
                  {loading || recyclingLoading ? t('common.loading') || 'Loading...' : 
                    activeTab === 'waste' ? 
                      `${Array.isArray(filteredCollections) ? filteredCollections.length : 0} ${t('home.wasteCollections.collections') || 'collections'}` :
                      `${Array.isArray(filteredRecyclingBookings) ? filteredRecyclingBookings.length : 0} ${t('recyclingCenter.bookings') || 'bookings'}`
                  }
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab('waste');
                    setStatusFilter('all');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                    activeTab === 'waste'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  {t('home.wasteCollections.tabTitle') || 'Waste Collections'}
                </button>
                {/* Only show Recycling Center tab for users with role 'user' */}
                {user?.role === 'user' && (
                  <button
                    onClick={() => {
                      setActiveTab('recycling');
                      setStatusFilter('all');
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                      activeTab === 'recycling'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Recycle className="w-4 h-4" />
                    {t('recyclingCenter.tabTitle') || 'Recycling Center'}
                  </button>
                )}
              </nav>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="p-6">
            {activeTab === 'waste' ? (
              // Waste Collections Tab
              <>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Collections</h3>
                    <p className="text-gray-600">{error}</p>
                  </div>
                ) : (Array.isArray(filteredCollections) && filteredCollections.length > 0) ? (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t('home.wasteCollections.date') || 'Date'}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {t('home.wasteCollections.time') || 'Time'}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {t('home.wasteCollections.location') || 'Location'}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('home.wasteCollections.status') || 'Status'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {t('home.wasteCollections.company') || 'Company'}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💳</span>
                            Payment
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Receipt
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-red-500" />
                            {t('home.wasteCollections.actions') || 'Actions'}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(Array.isArray(filteredCollections) ? filteredCollections : []).slice(0, 10).map((collection, index) => (
                        <tr 
                          key={collection.id || index} 
                          className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => handleRowClick(collection)}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {collection.pickup_date ? new Date(collection.pickup_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {collection.time_slot || 'TBD'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <MapPin className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{collection.street || 'N/A'}</div>
                                <div className="text-sm text-gray-500">
                                  {collection.sector && collection.district 
                                    ? `${collection.sector}, ${collection.district}`
                                    : t('home.wasteCollections.locationNotSpecified') || 'Location not specified'
                                  }
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(collection.status)}`}>
                              <span className="text-lg">{getStatusIcon(collection.status)}</span>
                              {collection.status ? t(`home.wasteCollections.statuses.${collection.status}`) || collection.status : t('home.wasteCollections.statuses.unknown') || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-50 rounded-lg">
                                <Building2 className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {collection.company_name || t('home.wasteCollections.notAssigned') || 'Not Assigned'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getPaymentStatusIcon(collection.payment_status, collection.status)}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(collection.payment_status, collection.status)}`}>
                                {t(`home.wasteCollections.paymentStatuses.${getEffectivePaymentStatus(collection.payment_status, collection.status)}`) || getEffectivePaymentStatus(collection.payment_status, collection.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const effectivePaymentStatus = getEffectivePaymentStatus(collection.payment_status, collection.status);
                              if (effectivePaymentStatus === 'paid') {
                                return (
                                  <button
                                    onClick={(e) => handleViewReceipt(collection, e)}
                                    disabled={receiptLoading}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {receiptLoading ? (
                                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Receipt className="w-4 h-4" />
                                    )}
                                    View Receipt
                                  </button>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                                    <Receipt className="w-4 h-4" />
                                    Not Available
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              // Only show cancel button for pending or approved collections that haven't been completed
                              if (collection.status === 'pending' || collection.status === 'approved') {
                                return (
                                  <button
                                    onClick={(e) => handleCancelWasteCollection(collection.id, e)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Cancel
                                  </button>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                    Not Available
                                  </span>
                                );
                              }
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredCollections.length > 10 && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">
                        {t('home.wasteCollections.showing', { shown: 10, total: filteredCollections.length }) || `Showing 10 of ${filteredCollections.length} collections`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' 
                    ? t('home.wasteCollections.noCollectionsFound') || 'No waste collections found'
                    : t('home.wasteCollections.noCollectionsWithStatus', { status: t(`home.wasteCollections.statuses.${statusFilter}`) || statusFilter }) || `No collections with status: ${statusFilter}`
                  }
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {statusFilter === 'all' 
                    ? t('home.wasteCollections.noCollectionsMessage') || 'You haven\'t booked any waste collections yet. Start by scheduling your first collection!'
                    : t('home.wasteCollections.tryDifferentStatus') || 'Try selecting a different status filter to see more collections.'
                  }
                </p>
              </div>
            )}
              </>
            ) : (
              // Recycling Center Tab
              <>
                {recyclingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : recyclingError ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Recycling Bookings</h3>
                    <p className="text-gray-600">{recyclingError}</p>
                  </div>
                ) : (Array.isArray(filteredRecyclingBookings) && filteredRecyclingBookings.length > 0) ? (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {t('recyclingCenter.date') || 'Date'}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {t('recyclingCenter.time') || 'Time'}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {t('recyclingCenter.location') || 'Location'}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {t('recyclingCenter.status') || 'Status'}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {t('recyclingCenter.center') || 'Recycling Center'}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">♻️</span>
                                {t('recyclingCenter.wasteType') || 'Waste Type'}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500" />
                                {t('recyclingCenter.actions') || 'Actions'}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(Array.isArray(filteredRecyclingBookings) ? filteredRecyclingBookings : []).slice(0, 10).map((booking, index) => (
                            <tr 
                              key={booking.id || index} 
                              className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                              onClick={() => handleRecyclingRowClick(booking)}
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatRecyclingDate(booking.dropoff_date)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 font-medium">
                                  {formatRecyclingTime(booking.time_slot)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{booking.street || 'N/A'}</div>
                                    <div className="text-sm text-gray-500">
                                      {booking.sector && booking.district 
                                        ? `${booking.sector}, ${booking.district}`
                                        : t('recyclingCenter.locationNotSpecified') || 'Location not specified'
                                      }
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border ${getRecyclingStatusColor(booking.status)}`}>
                                  {/* <span className="text-lg">{getRecyclingStatusIcon(booking.status)}</span> */}
                                  {t(`recyclingCenter.statuses.${booking.status}`) || booking.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-50 rounded-lg">
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.company_name || t('recyclingCenter.notAssigned') || 'Not Assigned'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col gap-1">
                                    {Array.isArray(formatWasteType(booking.waste_type)) ? 
                                      formatWasteType(booking.waste_type).map((type, index) => (
                                        <span key={index} className="px-2 py-1 text-xs font-medium rounded-full border bg-green-50 text-green-700 border-green-200">
                                          {type}
                                        </span>
                                      ))
                                    : (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-50 text-green-700 border-green-200">
                                        {formatWasteType(booking.waste_type)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                                                             <td className="px-6 py-4">
                                 <button
                                   onClick={(e) => handleCancelRecyclingBooking(booking.id, e)}
                                   className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                   Cancel
                                 </button>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                      <Recycle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {statusFilter === 'all' 
                                            ? t('recyclingCenter.noBookingsFound') || 'No recycling center bookings found'
                    : t('recyclingCenter.noBookingsWithStatus', { status: t(`recyclingCenter.statuses.${statusFilter}`) || statusFilter }) || `No bookings with status: ${statusFilter}`
                      }
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {statusFilter === 'all' 
                                            ? t('recyclingCenter.noBookingsMessage') || 'You haven\'t booked any recycling center visits yet. Start by scheduling your first visit!'
                    : t('recyclingCenter.tryDifferentStatus') || 'Try selecting a different status filter to see more bookings.'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collection Details Modal */}
      {showModal && selectedCollection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {t('home.wasteCollections.collectionDetails') || 'Collection Details'}
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1">
                      Collection #{selectedCollection.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              
              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-emerald-100 font-medium">
                  {t('home.wasteCollections.status') || 'Status'}
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 border-white/30 backdrop-blur-sm ${getStatusColor(selectedCollection.status)}`}>
                  <span className="text-lg">{getStatusIcon(selectedCollection.status)}</span>
                  {selectedCollection.status ? t(`home.wasteCollections.statuses.${selectedCollection.status}`) || selectedCollection.status : t('home.wasteCollections.statuses.unknown') || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              {/* Date and Time Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Schedule Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {t('home.wasteCollections.pickupDate') || 'Pickup Date'}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 bg-white rounded-lg p-3 border border-blue-200">
                      {selectedCollection.pickup_date ? new Date(selectedCollection.pickup_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not scheduled'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {t('home.wasteCollections.timeSlot') || 'Time Slot'}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 bg-white rounded-lg p-3 border border-blue-200">
                      {selectedCollection.time_slot || 'To be determined'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  {t('home.wasteCollections.assignedCompany') || 'Assigned Company'}
                </h3>
                <div className="mb-4">
                  <div className="text-xl font-bold text-gray-900 bg-white rounded-lg p-4 border border-purple-200">
                    {selectedCollection.company_name || t('home.wasteCollections.notAssigned') || 'Not Assigned'}
                  </div>
                </div>
                
                {/* Company Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    {t('home.wasteCollections.companyLocation') || 'Company Location'}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-purple-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Street</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedCollection.company_street || 'Not available'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Village</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedCollection.company_village || 'Not available'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Cell</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedCollection.company_cell || 'Not available'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Sector</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedCollection.company_sector || 'Not available'}
                        </div>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">District</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedCollection.company_district || 'Not available'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information (for admin users) */}
              {user?.role === 'admin' && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    {t('home.wasteCollections.customer') || 'Customer'}
                  </h3>
                  <div className="mb-4">
                    <div className="text-xl font-bold text-gray-900 bg-white rounded-lg p-4 border border-emerald-200">
                      {selectedCollection.name && selectedCollection.last_name 
                        ? `${selectedCollection.name} ${selectedCollection.last_name}`
                        : 'Customer name not available'
                      }
                    </div>
                    {selectedCollection.phone && (
                      <div className="mt-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-emerald-200">
                        <span className="font-medium">Phone:</span> {selectedCollection.phone}
                      </div>
                    )}
                  </div>
                  
                  {/* Customer Location */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {t('home.wasteCollections.customerLocation') || 'Customer Location'}
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Street</div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedCollection.street || 'Street address not provided'}
                          </div>
                        </div>
                        {selectedCollection.house_number && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">House Number</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedCollection.house_number}
                            </div>
                          </div>
                        )}
                        {selectedCollection.sector && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Sector</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedCollection.sector}
                            </div>
                          </div>
                        )}
                        {selectedCollection.district && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">District</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedCollection.district}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes (if available) */}
              {selectedCollection.admin_notes && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    {t('home.wasteCollections.adminNotes') || 'Admin Notes'}
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <div className="text-sm text-amber-800 leading-relaxed">
                      {selectedCollection.admin_notes}
                    </div>
                  </div>
                </div>
              )}

              {/* Collection ID */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  {t('home.wasteCollections.collectionId') || 'Collection ID'}
                </h3>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-lg font-mono font-bold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    #{selectedCollection.id || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  Payment Information
                </h3>
                <div className="space-y-4">
                  {/* Payment Status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-lg">{getPaymentStatusIcon(selectedCollection.payment_status, selectedCollection.status)}</span>
                      {t('home.wasteCollections.paymentStatus') || 'Payment Status'}
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-indigo-200">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 ${getPaymentStatusColor(selectedCollection.payment_status, selectedCollection.status)}`}>
                        <span className="text-lg">{getPaymentStatusIcon(selectedCollection.payment_status, selectedCollection.status)}</span>
                        {t(`home.wasteCollections.paymentStatuses.${getEffectivePaymentStatus(selectedCollection.payment_status, selectedCollection.status)}`) || getEffectivePaymentStatus(selectedCollection.payment_status, selectedCollection.status)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  {selectedCollection.payment_amount && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">💰</span>
                        {t('home.wasteCollections.paymentAmount') || 'Payment Amount'}
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-indigo-200">
                        <div className="text-xl font-bold text-gray-900">
                          RWF {parseFloat(selectedCollection.payment_amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {selectedCollection.payment_method && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">🏦</span>
                        {t('home.wasteCollections.paymentMethod') || 'Payment Method'}
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-indigo-200">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {selectedCollection.payment_method.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction ID */}
                  {selectedCollection.transaction_id && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">🆔</span>
                        {t('home.wasteCollections.transactionId') || 'Transaction ID'}
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-indigo-200">
                        <div className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                          {selectedCollection.transaction_id}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Date */}
                  {selectedCollection.payment_date && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">📅</span>
                        {t('home.wasteCollections.paymentDate') || 'Payment Date'}
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-indigo-200">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(selectedCollection.payment_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Receipt className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Payment Receipt
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1">
                      Receipt #{selectedReceipt.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeReceiptModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Receipt Header */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 text-xl">✅</span>
                  </div>
                  <h4 className="text-lg font-semibold text-green-800">Booking Confirmed</h4>
                  <p className="text-sm text-gray-600">Receipt #{selectedReceipt.booking_id}</p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedReceipt.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedReceipt.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selectedReceipt.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{selectedReceipt.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Date:</span>
                  <span className="font-medium">{selectedReceipt.pickup_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Slot:</span>
                  <span className="font-medium">{selectedReceipt.time_slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{selectedReceipt.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{selectedReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Date:</span>
                  <span className="font-medium">{selectedReceipt.transaction_date}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">RWF {parseFloat(selectedReceipt.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  📄 Print Receipt
                </button>
                <button
                  onClick={closeReceiptModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recycling Center Booking Details Modal */}
      {showRecyclingModal && selectedRecyclingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Recycle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Recycling Center Booking Details
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1">
                      Booking #{selectedRecyclingBooking.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeRecyclingModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              
              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-emerald-100 font-medium">
                  Status
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 border-white/30 backdrop-blur-sm ${getRecyclingStatusColor(selectedRecyclingBooking.status)}`}>
                  <span className="text-lg">{getRecyclingStatusIcon(selectedRecyclingBooking.status)}</span>
                  {selectedRecyclingBooking.status ? selectedRecyclingBooking.status : 'Pending'}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              {/* Date and Time Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Schedule Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Drop-off Date
                    </div>
                    <div className="text-lg font-semibold text-gray-900 bg-white rounded-lg p-3 border border-blue-200">
                      {selectedRecyclingBooking.dropoff_date ? new Date(selectedRecyclingBooking.dropoff_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not scheduled'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Time Slot
                    </div>
                    <div className="text-lg font-semibold text-gray-900 bg-white rounded-lg p-3 border border-blue-200">
                      {selectedRecyclingBooking.time_slot || 'To be determined'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recycling Center Information Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Recycling Center
                </h3>
                <div className="mb-4">
                  <div className="text-xl font-bold text-gray-900 bg-white rounded-lg p-4 border border-purple-200">
                    {selectedRecyclingBooking.company_name || 'Not Assigned'}
                  </div>
                </div>
                
                {/* Waste Type */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">♻️</span>
                    Waste Type{(() => {
                      try {
                        const wasteTypesArray = JSON.parse(selectedRecyclingBooking.waste_type);
                        if (Array.isArray(wasteTypesArray) && wasteTypesArray.length > 1) {
                          return 's';
                        }
                      } catch (e) {}
                      return '';
                    })()}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatWasteType(selectedRecyclingBooking.waste_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information (for admin and recycling center users) */}
              {(user?.role === 'admin' || user?.role === 'recycling_center') && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Customer
                  </h3>
                  <div className="mb-4">
                    <div className="text-xl font-bold text-gray-900 bg-white rounded-lg p-4 border border-emerald-200">
                      {selectedRecyclingBooking.user_name && selectedRecyclingBooking.user_last_name 
                        ? `${selectedRecyclingBooking.user_name} ${selectedRecyclingBooking.user_last_name}`
                        : 'Customer name not available'
                      }
                    </div>
                    {selectedRecyclingBooking.user_email && (
                      <div className="mt-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-emerald-200">
                        <span className="font-medium">Email:</span> {selectedRecyclingBooking.user_email}
                      </div>
                    )}
                    {selectedRecyclingBooking.user_phone && (
                      <div className="mt-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-emerald-200">
                        <span className="font-medium">Phone:</span> {selectedRecyclingBooking.user_phone}
                      </div>
                    )}
                  </div>
                  
                  {/* Customer Location */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Customer Location
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Street</div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedRecyclingBooking.street || 'Street address not provided'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Cell</div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedRecyclingBooking.cell || 'Not available'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Sector</div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedRecyclingBooking.sector || 'Not available'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">District</div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedRecyclingBooking.district || 'Not available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {selectedRecyclingBooking.notes && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Additional Notes
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <div className="text-sm text-gray-900 leading-relaxed">
                      {selectedRecyclingBooking.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={closeRecyclingModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100">
            <div className="relative bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Trash2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {t('recyclingCenter.confirmCancellation') || 'Confirm Cancellation'}
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                      {activeTab === 'recycling' 
                        ? (t('recyclingCenter.cancelConfirmation') || 'Are you sure you want to cancel this booking? This action cannot be undone.')
                        : (t('home.wasteCollections.cancelConfirmation') || 'Are you sure you want to cancel this collection? This action cannot be undone.')
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6 max-h-[40vh] overflow-y-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-4xl">
                  ⚠️
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('recyclingCenter.cancelWarning') || 'This action cannot be undone'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'recycling'
                    ? (t('recyclingCenter.cancelWarningMessage') || 'The booking will be permanently cancelled and removed from your list.')
                    : (t('home.wasteCollections.cancelWarningMessage') || 'The collection will be permanently cancelled and removed from your list.')
                  }
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={confirmCancelBooking}
                  disabled={recyclingLoading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {recyclingLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('recyclingCenter.cancelling') || 'Cancelling...'}
                    </div>
                  ) : (
                    t('recyclingCenter.confirmCancel') || 'Confirm Cancel'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={recyclingLoading}
                  className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 disabled:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100">
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {activeTab === 'recycling'
                        ? (t('recyclingCenter.bookingCancelled') || 'Booking Cancelled')
                        : (t('home.wasteCollections.collectionCancelled') || 'Collection Cancelled')
                      }
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {activeTab === 'recycling'
                        ? (t('recyclingCenter.bookingCancelledMessage') || 'Your booking has been successfully cancelled.')
                        : (t('home.wasteCollections.collectionCancelledMessage') || 'Your collection has been successfully cancelled.')
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6 max-h-[40vh] overflow-y-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-4xl">
                  ✓
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('common.cancellationSuccessful') || 'Cancellation Successful'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'recycling'
                    ? (t('recyclingCenter.cancellationSuccessfulMessage') || 'The booking has been removed from your list and the recycling center has been notified.')
                    : (t('home.wasteCollections.cancellationSuccessfulMessage') || 'The collection has been removed from your list and the waste collection company has been notified.')
                  }
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('common.ok') || 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100">
            <div className="relative bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {t('common.cancellationFailed') || 'Cancellation Failed'}
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                      {activeTab === 'recycling'
                        ? (t('recyclingCenter.cancellationFailedMessage') || 'There was an error cancelling your booking.')
                        : (t('home.wasteCollections.cancellationFailedMessage') || 'There was an error cancelling your collection.')
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6 max-h-[40vh] overflow-y-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-4xl">
                  ✗
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('recyclingCenter.errorOccurred') || 'An Error Occurred'}
                </h3>
                <p className="text-gray-600">
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('common.ok') || 'OK'}
                </button>
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setShowCancelModal(true);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('common.tryAgain') || 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
} 