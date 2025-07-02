import React from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const TomorrowEventsModal = ({ isOpen, onClose, events, isLoading }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      cleanup: 'bg-blue-100 text-blue-800',
      education: 'bg-green-100 text-green-800',
      planting: 'bg-emerald-100 text-emerald-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      cleanup: '🧹',
      education: '📚',
      planting: '🌱',
      other: '📅'
    };
    return icons[category] || icons.other;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('modal.tomorrowEvents.title', 'Tomorrow\'s Events')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('modal.tomorrowEvents.subtitle', 'Community events scheduled for tomorrow')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-3 text-gray-600">{t('common.loading', 'Loading...')}</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('modal.tomorrowEvents.noEvents.title', 'No Events Tomorrow')}
              </h3>
              <p className="text-gray-500">
                {t('modal.tomorrowEvents.noEvents.description', 'There are no community events scheduled for tomorrow.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(event.category)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatTime(event.event_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{event.current_participants || 0}/{event.max_participants} participants</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="font-medium">{t('common.organizer', 'Organizer')}:</span> {event.organizer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {events.length > 0 && (
              <span>
                {t('modal.tomorrowEvents.totalEvents', '{{count}} event(s) tomorrow', { count: events.length })}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TomorrowEventsModal; 