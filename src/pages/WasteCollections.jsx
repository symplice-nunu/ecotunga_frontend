import React, { useState, useEffect } from 'react';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, FileText, Calendar, Clock, MapPin, Building2, Filter, RefreshCw, TrendingUp, Plus, Truck, X, Users } from 'lucide-react';

export default function WasteCollections() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        setCollections(response || []);
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

  // Update status filter when URL parameters change
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams, user]);

  // Filter collections based on status
  const filteredCollections = collections.filter(collection => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'denied') {
      return collection.status === 'denied' || collection.status === 'rejected';
    }
    return collection.status === statusFilter;
  });

  // Get unique statuses for filter options
  const availableStatuses = [...new Set(collections.map(collection => collection.status))].filter(Boolean);

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

  // Helper function to check if location data is valid (not placeholder)
  const isValidLocationData = (value) => {
    if (!value) return false;
    const placeholderValues = ['Unknown', 'Ratione voluptatem', 'N/A', 'TBD', ''];
    const isValid = !placeholderValues.includes(value.trim());
    console.log(`🔍 Location validation: "${value}" -> ${isValid}`);
    return isValid;
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
              to="/collection"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              {t('home.bookCollection.button')}
            </Link>
          </div>
        )}
        </div>

        

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with Filter */}
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
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? t('common.loading') || 'Loading...' : `${filteredCollections.length} ${t('home.wasteCollections.collections') || 'collections'}`}
                </div>
              </div>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="p-6">
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
            ) : filteredCollections.length > 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCollections.slice(0, 10).map((collection, index) => (
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
    </div>
  );
} 