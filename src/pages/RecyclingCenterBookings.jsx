import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getRecyclingCenterBookingsByCompany, approveRecyclingCenterBooking } from '../services/recyclingCenterApi';
import { Calendar, Clock, MapPin, User, Phone, Mail, Search, ArrowLeft, XCircle, CheckCircle, Hourglass, Ban } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal';
import BookingDetailsModal from '../components/BookingDetailsModal';

function getInitials(name, lastName) {
  if (!name) return '';
  if (!lastName) return name[0].toUpperCase();
  return (name[0] + lastName[0]).toUpperCase();
}

export default function RecyclingCenterBookings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchParams] = useSearchParams();
  const filterFromUrl = searchParams.get('filter') || 'all';
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, booking: null });
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, booking: null });

  useEffect(() => {
    setDateFilter(filterFromUrl);
    window.scrollTo(0, 0);
  }, [filterFromUrl]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getRecyclingCenterBookingsByCompany();
        setBookings(response.bookings || response || []);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load bookings';
        setError(errorMessage);
        console.error('Error fetching recycling bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'recycling_center') {
      fetchBookings();
    }
  }, [user]);

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = dateFilter === 'all' || (() => {
      const today = new Date().toISOString().split('T')[0];
      const bookingDate = booking.dropoff_date;
      switch (dateFilter) {
        case 'today':
          return bookingDate === today;
        case 'week':
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return bookingDate >= startOfWeek.toISOString().split('T')[0] && 
                 bookingDate <= endOfWeek.toISOString().split('T')[0];
        case 'month':
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const bookingMonth = new Date(bookingDate).getMonth();
          const bookingYear = new Date(bookingDate).getFullYear();
          return bookingMonth === currentMonth && bookingYear === currentYear;
        default:
          return true;
      }
    })();
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status, price, priceConfirmed, paymentConfirmed) => {
    const statusElement = (() => {
      switch (status) {
        case 'approved':
          return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle className="w-4 h-4" /> Approved</span>;
        case 'completed':
          return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><CheckCircle className="w-4 h-4" /> Completed</span>;
        case 'pending':
          return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"><Hourglass className="w-4 h-4" /> Pending</span>;
        case 'cancelled':
          return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><Ban className="w-4 h-4" /> Cancelled</span>;
        default:
          return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"><XCircle className="w-4 h-4" /> Unknown</span>;
      }
    })();

    return (
      <div className="flex flex-col gap-1">
        {statusElement}
        {price && status === 'approved' && (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
              💰 {parseFloat(price).toLocaleString('en-US', {
                style: 'currency',
                currency: 'RWF'
              })}
            </span>
            {priceConfirmed === true && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✅ Confirmed
              </span>
            )}
            {priceConfirmed === false && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                ❌ Declined
              </span>
            )}
            {priceConfirmed === null && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                ⏳ Awaiting Confirmation
              </span>
            )}
            {priceConfirmed === true && (
              paymentConfirmed === true ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  💳 Payment Confirmed
                </span>
              ) : paymentConfirmed === false ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  💳 Payment Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  💳 Awaiting Payment Confirmation
                </span>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  const handleApproveBooking = async (bookingId, price, notes) => {
    setApprovalLoading(true);
    try {
      await approveRecyclingCenterBooking(bookingId, price, notes);
      // Refresh the bookings list
      const response = await getRecyclingCenterBookingsByCompany();
      setBookings(response.bookings || response || []);
      // Show success message (you can add a toast notification here)
      alert('Booking approved successfully! Email sent to customer.');
    } catch (error) {
      console.error('Error approving booking:', error);
      throw error;
    } finally {
      setApprovalLoading(false);
    }
  };

  const openApprovalModal = (booking) => {
    setApprovalModal({ isOpen: true, booking });
  };

  const closeApprovalModal = () => {
    setApprovalModal({ isOpen: false, booking: null });
  };

  const openDetailsModal = (booking) => {
    setDetailsModal({ isOpen: true, booking });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ isOpen: false, booking: null });
  };

  if (user?.role !== 'recycling_center') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Recycling Center Bookings</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredBookings.length} of {bookings.length} bookings
              </span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <img src="https://undraw.co/api/illustrations/undraw_empty_re_opql.svg" alt="No bookings" className="w-32 h-32 mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'No bookings have been made yet.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* User Avatar and Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 border-2 border-blue-200">
                      {getInitials(booking.user_name, booking.user_last_name)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {booking.user_name} {booking.user_last_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 gap-2 truncate">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{booking.user_email}</span>
                    </div>
                    {booking.user_phone && (
                      <div className="flex items-center text-sm text-gray-600 gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{booking.user_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Booking Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">
                        {booking.sector}, {booking.district}
                      </p>
                      {booking.street && (
                        <p className="text-sm text-gray-600">{booking.street}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.dropoff_date)}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatTime(booking.time_slot)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Waste Types & Status */}
                <div className="flex flex-col gap-2 min-w-[180px]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {booking.waste_types && booking.waste_types.length > 0 && booking.waste_types.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <div>{getStatusBadge(booking.status, booking.price, booking.price_confirmed, booking.payment_confirmed)}</div>
                </div>
                {/* Notes & Actions */}
                <div className="flex flex-col gap-2 min-w-[180px]">
                  {booking.notes && (
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-700 mb-2 border border-gray-100">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => openDetailsModal(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow"
                    >
                      <User className="w-4 h-4" /> View Details
                    </button>
                    {booking.status !== 'approved' && (
                      <button 
                        onClick={() => openApprovalModal(booking)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Price
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        <ApprovalModal
          isOpen={approvalModal.isOpen}
          onClose={closeApprovalModal}
          onApprove={handleApproveBooking}
          booking={approvalModal.booking}
          loading={approvalLoading}
        />

        {/* Booking Details Modal */}
        <BookingDetailsModal
          isOpen={detailsModal.isOpen}
          onClose={closeDetailsModal}
          booking={detailsModal.booking}
        />
      </div>
    </div>
  );
} 