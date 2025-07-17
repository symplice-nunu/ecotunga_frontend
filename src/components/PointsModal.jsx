import React from 'react';
import { X, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PointsModal = ({ isOpen, onClose, userPoints, isLoading }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recycling Points</h2>
              <p className="text-sm text-gray-500">Your recycling achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Points */}
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {userPoints?.total_points || 0}
                </div>
                <div className="text-sm text-gray-500">Total Points Earned</div>
              </div>

              {/* Progress to next bonus */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress to next bonus</span>
                  <span className="text-sm text-purple-600 font-medium">
                    {userPoints?.total_points || 0}/100 points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((userPoints?.total_points || 0) / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {100 - (userPoints?.total_points || 0)} points needed for 1,000 RWF bonus
                </div>
              </div>



              {/* Rewards Info */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Available Rewards</h3>
                <div className="space-y-2 text-xs text-purple-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>100 points = 1,000 RWF bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>250 points = 3,000 RWF bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>500 points = 7,000 RWF bonus</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointsModal; 