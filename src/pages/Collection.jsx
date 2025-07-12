import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getUserProfile } from '../services/userApi';
import { wasteCollectionApi } from '../services/wasteCollectionApi';
import { getCompanies, getCompanyById } from '../services/companyApi';
import { initiateMobileMoneyPayment } from '../services/paymentService';
import { createReceipt } from '../services/receiptApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

// Cell mapping by sector - this should be more comprehensive in a real application
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

export default function Collection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const companiesFetchedRef = useRef(false);
  const [cellOptions, setCellOptions] = useState([]);
  
  // Add state for dynamic options
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  
  // Add state for searchable district dropdown
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [filteredDistrictOptions, setFilteredDistrictOptions] = useState([]);
  
  // Add state for searchable sector dropdown
  const [sectorSearchTerm, setSectorSearchTerm] = useState('');
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [filteredSectorOptions, setFilteredSectorOptions] = useState([]);
  
  // Add state for searchable cell dropdown
  const [cellSearchTerm, setCellSearchTerm] = useState('');
  const [isCellDropdownOpen, setIsCellDropdownOpen] = useState(false);
  const [filteredCellOptions, setFilteredCellOptions] = useState([]);
  
  const [personalInfo, setPersonalInfo] = useState({
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
    cell: '',
    street: ''
  });
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
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [recipientPhone] = useState('0785847049');

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [tempBookingData, setTempBookingData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  // Back button state
  const [showBackButton, setShowBackButton] = useState(false);
  
  // Pay on Pickup Modal state
  const [showPayOnPickupModal, setShowPayOnPickupModal] = useState(false);
  
  // Card payment state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [showCardForm, setShowCardForm] = useState(false);
  
  // Mobile money payment state
  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    phoneNumber: ''
  });
  const [showMobileMoneyForm, setShowMobileMoneyForm] = useState(false);

  // Helper to ensure select options include the profile value
  // const districtOptionsWithProfile = getOptionsWithProfileValue(districtOptions, location.district);
  // const sectorOptionsWithProfile = getOptionsWithProfileValue(sectorOptions, location.sector);
  // const cellOptionsWithProfile = getOptionsWithProfileValue(cellOptions, location.cell);
  // const genderOptionsWithProfile = getOptionsWithProfileValue(genderOptions, personalInfo.gender);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!user) {
      console.log('No user found - redirecting to login');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch user profile on component mount
  // Check localStorage for bookCollectionClicked value
  useEffect(() => {
    const bookCollectionClicked = localStorage.getItem('bookCollectionClicked');
    setShowBackButton(bookCollectionClicked === '1');
  }, []);

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
            house_number: response.data.house_number || '',
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
          
          // Set cell options based on user's sector
          // if (response.data.sector) {
          //   const sectorCells = cellMapping[response.data.sector] || fallbackCellOptions;
          //   
          //   // If user has a cell that's not in the sector mapping, add it to the options
          //   let finalCellOptions = [...sectorCells];
          //   if (response.data.cell && !sectorCells.includes(response.data.cell)) {
          //     finalCellOptions = [response.data.cell, ...sectorCells];
          //   }
          //   
          //   setCellOptions(finalCellOptions);
          // }
          
          // Populate sectors if user has a district
          if (userProfile?.district) {
            setAvailableSectors(sectorOptions);
          }
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
      console.log('No user found in auth context - redirecting to login');
      setLoading(false);
      navigate('/login');
    }
  }, [user]);

  // Populate districts when component mounts
  useEffect(() => {
    setAvailableDistricts(districtOptions);
  }, []);

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

  // Update cell options based on selected sector
  useEffect(() => {
    if (selectedLocation.sector) {
      const sectorCells = cellMapping[selectedLocation.sector] || fallbackCellOptions;
      
      // If user has a cell that's not in the sector mapping, add it to the options
      let finalCellOptions = [...sectorCells];
      if (selectedLocation.cell && !sectorCells.includes(selectedLocation.cell)) {
        finalCellOptions = [selectedLocation.cell, ...sectorCells];
      }
      
      setCellOptions(finalCellOptions);
      
      // Don't reset cell if it's the user's original cell, even if not in mapping
      // Only reset if it's a different cell that's not available
      if (selectedLocation.cell && !finalCellOptions.includes(selectedLocation.cell)) {
        setSelectedLocation(prev => ({
          ...prev,
          cell: ''
        }));
      }
    } else {
      setCellOptions([]);
    }
  }, [selectedLocation.sector, selectedLocation.cell]);

  // Filter district options based on search term
  useEffect(() => {
    if (districtSearchTerm.trim() === '') {
      setFilteredDistrictOptions(availableDistricts);
    } else {
      const filtered = availableDistricts.filter(district =>
        district.toLowerCase().includes(districtSearchTerm.toLowerCase())
      );
      setFilteredDistrictOptions(filtered);
    }
  }, [districtSearchTerm, availableDistricts]);

  // Filter sector options based on search term
  useEffect(() => {
    if (sectorSearchTerm.trim() === '') {
      setFilteredSectorOptions(availableSectors);
    } else {
      const filtered = availableSectors.filter(sector =>
        sector.toLowerCase().includes(sectorSearchTerm.toLowerCase())
      );
      setFilteredSectorOptions(filtered);
    }
  }, [sectorSearchTerm, availableSectors]);

  // Filter cell options based on search term
  useEffect(() => {
    if (cellSearchTerm.trim() === '') {
      setFilteredCellOptions(cellOptions);
    } else {
      const filtered = cellOptions.filter(cell =>
        cell.toLowerCase().includes(cellSearchTerm.toLowerCase())
      );
      setFilteredCellOptions(filtered);
    }
  }, [cellSearchTerm, cellOptions]);

  // const villageOptions = [
  //   'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
  //   'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka',
  //   'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro',
  //   'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  //   'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
  // ];

  // Stepper UI
  const handleBackButtonClick = () => {
    localStorage.setItem('bookCollectionClicked', '0');
    navigate('/waste-collections?status=all');
  };

  const Stepper = () => {
    // Calculate the percent width for the green line
    const percent = steps.length === 1 ? 0 : (step) / (steps.length - 1) * 100;
    return (
      <div className='flex'>
        {showBackButton && (
          <div>
            <button 
              onClick={handleBackButtonClick}
              className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors'
            >
              Back
            </button>
          </div>
        )}
        <div className="flex flex-col items-center w-full mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">
            <div className='flex items-center gap-2'>
            <span role="img" aria-label="waste">
              <img src={collection} alt="waste" className="w-[48px] h-[36px]" />
            </span> 
            <div>Book your waste collection in minutes</div>
            </div>
          </h2>
          
          <hr className='w-full max-w-4xl mt-7 border-2 border-[#0C9488]' />
        </div>
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

    // Prepare booking data
    const bookingData = {
      name: personalInfo.name,
      last_name: personalInfo.last_name,
      email: personalInfo.email,
      phone_number: personalInfo.phone_number,
      gender: personalInfo.gender,
      ubudehe_category: personalInfo.ubudehe_category,
      house_number: personalInfo.house_number,
      district: location.district,
      sector: location.sector,
      cell: location.cell,
      street: location.street,
      pickup_date: pickupDate.toISOString().split('T')[0],
      time_slot: timeSlot,
      company_id: selectedCompany,
      notes: notes
    };

    // Set payment amount based on ubudehe_category
    const getAmountByUbudeheCategory = (category) => {
      switch (category) {
        case 'A':
          return 1000;
        case 'B':
          return 1500;
        case 'C':
          return 2000;
        case 'D':
          return 4000;
        default:
          return 2000; // Default to category C if no category is set
      }
    };

    const amount = getAmountByUbudeheCategory(personalInfo.ubudehe_category);
    setPaymentAmount(amount);

    // Store booking data temporarily and show payment modal
    setTempBookingData(bookingData);
    setShowPaymentModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPaymentMethod) {
      setPaymentError('Please select a payment method');
      return;
    }

    // Check authentication before proceeding
    const token = localStorage.getItem('token');
    console.log('Current user:', user);
    console.log('Token in localStorage:', token);
    console.log('User profile:', userProfile);

    if (!user || !token) {
      setPaymentError('You must be logged in to book a pickup. Please log in and try again.');
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError('');

      // Add payment method to booking data
      const bookingDataWithPayment = {
        ...tempBookingData,
        payment_method: selectedPaymentMethod,
        payment_status: selectedPaymentMethod === 'pay_on_pickup' ? 'pending' : 'pending'
      };

      console.log('Submitting booking data:', bookingDataWithPayment);
      const response = await wasteCollectionApi.createWasteCollection(bookingDataWithPayment);
      console.log('Booking response:', response);

      // Check if response exists
      if (!response) {
        throw new Error('Invalid response from server');
      }

      setBookingDetails(response);
      setSubmitSuccess(true);
      
      // Prepare receipt data
      const receipt = {
        bookingId: response.id || 'N/A',
        customerName: `${tempBookingData.name} ${tempBookingData.last_name}`,
        email: tempBookingData.email,
        phone: tempBookingData.phone_number,
        pickupDate: tempBookingData.pickup_date,
        timeSlot: tempBookingData.time_slot,
        location: `${tempBookingData.district}, ${tempBookingData.sector}`,
        amount: paymentAmount,
        paymentMethod: selectedPaymentMethod === 'mobile_money' ? 'Mobile Money' : 
                      selectedPaymentMethod === 'card' ? 'Credit/Debit Card' : 'Pay on Pickup',
        paymentStatus: selectedPaymentMethod === 'pay_on_pickup' ? 'Pending (Pay on Pickup)' : 'Pending',
        transactionDate: new Date().toLocaleString(),
        company: selectedCompanyDetails?.name || 'Selected Company'
      };
      
      // Store receipt in database
      try {
        const receiptDataForDB = {
          waste_collection_id: response.id,
          booking_id: response.id.toString(),
          customer_name: receipt.customerName,
          email: receipt.email,
          phone: receipt.phone,
          company: receipt.company,
          pickup_date: receipt.pickupDate,
          time_slot: receipt.timeSlot,
          location: receipt.location,
          amount: receipt.amount,
          payment_method: receipt.paymentMethod,
          payment_status: receipt.paymentStatus,
          transaction_date: receipt.transactionDate,
          receipt_data: receipt // Store complete receipt data as JSON
        };
        
        console.log('Storing receipt in database:', receiptDataForDB);
        const receiptResponse = await createReceipt(receiptDataForDB);
        console.log('Receipt stored successfully:', receiptResponse);
      } catch (receiptError) {
        console.error('Error storing receipt in database:', receiptError);
        // Don't fail the booking if receipt storage fails
      }
      
      setReceiptData(receipt);
      setShowReceipt(true);
      setShowPaymentModal(false); // Hide payment modal when showing receipt
      console.log('Receipt should now be shown:', receipt);
    } catch (error) {
      console.error('Error submitting booking:', error);
      if (error.response?.status === 401) {
        setPaymentError('Your session has expired. Please log in and try again.');
      } else {
        setSubmitError(error.response?.data?.message || 'Failed to book pickup. Please try again.');
      }
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
            {userProfile && (userProfile.district || userProfile.sector || userProfile.cell || userProfile.street) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({
                    district: userProfile.district || '',
                    sector: userProfile.sector || '',
                    cell: userProfile.cell || '',
                    street: userProfile.street || '',
                  });
                  setSelectedCompany('');
                  setSelectedCompanyDetails(null);
                  
                  // Populate sectors if user has a district
                  if (userProfile.district) {
                    setAvailableSectors(sectorOptions);
                  }
                }}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Use My Location
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* District Selection */}
            <div className="relative">
              <label className="block font-semibold mb-2 text-sm">District</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm pr-8 cursor-pointer"
                  value={isDistrictDropdownOpen ? districtSearchTerm : selectedLocation.district}
                  onChange={e => {
                    if (isDistrictDropdownOpen) {
                      setDistrictSearchTerm(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    setIsDistrictDropdownOpen(true);
                    setDistrictSearchTerm('');
                    if (availableDistricts.length === 0) {
                      setAvailableDistricts(districtOptions);
                    }
                  }}
                  onBlur={() => {
                    // Delay closing to allow clicking on options
                    setTimeout(() => setIsDistrictDropdownOpen(false), 200);
                  }}
                  placeholder={selectedLocation.district || "Search or select district..."}
                  readOnly={!isDistrictDropdownOpen}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Options */}
                {isDistrictDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredDistrictOptions.length > 0 ? (
                      filteredDistrictOptions.map(district => (
                        <div
                          key={district}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedLocation(prev => ({
                              ...prev,
                              district: district,
                              sector: '', // Reset sector when district changes
                              cell: '',    // Reset cell when district changes
                              street: ''   // Reset street when district changes
                            }));
                            setSelectedCompany(''); // Reset company selection
                            setSelectedCompanyDetails(null); // Reset company details
                            setDistrictSearchTerm('');
                            setIsDistrictDropdownOpen(false);
                            
                            // Populate sectors when district is selected
                            if (district) {
                              setAvailableSectors(sectorOptions);
                            } else {
                              setAvailableSectors([]);
                            }
                          }}
                        >
                          {district}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No districts found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Sector Selection */}
            <div className="relative">
              <label className="block font-semibold mb-2 text-sm">Sector</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm pr-8 cursor-pointer"
                  value={isSectorDropdownOpen ? sectorSearchTerm : selectedLocation.sector}
                  onChange={e => {
                    if (isSectorDropdownOpen) {
                      setSectorSearchTerm(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (selectedLocation.district) {
                      setIsSectorDropdownOpen(true);
                      setSectorSearchTerm('');
                      if (availableSectors.length === 0) {
                        setAvailableSectors(sectorOptions);
                      }
                    }
                  }}
                  onBlur={() => {
                    // Delay closing to allow clicking on options
                    setTimeout(() => setIsSectorDropdownOpen(false), 200);
                  }}
                  placeholder={selectedLocation.sector || "Search or select sector..."}
                  readOnly={!isSectorDropdownOpen}
                  disabled={!selectedLocation.district}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Options */}
                {isSectorDropdownOpen && selectedLocation.district && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSectorOptions.length > 0 ? (
                      filteredSectorOptions.map(sector => (
                        <div
                          key={sector}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedLocation(prev => ({
                              ...prev,
                              sector: sector,
                              cell: '', // Reset cell when sector changes
                              street: '' // Reset street when sector changes
                            }));
                            setSelectedCompany(''); // Reset company selection
                            setSelectedCompanyDetails(null); // Reset company details
                            setSectorSearchTerm('');
                            setIsSectorDropdownOpen(false);
                            
                            // Clear sectors if sector is cleared
                            if (!sector) {
                              setAvailableSectors([]);
                            }
                          }}
                        >
                          {sector}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No sectors found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Cell Selection */}
            <div className="relative">
              <label className="block font-semibold mb-2 text-sm">Cell</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm pr-8 cursor-pointer"
                  value={isCellDropdownOpen ? cellSearchTerm : selectedLocation.cell}
                  onChange={e => {
                    if (isCellDropdownOpen) {
                      setCellSearchTerm(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (selectedLocation.sector) {
                      setIsCellDropdownOpen(true);
                      setCellSearchTerm('');
                    }
                  }}
                  onBlur={() => {
                    // Delay closing to allow clicking on options
                    setTimeout(() => setIsCellDropdownOpen(false), 200);
                  }}
                  placeholder={selectedLocation.cell || "Search or select cell..."}
                  readOnly={!isCellDropdownOpen}
                  disabled={!selectedLocation.sector}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Options */}
                {isCellDropdownOpen && selectedLocation.sector && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCellOptions.length > 0 ? (
                      filteredCellOptions.map(cell => (
                        <div
                          key={cell}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedLocation(prev => ({
                              ...prev,
                              cell: cell,
                              street: '' // Reset street when cell changes
                            }));
                            setSelectedCompany(''); // Reset company selection
                            setSelectedCompanyDetails(null); // Reset company details
                            setCellSearchTerm('');
                            setIsCellDropdownOpen(false);
                          }}
                        >
                          {cell}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No cells found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Street Selection */}
            <div>
              <label className="block font-semibold mb-2 text-sm">Street</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedLocation.street}
                onChange={e => {
                  setSelectedLocation(prev => ({
                    ...prev,
                    street: e.target.value
                  }));
                  setSelectedCompany(''); // Reset company selection
                  setSelectedCompanyDetails(null); // Reset company details
                }}
                placeholder="Enter street name"
                disabled={!selectedLocation.cell}
              />
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
                      <span className="text-gray-700">FRW {selectedCompanyDetails.amount_per_month}</span>
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
        {submitLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          'Proceed'
        )}
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
          
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
            <strong>📧 Email Confirmation:</strong> A confirmation email has been sent to {bookingDetails.email} with all your booking details.
          </div>
        </div>
      )}

      
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
          {selectedPaymentMethod === 'pay_on_pickup' ? (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">💰 Payment Status</h4>
                <p className="text-orange-700 text-sm">
                  Payment will be collected when the waste collector arrives at your location. No payment is required now.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📧 Next Steps</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• You'll receive a confirmation email with booking details</li>
                  <li>• The waste collection company will contact you before pickup</li>
                  <li>• Have <strong>RWF {paymentAmount?.toLocaleString()}</strong> ready for payment</li>
                  <li>• Pay the collector when they arrive (cash or mobile money)</li>
                  <li>• Keep your phone nearby for any updates</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">📱 Payment Status</h4>
                <p className="text-blue-700 text-sm">
                  Payment has been initiated via {selectedPaymentMethod === 'mobile_money' ? 'mobile money' : 'card'}. Please check your phone for the payment prompt and complete the transaction.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📧 Next Steps</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Complete the payment on your {selectedPaymentMethod === 'mobile_money' ? 'phone' : 'card'}</li>
                  <li>• You'll receive a confirmation email with booking details</li>
                  <li>• The waste collection company will contact you before pickup</li>
                  <li>• Keep your phone nearby for any updates</li>
                </ul>
              </div>
            </>
          )}

        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  // Payment Receipt Component
  const PaymentReceipt = () => {
    if (!showReceipt || !receiptData) return null;

    const handlePrintReceipt = () => {
      window.print();
    };

    const handleCloseReceipt = () => {
      setShowReceipt(false);
      setShowPaymentModal(false);
      
      // For Pay on Pickup, the booking is already submitted, so just reset
      if (selectedPaymentMethod === 'pay_on_pickup') {
        // Reset all states
        setSelectedPaymentMethod('');
        setTempBookingData(null);
        setReceiptData(null);
        setBookingDetails(null);
        setSubmitSuccess(false);
        setSubmitError('');
        setSubmitLoading(false);
      } else {
        setStep(1); // Move to payment step for other payment methods
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Receipt Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3> */}
              <button
                onClick={handleCloseReceipt}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* <p className="text-gray-600 mt-2">Your booking has been confirmed successfully!</p> */}
          </div>

          {/* Receipt Content */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <h4 className="text-lg font-semibold text-green-800">Booking Confirmed</h4>
                <p className="text-sm text-gray-600">Receipt #{receiptData.bookingId}</p>
              </div>
            </div>

            {/* Receipt Details */}
            {/* <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{receiptData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{receiptData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{receiptData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{receiptData.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Date:</span>
                <span className="font-medium">{receiptData.pickupDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Slot:</span>
                <span className="font-medium">{receiptData.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{receiptData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{receiptData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Date:</span>
                <span className="font-medium">{receiptData.transactionDate}</span>
              </div>
            </div> */}

            {/* Total Amount */}
            {/* <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">RWF {receiptData.amount?.toLocaleString()}</span>
              </div>
            </div> */}

            {/* Action Buttons */}
            {/* <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                📄 Print Receipt
              </button>
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  // Payment Modal Component
  const PaymentModal = () => {
    // Memoize the button disabled state to prevent unnecessary re-renders
    const isButtonDisabled = useMemo(() => {
      if (submitLoading || !selectedPaymentMethod) return true;
      
      if (selectedPaymentMethod === 'pay_on_pickup') {
        return false; // No additional validation needed for pay on pickup
      }
      
      if (showCardForm) {
        return !cardDetails.cardNumber || !cardDetails.cardHolderName || 
               !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv;
      }
      
      if (showMobileMoneyForm) {
        return !mobileMoneyDetails.phoneNumber;
      }
      
      return false;
    }, [submitLoading, selectedPaymentMethod, showCardForm, showMobileMoneyForm, cardDetails, mobileMoneyDetails]);

    if (!showPaymentModal) return null;

    const paymentMethods = [
      {
        id: 'pay_on_pickup',
        name: 'Pay on Pickup',
        description: 'Pay when the waste collector arrives at your location',
        icon: '💰',
        color: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-800'
      },
      {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'Pay with MTN Mobile Money or Airtel Money',
        icon: '📱',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-800'
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, or other cards',
        icon: '💳',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800'
      }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Choose Payment Method</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod('');
                  setPaymentError('');
                  setShowCardForm(false);
                  setShowMobileMoneyForm(false);
                  setShowReceipt(false);
                  setReceiptData(null);
                  setCardDetails({
                    cardNumber: '',
                    cardHolderName: '',
                    expiryMonth: '',
                    expiryYear: '',
                    cvv: ''
                  });
                  setMobileMoneyDetails({
                    phoneNumber: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">Select your preferred payment method to complete your booking</p>
          </div>

          {/* Payment Amount */}
          <div className="p-6 border-b border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">RWF {paymentAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6">
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? `${method.color} border-2 border-green-500`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    if (method.id === 'pay_on_pickup') {
                      setShowPayOnPickupModal(true);
                      setShowPaymentModal(false);
                    } else if (method.id === 'card') {
                      setShowCardForm(true);
                      setShowMobileMoneyForm(false);
                      setShowPayOnPickupModal(false);
                    } else if (method.id === 'mobile_money') {
                      setShowMobileMoneyForm(true);
                      setShowCardForm(false);
                      setShowPayOnPickupModal(false);
                    } else {
                      setShowCardForm(false);
                      setShowMobileMoneyForm(false);
                      setShowPayOnPickupModal(false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${method.textColor}`}>{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pay on Pickup Instructions */}
            {selectedPaymentMethod === 'pay_on_pickup' && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-4">💰 Pay on Pickup Instructions</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 text-lg">📋</span>
                    <div className="text-sm text-orange-700">
                      <strong>How it works:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Your booking will be confirmed immediately</li>
                        <li>No payment is required now</li>
                        <li>Pay the waste collector when they arrive</li>
                        <li>Payment amount: <strong>RWF {paymentAmount?.toLocaleString()}</strong></li>
                        <li>Cash or mobile money accepted on pickup</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-orange-200 rounded-lg p-3">
                    <h5 className="font-medium text-orange-800 mb-2">⚠️ Important Notes</h5>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• Please have the exact amount ready</li>
                      <li>• Keep your phone nearby for any updates</li>
                      <li>• The collector will contact you before arrival</li>
                      <li>• Payment is due immediately upon pickup</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Card Details Form */}
            {showCardForm && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Card Details</h4>
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        const input = e.target;
                        const cursorPosition = input.selectionStart;
                        const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardDetails(prev => ({ ...prev, cardNumber: value }));
                        
                        // Restore cursor position after state update
                        setTimeout(() => {
                          input.setSelectionRange(cursorPosition, cursorPosition);
                        }, 0);
                      }}
                      maxLength="19"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Card Holder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.cardHolderName}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardHolderName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month
                      </label>
                      <select
                        value={cardDetails.expiryMonth}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        value={cardDetails.expiryYear}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                                              onChange={(e) => {
                        const input = e.target;
                        const cursorPosition = input.selectionStart;
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardDetails(prev => ({ ...prev, cvv: value }));
                        
                        // Restore cursor position after state update
                        setTimeout(() => {
                          input.setSelectionRange(cursorPosition, cursorPosition);
                        }, 0);
                      }}
                        maxLength="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    🔒 Your card details are encrypted and secure. We use industry-standard SSL encryption.
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Money Form */}
            {showMobileMoneyForm && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Mobile Money Details</h4>
                <div className="space-y-4">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">+250</span>
                      <input
                        type="tel"
                        placeholder="7X XXX XXXX"
                        value={mobileMoneyDetails.phoneNumber}
                        onChange={(e) => {
                          const input = e.target;
                          const cursorPosition = input.selectionStart;
                          const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                          setMobileMoneyDetails(prev => ({ ...prev, phoneNumber: value }));
                          
                          // Restore cursor position after state update
                          setTimeout(() => {
                            input.setSelectionRange(cursorPosition, cursorPosition);
                          }, 0);
                        }}
                        maxLength="9"
                        className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your MTN or Airtel phone number (without country code)
                    </p>
                  </div>

                  {/* Mobile Money Instructions */}
                  {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-800 mb-2">📱 Payment Instructions</h5>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• You'll receive a payment prompt on your phone</li>
                      <li>• Enter your mobile money PIN to confirm</li>
                      <li>• Payment will be processed instantly</li>
                      <li>• You'll receive a confirmation SMS</li>
                    </ul>
                  </div> */}

                  {/* Security Notice */}
                  <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                    🔒 Mobile money payments are secure and instant. No card details required.
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {paymentError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-red-800 text-sm">{paymentError}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod('');
                  setPaymentError('');
                  setShowCardForm(false);
                  setShowMobileMoneyForm(false);
                  setShowReceipt(false);
                  setReceiptData(null);
                  setCardDetails({
                    cardNumber: '',
                    cardHolderName: '',
                    expiryMonth: '',
                    expiryYear: '',
                    cvv: ''
                  });
                  setMobileMoneyDetails({
                    phoneNumber: ''
                  });
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                disabled={isButtonDisabled}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  selectedPaymentMethod === 'pay_on_pickup' ? 'Confirm Booking' : 'Confirm & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pay on Pickup Modal Component
  const PayOnPickupModal = () => {
    if (!showPayOnPickupModal || !tempBookingData) return null;

    const handleConfirmPayOnPickup = async () => {
      try {
        setSubmitLoading(true);
        setSubmitError('');

        // Add payment method to booking data
        const bookingDataWithPayment = {
          ...tempBookingData,
          payment_method: 'pay_on_pickup',
          payment_status: 'pending'
        };

        console.log('Submitting Pay on Pickup booking data:', bookingDataWithPayment);
        const response = await wasteCollectionApi.createWasteCollection(bookingDataWithPayment);
        console.log('Pay on Pickup booking response:', response);

        // Check if response exists
        if (!response) {
          throw new Error('Invalid response from server');
        }

        setBookingDetails(response);
        setSubmitSuccess(true);
        
        // Prepare receipt data
        const receipt = {
          bookingId: response.id || 'N/A',
          customerName: `${tempBookingData.name} ${tempBookingData.last_name}`,
          email: tempBookingData.email,
          phone: tempBookingData.phone_number,
          pickupDate: tempBookingData.pickup_date,
          timeSlot: tempBookingData.time_slot,
          location: `${tempBookingData.district}, ${tempBookingData.sector}`,
          amount: paymentAmount,
          paymentMethod: 'Pay on Pickup',
          paymentStatus: 'Pending (Pay on Pickup)',
          transactionDate: new Date().toLocaleString(),
          company: selectedCompanyDetails?.name || 'Selected Company'
        };
        
        // Store receipt in database
        try {
          const receiptDataForDB = {
            waste_collection_id: response.id,
            booking_id: response.id.toString(),
            customer_name: receipt.customerName,
            email: receipt.email,
            phone: receipt.phone,
            company: receipt.company,
            pickup_date: receipt.pickupDate,
            time_slot: receipt.timeSlot,
            location: receipt.location,
            amount: receipt.amount,
            payment_method: receipt.paymentMethod,
            payment_status: receipt.paymentStatus,
            transaction_date: receipt.transactionDate,
            receipt_data: receipt // Store complete receipt data as JSON
          };
          
          console.log('Storing Pay on Pickup receipt in database:', receiptDataForDB);
          const receiptResponse = await createReceipt(receiptDataForDB);
          console.log('Pay on Pickup receipt stored successfully:', receiptResponse);
        } catch (receiptError) {
          console.error('Error storing Pay on Pickup receipt in database:', receiptError);
          // Don't fail the booking if receipt storage fails
        }
        
        setReceiptData(receipt);
        setShowReceipt(true);
        setShowPayOnPickupModal(false);
        console.log('Pay on Pickup receipt should now be shown:', receipt);
      } catch (error) {
        console.error('Error submitting Pay on Pickup booking:', error);
        if (error.response?.status === 401) {
          setSubmitError('Your session has expired. Please log in and try again.');
        } else {
          setSubmitError(error.response?.data?.message || 'Failed to book pickup. Please try again.');
        }
      } finally {
        setSubmitLoading(false);
      }
    };

    const handleClosePayOnPickupModal = () => {
      setShowPayOnPickupModal(false);
      setSelectedPaymentMethod('');
      setSubmitError('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Receipt Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Pay on Pickup Receipt</h3>
              <button
                onClick={handleClosePayOnPickupModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">Review your booking details before confirming</p>
          </div>

          {/* Receipt Content */}
          <div className="p-6">
            {/* Receipt Header with Logo */}
            {/* <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">💰</span>
                </div>
                <h4 className="text-xl font-bold text-green-800">Pay on Pickup Booking</h4>
                <p className="text-sm text-gray-600">Booking Preview</p>
              </div>
            </div> */}

            {/* Receipt Details */}
            <div className="space-y-4 mb-6">
              {/* Customer Information */}
              {/* <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-500">👤</span>
                  Customer Informationghfh
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{tempBookingData.name} {tempBookingData.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{tempBookingData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{tempBookingData.phone_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Number:</span>
                    <span className="font-medium">{tempBookingData.house_number || 'Not specified'}</span>
                  </div>
                </div>
              </div> */}

              {/* Pickup Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-green-500">🗓️</span>
                  Pickup Details
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Date:</span>
                    <span className="font-medium">
                      {new Date(tempBookingData.pickup_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-medium">{tempBookingData.time_slot}</span>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              {/* <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-purple-500">📍</span>
                  Location Details
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">District:</span>
                    <span className="font-medium">{tempBookingData.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sector:</span>
                    <span className="font-medium">{tempBookingData.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cell:</span>
                    <span className="font-medium">{tempBookingData.cell}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Street:</span>
                    <span className="font-medium">{tempBookingData.street || 'Not specified'}</span>
                  </div>
                </div>
              </div> */}

              {/* Company Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-orange-500">🏢</span>
                  Company Details
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{selectedCompanyDetails?.name || 'Selected Company'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-green-600">Pay on Pickup</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {tempBookingData.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-gray-500">📝</span>
                    Additional Notes
                  </h5>
                  <div className="text-sm text-gray-700">
                    {tempBookingData.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">RWF {paymentAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Pay on Pickup Notice */}
            {/* <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-orange-600 text-lg">💰</span>
                <div className="text-sm text-orange-700">
                  <strong>Payment Instructions:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>No payment required now</li>
                    <li>Pay RWF {paymentAmount?.toLocaleString()} when collector arrives</li>
                    <li>Cash or mobile money accepted</li>
                    <li>Keep this receipt for reference</li>
                  </ul>
                </div>
              </div>
            </div> */}

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-red-800 text-sm">{submitError}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClosePayOnPickupModal}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayOnPickup}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (loading || !user) {
    return (
      <div className="py-8 px-2 md:px-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-2 md:px-8">
      
      <Stepper />
      {step === 0 && <BookPickup />}
      {step === 1 && <PaymentProcess />}
      {step === 2 && <Confirmation />}
      
      {/* Payment Modal */}
      {!showReceipt && <PaymentModal />}
      
      {/* Pay on Pickup Modal */}
      <PayOnPickupModal />
      
      {/* Payment Receipt */}
      {showReceipt && <PaymentReceipt />}
    </div>
  );
} 