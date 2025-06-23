import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import logo from '../assets/login_logo.png';
import LanguageSelector from '../components/LanguageSelector';
import { User, MapPin, Phone, Building } from 'lucide-react';

// Rwanda districts array (same as Profile.jsx)
const rwandaDistricts = [
  'Bugesera',
  'Burera',
  'Gakenke',
  'Gasabo',
  'Gatsibo',
  'Gicumbi',
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Karongi',
  'Kayonza',
  'Kicukiro',
  'Kirehe',
  'Muhanga',
  'Musanze',
  'Ngoma',
  'Ngororero',
  'Nyabihu',
  'Nyagatare',
  'Nyamagabe',
  'Nyamasheke',
  'Nyanza',
  'Nyarugenge',
  'Nyaruguru',
  'Rubavu',
  'Ruhango',
  'Rulindo',
  'Rusizi',
  'Rutsiro',
  'Rwamagana'
];

// Rwanda sectors array (same as Profile.jsx)
const rwandaSectors = [
  'Bumbogo',
  'Gatsata',
  'Gikomero',
  'Gisozi',
  'Jabana',
  'Jali',
  'Kacyiru',
  'Kimihurura',
  'Kimironko',
  'Kinyinya',
  'Ndera',
  'Nduba',
  'Remera',
  'Rusororo',
  'Rutunga',
  'Gahanga',
  'Gatenga',
  'Gikondo',
  'Kagarama',
  'Kanombe',
  'Kicukiro',
  'Kigarama',
  'Masaka',
  'Niboye',
  'Nyarugunga',
  'Busasamana',
  'Busoro',
  'Cyabakamyi',
  'Kibilizi',
  'Kigoma',
  'Mukingo',
  'Muyira',
  'Ntyazo',
  'Nyagisozi',
  'Rwabicuma',
  'Gikonko',
  'Gishubi',
  'Kansi',
  'Kibirizi',
  'Kigembe',
  'Mamba',
  'Muganza',
  'Mugombwa',
  'Mukindo',
  'Musha',
  'Ndora',
  'Nyanza',
  'Save',
  'Busanze',
  'Butare',
  'Gahororo',
  'Gashora',
  'Gikundamvura',
  'Kigembe',
  'Mareba',
  'Mayange',
  'Musenyi',
  'Mwogo',
  'Ngeruka',
  'Ntarama',
  'Ruhuha',
  'Rweru',
  'Shyara',
  'Bungwe',
  'Butaro',
  'Cyanika',
  'Cyeru',
  'Gahunga',
  'Gatebe',
  'Gitovu',
  'Kagogo',
  'Kinoni',
  'Kinyababa',
  'Kivuye',
  'Nemba',
  'Rugarama',
  'Rugengabari',
  'Ruhunde',
  'Rusarabuye',
  'Rwerere',
  'Busengo',
  'Coko',
  'Cyabingo',
  'Gakenke',
  'Gashyita',
  'Janja',
  'Kamubuga',
  'Karambo',
  'Kivuruga',
  'Mataba',
  'Minazi',
  'Mugunga',
  'Muhondo',
  'Muyongwe',
  'Muzo',
  'Nemba',
  'Ruli',
  'Rusasa',
  'Rushashi'
];

// Rwanda cells array (same as Profile.jsx)
const rwandaCells = [
  'Bumbogo',
  'Gatsata',
  'Gikomero',
  'Gisozi',
  'Jabana',
  'Jali',
  'Kacyiru',
  'Kimihurura',
  'Kimironko',
  'Kinyinya',
  'Ndera',
  'Nduba',
  'Remera',
  'Rusororo',
  'Rutunga',
  'Gahanga',
  'Gatenga',
  'Gikondo',
  'Kagarama',
  'Kanombe',
  'Kicukiro',
  'Kigarama',
  'Masaka',
  'Niboye',
  'Nyarugunga'
];

export default function PersonalInfo() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    last_name: '',
    gender: '',
    phone_number: '',
    ubudehe_category: '',
    company_name: '',
    district: '',
    sector: '',
    cell: '',
    street: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get user credentials from location state (passed from signup)
  const userCredentials = location.state?.userCredentials;

  // Check if user is a business entity (waste collector or recycling center)
  const isBusinessEntity = userCredentials?.role === 'waste_collector' || userCredentials?.role === 'recycling_center';

  const validateForm = () => {
    const newErrors = {};
    
    if (isBusinessEntity) {
      // For business entities, validate company name instead of personal fields
      if (!form.company_name?.trim()) {
        newErrors.company_name = t('errors.required');
      }
    } else {
      // For regular users, validate personal fields
      if (!form.name?.trim()) {
        newErrors.name = t('errors.required');
      }
      if (!form.last_name?.trim()) {
        newErrors.last_name = t('errors.required');
      }
      if (!form.gender) {
        newErrors.gender = t('errors.required');
      }
      if (!form.ubudehe_category) {
        newErrors.ubudehe_category = t('errors.required');
      }
    }
    
    // Common validations for all users
    if (!form.phone_number?.trim()) {
      newErrors.phone_number = t('errors.required');
    } else if (!/^(\+250|0)?7[2389][0-9]{7}$/.test(form.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'Please enter a valid Rwandan phone number';
    }
    if (!form.district) {
      newErrors.district = t('errors.required');
    }
    if (!form.sector) {
      newErrors.sector = t('errors.required');
    }
    if (!form.cell) {
      newErrors.cell = t('errors.required');
    }
    if (!form.street?.trim()) {
      newErrors.street = t('errors.required');
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
    if (!userCredentials) {
      setServerError('User credentials not found. Please try signing up again.');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      // First, try to register the user
      try {
        await API.post('/auth/register', {
          name: userCredentials.name,
          email: userCredentials.email,
          password: userCredentials.password,
          role: userCredentials.role
        });
      } catch (registerError) {
        // If user already exists, that's fine - we can proceed with login
        if (registerError.response?.status !== 400 || !registerError.response?.data?.message?.includes('already exists')) {
          throw registerError;
        }
      }

      // Then, login the user to get the token
      const loginResponse = await API.post('/auth/login', {
        email: userCredentials.email,
        password: userCredentials.password
      });

      // Store the token
      localStorage.setItem('token', loginResponse.data.token);

      // Prepare profile data based on user type
      const profileData = isBusinessEntity ? {
        name: form.company_name, // Use company name as the name field
        phone_number: form.phone_number,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        street: form.street
      } : {
        name: form.name,
        last_name: form.last_name,
        gender: form.gender,
        phone_number: form.phone_number,
        ubudehe_category: form.ubudehe_category,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        street: form.street
      };

      // Update user profile with personal information
      await API.put('/users/profile/me', profileData, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.token}`
        }
      });

      // If user is a waste collector or recycling center, update the company record with additional info
      if (isBusinessEntity) {
        try {
          await API.put('/companies/update-by-email', {
            email: userCredentials.email,
            phone: form.phone_number,
            district: form.district,
            sector: form.sector,
            cell: form.cell,
            village: form.street, // Using street as village
            street: form.street,
            amount_per_month: 0 // Default amount, can be updated later
          }, {
            headers: {
              Authorization: `Bearer ${loginResponse.data.token}`
            }
          });
        } catch (companyError) {
          console.error('Error updating company info:', companyError);
          // Don't fail the registration if company update fails
        }
      }

      // Login the user through AuthContext
      await login(userCredentials.email, userCredentials.password);

      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Registration/Login error:', err);
      setServerError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no user credentials, redirect to signup
  if (!userCredentials) {
    navigate('/signup');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-green-200 p-4">
      <div className="w-full max-w-6xl bg-white/0 rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Illustration and Company Info */}
        <div className="lg:w-1/2 flex flex-col justify-between items-center bg-gradient-to-br from-green-200 via-blue-100 to-green-100 p-6 sm:p-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-lg p-2">
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
            <img src={logo} alt="Illustration" className="w-48 h-48 sm:w-72 sm:h-72 object-contain" />
          </div>
        </div>
        
        {/* Right Side: Personal Information Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{t('auth.completeProfile')}</h2>
              <p className="text-gray-500 text-sm">{t('auth.completeProfileSubtitle')}</p>
            </div>
            
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal/Business Information */}
              <div className="space-y-4">
                
                <div className="space-y-4">
                  {isBusinessEntity ? (
                    // Business entity fields
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={form.company_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your company name"
                        className={`w-full px-4 py-3 border ${errors.company_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                      />
                      {errors.company_name && <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>}
                    </div>
                  ) : (
                    // Regular user fields
                    <>
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {t('profile.firstName')} *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder={t('profile.firstNamePlaceholder')}
                          className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.lastName')} *
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          required
                          placeholder={t('profile.lastNamePlaceholder')}
                          className={`w-full px-4 py-3 border ${errors.last_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        />
                        {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.gender')} *
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-3 border ${errors.gender ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        >
                          <option value="">{t('profile.selectGender')}</option>
                          <option value="Male">{t('profile.male')}</option>
                          <option value="Female">{t('profile.female')}</option>
                          <option value="Other">{t('profile.other')}</option>
                        </select>
                        {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="ubudehe_category" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.ubudeheCategory')} *
                        </label>
                        <select
                          id="ubudehe_category"
                          name="ubudehe_category"
                          value={form.ubudehe_category}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-3 border ${errors.ubudehe_category ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        >
                          <option value="">Select</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                        {errors.ubudehe_category && <p className="mt-1 text-xs text-red-600">{errors.ubudehe_category}</p>}
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('profile.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      required
                      placeholder={t('profile.phoneNumberPlaceholder')}
                      className={`w-full px-4 py-3 border ${errors.phone_number ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    />
                    {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.district')} *
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border ${errors.district ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    >
                      <option value="">Select</option>
                      {rwandaDistricts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.sector')} *
                    </label>
                    <select
                      id="sector"
                      name="sector"
                      value={form.sector}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border ${errors.sector ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    >
                      <option value="">Select</option>
                      {rwandaSectors.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                    {errors.sector && <p className="mt-1 text-xs text-red-600">{errors.sector}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="cell" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.cell')} *
                    </label>
                    <select
                      id="cell"
                      name="cell"
                      value={form.cell}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border ${errors.cell ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    >
                      <option value="">Select</option>
                      {rwandaCells.map((cell) => (
                        <option key={cell} value={cell}>{cell}</option>
                      ))}
                    </select>
                    {errors.cell && <p className="mt-1 text-xs text-red-600">{errors.cell}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.street')} *
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      required
                      placeholder={t('profile.streetPlaceholder')}
                      className={`w-full px-4 py-3 border ${errors.street ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-base sm:text-lg shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span>{t('auth.completingRegistration')}</span>
              ) : (
                <span>{t('auth.completeRegistration')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 