import React, { useState } from 'react';
import { X, DollarSign, FileText, CheckCircle, AlertCircle, Star } from 'lucide-react';

export default function ApprovalModal({ isOpen, onClose, onApprove, booking, loading }) {
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [sortedProperly, setSortedProperly] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate price
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      await onApprove(booking.id, parseFloat(price), notes, sortedProperly);
      // Reset form
      setPrice('');
      setNotes('');
      setSortedProperly(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve booking');
    }
  };

  const handleClose = () => {
    setPrice('');
    setNotes('');
    setSortedProperly(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Approve Booking</h2>
              <p className="text-sm text-gray-600">Set price and send confirmation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{booking?.user_name} {booking?.user_last_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {booking?.dropoff_date ? (() => {
                    let date;
                    
                    // Handle ISO date strings (like "2026-10-09T00:00:00.000Z")
                    if (booking.dropoff_date.includes('T') || booking.dropoff_date.includes('Z')) {
                      date = new Date(booking.dropoff_date);
                    } else {
                      // Handle simple date strings (like "2026-10-09")
                      const [year, month, day] = booking.dropoff_date.split('-').map(Number);
                      date = new Date(year, month - 1, day);
                    }
                    
                    if (isNaN(date.getTime())) return 'Invalid Date';
                    return date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                  })() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">{booking?.time_slot || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-medium">{booking?.sector}, {booking?.district}</span>
              </div>
              {booking?.waste_types && booking.waste_types.length > 0 && (
                <div className="flex justify-between">
                  <span>Waste Types:</span>
                  <span className="font-medium">{booking.waste_types.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Price Input */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price (RWF)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in RWF"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  RWF
                </div>
              </div>
            </div>

            {/* Sorted Properly Checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="sortedProperly"
                checked={sortedProperly}
                onChange={(e) => setSortedProperly(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="sortedProperly" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Star className="w-4 h-4 text-blue-600" />
                Sorted properly
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  +5 points
                </span>
              </label>
            </div>

            {/* Notes Input */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes for the customer..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !price}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve & Send Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 