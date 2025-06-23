import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile } from '../services/userApi';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { getCompanies, getCompanyById } from '../services/companyApi';
import { initiateMobileMoneyPayment } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import wasteTruck from '../assets/eb2216243ee44e2c328a1dea4bc045e2ad26c104.jpg';
import collection from '../assets/e682b31ec1c636f1fc957bef07cbbcd23f22fe33.png';
// import person from '../assets/07e14575ca040bb0119bc4319a1d4d8afb0ac6bd.png';
// import locations from '../assets/82b1f6e7211be6cd0aaaf955a7f648fc0bf7bcbf.png';
// import attention from '../assets/25a91c6fec7f15183e2bac4bc553d85f5b49362a.png';
// import truck from '../assets/f9c17e1c8abf24e0e94b552b9f1b4c26dfa14b1a.png';

const steps = [
  'Book Pickup',
  'Payment Process',
  'Confirm',
];

// Helper to ensure select options include the profile value
// const getOptionsWithProfileValue = (options, profileValue) => {
//   if (profileValue && !options.includes(profileValue)) {
//     return [profileValue, ...options];
//   }
//   return options;
// };

// Dummy options for selects
// const genderOptions = ['Male', 'Female', 'Other'];
const districtOptions = [
  'Bugesera', 'Burera', 'Gakenke', 'Gasabo', 'Gatsibo', 'Gicumbi', 'Gisagara', 'Huye', 'Kamonyi', 'Karongi',
  'Kayonza', 'Kicukiro', 'Kirehe', 'Muhanga', 'Musanze', 'Ngoma', 'Ngororero', 'Nyabihu', 'Nyagatare',
  'Nyamagabe', 'Nyamasheke', 'Nyanza', 'Nyarugenge', 'Nyaruguru', 'Rubavu', 'Ruhango', 'Rulindo',
  'Rusizi', 'Rutsiro', 'Rwamagana'
];
const sectorOptions = [
  'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko',
  'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga', 'Gahanga', 'Gatenga', 'Gikondo',
  'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Busasamana',
  'Busoro', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma',
  'Gikonko', 'Gishubi', 'Kansi', 'Kibirizi', 'Kigembe', 'Mamba', 'Muganza', 'Mugombwa', 'Mukindo',
  'Musha', 'Ndora', 'Nyanza', 'Save', 'Busanze', 'Butare', 'Gahororo', 'Gashora', 'Gikundamvura',
  'Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara',
  'Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa',
  'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuye', 'Rwerere', 'Busengo', 'Coko',
  'Cyabingo', 'Gakenke', 'Gashyita', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi',
  'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'
];
const cellOptions = [
  'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
  'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka',
  'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro',
  'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
];

export default function Collection() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const companiesFetchedRef = useRef(false);
  
  const [personalInfo, setPersonalInfo] = useState({
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
  const [location, setLocation] = useState({
    district: '',
    sector: '',
    cell: '',
    street: ''
  });
  const [selectedLocation, setSelectedLocation] = useState({
    district: '',
    sector: '',
    cell: ''
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Step 3: Book Pickup (Updated UI)
  const [pickupDate, setPickupDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null);
  const [notes, setNotes] = useState('');
  const timeSlots = [
    '06:00 - 08:00',
    '08:00 - 10:00', 
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '20:00 - 22:00'
  ];

  // Payment-related state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [recipientPhone] = useState('0785847049');

  // Helper to ensure select options include the profile value
  // const districtOptionsWithProfile = getOptionsWithProfileValue(districtOptions, location.district);
  // const sectorOptionsWithProfile = getOptionsWithProfileValue(sectorOptions, location.sector);
  // const cellOptionsWithProfile = getOptionsWithProfileValue(cellOptions, location.cell);
  // const genderOptionsWithProfile = getOptionsWithProfileValue(genderOptions, personalInfo.gender);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Collection component - user from auth context:', user);
        console.log('Token in localStorage:', localStorage.getItem('token'));
        
        if (user) {
          console.log('Fetching user profile...');
          const response = await getUserProfile();
          console.log('User profile response:', response.data);
          setUserProfile(response.data);
          
          // Pre-populate personal info with user profile data
          const personalData = {
            name: response.data.name || '',
            email: response.data.email || '',
            last_name: response.data.last_name || '',
            gender: response.data.gender || '',
            phone_number: response.data.phone_number || '',
            ubudehe_category: response.data.ubudehe_category || '',
            district: response.data.district || '',
            sector: response.data.sector || '',
            cell: response.data.cell || '',
            street: response.data.street || '',
          };
          console.log('Setting personal info:', personalData);
          setPersonalInfo(personalData);
          
          // Pre-populate location with user profile data
          const locationData = {
            district: response.data.district || '',
            sector: response.data.sector || '',
            cell: response.data.cell || '',
            street: response.data.street || '',
          };
          console.log('Setting location data:', locationData);
          setLocation(locationData);
          
          // Pre-populate selected location for company filtering
          const selectedLocationData = {
            district: response.data.district || '',
            sector: response.data.sector || '',
            cell: response.data.cell || '',
          };
          console.log('Setting selected location data:', selectedLocationData);
          setSelectedLocation(selectedLocationData);
        } else {
          console.log('No user found in auth context');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    } else {
      console.log('No user found in auth context');
      setLoading(false);
    }
  }, [user]);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        console.log('Fetching companies...');
        const response = await getCompanies();
        console.log('Companies response:', response.data);
        setCompanies(response.data);
        setFilteredCompanies(response.data); // Initially show all companies
        companiesFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    if (!companiesFetchedRef.current) {
      fetchCompanies();
    } else {
      console.log('Companies already fetched');
    }
  }, []);

  // Filter companies based on selected location
  useEffect(() => {
    if (companies.length > 0) {
      let filtered = companies;
      
      if (selectedLocation.district) {
        filtered = filtered.filter(company => 
          company.district && company.district.toLowerCase() === selectedLocation.district.toLowerCase()
        );
      }
      
      if (selectedLocation.sector) {
        filtered = filtered.filter(company => 
          company.sector && company.sector.toLowerCase() === selectedLocation.sector.toLowerCase()
        );
      }
      
      if (selectedLocation.cell) {
        filtered = filtered.filter(company => 
          company.cell && company.cell.toLowerCase() === selectedLocation.cell.toLowerCase()
        );
      }
      
      setFilteredCompanies(filtered);
    }
  }, [selectedLocation, companies]);

  // const villageOptions = [
  //   'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
  //   'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka',
  //   'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro',
  //   'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  //   'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
  // ];

  // Stepper UI
  const Stepper = () => {
    // Calculate the percent width for the green line
    const percent = steps.length === 1 ? 0 : (step) / (steps.length - 1) * 100;
    return (
      <div className="flex flex-col items-center w-full mb-8">
        <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">
          <div className='flex items-center gap-2'>
          <span role="img" aria-label="waste">
            <img src={collection} alt="waste" className="w-[48px] h-[36px]" />
          </span> 
          <div>Book your waste collection in minutes</div>
          </div>
        </h2>
        <div className="relative w-full max-w-4xl flex flex-col items-center mb-2" style={{ minHeight: 60 }}>
          {/* Gray line (full width) */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 z-0" style={{ transform: 'translateY(-50%)' }} />
          {/* Green line (progress) */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-green-700 z-10 transition-all duration-300"
            style={{
              width: `calc(${percent}% - 50px * ${step === 0 ? 0 : 0.5})`,
              maxWidth: '100%',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Steps */}
          <div className="relative flex w-full justify-between items-center z-20">
            {steps.map((label, idx) => (
              <div key={label} className="flex flex-col items-left flex-1 mt-6">
                <div className={`flex items-center justify-center rounded-full w-10 h-10 mb-1 text-lg font-bold  ${
                  idx < step
                    ? 'bg-green-700 text-white border-green-700 shadow'
                    : idx === step
                      ? 'bg-green-700 text-white border-green-700 shadow'
                      : 'bg-gray-300 text-black border-gray-300'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-sm text-gray-600 mt-1 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <hr className='w-full max-w-4xl mt-7 border-2 border-[#0C9488]' />
      </div>
    );
  };

  // Show loading state while fetching user profile
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your information...</p>
        </div>
      </div>
    );
  }

  // Validate personal info and location data
  const validateData = () => {
    const newErrors = {};
    
    console.log('🔍 Validating data...');
    console.log('Personal Info:', personalInfo);
    console.log('Location:', location);
    
    // Validate personal info
    if (!personalInfo.name) newErrors.name = 'Required';
    if (!personalInfo.last_name) newErrors.last_name = 'Required';
    if (!personalInfo.gender) newErrors.gender = 'Required';
    if (!personalInfo.email) newErrors.email = 'Required';
    if (!personalInfo.phone_number) newErrors.phone_number = 'Required';
    if (!personalInfo.ubudehe_category) newErrors.ubudehe_category = 'Required';
    
    // Validate location
    if (!location.district) newErrors.district = 'Required';
    if (!location.sector) newErrors.sector = 'Required';
    if (!location.cell) newErrors.cell = 'Required';
    
    console.log('❌ Validation errors:', newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle company selection
  const handleCompanySelection = async (companyId) => {
    setSelectedCompany(companyId);
    
    if (companyId) {
      try {
        // First try to find in filtered companies
        const selectedCompanyId = parseInt(companyId, 10);
        let companyData = filteredCompanies.find(company => company.id === selectedCompanyId);
        
        // If not found in filtered companies, try to fetch from API
        if (!companyData) {
          console.log('Company not found in filtered companies, fetching from API...');
          const response = await getCompanyById(companyId);
          companyData = response.data;
        }
        
        setSelectedCompanyDetails(companyData);
        console.log('Selected company details:', companyData);
      } catch (error) {
        console.error('Error fetching company details:', error);
        setSelectedCompanyDetails(null);
      }
    } else {
      setSelectedCompanyDetails(null);
    }
  };

  // Step 3: Book Pickup (Updated UI)
  const handleBookPickupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateData()) {
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError('');

      const bookingData = {
        name: personalInfo.name,
        last_name: personalInfo.last_name,
        email: personalInfo.email,
        phone_number: personalInfo.phone_number,
        gender: personalInfo.gender,
        ubudehe_category: personalInfo.ubudehe_category,
        district: location.district,
        sector: location.sector,
        cell: location.cell,
        street: location.street,
        pickup_date: pickupDate.toISOString().split('T')[0],
        time_slot: timeSlot,
        company_id: selectedCompany,
        notes: notes
      };

      console.log('Submitting booking data:', bookingData);
      const response = await wasteCollectionApi.createWasteCollection(bookingData);
      console.log('Booking response:', response.data);

      setBookingDetails(response.data);
      setSubmitSuccess(true);
      
      // Set payment amount based on selected company
      if (selectedCompanyDetails) {
        setPaymentAmount(selectedCompanyDetails.amount_per_month);
      }
      
      setStep(1); // Move to payment step
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitError(error.response?.data?.message || 'Failed to book pickup. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!userProfile || !userProfile.phone_number) {
      setPaymentError('Phone number is required for payment. Please update your profile.');
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError('');

      // Generate unique transaction reference
      const txRef = `ECOTUNGA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const paymentData = {
        amount: paymentAmount,
        phone_number: userProfile.phone_number,
        email: userProfile.email,
        tx_ref: txRef,
        consumer_id: userProfile.id || user?.id,
        customer_name: `${userProfile.name} ${userProfile.last_name}`.trim(),
        callback_url: `${window.location.origin}/payment/callback`,
        redirect_url: `${window.location.origin}/payment/redirect`
      };

      console.log('Initiating payment with data:', paymentData);
      const response = await initiateMobileMoneyPayment(paymentData);
      console.log('Payment response:', response);

      if (response.success && response.data) {
        setPaymentDetails(response.data);
        setPaymentSuccess(true);
        
        // Check if there's a redirect URL for CAPTCHA verification
        if (response.data.meta && response.data.meta.authorization && response.data.meta.authorization.redirect) {
          // Show user-friendly message about CAPTCHA verification
          setPaymentSuccess(true);
          
          // Wait a moment then redirect to CAPTCHA page
          setTimeout(() => {
            window.location.href = response.data.meta.authorization.redirect;
          }, 2000);
        } else if (response.data.link) {
          // Fallback to direct link
          window.location.href = response.data.link;
        } else {
          setPaymentError('Payment initiated but no verification page found. Please check your phone for SMS.');
        }
      } else {
        setPaymentError(response.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const BookPickup = () => (
    <form
      className="bg-white rounded-xl shadow max-w-4xl mx-auto mt-6 flex flex-col items-center p-8"
      onSubmit={handleBookPickupSubmit}
    >
      {/* Company Selection - Full Width */}
      <div className="w-full mb-8">
        {/* Location Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between my-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Company Location</h3>
            {userProfile && (userProfile.district || userProfile.sector || userProfile.cell) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({
                    district: userProfile.district || '',
                    sector: userProfile.sector || '',
                    cell: userProfile.cell || '',
                  });
                  setSelectedCompany('');
                  setSelectedCompanyDetails(null);
                }}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Use My Location
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* District Selection */}
            <div>
              <label className="block font-semibold mb-2 text-sm">District</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedLocation.district}
                onChange={e => {
                  setSelectedLocation(prev => ({
                    ...prev,
                    district: e.target.value,
                    sector: '', // Reset sector when district changes
                    cell: ''    // Reset cell when district changes
                  }));
                  setSelectedCompany(''); // Reset company selection
                  setSelectedCompanyDetails(null); // Reset company details
                }}
              >
                <option value="">Select District</option>
                {districtOptions.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            {/* Sector Selection */}
            <div>
              <label className="block font-semibold mb-2 text-sm">Sector</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedLocation.sector}
                onChange={e => {
                  setSelectedLocation(prev => ({
                    ...prev,
                    sector: e.target.value,
                    cell: '' // Reset cell when sector changes
                  }));
                  setSelectedCompany(''); // Reset company selection
                  setSelectedCompanyDetails(null); // Reset company details
                }}
                disabled={!selectedLocation.district}
              >
                <option value="">Select Sector</option>
                {selectedLocation.district && sectorOptions.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            {/* Cell Selection */}
            <div>
              <label className="block font-semibold mb-2 text-sm">Cell</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedLocation.cell}
                onChange={e => {
                  setSelectedLocation(prev => ({
                    ...prev,
                    cell: e.target.value
                  }));
                  setSelectedCompany(''); // Reset company selection
                  setSelectedCompanyDetails(null); // Reset company details
                }}
                disabled={!selectedLocation.sector}
              >
                <option value="">Select Cell</option>
                {selectedLocation.sector && cellOptions.map(cell => (
                  <option key={cell} value={cell}>{cell}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Company Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-semibold">Select Company</label>
            {(selectedLocation.district || selectedLocation.sector || selectedLocation.cell) && (
              <span className="text-sm text-gray-600">
                {filteredCompanies.length} company{filteredCompanies.length !== 1 ? 'ies' : 'y'} found
              </span>
            )}
          </div>
          {companiesLoading ? (
            <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500">
              Loading companies...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500">
              {selectedLocation.district || selectedLocation.sector || selectedLocation.cell 
                ? 'No companies found in the selected location' 
                : 'Please select a location to see available companies'}
            </div>
          ) : (
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedCompany}
              onChange={e => handleCompanySelection(e.target.value)}
              required
            >
              <option value="">Select a company</option>
              {filteredCompanies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          )}
        </div>
        {/* Selected Company Details */}
        {selectedCompany && !companiesLoading && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            {selectedCompanyDetails ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {selectedCompanyDetails.logo ? (
                    <img 
                      src={selectedCompanyDetails.logo} 
                      alt={`${selectedCompanyDetails.name} Logo`} 
                      className="w-12 h-12 rounded-lg object-cover border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 rounded-lg border bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg ${
                      selectedCompanyDetails.logo ? 'hidden' : 'flex'
                    }`}
                  >
                    {selectedCompanyDetails.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800">{selectedCompanyDetails.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📧 Email:</span>
                      <span className="text-gray-700">{selectedCompanyDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📞 Phone:</span>
                      <span className="text-gray-700">{selectedCompanyDetails.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">💰 Monthly Rate:</span>
                      <span className="text-gray-700">${selectedCompanyDetails.amount_per_month}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📍 District:</span>
                      <span className="text-gray-700">{selectedCompanyDetails.district}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">🏢 Sector:</span>
                      <span className="text-gray-700">{selectedCompanyDetails.sector}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">🏘️ Cell:</span>
                      <span className="text-gray-700">{selectedCompanyDetails.cell}</span>
                    </div>
                  </div>
                </div>
                {selectedCompanyDetails.street && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">🏠 Street:</span>
                      <span className="text-gray-700">{selectedCompanyDetails.street}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Loading company details...</div>
            )}
          </div>
        )}
      </div>
      {/* Pickup Date and Time Slot */}
      <div className="flex w-full md:flex-row gap-8 my-8">
        {/* Pickup Date */}
        <div>
          <label className="block font-semibold mb-2">Select Pickup Date</label>
          <div className="relative">
            <DatePicker
              className="w-full border rounded px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              selected={pickupDate}
              onChange={(date) => setPickupDate(date)}
              placeholderText="Select a date"
              dateFormat="MMMM dd, yyyy"
              minDate={new Date()}
              filterDate={(date) => {
                // Only allow weekdays (Monday to Friday)
                const day = date.getDay();
                return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
              }}
              required
            />
          </div>
        </div>
        {/* Time Slot */}
        <div className="flex-1">
          <label className="block font-semibold mb-2">Select Time Slot</label>
          <div className="relative">
            <select
              className="w-full border rounded px-3 py-2 mb-1"
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              required
            >
              <option value="">Select</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Notes */}
      <div className="w-full mb-6">
        <label className="block font-semibold mb-2">Add Notes <span className="text-gray-400">(Optional)</span></label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          placeholder="Add any notes here..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      {submitError && <div className="text-red-600 mb-2">{submitError}</div>}
      <button
        type="submit"
        className="mt-4 flex justify-center w-[420px] bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
        disabled={submitLoading}
      >
        {submitLoading ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  );

  // Step 4: Payment Process (placeholder) - Now step 1
  const PaymentProcess = () => (
    <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-6 flex flex-col items-center">
      {submitSuccess && bookingDetails && (
        <div className="w-full mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 text-xl">✅</span>
            <h3 className="text-lg font-semibold text-green-800">Booking Successful!</h3>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Booking ID:</strong> #{bookingDetails.id}</p>
            <p><strong>Name:</strong> {bookingDetails.name} {bookingDetails.last_name}</p>
            <p><strong>Company:</strong> {bookingDetails.company}</p>
            <p><strong>Pickup Date:</strong> {bookingDetails.pickup_date}</p>
            <p><strong>Time Slot:</strong> {bookingDetails.time_slot}</p>
            <p><strong>Location:</strong> {bookingDetails.district}, {bookingDetails.sector}</p>
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
            <strong>📧 Email Confirmation:</strong> A confirmation email has been sent to {bookingDetails.email} with all your booking details.
          </div>
        </div>
      )}

      <div className="w-full">
        <h3 className="text-2xl font-bold mb-6 text-center">Payment Process</h3>
        
        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Payment Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">Waste Collection</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-green-600">RWF {paymentAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">Mobile Money (Rwanda)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From Phone:</span>
              <span className="font-medium">{userProfile?.phone_number || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To Phone:</span>
              <span className="font-medium">{recipientPhone}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">📱 Payment Instructions</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• You will be redirected to a secure verification page</li>
            <li>• Enter the OTP sent to your phone via SMS/WhatsApp</li>
            <li>• Complete the CAPTCHA verification if prompted</li>
            <li>• Payment will be processed securely via Flutterwave</li>
            <li>• You'll receive a confirmation after successful payment</li>
          </ul>
        </div>

        {/* Error Message */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800 font-medium">Payment Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{paymentError}</p>
          </div>
        )}

        {/* Success Message */}
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800 font-medium">Payment Initiated Successfully</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              You will be redirected to a secure verification page. Please complete the CAPTCHA verification to finalize your payment.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-600 transition"
            onClick={() => setStep(0)}
            disabled={paymentLoading}
          >
            Back
          </button>
          <button
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:bg-gray-400"
            onClick={handlePayment}
            disabled={paymentLoading || !userProfile?.phone_number}
          >
            {paymentLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>

        {/* Phone Number Warning */}
        {!userProfile?.phone_number && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-800 font-medium">Phone Number Required</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Please update your profile with a valid phone number to proceed with payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Step 5: Confirmation (placeholder) - Now step 2
  const Confirmation = () => (
    <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-6 flex flex-col items-center">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✅</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">Your waste collection has been successfully booked and payment initiated.</p>
      </div>

      {bookingDetails && (
        <div className="w-full bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Booking Summary</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">#{bookingDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{bookingDetails.name} {bookingDetails.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup Date:</span>
              <span className="font-medium">{bookingDetails.pickup_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Slot:</span>
              <span className="font-medium">{bookingDetails.time_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{bookingDetails.district}, {bookingDetails.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-bold text-green-600">RWF {paymentAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📱 Payment Status</h4>
          <p className="text-blue-700 text-sm">
            Payment has been initiated via mobile money. Please check your phone for the payment prompt and complete the transaction.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">📧 Next Steps</h4>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Complete the mobile money payment on your phone</li>
            <li>• You'll receive a confirmation email with booking details</li>
            <li>• The waste collection company will contact you before pickup</li>
            <li>• Keep your phone nearby for any updates</li>
          </ul>
        </div>

        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-8 px-2 md:px-8">
      
      <Stepper />
      {step === 0 && <BookPickup />}
      {step === 1 && <PaymentProcess />}
      {step === 2 && <Confirmation />}
    </div>
  );
} 