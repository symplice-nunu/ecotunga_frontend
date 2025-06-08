// Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats = [
    {
      title: t('home.stats.totalUsers'),
      value: '2,543',
      change: '+12.5%',
      icon: '👥'
    },
    {
      title: t('home.stats.activeProjects'),
      value: '45',
      change: '+8.2%',
      icon: '📊'
    },
    {
      title: t('home.stats.revenue'),
      value: '$12,450',
      change: '+15.3%',
      icon: '💰'
    },
    {
      title: t('home.stats.tasks'),
      value: '89',
      change: '+5.7%',
      icon: '✅'
    }
  ];

  const recentActivities = [
    {
      user: 'John Doe',
      action: t('home.activities.createdProject'),
      time: t('home.activities.timeAgo', { hours: 2 }),
      icon: '📝'
    },
    {
      user: 'Sarah Smith',
      action: t('home.activities.updatedProfile'),
      time: t('home.activities.timeAgo', { hours: 3 }),
      icon: '⚙️'
    },
    {
      user: 'Mike Johnson',
      action: t('home.activities.completedTask'),
      time: t('home.activities.timeAgo', { hours: 5 }),
      icon: '✅'
    }
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('home.recentActivities')}</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-gray-800">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('home.quickActions')}</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              {t('home.actions.viewProfile')}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('home.actions.settings')}
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('home.actions.analytics')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}