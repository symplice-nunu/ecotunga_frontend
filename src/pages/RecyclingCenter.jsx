import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPinIcon, PhoneIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const RecyclingCenter = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState({
    district: '',
    sector: '',
    cell: '',
    village: '',
    street: ''
  });

  // Mock data for recycling centers
  const recyclingCenters = [
    {
      id: 1,
      name: 'Green Earth Recycling',
      address: '123 Eco Street, Kigali',
      phone: '+250 788 123 456',
      hours: 'Mon-Sat: 8AM-6PM',
      materials: ['Plastic', 'Paper', 'Glass', 'Metal'],
    },
    {
      id: 2,
      name: 'Eco Solutions Center',
      address: '456 Green Avenue, Kigali',
      phone: '+250 789 987 654',
      hours: 'Mon-Fri: 7AM-5PM',
      materials: ['Plastic', 'Paper', 'Electronics'],
    },
  ];

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredCenters = recyclingCenters.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8 px-4">
      {/* Header with slogan */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700 mb-2">Don't trash it, recycle it!</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to recycle?</h2>
        <p className="text-gray-600 mb-6">Share your location to find recycling centers near you.</p>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Location form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">District</label>
            <select 
              name="district"
              value={location.district}
              onChange={handleLocationChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select ▼</option>
              <option value="Kigali">Kigali</option>
              <option value="Northern">Northern</option>
              <option value="Southern">Southern</option>
              <option value="Eastern">Eastern</option>
              <option value="Western">Western</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Sector</label>
            <select 
              name="sector"
              value={location.sector}
              onChange={handleLocationChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select ▼</option>
              <option value="Nyarugenge">Nyarugenge</option>
              <option value="Gasabo">Gasabo</option>
              <option value="Kicukiro">Kicukiro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Cell</label>
            <select 
              name="cell"
              value={location.cell}
              onChange={handleLocationChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select ▼</option>
              <option value="Gikondo">Gikondo</option>
              <option value="Kimihurura">Kimihurura</option>
              <option value="Remera">Remera</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Village</label>
            <select 
              name="village"
              value={location.village}
              onChange={handleLocationChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select ▼</option>
              <option value="Kiyovu">Kiyovu</option>
              <option value="Gishushu">Gishushu</option>
              <option value="Nyamirambo">Nyamirambo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Street <span className="text-gray-500 font-normal">(Optional)</span></label>
            <input 
              type="text" 
              name="street"
              value={location.street}
              onChange={handleLocationChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
        >
          Submit
        </button>

        {/* Search input (hidden by default, can be toggled if needed) */}
        <div className="mt-6 hidden">
          <input
            type="text"
            placeholder={t('Search recycling centers...')}
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-700 text-base"
          />
        </div>

        {/* Results */}
        {filteredCenters.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6">
            {filteredCenters.map((center) => (
              <div key={center.id} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-3 text-green-700">{center.name}</h3>
                  <div className="flex items-center mb-2">
                    <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-gray-700 text-sm">{center.address}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <PhoneIcon className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-gray-700 text-sm">{center.phone}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-gray-700 text-sm">{center.hours}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <ArrowPathIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700 text-sm font-medium">{t('Accepted Materials')}:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {center.materials.map((material, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecyclingCenter;