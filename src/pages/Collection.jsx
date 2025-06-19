import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile, submitWasteCollection } from '../services/userApi';
import { getCompanies, getCompanyById } from '../services/companyApi';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import wasteTruck from '../assets/eb2216243ee44e2c328a1dea4bc045e2ad26c104.jpg';
import collection from '../assets/e682b31ec1c636f1fc957bef07cbbcd23f22fe33.png';
import person from '../assets/07e14575ca040bb0119bc4319a1d4d8afb0ac6bd.png';
import locations from '../assets/82b1f6e7211be6cd0aaaf955a7f648fc0bf7bcbf.png';
import attention from '../assets/25a91c6fec7f15183e2bac4bc553d85f5b49362a.png';
import truck from '../assets/f9c17e1c8abf24e0e94b552b9f1b4c26dfa14b1a.png';

const steps = [
  'Personal Information',
  'Provide Location',
  'Book Pickup',
  'Payment Process',
  'Confirm',
];

// Helper to ensure select options include the profile value
const getOptionsWithProfileValue = (options, profileValue) => {
  if (profileValue && !options.includes(profileValue)) {
    return [profileValue, ...options];
  }
  return options;
};

// Dummy options for selects
const genderOptions = ['Male', 'Female', 'Other'];
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
    village: '',
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

  // Helper to ensure select options include the profile value
  const districtOptionsWithProfile = getOptionsWithProfileValue(districtOptions, location.district);
  const sectorOptionsWithProfile = getOptionsWithProfileValue(sectorOptions, location.sector);
  const cellOptionsWithProfile = getOptionsWithProfileValue(cellOptions, location.cell);
  const genderOptionsWithProfile = getOptionsWithProfileValue(genderOptions, personalInfo.gender);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
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
          village: '', // Not in profile, keep empty
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
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    console.log('Collection component - user from auth context:', user);
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

  const villageOptions = [
    'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
    'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka',
    'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro',
    'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
    'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
  ];

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

  // Step 1: Personal Information
  const PersonalInfoForm = () => (
    <form
      className="bg-white rounded-xl shadow-xl border-2 p-8 max-w-4xl mx-auto mt-6"
      onSubmit={e => {
        e.preventDefault();
        // Validate
        const newErrors = {};
        if (!personalInfo.name) newErrors.name = 'Required';
        if (!personalInfo.last_name) newErrors.last_name = 'Required';
        if (!personalInfo.gender) newErrors.gender = 'Required';
        if (!personalInfo.email) newErrors.email = 'Required';
        if (!personalInfo.phone_number) newErrors.phone_number = 'Required';
        if (!personalInfo.ubudehe_category) newErrors.ubudehe_category = 'Required';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) setStep(1);
      }}
    >
      <div className="flex items-center mb-6">
        <span role="img" aria-label="waste">
            <img src={person} alt="waste" className="w-[35px] h-[30px]" />
          </span> 
        <h3 className="text-xl font-bold mt-1">Personal Information</h3>
        {userProfile && (
          <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Pre-filled from your profile
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">First Name<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your first name"
            value={personalInfo.name}
            onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })}
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Last Name<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your last name"
            value={personalInfo.last_name}
            onChange={e => setPersonalInfo({ ...personalInfo, last_name: e.target.value })}
          />
          {errors.last_name && <span className="text-xs text-red-500">{errors.last_name}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Gender<span className="text-red-500">*</span></label>
          <select
            className="w-full border rounded px-3 py-2 mb-1"
            value={personalInfo.gender}
            onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
          >
            <option value="">Select</option>
            {genderOptionsWithProfile.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {errors.gender && <span className="text-xs text-red-500">{errors.gender}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Phone Number<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your phone number"
            value={personalInfo.phone_number}
            onChange={e => setPersonalInfo({ ...personalInfo, phone_number: e.target.value })}
          />
          {errors.phone_number && <span className="text-xs text-red-500">{errors.phone_number}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Email<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter email address"
            value={personalInfo.email}
            onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
          />
          <div className="text-xs text-green-700 flex items-center gap-2 bg-green-50 rounded px-2 py-1 mt-1">
            <span role="img" aria-label="waste">
            <img src={attention} alt="waste" className="w-[15px] h-[15px]" />
          </span>
           <span>Your email will be used for the app's login</span>
           </div>
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Ubudehe Category<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your category"
            value={personalInfo.ubudehe_category}
            onChange={e => setPersonalInfo({ ...personalInfo, ubudehe_category: e.target.value })}
          />
          {errors.ubudehe_category && <span className="text-xs text-red-500">{errors.ubudehe_category}</span>}
        </div>
      </div>
      <div className='flex justify-center'>
      <button type="submit" className="mt-8 w-[420px] bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition">Submit</button>
      </div>
     </form>
  );

  // Step 2: Location Details
  const LocationForm = () => (
    <form
      className="bg-white rounded-xl shadow-xl border-3 border-[#EFFDF2] p-8 max-w-3xl mx-auto mt-6 border-2 border-blue-300"
      onSubmit={e => {
        e.preventDefault();
        // Validate
        const newErrors = {};
        if (!location.district) newErrors.district = 'Required';
        if (!location.sector) newErrors.sector = 'Required';
        if (!location.cell) newErrors.cell = 'Required';
        if (!location.village) newErrors.village = 'Required';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) setStep(2);
      }}
    >
      <div className="flex items-center mb-6">
        <img src={locations} alt="waste" className="w-[35px] h-[30px]" />
        <h3 className="text-xl font-bold mt-1">Location Details</h3>
        {userProfile && (
          <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Pre-filled from your profile
          </div>
        )}
      </div>
      <div className="space-y-6">
  {/* District */}
  <div className="relative">
    <div className="relative border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700 flex items-center gap-2">
        District
        {userProfile && userProfile.district && (
          <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">from profile</span>
        )}
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.district}
        onChange={e => setLocation({ ...location, district: e.target.value })}
      >
        <option value="">Select</option>
        {districtOptionsWithProfile.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {errors.district && <span className="text-xs text-red-500">{errors.district}</span>}
  </div>

  {/* Sector */}
  <div className="relative">
    <div className="relative border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700 flex items-center gap-2">
        Sector
        {userProfile && userProfile.sector && (
          <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">from profile</span>
        )}
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.sector}
        onChange={e => {
          setLocation({ ...location, sector: e.target.value });
          setSelectedCompany('');
          setSelectedCompanyDetails(null);
        }}
      >
        <option value="">Select</option>
        {sectorOptionsWithProfile.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {errors.sector && <span className="text-xs text-red-500">{errors.sector}</span>}
  </div>

  {/* Cell */}
  <div className="relative">
    <div className="relative border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700 flex items-center gap-2">
        Cell
        {userProfile && userProfile.cell && (
          <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">from profile</span>
        )}
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.cell}
        onChange={e => {
          setLocation({ ...location, cell: e.target.value });
          setSelectedCompany('');
          setSelectedCompanyDetails(null);
        }}
      >
        <option value="">Select</option>
        {cellOptionsWithProfile.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {errors.cell && <span className="text-xs text-red-500">{errors.cell}</span>}
  </div>

  {/* Village */}
  <div className="relative">
    <div className="relative border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700">
        Village
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.village}
        onChange={e => setLocation({ ...location, village: e.target.value })}
      >
        <option value="">Select</option>
        {villageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {errors.village && <span className="text-xs text-red-500">{errors.village}</span>}
  </div>

  {/* Street (Optional) - Kept as original since it's an input */}
  <div>
    <label className="block font-medium mb-1 flex items-center gap-2">Street <span className="text-gray-400">(Optional)</span>
      {userProfile && userProfile.street && (
        <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">from profile</span>
      )}
    </label>
    <input
      className="w-full shadow-lg border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
      placeholder="Optional"
      value={location.street}
      onChange={e => setLocation({ ...location, street: e.target.value })}
    />
  </div>
</div>
      
      <div className='flex justify-center'>
      <button type="submit" className="mt-8 flex justify-center w-[420px] bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition">Submit</button>
      </div>
     </form>
  );

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
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const payload = {
        ...personalInfo,
        ...location,
        company_id: selectedCompany,
        pickup_date: pickupDate ? pickupDate.toISOString().split('T')[0] : '',
        time_slot: timeSlot,
        notes,
      };
      const response = await submitWasteCollection(payload);
      setBookingDetails({
        id: response.data.id,
        ...payload,
        company: companies.find(c => c.id === selectedCompany)?.name || 'Selected Company'
      });
      setSubmitSuccess(true);
      setStep(3); // Advance to payment step
    } catch (err) {
      setSubmitError('Failed to book collection. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const BookPickup = () => (
    <form
      className="bg-white rounded-xl shadow max-w-4xl mx-auto mt-6 flex flex-col items-center p-8"
      onSubmit={handleBookPickupSubmit}
    >
      {/* COPED LTD Banner */}
      <div className="bg-white flex flex-col md:flex-row items-center overflow-hidden">
        {/* Left: Text Content */}
        <div className="flex-1 pr-5">
          <div className="flex items-center gap-2 mb-2">
            {/* Logo (use collection icon as placeholder) */}
            <img src={truck} alt="COPED LTD Logo" className="w-8 h-8" />
            <span className="text-green-700 font-bold text-xl">COPED LTD</span>
          </div>
          <div className="font-bold text-[16px] mb-2">Company for Protection of Environment and Development</div>
          <div className="text-gray-700 text-[11px] mb-3 max-w-xl">
            A Rwandan waste management company established in 1999, specializing in the collection, transportation, treatment, and disposal of waste. It serves a broad range of clients, including homes, businesses, government and non-government organizations, industries, and medical facilities. <button type="button" className="text-blue-600 underline bg-transparent border-none p-0 cursor-pointer">Read More</button>
          </div>
          <div className="flex text-[10px] flex-col md:flex-col gap-2 text-xs text-gray-600 mt-4">
            <div className="flex items-center gap-1">
              <span role="img" aria-label="location">📍</span>
              Gasabo, Kacyiru, Utexrwa Road, KG 15 Ave
            </div>
            <div className="flex items-center gap-1">
              <span role="img" aria-label="email">✉️</span>
              <a href="mailto:info@copedgroup.rw" className="underline">info@copedgroup.rw</a>
            </div>
            <div className="flex items-center gap-1">
              <span role="img" aria-label="phone">📞</span>
              (+250)788 508 290
            </div>
          </div>
        </div>
        {/* Right: Truck Image */}
        <div className="flex-1 min-w-[220px] max-w-[350px] h-full flex items-end justify-end">
          <img src={wasteTruck} alt="Waste Truck" className="object-cover w-full h-full rounded-tl-[180px]" />
        </div>
      </div>
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

  // Step 4: Payment Process (placeholder)
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
        </div>
      )}
      <h3 className="text-xl font-bold mb-4">Payment Process</h3>
      <p className="mb-8">Payment integration coming soon.</p>
      <button
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
        onClick={() => setStep(4)}
      >
        Continue
      </button>
    </div>
  );

  // Step 5: Confirmation (placeholder)
  const Confirmation = () => (
    <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4">Booking Confirmed!</h3>
      <p className="mb-8">Thank you for booking your waste collection. We will contact you soon.</p>
    </div>
  );

  return (
    <div className="py-8 px-2 md:px-8">
      
      <Stepper />
      {step === 0 && <PersonalInfoForm />}
      {step === 1 && <LocationForm />}
      {step === 2 && <BookPickup />}
      {step === 3 && <PaymentProcess />}
      {step === 4 && <Confirmation />}
    </div>
  );
} 