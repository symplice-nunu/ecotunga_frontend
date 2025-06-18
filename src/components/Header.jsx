import React, { useState } from 'react';
import { BellIcon, GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  // For demo, hardcode user info. Replace with real user data as needed.
  const user = {
    name: 'Sophia Adams',
    role: 'Mentor',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', // Replace with your avatar source
  };
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' }
  ];
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center h-16 lg:h-20 px-4 lg:px-8">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu size={24} />
        </button>

        {/* Breadcrumb - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          <span className="text-gray-400 font-medium">{t('header.home')}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">{t('header.dashboard')}</span>
        </nav>

        {/* Right side: Language, Notification, User */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Language Switcher - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <GlobeAltIcon className="h-5 w-5 text-gray-500" />
              <span className="flex items-center">
                <span className="mr-2">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>
            {isLanguageMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        i18n.changeLanguage(language.code);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`${
                        i18n.language === language.code
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } flex items-center w-full px-4 py-2 text-sm`}
                      role="menuitem"
                    >
                      <span className="mr-2">{language.flag}</span>
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification */}
          <button 
            className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50"
            aria-label={t('header.notifications')}
          >
            <BellIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 lg:gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border border-gray-200"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</span>
              <span className="text-xs text-gray-400 leading-tight">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;