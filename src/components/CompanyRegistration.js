import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/apiConfig';

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
  'Save'
];

// Rwanda cells array (sample)
const rwandaCells = [
  'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nyagatovu', 'Remera',
  'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
];

// Rwanda villages array (sample)
const rwandaVillages = [
  'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nyagatovu', 'Remera',
  'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
];

const CompanyRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    logo: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    street: '',
    amount_per_month: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL()}/companies/register`, formData);
      setSuccess('Company registered successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        logo: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        street: '',
        amount_per_month: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Company Registration
            </h1>
            <p className="text-lg text-gray-600">
              Please fill in your company details below
            </p>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-6">
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    placeholder="company@example.com"
                  />
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="logo" className="block text-sm font-semibold text-gray-700">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    id="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="amount_per_month" className="block text-sm font-semibold text-gray-700">
                    Amount per Month
                  </label>
                  <input
                    type="number"
                    name="amount_per_month"
                    id="amount_per_month"
                    required
                    value={formData.amount_per_month}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="district" className="block text-sm font-semibold text-gray-700">
                    District
                  </label>
                  <select
                    name="district"
                    id="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                  >
                    <option value="">Select district</option>
                    {rwandaDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="sector" className="block text-sm font-semibold text-gray-700">
                    Sector
                  </label>
                  <select
                    name="sector"
                    id="sector"
                    required
                    value={formData.sector}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                  >
                    <option value="">Select sector</option>
                    {rwandaSectors.map((sector, idx) => (
                      <option key={sector + '-' + idx} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="cell" className="block text-sm font-semibold text-gray-700">
                    Cell
                  </label>
                  <select
                    name="cell"
                    id="cell"
                    required
                    value={formData.cell}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                  >
                    <option value="">Select cell</option>
                    {rwandaCells.map((cell, idx) => (
                      <option key={cell + '-' + idx} value={cell}>
                        {cell}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="village" className="block text-sm font-semibold text-gray-700">
                    Village
                  </label>
                  <select
                    name="village"
                    id="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                  >
                    <option value="">Select village</option>
                    {rwandaVillages.map((village, idx) => (
                      <option key={village + '-' + idx} value={village}>
                        {village}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="street" className="block text-sm font-semibold text-gray-700">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    placeholder="Enter street"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 transform hover:scale-[1.02] ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </div>
                ) : (
                  'Register Company'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration; 