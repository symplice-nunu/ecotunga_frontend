import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import logo from '../assets/login_logo.png';

export default function Signup() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(form.password)) {
      newErrors.password = 'Must include uppercase, lowercase, number, and special character';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setServerError('');
    try {
      const { data } = await API.post('/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      navigate('/login', { state: { successMessage: data.message } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-green-200">
      <div className="w-full max-w-5xl bg-white/0 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Illustration and Company Info */}
        <div className="md:w-1/2 flex flex-col justify-between items-center bg-gradient-to-br from-green-200 via-blue-100 to-green-100 p-8">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-500 rounded-lg p-2">
                {/* Logo icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" fill="#22c55e" />
                  <rect x="8" y="8" width="8" height="8" rx="2" fill="#fff" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg text-gray-800">Ecotunga.</div>
                <div className="text-xs text-gray-500">Kigali, Rwanda</div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Illustration Placeholder */}
            <img src={logo} alt="Illustration" className="w-72 h-72 object-contain" />
          </div>
        </div>
        {/* Right Side: Signup Form */}
        <div className="md:w-1/2 flex items-center justify-center p-8 bg-white/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Create a New Account</h2>
              <p className="text-gray-500 text-sm">EcoTunga, today</p>
            </div>
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {serverError}
              </div>
            )}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                  
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              {/* Email Field */}
              <div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full px-4 py-3 bg-white border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                  
                  
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full px-4 py-3 bg-white border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                  
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={`w-full px-4 py-3 bg-white border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                  
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500">
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-lg shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
            <div className="text-center mt-2">
              <span className="text-gray-500 text-sm">Already have an account? </span>
              <a href="/login" className="text-green-600 font-semibold hover:underline">Log in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}