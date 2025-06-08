// Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome to the Home Page!</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center">
        Manage your account and explore all the features from this dashboard.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/profile')}
          className="bg-gradient-to-r from-teal-500 to-green-400 hover:from-teal-600 hover:to-green-500 text-white px-8 py-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
        >
          Go to Profile
        </button>
      </div>
    </>
  );
}