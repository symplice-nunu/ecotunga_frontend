import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PersonalInfo from './pages/PersonalInfo';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Collection from './pages/Collection';
import RecyclingCenter from './pages/RecyclingCenter';
import CompanyRegistration from './components/CompanyRegistration';
import CompanyList from './components/CompanyList';
import Layout from './components/Layout';
import WasteCollections from './pages/WasteCollections';
import AdminWasteCollections from './pages/AdminWasteCollections';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/personal-info" element={<PersonalInfo />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<Users />} />
              <Route path="collection" element={<Collection />} />
              <Route path="waste-collections" element={<WasteCollections />} />
              <Route path="admin-waste-collections" element={<AdminWasteCollections />} />
              <Route path="recycling-center" element={<RecyclingCenter />} />
              <Route path="company-registration" element={<CompanyRegistration />} />
              <Route path="companies" element={<CompanyList />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;