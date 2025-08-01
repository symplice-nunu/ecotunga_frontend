import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/login_logo.png';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { login } = useAuth();
  const successMessage = location.state?.successMessage;
  const from = location.state?.from || searchParams.get('from') || '/home';
  const isRedirected = location.state?.from || searchParams.get('from');

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from);
    } catch (err) {
      console.log('Login error:', err);
      let msg = err?.response?.data?.message || err?.message || t('auth.loginError') || 'Unknown error';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-green-200 p-4">
      <div className="w-full max-w-5xl bg-white/0 rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Illustration and Company Info */}
        <div className="lg:w-1/2 flex flex-col justify-between items-center bg-gradient-to-br from-green-200 via-blue-100 to-green-100 p-6 sm:p-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-lg p-2">
                  {/* Logo icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <rect x="8" y="8" width="8" height="8" rx="2" fill="#fff" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-gray-800">Ecotunga.</div>
                  <div className="text-xs text-gray-500">Kigali, Rwanda</div>
                </div>
              </div>
              <LanguageSelector />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Illustration Placeholder */}
            <img src={logo} alt="Illustration" className="w-48 h-48 sm:w-72 sm:h-72 object-contain" />
          </div>
        </div>
        
        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{t('common.welcome')}</h2>
              <p className="text-gray-500 text-sm">{t('auth.enterDetails')}</p>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}
            
            {isRedirected && (
              <></>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('auth.email')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
              </div>
              
              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('auth.password')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
                <button 
                  type="button" 
                  tabIndex={-1} 
                  onClick={() => setShowPassword(v => !v)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Remember Me and Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    {t('auth.rememberMe')}
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm text-green-600 hover:underline">
                  {t('auth.forgotPassword')}
                </a>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !form.email || !form.password}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-base sm:text-lg shadow-md transition-all duration-300 mt-2
                ${isLoading || !form.email || !form.password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isLoading ? (
                <span>{t('auth.signingIn')}</span>
              ) : (
                <span>{t('auth.signIn')}</span>
              )}
            </button>
            
            <div className="text-center mt-2">
              <span className="text-gray-500 text-sm">{t('auth.noAccount')} </span>
              <a href="/signup" className="text-green-600 font-semibold hover:underline">{t('common.signup')}</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}