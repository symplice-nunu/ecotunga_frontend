import React from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, Package, DollarSign, CheckCircle, XCircle, Hourglass } from 'lucide-react';

export default function BookingDetailsModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Hourglass className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Hourglass className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceConfirmationStatus = (priceConfirmed) => {
    if (priceConfirmed === true) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✅ Confirmed</span>;
    } else if (priceConfirmed === false) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">❌ Declined</span>;
    } else {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">⏳ Awaiting Confirmation</span>;
    }
  };

  const getPaymentConfirmationStatus = (paymentConfirmed) => {
    if (paymentConfirmed === true) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">💳 Payment Confirmed</span>;
    } else if (paymentConfirmed === false) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">💳 Payment Pending</span>;
    } else {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">💳 Awaiting Payment Confirmation</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-600">ID: #{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-gray-900">{booking.user_name} {booking.user_last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {booking.user_email}
                </p>
              </div>
              {booking.user_phone && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {booking.user_phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Drop-off Date</p>
                <p className="text-gray-900">{formatDate(booking.dropoff_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time Slot</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(booking.time_slot)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(booking.status)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
              {booking.created_at && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-gray-900">{formatDate(booking.created_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-600">District</p>
                <p className="text-gray-900">{booking.district}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sector</p>
                <p className="text-gray-900">{booking.sector}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cell</p>
                <p className="text-gray-900">{booking.cell}</p>
              </div>
              {booking.street && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Street</p>
                  <p className="text-gray-900">{booking.street}</p>
                </div>
              )}
            </div>
          </div>

          {/* Waste Types */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Waste Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {booking.waste_types && booking.waste_types.length > 0 ? (
                booking.waste_types.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {type}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No waste types specified</p>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          {booking.price && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    {parseFloat(booking.price).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'RWF'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Price Confirmation</p>
                  <div className="mt-1">
                    {getPriceConfirmationStatus(booking.price_confirmed)}
                  </div>
                </div>
                {booking.price_confirmed && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Confirmation</p>
                    <div className="mt-1">
                      {getPaymentConfirmationStatus(booking.payment_confirmed)}
                    </div>
                  </div>
                )}
                {booking.approval_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approval Notes</p>
                    <p className="text-gray-900 mt-1">{booking.approval_notes}</p>
                  </div>
                )}
                {booking.approved_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved At</p>
                    <p className="text-gray-900">{formatDate(booking.approved_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-900">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 