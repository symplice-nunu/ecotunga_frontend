import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getRecyclingCenterBookingsByCompany } from '../services/recyclingCenterApi';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function RecyclingRequest() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, today, upcoming, past

  useEffect(() => {
    if (user?.role === 'recycling_center') {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRecyclingCenterBookingsByCompany();
      setBookings(response.bookings || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load recycling requests';
      setError(errorMessage);
      console.error('Error fetching recycling requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return 'text-red-600 bg-red-50';
    } else if (bookingDate.getTime() === today.getTime()) {
      return 'text-blue-600 bg-blue-50';
    } else {
      return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return <XCircle size={16} />;
    } else if (bookingDate.getTime() === today.getTime()) {
      return <AlertCircle size={16} />;
    } else {
      return <CheckCircle size={16} />;
    }
  };

  const getStatusText = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return 'Past';
    } else if (bookingDate.getTime() === today.getTime()) {
      return 'Today';
    } else {
      return 'Upcoming';
    }
  };

  const filterBookings = () => {
    if (filter === 'all') return bookings;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.dropoff_date);
      bookingDate.setHours(0, 0, 0, 0);
      
      switch (filter) {
        case 'today':
          return bookingDate.getTime() === today.getTime();
        case 'upcoming':
          return bookingDate > today;
        case 'past':
          return bookingDate < today;
        default:
          return true;
      }
    });
  };

  const filteredBookings = filterBookings();

  if (user?.role !== 'recycling_center') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recycling Requests</h1>
              <p className="text-gray-600 mt-2">Manage and view all recycling center booking requests</p>
            </div>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <FileText size={24} className="text-teal-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {bookings.filter(b => {
                      const today = new Date();
                      const bookingDate = new Date(b.dropoff_date);
                      return today.toDateString() === bookingDate.toDateString();
                    }).length}
                  </p>
                </div>
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => {
                      const today = new Date();
                      const bookingDate = new Date(b.dropoff_date);
                      return bookingDate > today;
                    }).length}
                  </p>
                </div>
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Past</p>
                  <p className="text-2xl font-bold text-red-600">
                    {bookings.filter(b => {
                      const today = new Date();
                      const bookingDate = new Date(b.dropoff_date);
                      return bookingDate < today;
                    }).length}
                  </p>
                </div>
                <XCircle size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All Requests' },
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-teal-600" />
            <span className="ml-3 text-gray-600">Loading requests...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle size={32} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Requests</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No recycling requests have been made yet.'
                : `No ${filter} recycling requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(booking.dropoff_date)}`}>
                      {getStatusIcon(booking.dropoff_date)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.user_name} {booking.user_last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{getStatusText(booking.dropoff_date)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.dropoff_date)}`}>
                    {getStatusText(booking.dropoff_date)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <strong>Date:</strong> {formatDate(booking.dropoff_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <strong>Time:</strong> {booking.time_slot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <strong>Location:</strong> {booking.district}, {booking.sector}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{booking.user_email}</span>
                      </div>
                      {booking.user_phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{booking.user_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Address Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>District:</strong> {booking.district}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Sector:</strong> {booking.sector}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Cell:</strong> {booking.cell}
                      </p>
                      {booking.street && (
                        <p className="text-sm text-gray-600">
                          <strong>Street:</strong> {booking.street}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 