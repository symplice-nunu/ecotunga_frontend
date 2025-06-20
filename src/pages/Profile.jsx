import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userApi';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Save, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react';

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

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    last_name: '',
    gender: '',
    phone_number: '',
    ubudehe_category: '',
    district: '',
    sector: '',
    cell: '',
    street: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: t('profile.fetchError') });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await updateUserProfile(profile);
      setProfile(response.data);
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Personal Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{t('profile.personalInfo')}</h3>
                </div>
                
                <div className="space-y-4">
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
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{t('profile.locationInfo')}</h3>
                </div>
                
                <div className="space-y-4">
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
                  
                  <div>
                    <label htmlFor="cell" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.cell')}
                    </label>
                    <select
                      id="cell"
                      name="cell"
                      value={profile.cell || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                    >
                      <option value="">Select</option>
                      {rwandaCells.map((cell) => (
                        <option key={cell} value={cell}>{cell}</option>
                      ))}
                    </select>
                  </div>
                  
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
                </div>
              </div>
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
