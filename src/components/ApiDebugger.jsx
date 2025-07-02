import React, { useState } from 'react';
import api from '../services/api';

export default function ApiDebugger() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const newResults = {};

    try {
      // Test 1: Basic API connection
      console.log('🔍 Testing basic API connection...');
      const basicTest = await api.get('/test');
      newResults.basic = { success: true, data: basicTest.data };
      console.log('✅ Basic API test passed:', basicTest.data);
    } catch (error) {
      newResults.basic = { success: false, error: error.message };
      console.error('❌ Basic API test failed:', error);
    }

    try {
      // Test 2: Waste collection routes
      console.log('🔍 Testing waste collection routes...');
      const wasteTest = await api.get('/waste-collections/test');
      newResults.wasteRoutes = { success: true, data: wasteTest.data };
      console.log('✅ Waste collection routes test passed:', wasteTest.data);
    } catch (error) {
      newResults.wasteRoutes = { success: false, error: error.message };
      console.error('❌ Waste collection routes test failed:', error);
    }

    try {
      // Test 3: Database debug
      console.log('🔍 Testing database debug endpoint...');
      const dbTest = await api.get('/waste-collections/debug');
      newResults.database = { success: true, data: dbTest.data };
      console.log('✅ Database debug test passed:', dbTest.data);
    } catch (error) {
      newResults.database = { success: false, error: error.message };
      console.error('❌ Database debug test failed:', error);
    }

    try {
      // Test 4: Authentication test
      console.log('🔍 Testing authentication...');
      const authTest = await api.get('/waste-collections/test-auth');
      newResults.auth = { success: true, data: authTest.data };
      console.log('✅ Authentication test passed:', authTest.data);
    } catch (error) {
      newResults.auth = { success: false, error: error.message };
      console.error('❌ Authentication test failed:', error);
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">API Debugger</h3>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Endpoints'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-4 space-y-4">
          {Object.entries(results).map(([test, result]) => (
            <div key={test} className="border rounded p-3">
              <h4 className="font-medium capitalize">{test} Test</h4>
              {result.success ? (
                <div className="text-green-600 text-sm">
                  ✅ Success: {JSON.stringify(result.data, null, 2)}
                </div>
              ) : (
                <div className="text-red-600 text-sm">
                  ❌ Failed: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 