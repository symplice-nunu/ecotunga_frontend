import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userApi';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Save, CheckCircle, AlertCircle, Mail, Phone, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import pricingApi from '../services/pricingApi';

// Rwanda districts array
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

// Rwanda sectors array
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
  'Rushashi',
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

// Rwanda cells array (sample)
const rwandaCells = [
  'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nyagatovu', 'Remera',
  'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
];

// Cell mapping by sector - comprehensive mapping for Profile page
const cellMapping = {
  'Bumbogo': ['Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali'],
  'Gatsata': ['Gatsata', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera'],
  'Gikomero': ['Gikomero', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'],
  'Gisozi': ['Gisozi', 'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga'],
  'Jabana': ['Jabana', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera'],
  'Jali': ['Jali', 'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo'],
  'Kacyiru': ['Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura'],
  'Kimihurura': ['Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nyagatovu'],
  'Kimironko': ['Kimironko', 'Kinyinya', 'Ndera', 'Remera', 'Gatenga'],
  'Kinyinya': ['Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo'],
  'Ndera': ['Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'],
  'Nduba': ['Nduba', 'Remera', 'Rusororo', 'Rutunga', 'Gahanga'],
  'Remera': ['Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe'],
  'Rusororo': ['Rusororo', 'Rutunga', 'Gahanga', 'Gatenga', 'Gikondo'],
  'Rutunga': ['Rutunga', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama'],
  'Gahanga': ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe'],
  'Gatenga': ['Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro'],
  'Gikondo': ['Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama'],
  'Kagarama': ['Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka'],
  'Kanombe': ['Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye'],
  'Kicukiro': ['Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'],
  'Kigarama': ['Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Busanza'],
  'Masaka': ['Masaka', 'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga'],
  'Niboye': ['Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga'],
  'Nyarugunga': ['Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo'],
  // Add cells from database that weren't in the original mapping
  'Gashora': ['Gashora', 'Gikundamvura', 'Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Busanze': ['Busanze', 'Butare', 'Gahororo', 'Gashora', 'Gikundamvura', 'Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Butare': ['Butare', 'Gahororo', 'Gashora', 'Gikundamvura', 'Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Gahororo': ['Gahororo', 'Gashora', 'Gikundamvura', 'Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Gikundamvura': ['Gikundamvura', 'Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Kigembe': ['Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Mareba': ['Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Mayange': ['Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Musenyi': ['Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Mwogo': ['Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Ngeruka': ['Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Ntarama': ['Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Ruhuha': ['Ruhuha', 'Rweru', 'Shyara'],
  'Rweru': ['Rweru', 'Shyara'],
  'Shyara': ['Shyara'],
  // Add more sector-cell mappings as needed
};

// Fallback cell options if no specific mapping is found
const fallbackCellOptions = [
  'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
  'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka',
  'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro',
  'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
];

const Profile = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    last_name: '',
    gender: '',
    phone_number: '',
    ubudehe_category: '',
    house_number: '',
    district: '',
    sector: '',
    cell: '',
    street: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cellOptions, setCellOptions] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);

  // Helper function to determine if a field should be hidden based on user role
  const shouldHideField = (fieldName) => {
    const userRole = authUser?.role;
    
    if (userRole === 'waste_collector' || userRole === 'recycling_center') {
      // Hide these fields for waste_collector and recycling_center roles
      const hiddenFields = ['name', 'last_name', 'gender', 'ubudehe_category', 'house_number'];
      return hiddenFields.includes(fieldName);
    }
    
    if (userRole === 'admin') {
      // Hide these fields for admin role
      const hiddenFields = ['ubudehe_category', 'street', 'sector', 'cell', 'district', 'house_number'];
      return hiddenFields.includes(fieldName);
    }
    
    return false;
  };

  // Helper function to determine if we should use company profile
  const shouldUseCompanyProfile = () => {
    const userRole = authUser?.role;
    return userRole === 'waste_collector' || userRole === 'recycling_center';
  };

  // Helper function to get the appropriate section title
  const getSectionTitle = () => {
    const userRole = authUser?.role;
    if (userRole === 'waste_collector' || userRole === 'recycling_center') {
      return 'Company Information';
    }
    return t('profile.personalInfo');
  };

  // Fetch pricing data for ubudehe categories
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setPricingLoading(true);
        console.log('Profile: Starting to fetch pricing data...');
        
        // Always try to fetch from API first (pricing endpoints are public)
        console.log('Profile: Fetching from API...');
        const data = await pricingApi.getAllPricing();
        console.log('Profile: Pricing data fetched from API:', data);
        console.log('Profile: First item description:', data[0]?.description);
        setPricingData(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        // Set default pricing if API fails
        const fallbackPricing = [
          { ubudehe_category: 'A', amount: 1000, description: 'Category A - Lowest income bracket' },
          { ubudehe_category: 'B', amount: 1500, description: 'Category B - Low income bracket' },
          { ubudehe_category: 'C', amount: 2000, description: 'Category C - Medium income bracket' },
          { ubudehe_category: 'D', amount: 4000, description: 'Category D - High income bracket' }
        ];
        console.log('Profile: Setting fallback pricing:', fallbackPricing);
        setPricingData(fallbackPricing);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      if (shouldUseCompanyProfile()) {
        // Fetch company profile for waste collectors and recycling centers
        const response = await API.get('/companies/profile/me');
        const companyData = response.data;
        
        // Map company data to profile format
        setProfile({
          name: companyData.name || '',
          email: companyData.email || '',
          last_name: companyData.last_name || '',
          gender: companyData.gender || '',
          phone_number: companyData.phone || '',
          ubudehe_category: companyData.ubudehe_category || '',
          district: companyData.district || '',
          sector: companyData.sector || '',
          cell: companyData.cell || '',
          street: companyData.street || '',
          company_name: companyData.company_name || companyData.name || '',
          house_number: companyData.house_number || ''
        });
        
        // Set cell options based on company's sector
        if (companyData.sector) {
          const sectorCells = cellMapping[companyData.sector] || fallbackCellOptions;
          let finalCellOptions = [...sectorCells];
          if (companyData.cell && !sectorCells.includes(companyData.cell)) {
            finalCellOptions = [companyData.cell, ...sectorCells];
          }
          setCellOptions(finalCellOptions);
        }
      } else {
        // Fetch user profile for regular users and admins
        const response = await getUserProfile();
        setProfile(response.data);
        
        // Set cell options based on user's sector
        if (response.data.sector) {
          const sectorCells = cellMapping[response.data.sector] || fallbackCellOptions;
          let finalCellOptions = [...sectorCells];
          if (response.data.cell && !sectorCells.includes(response.data.cell)) {
            finalCellOptions = [response.data.cell, ...sectorCells];
          }
          setCellOptions(finalCellOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: t('profile.fetchError') });
    } finally {
      setLoading(false);
    }
  }, [t, authUser?.role]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update cell options based on selected sector
  useEffect(() => {
    if (profile.sector) {
      const sectorCells = cellMapping[profile.sector] || fallbackCellOptions;
      
      // If user has a cell that's not in the sector mapping, add it to the options
      let finalCellOptions = [...sectorCells];
      if (profile.cell && !sectorCells.includes(profile.cell)) {
        finalCellOptions = [profile.cell, ...sectorCells];
      }
      
      setCellOptions(finalCellOptions);
    } else {
      setCellOptions([]);
    }
  }, [profile.sector, profile.cell]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const newProfile = {
        ...prev,
        [name]: value
      };
      
      // Reset cell when sector changes
      if (name === 'sector') {
        newProfile.cell = '';
      }
      
      return newProfile;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      if (shouldUseCompanyProfile()) {
        // Update company profile for waste collectors and recycling centers
        const companyData = {
          phone: profile.phone_number,
          district: profile.district,
          sector: profile.sector,
          cell: profile.cell,
          street: profile.street,
          ubudehe_category: profile.ubudehe_category,
          gender: profile.gender,
          last_name: profile.last_name,
          company_name: profile.company_name,
          house_number: profile.house_number
        };
        
        const response = await API.put('/companies/profile/me', companyData);
        setMessage({ type: 'success', text: 'Company profile updated successfully' });
      } else {
        // Update user profile for regular users and admins
        const response = await updateUserProfile(profile);
        setProfile(response.data);
        setMessage({ type: 'success', text: t('profile.updateSuccess') });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || t('profile.updateError');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-6 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Profile</h3>
              <p className="text-gray-500">Fetching your profile information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {t('profile.title')}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your personal information and preferences</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl shadow-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-lg font-semibold ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.type === 'success' ? 'Success!' : 'Error'}
                </h3>
                <p className={`text-sm sm:text-base ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            <div className={`${(authUser?.role === 'user' || authUser?.role === 'waste_collector' || authUser?.role === 'recycling_center') ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8' : 'space-y-6 sm:space-y-8'} mb-6 sm:mb-8`}>
              {/* Personal Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{getSectionTitle()}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Company Name field for waste_collector and recycling_center */}
                  {(authUser?.role === 'waste_collector' || authUser?.role === 'recycling_center') && (
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={profile.company_name || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter company name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      />
                    </div>
                  )}

                  {!shouldHideField('name') && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t('profile.firstName')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name || ''}
                        onChange={handleInputChange}
                        required
                        placeholder={t('profile.firstNamePlaceholder')}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      />
                    </div>
                  )}
                  
                  {!shouldHideField('last_name') && (
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.lastName')}
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={profile.last_name || ''}
                        onChange={handleInputChange}
                        placeholder={t('profile.lastNamePlaceholder')}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t('profile.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email || ''}
                      onChange={handleInputChange}
                      required
                      placeholder={t('profile.emailPlaceholder')}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('profile.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={profile.phone_number || ''}
                      onChange={handleInputChange}
                      placeholder={t('profile.phonePlaceholder')}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                    />
                  </div>
                  
                  {!shouldHideField('gender') && (
                    <div>
                      <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.gender')}
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={profile.gender || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      >
                        <option value="">{t('profile.selectGender')}</option>
                        <option value="Male">{t('profile.male')}</option>
                        <option value="Female">{t('profile.female')}</option>
                        <option value="Other">{t('profile.other')}</option>
                      </select>
                    </div>
                  )}
                  
                  {!shouldHideField('ubudehe_category') && (
                    <div>
                      <label htmlFor="ubudehe_category" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.ubudeheCategory')}
                      </label>
                      <select
                        id="ubudehe_category"
                        name="ubudehe_category"
                        value={profile.ubudehe_category || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      >
                        <option value="">Select</option>
                        {pricingData.map((pricing) => (
                          <option key={pricing.ubudehe_category} value={pricing.ubudehe_category}>
                            {pricing.ubudehe_category} - RWF {pricing.amount?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                     
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              {(authUser?.role === 'user' || authUser?.role === 'waste_collector' || authUser?.role === 'recycling_center') && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{t('profile.locationInfo')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {!shouldHideField('district') && (
                      <div>
                        <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.district')}
                        </label>
                        <select
                          id="district"
                          name="district"
                          value={profile.district || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                        >
                          <option value="">Select</option>
                          {rwandaDistricts.map((district) => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {!shouldHideField('sector') && (
                      <div>
                        <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.sector')}
                        </label>
                        <select
                          id="sector"
                          name="sector"
                          value={profile.sector || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                        >
                          <option value="">Select</option>
                          {rwandaSectors.map((sector) => (
                            <option key={sector} value={sector}>{sector}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {!shouldHideField('cell') && (
                      <div>
                        <label htmlFor="cell" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.cell')}
                        </label>
                        <select
                          id="cell"
                          name="cell"
                          value={profile.cell || ''}
                          onChange={handleInputChange}
                          disabled={!profile.sector}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base ${!profile.sector ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">{profile.sector ? 'Select Cell' : 'Select Sector First'}</option>
                          {cellOptions.map((cell) => (
                            <option key={cell} value={cell}>{cell}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {!shouldHideField('street') && (
                      <div>
                        <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.street')}
                        </label>
                        <input
                          type="text"
                          id="street"
                          name="street"
                          value={profile.street || ''}
                          onChange={handleInputChange}
                          placeholder={t('profile.streetPlaceholder')}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                        />
                      </div>
                    )}
                    
                    {!shouldHideField('house_number') && (
                      <div>
                        <label htmlFor="house_number" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          House Number
                        </label>
                        <input
                          type="text"
                          id="house_number"
                          name="house_number"
                          value={profile.house_number || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your house number"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('profile.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('profile.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
