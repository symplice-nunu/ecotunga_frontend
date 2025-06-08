import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    API.get('/profile')
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-white p-1 mx-auto">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  {profile?.name ? (
                    <span className="text-4xl font-bold text-gray-600">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">?</span>
                  )}
                </div>
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">{profile?.name || t('profile.loading')}</h2>
            <p className="text-blue-100">{profile?.email || ''}</p>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8">
            {profile ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{t('profile.userId')}</h3>
                      <p className="text-gray-600">{profile.id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{t('profile.fullName')}</h3>
                      <p className="text-gray-600">{profile.name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{t('profile.emailAddress')}</h3>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => navigate('/home')} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t('profile.backToHome')}
                  </button>
                  <button 
                    onClick={() => navigate('/edit-profile')} 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('profile.editProfile')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
