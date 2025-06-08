import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (without layout) */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes (with layout) */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Default route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;