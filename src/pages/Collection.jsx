import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function Collection() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: '',
    ubudehe: '',
  });
  const [location, setLocation] = useState({
    district: '',
    sector: '',
    cell: '',
    village: '',
    street: '',
  });
  const [errors, setErrors] = useState({});

  // Dummy options for selects
  const genderOptions = ['Male', 'Female', 'Other'];
  const districtOptions = ['Gasabo', 'Kicukiro', 'Nyarugenge'];
  const sectorOptions = ['Remera', 'Kimironko', 'Kacyiru'];
  const cellOptions = ['Cell 1', 'Cell 2', 'Cell 3'];
  const villageOptions = ['Village 1', 'Village 2', 'Village 3'];

  // Step 3: Book Pickup (Updated UI)
  const [pickupDate, setPickupDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const pickupDates = ['2024-06-10', '2024-06-11', '2024-06-12']; // Example dates
  const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00'];

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

  // Step 1: Personal Information
  const PersonalInfoForm = () => (
    <form
      className="bg-white rounded-xl shadow-xl border-2 p-8 max-w-4xl mx-auto mt-6"
      onSubmit={e => {
        e.preventDefault();
        // Validate
        const newErrors = {};
        if (!personalInfo.firstName) newErrors.firstName = 'Required';
        if (!personalInfo.lastName) newErrors.lastName = 'Required';
        if (!personalInfo.gender) newErrors.gender = 'Required';
        if (!personalInfo.email) newErrors.email = 'Required';
        if (!personalInfo.phone) newErrors.phone = 'Required';
        if (!personalInfo.ubudehe) newErrors.ubudehe = 'Required';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) setStep(1);
      }}
    >
      <div className="flex items-center mb-6">
        <span role="img" aria-label="waste">
            <img src={person} alt="waste" className="w-[35px] h-[30px]" />
          </span> 
        <h3 className="text-xl font-bold mt-1">Personal Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">First Name<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your first name"
            value={personalInfo.firstName}
            onChange={e => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
          />
          {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Last Name<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your last name"
            value={personalInfo.lastName}
            onChange={e => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
          />
          {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Gender<span className="text-red-500">*</span></label>
          <select
            className="w-full border rounded px-3 py-2 mb-1"
            value={personalInfo.gender}
            onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
          >
            <option value="">Select</option>
            {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {errors.gender && <span className="text-xs text-red-500">{errors.gender}</span>}
        </div>
        <div>
          <label className="block font-medium mb-1">Phone Number<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2 mb-1"
            placeholder="Enter your phone number"
            value={personalInfo.phone}
            onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
          />
          {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
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
            value={personalInfo.ubudehe}
            onChange={e => setPersonalInfo({ ...personalInfo, ubudehe: e.target.value })}
          />
          {errors.ubudehe && <span className="text-xs text-red-500">{errors.ubudehe}</span>}
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
      </div>
      <div className="space-y-6">
  {/* District */}
  <div className="relative">
    <div className="relative border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700">
        District
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.district}
        onChange={e => setLocation({ ...location, district: e.target.value })}
      >
        <option value="">Select</option>
        {districtOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700">
        Sector
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.sector}
        onChange={e => setLocation({ ...location, sector: e.target.value })}
      >
        <option value="">Select</option>
        {sectorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-gray-700">
        Cell
      </label>
      <select
        className="block w-full shadow-lg px-3 py-2 pr-8 bg-transparent appearance-none focus:outline-none text-gray-700"
        value={location.cell}
        onChange={e => setLocation({ ...location, cell: e.target.value })}
      >
        <option value="">Select</option>
        {cellOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
    <label className="block font-medium mb-1">Street <span className="text-gray-400">(Optional)</span></label>
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

  // Step 3: Book Pickup (Updated UI)
  const BookPickup = () => (
    <form
      className="bg-white rounded-xl shadow max-w-4xl mx-auto mt-6 flex flex-col items-center p-8"
      onSubmit={e => {
        e.preventDefault();
        // Optionally validate here
        setStep(3);
      }}
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
            A Rwandan waste management company established in 1999, specializing in the collection, transportation, treatment, and disposal of waste. It serves a broad range of clients, including homes, businesses, government and non-government organizations, industries, and medical facilities. <a href="#" className="text-blue-600 underline">Read More</a>
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
      <div className="w-full flex flex-col md:flex-row gap-8 my-8">
        {/* Pickup Date */}
        <div className="flex-1">
          <label className="block font-semibold mb-2">Select Pickup Date</label>
          <div className="relative">
            <select
              className="w-full border rounded px-3 py-2 mb-1"
              value={pickupDate}
              onChange={e => setPickupDate(e.target.value)}
              required
            >
              <option value="">Select</option>
              {pickupDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
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
      <button
        type="submit"
        className="mt-4 flex justify-center w-[420px] bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
      >
        Book Now
      </button>
    </form>
  );

  // Step 4: Payment Process (placeholder)
  const PaymentProcess = () => (
    <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4">Payment Process</h3>
      <p className="mb-8">Payment integration coming soon.</p>
      <button
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
        onClick={() => setStep(5)}
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