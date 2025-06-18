import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserWasteCollections } from '../services/userApi';
import { useAuth } from '../contexts/AuthContext';
import collection from '../assets/e682b31ec1c636f1fc957bef07cbbcd23f22fe33.png';
import { Calendar, MapPin, Clock, User, Building, FileText, CheckCircle, AlertCircle, Clock as ClockIcon, XCircle, Filter } from 'lucide-react';

export default function WasteCollections() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getUserWasteCollections();
        setCollections(response.data);
      } catch (err) {
        setError('Failed to load your waste collections');
        console.error('Error fetching collections:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollections();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (pickupDate) => {
    const today = new Date();
    const pickup = new Date(pickupDate);
    const diffTime = pickup - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: 'Completed',
        icon: <CheckCircle size={16} />,
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Today',
        icon: <AlertCircle size={16} />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    } else if (diffDays <= 7) {
      return {
        text: 'Upcoming',
        icon: <ClockIcon size={16} />,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    } else {
      return {
        text: 'Scheduled',
        icon: <ClockIcon size={16} />,
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    }
  };

  const getApprovalStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        text: 'Pending Approval',
        icon: <Clock size={16} />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      approved: {
        text: 'Approved',
        icon: <CheckCircle size={16} />,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      denied: {
        text: 'Denied',
        icon: <XCircle size={16} />,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  // Filter collections based on status
  const filteredCollections = collections.filter(collection => {
    if (statusFilter === 'all') return true;
    return collection.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Collections</h3>
              <p className="text-gray-500">Fetching your waste collection history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <img src={collection} alt="Waste Collection" className="w-10 h-10" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{collections.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                My Waste Collections
              </h1>
              <p className="text-gray-600 mt-2">Track and manage your waste collection bookings</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-800">{collections.length}</p>
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
                    {collections.filter(c => c.status === 'pending').length}
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
                    {collections.filter(c => c.status === 'approved').length}
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
                    {collections.filter(c => c.status === 'denied').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Filter Collections</h3>
                <p className="text-sm text-gray-600">Show collections by status</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Collections ({collections.length})</option>
                <option value="pending">Pending ({collections.filter(c => c.status === 'pending').length})</option>
                <option value="approved">Approved ({collections.filter(c => c.status === 'approved').length})</option>
                <option value="denied">Denied ({collections.filter(c => c.status === 'denied').length})</option>
              </select>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Collections</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredCollections.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {statusFilter === 'all' ? 'No Collections Found' : `No ${statusFilter} Collections`}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {statusFilter === 'all' 
                ? 'You haven\'t booked any waste collections yet. Start your journey towards a cleaner environment!'
                : `No ${statusFilter} waste collection requests found.`
              }
            </p>
            {statusFilter === 'all' && (
              <a
                href="/collection"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Calendar className="w-5 h-5" />
                Book Your First Collection
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCollections.map((collection, index) => {
              const status = getStatusBadge(collection.pickup_date);
              return (
                <div 
                  key={collection.id} 
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4 mb-4 lg:mb-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-2xl">🗑️</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">
                            Collection #{collection.id}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {collection.name} {collection.last_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.className}`}>
                          {status.icon}
                          <span className="font-semibold">{status.text}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getApprovalStatusBadge(collection.status).className}`}>
                          {getApprovalStatusBadge(collection.status).icon}
                          <span className="font-semibold">{getApprovalStatusBadge(collection.status).text}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-semibold text-gray-700">{formatDate(collection.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Personal Info</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Email</span>
                            <span className="text-gray-800 font-semibold">{collection.email}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Phone</span>
                            <span className="text-gray-800 font-semibold">{collection.phone_number}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Gender</span>
                            <span className="text-gray-800 font-semibold">{collection.gender}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 font-medium">Category</span>
                            <span className="text-gray-800 font-semibold">{collection.ubudehe_category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Location</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">District</span>
                            <span className="text-gray-800 font-semibold">{collection.district}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Sector</span>
                            <span className="text-gray-800 font-semibold">{collection.sector}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Cell</span>
                            <span className="text-gray-800 font-semibold">{collection.cell}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Village</span>
                            <span className="text-gray-800 font-semibold">{collection.village}</span>
                          </div>
                          {collection.street && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-500 font-medium">Street</span>
                              <span className="text-gray-800 font-semibold">{collection.street}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pickup Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Pickup Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Date</span>
                            <span className="text-gray-800 font-semibold">{formatDate(collection.pickup_date)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Time</span>
                            <span className="text-gray-800 font-semibold">{collection.time_slot}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Company</span>
                            <span className="text-gray-800 font-semibold">{collection.company_name}</span>
                          </div>
                          {collection.company_email && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-500 font-medium">Company Email</span>
                              <span className="text-gray-800 font-semibold">{collection.company_email}</span>
                            </div>
                          )}
                          {collection.company_phone && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-500 font-medium">Company Phone</span>
                              <span className="text-gray-800 font-semibold">{collection.company_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {collection.notes && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Notes</h4>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                          <p className="text-gray-700 leading-relaxed">{collection.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 