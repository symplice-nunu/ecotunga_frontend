import React, { useState, useEffect } from 'react';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, User, FileText, CheckCircle, AlertCircle, XCircle, Check, X, Filter, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminWasteCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCollections, setExpandedCollections] = useState(new Set());

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await wasteCollectionApi.getWasteCollectionsByCompany();
        // The wasteCollectionApi returns data directly, not wrapped in a data property
        setCollections(response || []);
        setFilteredCollections(response || []);
      } catch (err) {
        setError('Failed to load waste collections');
        console.error('Error fetching collections:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollections();
    }
  }, [user]);

  // Filter collections based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      // Don't show approved or denied collections in the main view
      const filtered = collections.filter(collection => collection.status === 'pending');
      setFilteredCollections(filtered);
    } else {
      const filtered = collections.filter(collection => collection.status === statusFilter);
      setFilteredCollections(filtered);
    }
  }, [statusFilter, collections]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        text: 'Pending',
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

  const handleAction = async (collection, action) => {
    setSelectedCollection(collection);
    setActionType(action);
    setAdminNotes('');
    setShowModal(true);
  };

  const toggleExpanded = (collectionId) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const confirmAction = async () => {
    if (!selectedCollection || !actionType) return;

    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await wasteCollectionApi.approveWasteCollection(selectedCollection.id, adminNotes);
      } else if (actionType === 'deny') {
        await wasteCollectionApi.denyWasteCollection(selectedCollection.id, adminNotes);
      }

      // Refresh the collections list
      const response = await wasteCollectionApi.getWasteCollectionsByCompany();
      setCollections(response || []);
      
      setShowModal(false);
      setSelectedCollection(null);
      setActionType('');
      setAdminNotes('');
    } catch (err) {
      setError(`Failed to ${actionType} collection`);
      console.error(`Error ${actionType}ing collection:`, err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Collections</h3>
              <p className="text-gray-500">Fetching all waste collection requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Waste Collection Management
              </h1>
              <p className="text-gray-600 mt-2">Review and manage waste collection requests</p>
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          </div> */}

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
                  <option value="all">All Collections ({collections.filter(c => c.status === 'pending').length})</option>
                  <option value="pending">Pending ({collections.filter(c => c.status === 'pending').length})</option>
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredCollections.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {statusFilter === 'all' ? 'No Collections Found' : `No ${statusFilter} Collections`}
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No waste collection requests have been submitted yet.'
                : `No ${statusFilter} waste collection requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCollections.map((collection) => {
              const status = getStatusBadge(collection.status);
              const isExpanded = expandedCollections.has(collection.id);
              return (
                <div 
                  key={collection.id} 
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Compact Row */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                          <span className="text-white text-lg">🗑️</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-6">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                Collection #{collection.id}
                              </h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {collection.name} {collection.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-semibold text-gray-800">{collection.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-semibold text-gray-800">{collection.phone_number}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${status.className}`}>
                          {status.icon}
                          <span className="font-semibold">{status.text}</span>
                        </div>
                        <button
                          onClick={() => toggleExpanded(collection.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="p-6">
                        <div className="grid lg:grid-cols-2 gap-8 mb-6">
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
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Category</span>
                                <span className="text-gray-800 font-semibold">{collection.ubudehe_category}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Pickup Date</span>
                                <span className="text-gray-800 font-semibold">{formatDate(collection.pickup_date)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500 font-medium">Pickup Time</span>
                                <span className="text-gray-800 font-semibold">{collection.time_slot}</span>
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
                              {collection.street && (
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-gray-500 font-medium">Street</span>
                                  <span className="text-gray-800 font-semibold">{collection.street}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {collection.notes && (
                          <div className="mb-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800">Customer Notes</h4>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                              <p className="text-gray-700 leading-relaxed">{collection.notes}</p>
                            </div>
                          </div>
                        )}

                        {collection.admin_notes && (
                          <div className="mb-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-indigo-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800">Admin Notes</h4>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                              <p className="text-gray-700 leading-relaxed">{collection.admin_notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {collection.status === 'pending' && (
                          <div className="flex gap-4 pt-6 border-t border-gray-100">
                            <button
                              onClick={() => handleAction(collection, 'approve')}
                              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              <Check className="w-5 h-5" />
                              Approve Request
                            </button>
                            <button
                              onClick={() => handleAction(collection, 'deny')}
                              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              <X className="w-5 h-5" />
                              Deny Request
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Approve/Deny */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {actionType === 'approve' ? 'Approve' : 'Deny'} Collection Request
            </h3>
            <p className="text-gray-600 mb-6">
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this waste collection request?' 
                : 'Are you sure you want to deny this waste collection request?'}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={`Add notes for ${actionType === 'approve' ? 'approval' : 'denial'}...`}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-300"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={processing}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  actionType === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processing ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Deny')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 