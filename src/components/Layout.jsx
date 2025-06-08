import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}