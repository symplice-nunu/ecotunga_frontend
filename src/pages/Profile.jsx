import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/profile')
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-500">
      <div className="bg-red-500 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
        {profile ? (
          <div>
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <button onClick={() => navigate('/home')} className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Back to Home</button>
          </div>
        ) : <p>Loading...</p>}
      </div>
    </div>
  );
}
