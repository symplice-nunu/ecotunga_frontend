import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Mail, Phone, MapPin, Plus, Search, X, Edit, Trash, Eye } from 'lucide-react';
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

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL()}/companies`);
      setCompanies(response.data);
      setFilteredCompanies(response.data);
      setTotalPages(Math.ceil((response.data?.length || 0) / itemsPerPage));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch companies');
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Search functionality
  useEffect(() => {
    if (!companies) return;
    
    const filtered = companies.filter(company => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (company?.name && company.name.toLowerCase().includes(searchLower)) ||
        (company?.email && company.email.toLowerCase().includes(searchLower)) ||
        (company?.district && company.district.toLowerCase().includes(searchLower))
      );
    });
    setFilteredCompanies(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil((filtered?.length || 0) / itemsPerPage));
  }, [searchQuery, companies, itemsPerPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      await axios.post(`${API_BASE_URL()}/companies/register`, formData);
      setFormSuccess('Company registered successfully!');
      setShowSuccessModal(true);
      // Reset form
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
      // Refresh companies list
      fetchCompanies();
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setShowSuccessModal(false);
        setFormSuccess('');
      }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.error || 'An error occurred during registration');
    }
  };

  // Pagination functions
  const indexOfLastCompany = currentPage * itemsPerPage;
  const indexOfFirstCompany = indexOfLastCompany - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Loading companies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
        <button 
          onClick={fetchCompanies}
          className="bg-indigo-500 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Companies Management</h2>
          <p className="text-gray-500 mt-1">List of all registered companies</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-50 px-4 py-2 rounded-lg">
            <p className="text-indigo-600 font-medium">
              {filteredCompanies?.length || 0} companies found
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Register New Company
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search companies..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {(!filteredCompanies || filteredCompanies.length === 0) ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 p-8 rounded-lg inline-block">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No companies found</p>
              {searchQuery && (
                <p className="text-gray-500 text-sm">
                  No companies match your search "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>Company Name</span>
                      </div>
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        {/* <DollarSign className="h-4 w-4" /> */}
                        FRW &nbsp;
                        <span>Amount/Month</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {company.logo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-teal-100"
                                src={company.logo}
                                alt={company.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                {company.name ? company.name[0].toUpperCase() : 'C'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {company.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {String(company.id).slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.email}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.phone}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.district}, {company.sector}
                        </div>
                        <div className="text-xs text-gray-500">
                          {company.cell}, {company.village}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-teal-600">
                          FRW {parseFloat(company.amount_per_month).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing {indexOfFirstCompany + 1} to {Math.min(indexOfLastCompany, filteredCompanies?.length || 0)} of{' '}
                    {filteredCompanies?.length || 0} results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-2">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Success!</h3>
            <p className="text-sm text-gray-500 text-center">{formSuccess}</p>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-[480px] shadow-2xl rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Register New Company</h3>
                <p className="text-sm text-gray-500 mt-1">Fill in the company details below</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    id="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    placeholder="Enter logo URL"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    name="district"
                    id="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <option value="">Select district</option>
                    {rwandaDistricts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                    Sector
                  </label>
                  <select
                    name="sector"
                    id="sector"
                    required
                    value={formData.sector}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <option value="">Select sector</option>
                    {rwandaSectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="cell" className="block text-sm font-medium text-gray-700">
                    Cell
                  </label>
                  <select
                    name="cell"
                    id="cell"
                    required
                    value={formData.cell}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <option value="">Select cell</option>
                    {rwandaCells.map((cell) => (
                      <option key={cell} value={cell}>{cell}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="village" className="block text-sm font-medium text-gray-700">
                    Village
                  </label>
                  <select
                    name="village"
                    id="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <option value="">Select village</option>
                    {rwandaVillages.map((village) => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    placeholder="Enter street"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="amount_per_month" className="block text-sm font-medium text-gray-700">
                    Amount per Month
                  </label>
                  <input
                    type="number"
                    name="amount_per_month"
                    id="amount_per_month"
                    required
                    value={formData.amount_per_month}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Register Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList; 