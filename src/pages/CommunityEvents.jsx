import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, Search, Filter, CalendarDays, Star, Heart, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { communityEventApi } from '../services/communityEventApi';
import CommunityEventForm from '../components/CommunityEventForm';
import DeleteConfirmation from '../components/DeleteConfirmation';

export default function CommunityEvents() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinedEvents, setJoinedEvents] = useState(new Set());
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', eventTitle: '' });
  const [activeTab, setActiveTab] = useState('available');

  const categories = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'cleanup', label: 'Cleanup', icon: Users },
    { id: 'education', label: 'Education', icon: CalendarDays },
    { id: 'planting', label: 'Tree Planting', icon: Star }
  ];

  // Tab options
  const tabs = [
    { id: 'available', label: 'Available Events', icon: Plus },
    { id: 'joined', label: 'Joined Events', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserEvents();
    } else {
      // Clear joined events when user logs out
      setJoinedEvents(new Set());
      // Reset to 'available' tab when user logs out
      setActiveTab('available');
    }
  }, [selectedCategory, searchTerm, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await communityEventApi.getAllEvents(filters);
      setEvents(response);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const userEvents = await communityEventApi.getUserEvents();
      const joinedEventIds = new Set(userEvents.map(event => event.id));
      setJoinedEvents(joinedEventIds);
    } catch (err) {
      console.error('Error fetching user events:', err);
    }
  };

  const handleJoinEvent = async (eventId) => {
    // Check if user is authenticated
    if (!user) {
      setError('Please log in to join events');
      return;
    }

    try {
      if (joinedEvents.has(eventId)) {
        await communityEventApi.leaveEvent(eventId);
        setJoinedEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      } else {
        await communityEventApi.joinEvent(eventId);
        setJoinedEvents(prev => {
          const newSet = new Set(prev);
          newSet.add(eventId);
          return newSet;
        });
        
        // Show notification when joining an event
        const eventTitle = events.find(e => e.id === eventId)?.title;
        setNotification({ 
          show: true, 
          message: t('communityEvents.joinedEvent'), 
          eventTitle: eventTitle 
        });
        
        // Auto-dismiss notification after 10 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', eventTitle: '' });
        }, 10000);
      }
      
      // Refresh events to update participant count
      fetchEvents();
    } catch (err) {
      console.error('Error joining/leaving event:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Please log in to join events. Your session may have expired.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to join this event.');
      } else if (err.response?.status === 404) {
        setError('Event not found.');
      } else {
        setError('Failed to join/leave event. Please try again.');
      }
    }
  };

  // CRUD handlers
  const handleCreate = async (formData) => {
    try {
      const newEvent = await communityEventApi.createEvent(formData);
      setEvents(prev => [newEvent, ...prev]);
      setShowCreateModal(false);
      setError('');
      setSuccessMessage('Event created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const updatedEvent = await communityEventApi.updateEvent(selectedEvent.id, formData);
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      setShowEditModal(false);
      setSelectedEvent(null);
      setError('');
      setSuccessMessage('Event updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
    }
  };

  const handleDelete = async () => {
    try {
      await communityEventApi.deleteEvent(selectedEvent.id);
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
      setError('');
      setSuccessMessage('Event deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'cleanup': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-green-100 text-green-800';
      case 'planting': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter events based on active tab
  const getFilteredEvents = () => {
    let filteredEvents = events;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'joined':
        filteredEvents = filteredEvents.filter(event => joinedEvents.has(event.id));
        break;
      case 'available':
        filteredEvents = filteredEvents.filter(event => !joinedEvents.has(event.id));
        break;
      default:
        // Default to available events
        filteredEvents = filteredEvents.filter(event => !joinedEvents.has(event.id));
        break;
    }

    return filteredEvents;
  };

  const isAdmin = user && user.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="px-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('communityEvents.title')}</h1>
          <p className="text-gray-600">{t('communityEvents.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} />
            {t('communityEvents.createNew')}
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('communityEvents.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <category.icon size={16} />
              <span className="hidden sm:inline">{t(`communityEvents.categories.${category.id}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Event Tabs - Only show when user is logged in */}
      {user && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                  {tab.id === 'joined' && joinedEvents.size > 0 && (
                    <span className="ml-1 bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {joinedEvents.size}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 text-center font-medium shadow-sm flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-900 font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Login Prompt Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-6 text-center font-medium shadow-sm flex items-center justify-center gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-blue-900 font-semibold">Please log in to join community events and track your participation!</span>
        </div>
      )}

      {/* Featured Events */}
      {getFilteredEvents().filter(e => e.featured).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            {t('communityEvents.featuredEvents')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredEvents()
              .filter(event => event.featured)
              .map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="relative">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop'}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    {event.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => openEditModal(event)}
                            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(event)}
                            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </>
                      )}
                      <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Heart size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {categories.find(c => c.id === event.category)?.label}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} />
                        <span>{formatDate(event.event_date)} at {event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users size={16} />
                        <span>{event.current_participants || 0}/{event.max_participants} {t('communityEvents.participants')}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{t('communityEvents.by')} {event.organizer}</span>
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={!user}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          !user
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : joinedEvents.has(event.id)
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                        title={!user ? 'Please log in to join events' : ''}
                      >
                        {!user ? 'Login to Join' : joinedEvents.has(event.id) ? t('communityEvents.joined') : t('communityEvents.joinEvent')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Events */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {activeTab === 'joined' ? 'My Joined Events' : 'Available Events'}
        </h2>
        {getFilteredEvents().length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'joined' ? 'No joined events found' : 'No available events found'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'joined' ? 'You haven\'t joined any events yet' : 'All events are currently full or you\'ve joined all available events'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredEvents().map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop'}
                    alt={event.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => openEditModal(event)}
                          className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        >
                          <Edit size={14} className="text-blue-600" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(event)}
                          className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {categories.find(c => c.id === event.category)?.label}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} />
                      <span>{event.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={14} />
                      <span>{event.current_participants || 0}/{event.max_participants}</span>
                    </div>
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={!user}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        !user
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : joinedEvents.has(event.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                      title={!user ? 'Please log in to join events' : ''}
                    >
                      {!user ? 'Login to Join' : joinedEvents.has(event.id) ? t('communityEvents.joined') : t('communityEvents.joinEvent')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CommunityEventForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Edit Event Modal */}
      <CommunityEventForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEdit}
        event={selectedEvent}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('communityEvents.deleteEvent')}
        message={t('communityEvents.deleteConfirm')}
        itemName={selectedEvent?.title}
      />

      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
              {notification.eventTitle && (
                <p className="text-sm text-gray-600 mt-1">
                  "{notification.eventTitle}"
                </p>
              )}
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', eventTitle: '' })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 