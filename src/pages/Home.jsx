// Home.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
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
    </div>
  );
}