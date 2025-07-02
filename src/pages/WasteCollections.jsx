import React, { useState, useEffect } from 'react';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, FileText, Calendar, Clock, MapPin, Building2, Filter, RefreshCw, TrendingUp } from 'lucide-react';

export default function WasteCollections() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCollections.slice(0, 10).map((collection, index) => (
                        <tr key={collection.id || index} className="hover:bg-gray-50 transition-colors duration-150">
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
    </div>
  );
} 