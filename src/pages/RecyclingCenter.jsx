import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPinIcon, PhoneIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getUserProfile } from '../services/userApi';
import { getCompanies, getCompanyById } from '../services/companyApi';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const steps = [
  'Find Recycling Center',
  'Book Drop-off',
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

const RecyclingCenter = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const companiesFetchedRef = useRef(false);
  const [cellOptions, setCellOptions] = useState([]);
  
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
  const [dropoffDate, setDropoffDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  
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

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user) {
          const profile = await getUserProfile();
          setUserProfile(profile);
          
          // Pre-fill location with user profile data
          if (profile) {
            setLocation({
              district: profile.district || '',
              sector: profile.sector || '',
              cell: profile.cell || '',
              street: profile.street || ''
            });
            setSelectedLocation({
              district: profile.district || '',
              sector: profile.sector || '',
              cell: profile.cell || '',
              street: profile.street || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

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
      const response = await getCompanies();
      const allCompanies = response.data;
      
      // Filter for recycling centers only
      const recyclingCenters = allCompanies.filter(company => 
        company.type === 'recycling_center' &&
        company.district === selectedLocation.district &&
        company.sector === selectedLocation.sector &&
        company.cell === selectedLocation.cell
      );
      
      setCompanies(recyclingCenters);
      setFilteredCompanies(recyclingCenters);
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
    try {
      const response = await getCompanyById(companyId);
      setSelectedCompanyDetails(response.data);
      setSelectedCompany(companyId);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const handleBookDropoffSubmit = async (e) => {
    e.preventDefault();
    
    if (!dropoffDate || !timeSlot || !selectedCompany) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError('');
      
      // Create booking details (this would typically be sent to backend)
      const booking = {
        companyId: selectedCompany,
        companyDetails: selectedCompanyDetails,
        dropoffDate: dropoffDate,
        timeSlot: timeSlot,
        notes: notes,
        userLocation: selectedLocation,
        userProfile: userProfile
      };
      
      setBookingDetails(booking);
      setSubmitSuccess(true);
      setStep(2);
    } catch (error) {
      console.error('Error booking dropoff:', error);
      setSubmitError('Failed to book dropoff. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const Stepper = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((stepName, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              index <= step ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-500'
            }`}>
              {index + 1}
            </div>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Recycling Centers</h2>
        <p className="text-gray-600 mb-6">Share your location to find recycling centers near you.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">District</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearchTerm}
                onChange={(e) => setDistrictSearchTerm(e.target.value)}
                onFocus={() => setIsDistrictDropdownOpen(true)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {isDistrictDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredDistrictOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
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
                value={sectorSearchTerm}
                onChange={(e) => setSectorSearchTerm(e.target.value)}
                onFocus={() => setIsSectorDropdownOpen(true)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!location.district}
              />
              {isSectorDropdownOpen && location.district && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredSectorOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
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
                value={cellSearchTerm}
                onChange={(e) => setCellSearchTerm(e.target.value)}
                onFocus={() => setIsCellDropdownOpen(true)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!location.sector}
              />
              {isCellDropdownOpen && location.sector && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCellOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
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
              value={location.street}
              onChange={handleLocationChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter street name"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleLocationSubmit}
            disabled={!location.district || !location.sector || !location.cell}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Find Recycling Centers
          </button>
        </div>
      </div>

      {/* Show selected location */}
      {selectedLocation.district && (
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
      )}
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
              {filteredCompanies.map((company) => (
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
                  <div className="flex items-center mb-2">
                    <MapPinIcon className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-gray-700">{company.street}, {company.cell}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <PhoneIcon className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-gray-700">{company.phone}</p>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-gray-700">Mon-Sat: 8AM-6PM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          {selectedCompany && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Book Drop-off</h3>
              <form onSubmit={handleBookDropoffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Drop-off Date</label>
                    <DatePicker
                      selected={dropoffDate}
                      onChange={(date) => setDropoffDate(date)}
                      minDate={new Date()}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholderText="Select date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
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
                  {submitLoading ? 'Booking...' : 'Book Drop-off'}
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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Drop-off Booked Successfully!</h2>
        <p className="text-gray-600 mb-6">Your recycling drop-off has been scheduled.</p>

        {bookingDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recycling Center:</span>
                <span className="font-medium">{bookingDetails.companyDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingDetails.dropoffDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingDetails.timeSlot}</span>
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

        <div className="space-y-3">
          <button
            onClick={() => {
              setStep(0);
              setBookingDetails(null);
              setSubmitSuccess(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Book Another Drop-off
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