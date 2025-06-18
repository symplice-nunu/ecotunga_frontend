// Home.jsx
import React from 'react';
import { Calendar, Users, Truck, RefreshCcw, Clock, MapPin, CheckCircle, Info, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  // Stats cards data (updated)
  const stats = [
    {
      title: t('home.stats.users'),
      value: '123',
      icon: <Users className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
    {
      title: t('home.stats.totalAmount'),
      value: '123',
      icon: <Tag className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
    {
      title: t('home.stats.totalWastePickups'),
      value: '123',
      icon: <Truck className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
    {
      title: t('home.stats.totalRecycledMaterials'),
      value: '123',
      icon: <RefreshCcw className="w-6 h-6 text-teal-500" />,
      details: t('home.stats.viewDetails'),
    },
  ];

  // Waste collection bar chart data (months)
  const wasteData = [
    { month: 'Sept 2024', thisPeriod: 80, lastPeriod: 60 },
    { month: 'Nov 2024', thisPeriod: 70, lastPeriod: 50 },
    { month: 'Dec 2024', thisPeriod: 60, lastPeriod: 80 },
    { month: 'Jan 2025', thisPeriod: 50, lastPeriod: 70 },
    { month: 'Feb 2025', thisPeriod: 70, lastPeriod: 50 },
    { month: 'March 2025', thisPeriod: 90, lastPeriod: 60 },
    { month: 'April 2025', thisPeriod: 85, lastPeriod: 45 },
  ];

  // Recent activity (updated)
  const activities = [
    { label: t('home.recentActivity.wasteCollected'), date: '22th, march', link: true },
    { label: t('home.recentActivity.joinedCleanup', { location: 'Nyamirambo' }), date: '1st, jan', link: true },
    { label: t('home.recentActivity.recycled', { amount: '3', material: 'paper' }), date: '27th, jan', link: false },
    { label: t('home.recentActivity.unlockedBadge', { badge: 'Green Hero' }), date: '8th, April', link: false },
    { label: t('home.recentActivity.unlockedBadge', { badge: 'Green Hero' }), date: '8th, April', link: false },
    { label: t('home.recentActivity.unlockedBadge', { badge: 'Green Hero' }), date: '8th, April', link: false },
    { label: t('home.recentActivity.unlockedBadge', { badge: 'Green Hero' }), date: '8th, April', link: false },
  ];

  // Next pickups and events
  const nextPickup = {
    date: 'Thursday, July 13, 2025',
    time: '8:00 AM – 10:00 AM',
    location: 'KG 123 St',
  };
  const nextDropoff = {
    location: 'Cyivugiza Center (KG 50 St)',
    date: 'Saturday, June 15, 2025',
    time: '9:00 AM – 4:00 PM',
  };
  const events = [
    {
      title: t('home.events.umuganda'),
      date: 'July 5, 2025',
      location: 'Nyamirambo Rwanda, Kigali',
      color: 'green',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      title: t('home.events.youthLedCleanups'),
      date: 'July 5, 2025',
      location: 'Rafiki Rwanda, Kigali',
      color: 'orange',
      icon: <Info className="w-4 h-4" />,
    },
    {
      title: t('home.events.carFreeDays'),
      date: 'July 5, 2025',
      location: 'Kigali',
      color: 'red',
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  // Sorting guidelines
  const guidelines = [
    {
      icon: <RefreshCcw className="w-6 h-6 text-green-500" />,
      title: t('home.guidelines.separateBins.title'),
      desc: t('home.guidelines.separateBins.desc'),
    },
    {
      icon: <Tag className="w-6 h-6 text-yellow-500" />,
      title: t('home.guidelines.clearLabeling.title'),
      desc: t('home.guidelines.clearLabeling.desc'),
    },
    {
      icon: <Truck className="w-6 h-6 text-indigo-500" />,
      title: t('home.guidelines.foldFlatten.title'),
      desc: t('home.guidelines.foldFlatten.desc'),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('home.dashboard')}</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-50 rounded-lg p-2 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-xs text-gray-500 font-medium">{stat.title}</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
            <button className="mt-2 text-xs text-teal-600 font-semibold flex items-center gap-1 hover:underline">
              {stat.details}
              <span className="ml-1">&rarr;</span>
            </button>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Chart & Activity */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{t('home.wasteCollection.title')}</h2>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-teal-400"></span>
                  {t('home.wasteCollection.thisPeriod')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-amber-200"></span>
                  {t('home.wasteCollection.lastPeriod')}
                </span>
              </div>
            </div>
            {/* Bar Chart Representation */}
            <div className="flex items-end gap-2 sm:gap-4 h-32 sm:h-48 overflow-x-auto">
              {wasteData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
                  <div className="flex items-end gap-1 h-24 sm:h-40">
                    <div
                      className="w-4 sm:w-6 rounded-t bg-teal-400"
                      style={{ height: `${(item.thisPeriod / 100) * 96}px` }}
                    ></div>
                    <div
                      className="w-4 sm:w-6 rounded-t bg-amber-200"
                      style={{ height: `${(item.lastPeriod / 100) * 96}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('home.recentActivity.title')}</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {activities.map((activity, idx) => (
                <li key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm sm:text-base">
                    {activity.link ? (
                      <button onClick={() => {}} className="text-teal-600 hover:underline font-medium">
                        {activity.label}
                      </button>
                    ) : (
                      <span className="text-gray-700">{activity.label}</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400">{activity.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar: Next Pickup, Drop-off, Events */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Next Waste Pickup */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.nextPickup.title')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{nextPickup.date}</p>
                  <p className="text-xs text-gray-500">{nextPickup.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{nextPickup.location}</p>
                  <p className="text-xs text-gray-500">{t('home.nextPickup.location')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Drop-off */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.nextDropoff.title')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{nextDropoff.location}</p>
                  <p className="text-xs text-gray-500">{t('home.nextDropoff.location')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{nextDropoff.date}</p>
                  <p className="text-xs text-gray-500">{nextDropoff.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">{t('home.events.title')}</h3>
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    event.color === 'green' ? 'bg-green-100' :
                    event.color === 'orange' ? 'bg-orange-100' :
                    'bg-red-100'
                  }`}>
                    <div className={`${
                      event.color === 'green' ? 'text-green-600' :
                      event.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {event.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                    <p className="text-xs text-gray-500 truncate">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Guidelines */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('home.guidelines.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {guidelines.map((guideline, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
              <div className="flex-shrink-0">
                {guideline.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{guideline.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{guideline.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}