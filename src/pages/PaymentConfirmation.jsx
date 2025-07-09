import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { confirmRecyclingCenterBookingPayment } from '../services/recyclingCenterApi';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  
  const action = searchParams.get('action');

  useEffect(() => {
    const handleConfirmation = async () => {
      if (!action || !id) {
        setError('Invalid confirmation link');
        setLoading(false);
        return;
      }

      const isConfirmed = action === 'confirm';
      setConfirmed(isConfirmed);

      try {
        await confirmRecyclingCenterBookingPayment(id, isConfirmed);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to confirm payment');
      } finally {
        setLoading(false);
      }
    };

    handleConfirmation();
  }, [id, action]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment Confirmation</h2>
            <p className="text-gray-600">Please wait while we process your payment confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Confirmation Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Intent Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for confirming your payment intent. The recycling center has been notified and is preparing for your visit.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Bring your recyclable materials to the recycling center</li>
                <li>• Pay the quoted amount at the center</li>
                <li>• Drop off your materials during your scheduled time</li>
                <li>• Receive confirmation of your recycling contribution</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => navigate('/recycling-center/bookings')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 