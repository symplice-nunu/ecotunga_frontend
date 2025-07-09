import {
  Home,
  Calendar,
  Recycle,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Building2,
  Shield,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  // Navigation structure
  const navSections = [
    {
      header: t('sidebar.sections.home'),
      items: [
        { label: t('sidebar.sections.items.dashboard'), icon: Home, path: '/home' },
        //...(user?.role === 'user' ? [{ label: t('sidebar.sections.items.wasteCollection'), icon: Calendar, path: '/collection' }] : []),
        // { label: 'My Collections', icon: List, path: '/waste-collections' },
        // Only show Manage Collections for admin users
        ...(user?.role === 'waste_collector' ? [{ label: 'Manage Collections', icon: Shield, path: '/admin-waste-collections' }] : []),
        // Only show Recycling Center for recycling_center and admin users
        //...(user?.role === 'user' ? [{ label: t('sidebar.sections.items.recyclingCenter'), icon: Recycle, path: '/recycling-center' }] : []),
        // Only show Community Events for admin users
        ...(user?.role === 'user' || user?.role === 'admin' ? [{ label: t('sidebar.sections.items.communityEvents'), icon: Users, path: '/community' }] : []),
        // Only show Education Materials for admin users
        ...(user?.role === 'user' || user?.role === 'admin' ? [{ label: t('sidebar.sections.items.educationMaterials'), icon: BookOpen, path: '/education' }] : []),
        // Only show Users section for admin users
        ...(user?.role === 'admin' ? [{ label: t('sidebar.sections.items.users'), icon: Users, path: '/users' }] : []),
        // Only show Companies section for admin users
        ...(user?.role === 'admin' ? [{ label: t('sidebar.sections.items.companies'), icon: Building2, path: '/companies' }] : []),
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-xl border-r border-gray-100 p-4 flex flex-col justify-between fixed h-full overflow-y-auto">
      <div>
        {/* Logo and App Name with Mobile Close Button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-400 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-500 text-transparent bg-clip-text">
              EcoTunga
            </h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('sidebar.search')}
              className="w-full pl-4 pr-16 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-200 bg-gray-50 text-gray-700"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-400 border border-gray-200">⌘ K</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav>
          {navSections.map(section => (
            <div key={section.header} className="mb-4">
              <div className="px-4 py-1 text-xs font-semibold text-gray-400 tracking-widest">{section.header}</div>
              <ul className="space-y-1 mt-1">
                {section.items.map(item => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                        ${isActive(item.path)
                          ? 'bg-teal-50 text-teal-600 shadow-sm'
                          : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}
                      `}
                    >
                      <item.icon size={18} className={`${isActive(item.path) ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600'}`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Help & Center and Logout */}
      <div className="mb-2">
        <button
          onClick={() => handleNavigation('/profile')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-600 mb-2 group"
        >
          <Settings size={18} className="text-gray-400 group-hover:text-teal-600" />
          <span>{t('sidebar.settings')}</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 group"
        >
          <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
}