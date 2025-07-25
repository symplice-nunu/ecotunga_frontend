import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import pricingApi from '../services/pricingApi';

export default function PricingManagement() {
  const { t } = useTranslation();
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ubudehe_category: '',
    amount: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const data = await pricingApi.getAllPricing();
      setPricing(data);
      setError('');
    } catch (err) {
      console.error('Error fetching pricing:', err);
      
      // If it's a 404 or 500 error, it might mean the table doesn't exist yet
      if (err.response?.status === 404 || err.response?.status === 500) {
        setError('Pricing table not found. Please run the database migration first.');
        // Show default pricing data for demonstration
        setPricing([
          {
            id: 1,
            ubudehe_category: 'A',
            amount: 1000,
            description: 'Category A - Lowest income bracket',
            is_active: true
          },
          {
            id: 2,
            ubudehe_category: 'B',
            amount: 1500,
            description: 'Category B - Low income bracket',
            is_active: true
          },
          {
            id: 3,
            ubudehe_category: 'C',
            amount: 2000,
            description: 'Category C - Medium income bracket',
            is_active: true
          },
          {
            id: 4,
            ubudehe_category: 'D',
            amount: 4000,
            description: 'Category D - High income bracket',
            is_active: true
          }
        ]);
      } else {
        setError('Failed to fetch pricing configurations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      ubudehe_category: item.ubudehe_category,
      amount: item.amount.toString(),
      description: item.description || '',
      is_active: item.is_active
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      ubudehe_category: '',
      amount: '',
      description: '',
      is_active: true
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // Update existing pricing
        await pricingApi.updatePricing(editingId, {
          amount: parseFloat(formData.amount),
          description: formData.description,
          is_active: formData.is_active
        });
        setSuccess('Pricing configuration updated successfully');
      } else {
        // Create new pricing
        await pricingApi.createPricing({
          ubudehe_category: formData.ubudehe_category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          is_active: formData.is_active
        });
        setSuccess('Pricing configuration created successfully');
      }
      
      setShowForm(false);
      fetchPricing();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save pricing configuration');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing configuration?')) {
      return;
    }

    try {
      await pricingApi.deletePricing(id);
      setSuccess('Pricing configuration deleted successfully');
      fetchPricing();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete pricing configuration');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      ubudehe_category: '',
      amount: '',
      description: '',
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Waste Collection Pricing Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage pricing configurations for different ubudehe categories
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={error && error.includes('Pricing table not found')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            error && error.includes('Pricing table not found')
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add New Pricing
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Demo Data Notice */}
      {error && error.includes('Pricing table not found') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-yellow-700">
            Showing demo data. To use real data, run the database migration: <code className="bg-yellow-100 px-2 py-1 rounded">npm run migrate</code>
          </span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Pricing Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Pricing Configuration' : 'Add New Pricing Configuration'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubudehe Category *
                </label>
                <input
                  type="text"
                  value={formData.ubudehe_category}
                  onChange={(e) => setFormData({...formData, ubudehe_category: e.target.value})}
                  placeholder="e.g., A, B, C, D"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={editingId !== null} // Can't edit category once created
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (RWF) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount in RWF"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description of this pricing category"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active (available for use)
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pricing List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Current Pricing Configurations
            {error && error.includes('Pricing table not found') && (
              <span className="ml-2 text-sm font-normal text-yellow-600">(Demo Mode)</span>
            )}
          </h3>
        </div>
        
        {pricing.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pricing configurations found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (RWF)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricing.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.ubudehe_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      RWF {item.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center gap-2">
                         <button
                           onClick={() => handleEdit(item)}
                           disabled={error && error.includes('Pricing table not found')}
                           className={`p-1 ${
                             error && error.includes('Pricing table not found')
                               ? 'text-gray-400 cursor-not-allowed'
                               : 'text-blue-600 hover:text-blue-900'
                           }`}
                           title={error && error.includes('Pricing table not found') ? 'Demo mode - editing disabled' : 'Edit'}
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => handleDelete(item.id)}
                           disabled={error && error.includes('Pricing table not found')}
                           className={`p-1 ${
                             error && error.includes('Pricing table not found')
                               ? 'text-gray-400 cursor-not-allowed'
                               : 'text-red-600 hover:text-red-900'
                           }`}
                           title={error && error.includes('Pricing table not found') ? 'Demo mode - deletion disabled' : 'Delete'}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 