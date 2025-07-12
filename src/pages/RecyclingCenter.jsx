import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, ClockIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getUserProfile } from '../services/userApi';
import { getCompanies, getCompanyById } from '../services/companyApi';
import { createRecyclingCenterBooking } from '../services/recyclingCenterApi';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const steps = [
  'Find Recycling Center',
  'Book Service',
  'Confirm',
];

// Location options (same as Collection page)
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

// Cell mapping by sector (same as Collection page)
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
};

// Fallback cell options
const fallbackCellOptions = [
  'Kacyiru', 'Kagugu', 'Kamatamu', 'Kibagabaga', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
  'Nyagatovu', 'Remera', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka',
  'Niboye', 'Nyarugunga', 'Busanza', 'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro',
  'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
];

// Waste types mapping for display
const wasteTypesMapping = {
  'plastic_bottles': { label: 'Plastic Bottles', icon: '🥤' },
  'plastic_bags': { label: 'Plastic Bags', icon: '🛍️' },
  'paper': { label: 'Paper & Cardboard', icon: '📄' },
  'glass': { label: 'Glass', icon: '🍾' },
  'aluminum': { label: 'Aluminum Cans', icon: '🥫' },
  'steel': { label: 'Steel/Metal', icon: '🔧' },
  'electronics': { label: 'Electronics (E-waste)', icon: '💻' },
  'batteries': { label: 'Batteries', icon: '🔋' },
  'textiles': { label: 'Textiles & Clothing', icon: '👕' },
  'organic': { label: 'Organic Waste', icon: '🍃' },
  'construction': { label: 'Construction Materials', icon: '🧱' },
  'automotive': { label: 'Automotive Parts', icon: '🚗' },
  'medical': { label: 'Medical Waste', icon: '🏥' },
  'hazardous': { label: 'Hazardous Materials', icon: '⚠️' },
  'other': { label: 'Other Materials', icon: '📦' }
};

const RecyclingCenter = () => {
  const { t } = useTranslation();
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
  
  // Helper function to parse waste types from JSON string
  const parseWasteTypes = (wasteTypesString) => {
    if (!wasteTypesString) return [];
    try {
      return typeof wasteTypesString === 'string' ? JSON.parse(wasteTypesString) : wasteTypesString;
    } catch (error) {
      console.error('Error parsing waste types:', error);
      return [];
    }
  };
  
  // Location state
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
  
  // Search and dropdown states
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [filteredDistrictOptions, setFilteredDistrictOptions] = useState([]);
  
  const [sectorSearchTerm, setSectorSearchTerm] = useState('');
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [filteredSectorOptions, setFilteredSectorOptions] = useState([]);
  
  const [cellSearchTerm, setCellSearchTerm] = useState('');
  const [isCellDropdownOpen, setIsCellDropdownOpen] = useState(false);
  const [filteredCellOptions, setFilteredCellOptions] = useState([]);
  
  // Booking state
  const [bookingType, setBookingType] = useState('dropoff'); // 'pickup' or 'dropoff'
  const [pickupDate, setPickupDate] = useState(null);
  const [dropoffDate, setDropoffDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  

  

  
  // Back button state
  const [showBackButton, setShowBackButton] = useState(false);
  
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

  // Check localStorage for bookRecyclingClicked value
  useEffect(() => {
    const bookRecyclingClicked = localStorage.getItem('bookRecyclingClicked');
    setShowBackButton(bookRecyclingClicked === '1');
  }, []);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user) {
          const response = await getUserProfile();
          const profile = response.data;
          console.log('User profile fetched:', profile); // Debug log
          console.log('Profile location data:', {
            district: profile?.district,
            sector: profile?.sector,
            cell: profile?.cell,
            street: profile?.street
          });
          setUserProfile(profile);
          
          // Don't automatically populate location fields
          // Location will only be populated when user clicks "Use My Location"
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch existing bookings
  // Back button handler
  const handleBackButtonClick = () => {
    localStorage.setItem('bookRecyclingClicked', '0');
    navigate('/waste-collections?status=all');
  };







  // Filter district options
  useEffect(() => {
    const filtered = districtOptions.filter(option =>
      option.toLowerCase().includes(districtSearchTerm.toLowerCase())
    );
    setFilteredDistrictOptions(filtered);
  }, [districtSearchTerm]);

  // Filter sector options
  useEffect(() => {
    const filtered = sectorOptions.filter(option =>
      option.toLowerCase().includes(sectorSearchTerm.toLowerCase())
    );
    setFilteredSectorOptions(filtered);
  }, [sectorSearchTerm]);

  // Filter cell options
  useEffect(() => {
    const filtered = cellOptions.filter(option =>
      option.toLowerCase().includes(cellSearchTerm.toLowerCase())
    );
    setFilteredCellOptions(filtered);
  }, [cellOptions, cellSearchTerm]);

  // Update cell options when sector changes
  useEffect(() => {
    if (location.sector) {
      const cells = cellMapping[location.sector] || fallbackCellOptions;
      setCellOptions(cells);
    } else {
      setCellOptions([]);
    }
  }, [location.sector]);

  // Fetch recycling centers when location is selected
  useEffect(() => {
    if (selectedLocation.district && selectedLocation.sector && selectedLocation.cell && !companiesFetchedRef.current) {
      fetchRecyclingCenters();
    }
  }, [selectedLocation]);

  const fetchRecyclingCenters = async () => {
    try {
      setCompaniesLoading(true);
      const [companiesResponse, usersResponse] = await Promise.all([
        getCompanies(),
        fetch('http://62.171.173.62/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ]);
      
      const allCompanies = companiesResponse.data;
      const allUsers = usersResponse;
      
      // Filter for recycling centers only
      const recyclingCenters = allCompanies.filter(company => 
        company.type === 'recycling_center' &&
        company.district === selectedLocation.district &&
        company.sector === selectedLocation.sector &&
        company.cell === selectedLocation.cell
      );
      
      // Merge waste types from both companies and users tables
      const enrichedRecyclingCenters = recyclingCenters.map(company => {
        // Find corresponding user by email
        const correspondingUser = allUsers.find(user => user.email === company.email);
        
        // Parse waste types from both sources
        const companyWasteTypes = parseWasteTypes(company.waste_types);
        const userWasteTypes = correspondingUser ? parseWasteTypes(correspondingUser.waste_types) : [];
        
        // Merge waste types, removing duplicates
        const mergedWasteTypes = [...new Set([...companyWasteTypes, ...userWasteTypes])];
        
        return {
          ...company,
          waste_types: mergedWasteTypes.length > 0 ? JSON.stringify(mergedWasteTypes) : company.waste_types
        };
      });
      
      setCompanies(enrichedRecyclingCenters);
      setFilteredCompanies(enrichedRecyclingCenters);
      companiesFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching recycling centers:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset dependent fields
    if (name === 'district') {
      setLocation(prev => ({ ...prev, sector: '', cell: '' }));
      setSelectedLocation(prev => ({ ...prev, sector: '', cell: '' }));
    } else if (name === 'sector') {
      setLocation(prev => ({ ...prev, cell: '' }));
      setSelectedLocation(prev => ({ ...prev, cell: '' }));
    }
  };

  const handleLocationSubmit = () => {
    setSelectedLocation(location);
    companiesFetchedRef.current = false;
    setStep(1);
  };



  const handleCompanySelection = async (companyId) => {
    setSelectedWasteTypes([]); // Reset selected waste types when company changes
    try {
      const [companyResponse, usersResponse] = await Promise.all([
        getCompanyById(companyId),
        fetch('http://62.171.173.62/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ]);
      
      const companyData = companyResponse.data;
      const allUsers = usersResponse;
      
      // Find corresponding user by email
      const correspondingUser = allUsers.find(user => user.email === companyData.email);
      
      // Parse waste types from both sources
      const companyWasteTypes = parseWasteTypes(companyData.waste_types);
      const userWasteTypes = correspondingUser ? parseWasteTypes(correspondingUser.waste_types) : [];
      
      // Merge waste types, removing duplicates
      const mergedWasteTypes = [...new Set([...companyWasteTypes, ...userWasteTypes])];
      
      const enrichedCompanyData = {
        ...companyData,
        waste_types: mergedWasteTypes.length > 0 ? JSON.stringify(mergedWasteTypes) : companyData.waste_types
      };
      
      setSelectedCompanyDetails(enrichedCompanyData);
      setSelectedCompany(companyId);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const handleBookDropoffSubmit = async (e) => {
    e.preventDefault();
    
    const selectedDate = bookingType === 'pickup' ? pickupDate : dropoffDate;
    
    // Debug logging
    console.log('Form validation:', {
      bookingType,
      selectedDate,
      timeSlot,
      selectedCompany,
      pickupDate,
      dropoffDate
    });
    
    // Check each required field individually
    if (!selectedCompany) {
      setSubmitError('Please select a recycling center');
      return;
    }
    
    if (selectedWasteTypes.length === 0) {
      setSubmitError('Please select at least one waste type');
      return;
    }
    

    
    // Basic validation for required backend fields
    if (!selectedLocation.district || !selectedLocation.sector || !selectedLocation.cell) {
      setSubmitError('Please complete your location information (district, sector, cell)');
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError('');
      
      // Prepare booking data for API
      const bookingData = {
        company_id: selectedCompany,
        dropoff_date: selectedDate ? selectedDate.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        time_slot: timeSlot || null,
        notes: notes || null,
        district: selectedLocation.district,
        sector: selectedLocation.sector,
        cell: selectedLocation.cell,
        street: selectedLocation.street || null,
        waste_types: selectedWasteTypes.length > 0 ? JSON.stringify(selectedWasteTypes) : null
      };
      

      
      // Send booking to backend
      const response = await createRecyclingCenterBooking(bookingData);
      

      
      // Create booking details for UI display
      const booking = {
        id: response.id,
        companyId: selectedCompany,
        companyDetails: selectedCompanyDetails,
        serviceType: bookingType,
        date: selectedDate,
        timeSlot: timeSlot,
        notes: notes,
        userLocation: selectedLocation,
        userProfile: userProfile,
        waste_types: response.booking?.waste_types || selectedWasteTypes,
        waste_type: response.booking?.waste_type || 'other'
      };
      
      setBookingDetails(booking);
      setSubmitSuccess(true);
      setStep(2);
    } catch (error) {
      console.error('Error booking service:', error);
      setSubmitError(error.response?.data?.error || `Failed to book ${bookingType}. Please try again.`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const Stepper = () => (
    <div className='flex flex-col items-center mb-8'>
      {/* Main Back Button */}
      {step > 0 && (
        <div className="w-full max-w-4xl mb-4">
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-md transition-colors border border-green-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {step === 1 ? 'Location' : 'Previous Step'}
          </button>
        </div>
      )}
      
      {/* External Back Button */}
      {showBackButton && (
        <div className="w-full max-w-4xl mb-4">
          <button 
            onClick={handleBackButtonClick}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors'
          >
            Back
          </button>
        </div>
      )}
      
      {/* Step Indicators */}
      <div className="flex items-center space-x-4">
        {steps.map((stepName, index) => (
          <div key={index} className="flex items-center">
            <button
              onClick={() => {
                // Only allow navigation if we're at a later step
                if (index <= step) {
                  setStep(index);
                }
              }}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                index <= step ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' : 'border-gray-300 text-gray-500'
              }`}
            >
              {index + 1}
            </button>
            <span className={`ml-2 text-sm font-medium ${
              index <= step ? 'text-green-600' : 'text-gray-500'
            }`}>
              {stepName}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ml-4 ${
                index < step ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const FindRecyclingCenter = () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Find Recycling Centers</h2>
            <p className="text-gray-600">Share your location to find recycling centers near you.</p>
          </div>
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
                setLocation({
                  district: userProfile.district || '',
                  sector: userProfile.sector || '',
                  cell: userProfile.cell || '',
                  street: userProfile.street || '',
                });
                setDistrictSearchTerm(userProfile.district || '');
                setSectorSearchTerm(userProfile.sector || '');
                setCellSearchTerm(userProfile.cell || '');
              }}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Use My Location
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">District</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search district..."
                value={isDistrictDropdownOpen ? districtSearchTerm : selectedLocation.district}
                onChange={(e) => {
                  if (isDistrictDropdownOpen) {
                    setDistrictSearchTerm(e.target.value);
                  }
                }}
                onFocus={() => {
                  setIsDistrictDropdownOpen(true);
                  setDistrictSearchTerm('');
                }}
                onBlur={() => {
                  setTimeout(() => setIsDistrictDropdownOpen(false), 200);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                readOnly={!isDistrictDropdownOpen}
              />
              {isDistrictDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredDistrictOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedLocation(prev => ({ 
                          ...prev, 
                          district: option,
                          sector: '', // Reset sector when district changes
                          cell: '',    // Reset cell when district changes
                          street: ''   // Reset street when district changes
                        }));
                        setLocation(prev => ({ ...prev, district: option }));
                        setDistrictSearchTerm(option);
                        setIsDistrictDropdownOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Sector</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search sector..."
                value={isSectorDropdownOpen ? sectorSearchTerm : selectedLocation.sector}
                onChange={(e) => {
                  if (isSectorDropdownOpen) {
                    setSectorSearchTerm(e.target.value);
                  }
                }}
                onFocus={() => {
                  if (selectedLocation.district) {
                    setIsSectorDropdownOpen(true);
                    setSectorSearchTerm('');
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setIsSectorDropdownOpen(false), 200);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!selectedLocation.district}
                readOnly={!isSectorDropdownOpen}
              />
              {isSectorDropdownOpen && selectedLocation.district && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredSectorOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedLocation(prev => ({ 
                          ...prev, 
                          sector: option,
                          cell: '', // Reset cell when sector changes
                          street: '' // Reset street when sector changes
                        }));
                        setLocation(prev => ({ ...prev, sector: option }));
                        setSectorSearchTerm(option);
                        setIsSectorDropdownOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cell */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cell</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search cell..."
                value={isCellDropdownOpen ? cellSearchTerm : selectedLocation.cell}
                onChange={(e) => {
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
                  setTimeout(() => setIsCellDropdownOpen(false), 200);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!selectedLocation.sector}
                readOnly={!isCellDropdownOpen}
              />
              {isCellDropdownOpen && selectedLocation.sector && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCellOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedLocation(prev => ({ ...prev, cell: option }));
                        setLocation(prev => ({ ...prev, cell: option }));
                        setCellSearchTerm(option);
                        setIsCellDropdownOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Street */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Street <span className="text-gray-500 font-normal">(Optional)</span></label>
            <input
              type="text"
              name="street"
              value={selectedLocation.street}
              onChange={(e) => {
                setSelectedLocation(prev => ({ ...prev, street: e.target.value }));
                setLocation(prev => ({ ...prev, street: e.target.value }));
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter street name"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleLocationSubmit}
            disabled={!selectedLocation.district || !selectedLocation.sector || !selectedLocation.cell}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Find Recycling Centers
          </button>
        </div>
      </div>

      {/* Show selected location */}
      {/* {selectedLocation.district && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Location</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-600">District:</span>
              <p className="font-medium">{selectedLocation.district}</p>
            </div>
            <div>
              <span className="text-gray-600">Sector:</span>
              <p className="font-medium">{selectedLocation.sector}</p>
            </div>
            <div>
              <span className="text-gray-600">Cell:</span>
              <p className="font-medium">{selectedLocation.cell}</p>
            </div>
            <div>
              <span className="text-gray-600">Street:</span>
              <p className="font-medium">{selectedLocation.street || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );

  const BookDropoff = () => (
    <div className="w-full max-w-4xl mx-auto">
      {companiesLoading ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding recycling centers...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">No recycling centers found in your area.</p>
          <button
            onClick={() => setStep(0)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Try Different Location
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Available Recycling Centers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Recycling Centers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((company) => {
                const wasteTypes = parseWasteTypes(company.waste_types);
                return (
                  <div
                    key={company.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCompany === company.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => handleCompanySelection(company.id)}
                  >
                    <h4 className="font-semibold text-green-700 mb-2">{company.name}</h4>
                    {company.website && (
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0c2.21 0 4 4.03 4 9s-1.79 9-4 9-4-4.03-4-9 1.79-9 4-9zm0 0v18" />
                        </svg>
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 underline hover:text-blue-900 truncate max-w-xs"
                          title={company.website}
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center mb-2">
                      <MapPinIcon className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm text-gray-700">{company.street}, {company.cell}</p>
                    </div>
                    <div className="flex items-center mb-2">
                      <PhoneIcon className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm text-gray-700">{company.phone}</p>
                    </div>
                    <div className="flex items-center mb-2">
                      <ClockIcon className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm text-gray-700">Mon-Sat: 8AM-6PM</p>
                    </div>
                    
                    {/* Waste Types Display */}
                    {(() => {
                      const wasteTypes = parseWasteTypes(company.waste_types);
                      return wasteTypes.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Accepts:</p>
                          <div className="flex flex-wrap gap-1">
                            {wasteTypes.slice(0, 4).map((wasteType) => {
                              const typeInfo = wasteTypesMapping[wasteType];
                              return typeInfo ? (
                                <span
                                  key={wasteType}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                  title={typeInfo.label}
                                >
                                  <span>{typeInfo.icon}</span>
                                  <span className="hidden sm:inline">{typeInfo.label}</span>
                                </span>
                              ) : null;
                            })}
                            {wasteTypes.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{wasteTypes.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Form */}
          {selectedCompany && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Book Service</h3>
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Location
                </button>
              </div>
              
              {/* Selected Company Info */}
              {selectedCompanyDetails && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{selectedCompanyDetails.name}</h4>
                  <div className="flex items-center mb-2">
                    <MapPinIcon className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-gray-700">{selectedCompanyDetails.street}, {selectedCompanyDetails.cell}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <PhoneIcon className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-gray-700">{selectedCompanyDetails.phone}</p>
                  </div>
                  
                  {/* Waste Types for Selected Company */}
                  {(() => {
                    const wasteTypes = parseWasteTypes(selectedCompanyDetails.waste_types);
                    return wasteTypes.length > 0 ? (
                      <div className="mt-3">
                        {/* <p className="text-sm font-medium text-gray-700 mb-2">This center acceptssasa:</p> */}
                        {/* <div className="flex flex-wrap gap-2">
                          {wasteTypes.map((wasteType) => {
                            const typeInfo = wasteTypesMapping[wasteType];
                            return typeInfo ? (
                              <span
                                key={wasteType}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                              >
                                <span>{typeInfo.icon}</span>
                                <span>{typeInfo.label}</span>
                              </span>
                            ) : null;
                          })}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          💡 Your waste type will be automatically assigned based on what this center accepts.
                        </p> */}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
              
              {/* Service Type Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">Service Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bookingType"
                      value="dropoff"
                      checked={bookingType === 'dropoff'}
                      onChange={(e) => {
                        setBookingType(e.target.value);
                        // Reset dates when switching service type
                        setPickupDate(null);
                        setDropoffDate(null);
                        setTimeSlot('');
                        setSubmitError('');
                      }}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Drop-off (Bring items to center)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bookingType"
                      value="pickup"
                      checked={bookingType === 'pickup'}
                      onChange={(e) => {
                        setBookingType(e.target.value);
                        // Reset dates when switching service type
                        setPickupDate(null);
                        setDropoffDate(null);
                        setTimeSlot('');
                        setSubmitError('');
                      }}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Pickup (We collect from you)</span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleBookDropoffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {bookingType === 'pickup' ? 'Pickup Date' : 'Drop-off Date'}
                    </label>
                    <DatePicker
                      selected={bookingType === 'pickup' ? pickupDate : dropoffDate}
                      onChange={(date) => {
                        if (bookingType === 'pickup') {
                          setPickupDate(date);
                        } else {
                          setDropoffDate(date);
                        }
                        setSubmitError(''); // Clear error when user makes a selection
                      }}
                      minDate={new Date()}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholderText={`Select ${bookingType === 'pickup' ? 'pickup' : 'drop-off'} date`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => {
                        setTimeSlot(e.target.value);
                        setSubmitError(''); // Clear error when user makes a selection
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Waste Type Selection */}
                {selectedCompanyDetails && (() => {
                  const availableWasteTypes = parseWasteTypes(selectedCompanyDetails.waste_types);
                  return availableWasteTypes.length > 0 ? (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Select Waste Types <span className="text-gray-500 font-normal">(Click to select multiple)</span>
                      </label>
                      <div className="relative">
                        <div className="border border-gray-300 rounded-md p-3 min-h-[120px] bg-white">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {availableWasteTypes.map((wasteType) => {
                              const typeInfo = wasteTypesMapping[wasteType];
                              const isSelected = selectedWasteTypes.includes(wasteType);
                              return typeInfo ? (
                                <div
                                  key={wasteType}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedWasteTypes(prev => prev.filter(type => type !== wasteType));
                                    } else {
                                      setSelectedWasteTypes(prev => [...prev, wasteType]);
                                    }
                                    setSubmitError(''); // Clear error when user makes a selection
                                  }}
                                  className={`flex items-center p-2 rounded-md cursor-pointer transition-all border ${
                                    isSelected
                                      ? 'bg-green-100 border-green-500 text-green-800'
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-lg mr-1">{typeInfo.icon}</span>
                                    <span className="text-sm font-medium truncate">{typeInfo.label}</span>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                      {selectedWasteTypes.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          💡 Click on waste types to select them. You can choose multiple types.
                        </p>
                      )}
                      {selectedWasteTypes.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Selected waste types ({selectedWasteTypes.length}):</p>
                            <button
                              type="button"
                              onClick={() => setSelectedWasteTypes([])}
                              className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedWasteTypes.map((wasteType) => {
                              const typeInfo = wasteTypesMapping[wasteType];
                              return typeInfo ? (
                                <span
                                  key={wasteType}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                                >
                                  <span>{typeInfo.icon}</span>
                                  <span>{typeInfo.label}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedWasteTypes(prev => prev.filter(type => type !== wasteType));
                                    }}
                                    className="ml-1 text-green-600 hover:text-green-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
                


                <div>
                  <label className="block text-gray-700 font-medium mb-2">Notes <span className="text-gray-500 font-normal">(Optional)</span></label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any special instructions or materials to be recycled..."
                  />
                </div>

                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-200"
                >
                  {submitLoading ? 'Booking...' : `Book ${bookingType === 'pickup' ? 'Pickup' : 'Drop-off'}`}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const Confirmation = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Booking
          </button>
        </div>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {bookingDetails?.serviceType === 'pickup' ? 'Pickup' : 'Drop-off'} Booked Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Your recycling {bookingDetails?.serviceType === 'pickup' ? 'pickup' : 'drop-off'} has been scheduled.
        </p>

        {bookingDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recycling Center:</span>
                <span className="font-medium">{bookingDetails.companyDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type:</span>
                <span className="font-medium capitalize">{bookingDetails.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingDetails.date?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingDetails.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waste Types:</span>
                <span className="font-medium">
                  {(() => {
                    if (bookingDetails.waste_types && bookingDetails.waste_types.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1">
                          {bookingDetails.waste_types.map((wasteType) => {
                            const typeInfo = wasteTypesMapping[wasteType];
                            return typeInfo ? (
                              <span
                                key={wasteType}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                <span>{typeInfo.icon}</span>
                                <span>{typeInfo.label}</span>
                              </span>
                            ) : null;
                          })}
                        </div>
                      );
                    } else {
                      // Fallback to single waste type from response
                      const wasteType = bookingDetails.waste_type || 'other';
                      const typeInfo = wasteTypesMapping[wasteType];
                      return typeInfo ? `${typeInfo.icon} ${typeInfo.label}` : wasteType;
                    }
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{bookingDetails.userLocation.district}, {bookingDetails.userLocation.sector}</span>
              </div>
              {bookingDetails.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes:</span>
                  <span className="font-medium">{bookingDetails.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep(0);
              setBookingDetails(null);
              setSubmitSuccess(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Book Another Service
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Don't trash it, recycle it!</h1>
        <p className="text-gray-600">Find recycling centers and schedule your drop-off</p>
      </div>

      {/* Stepper */}
      <Stepper />

      {/* Step Content */}
      {step === 0 && <FindRecyclingCenter />}
      {step === 1 && <BookDropoff />}
      {step === 2 && <Confirmation />}
    </div>
  );
};

export default RecyclingCenter; 