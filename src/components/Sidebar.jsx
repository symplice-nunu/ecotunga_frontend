import { Home as HomeIcon, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-100 p-6 flex flex-col justify-between fixed h-full">
      <div>
        {/* App Logo */}
        <div className="mb-12 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-400 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-500 text-transparent bg-clip-text">
            {t('common.appName')}
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/home')}
            className={`w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:shadow-sm group ${
              isActive('/home') ? 'bg-teal-50 text-teal-600 shadow-sm' : ''
            }`}
          >
            <div className={`p-1.5 rounded-lg group-hover:bg-teal-100/50 transition-all ${
              isActive('/home') ? 'bg-teal-100/50' : ''
            }`}>
              <HomeIcon size={20} className={`${isActive('/home') ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'}`} />
            </div>
            <span className="font-medium">{t('common.home')}</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:shadow-sm group ${
              isActive('/profile') ? 'bg-teal-50 text-teal-600 shadow-sm' : ''
            }`}
          >
            <div className={`p-1.5 rounded-lg group-hover:bg-teal-100/50 transition-all ${
              isActive('/profile') ? 'bg-teal-100/50' : ''
            }`}>
              <User size={20} className={`${isActive('/profile') ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'}`} />
            </div>
            <span className="font-medium">{t('common.profile')}</span>
          </button>
          <button
            onClick={() => navigate('/users')}
            className={`w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:shadow-sm group ${
              isActive('/users') ? 'bg-teal-50 text-teal-600 shadow-sm' : ''
            }`}
          >
            <div className={`p-1.5 rounded-lg group-hover:bg-teal-100/50 transition-all ${
              isActive('/users') ? 'bg-teal-100/50' : ''
            }`}>
              <User size={20} className={`${isActive('/users') ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'}`} />
            </div>
            <span className="font-medium">{t('common.users')}</span>
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-6 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-lg rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-red-100/50 transition-all">
            <LogOut size={20} />
          </div>
          <span className="font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
}