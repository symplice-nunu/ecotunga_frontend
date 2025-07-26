import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Play, FileText, Download, Eye, Clock, Star, Bookmark, Users, Calendar, RefreshCcw, Leaf, Monitor, Package, Droplets, Box, Plus, Edit, Trash2, X, Save, User, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { educationMaterialApi } from '../services/educationMaterialApi';
import EducationMaterialForm from '../components/EducationMaterialForm';
import DeleteConfirmation from '../components/DeleteConfirmation';

export default function EducationMaterials() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState(new Set());
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'waste-management',
    level: 'beginner',
    type: 'article',
    duration: '',
    author: '',
    image_url: '',
    content_url: '',
    youtube_url: '',
    featured: false,
    tags: []
  });

  const categories = [
    { id: 'all', label: 'All Categories', icon: BookOpen },
    { id: 'waste-management', label: 'Waste Management', icon: FileText },
    { id: 'recycling', label: 'Recycling', icon: RefreshCcw },
    { id: 'composting', label: 'Composting', icon: Leaf },
    { id: 'lifestyle', label: 'Lifestyle', icon: Users },
    { id: 'e-waste', label: 'E-Waste', icon: Monitor },
    { id: 'packaging', label: 'Packaging', icon: Package },
    { id: 'conservation', label: 'Conservation', icon: Droplets },
    { id: 'materials', label: 'Materials', icon: Box }
  ];

  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const types = [
    { id: 'article', name: 'Article' },
    { id: 'video', name: 'Video' },
    { id: 'guide', name: 'Guide' }
  ];

  useEffect(() => {
    fetchMaterials();
    if (user) {
      fetchUserBookmarks();
    }
  }, [selectedCategory, selectedLevel, searchTerm, user]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (selectedLevel !== 'all') {
        filters.level = selectedLevel;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await educationMaterialApi.getAllMaterials(filters);
      setMaterials(response);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookmarks = async () => {
    try {
      if (!user) return; // Don't fetch bookmarks if user is not logged in
      const bookmarks = await educationMaterialApi.getUserBookmarks();
      const bookmarkedIds = new Set(bookmarks.map(material => material.id));
      setBookmarkedMaterials(bookmarkedIds);
    } catch (err) {
      console.error('Error fetching user bookmarks:', err);
      // Don't show error for bookmarks, just silently fail
    }
  };

  const handleBookmark = async (materialId) => {
    try {
      if (!user) {
        setError('Please log in to bookmark materials');
        return;
      }
      
      if (bookmarkedMaterials.has(materialId)) {
        await educationMaterialApi.removeBookmark(materialId);
        setBookmarkedMaterials(prev => {
          const newSet = new Set(prev);
          newSet.delete(materialId);
          return newSet;
        });
      } else {
        await educationMaterialApi.bookmarkMaterial(materialId);
        setBookmarkedMaterials(prev => {
          const newSet = new Set(prev);
          newSet.add(materialId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error bookmarking material:', err);
      setError('Failed to bookmark material');
    }
  };

  // Create new material
  const handleCreate = async (formData) => {
    try {
      const newMaterial = await educationMaterialApi.createMaterial(formData);
      setMaterials(prev => [newMaterial, ...prev]);
      setShowCreateModal(false);
      setError('');
      setSuccessMessage('Material created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating material:', err);
      setError('Failed to create material');
    }
  };

  // Edit material
  const handleEdit = async (formData) => {
    try {
      const updatedMaterial = await educationMaterialApi.updateMaterial(selectedMaterial.id, formData);
      setMaterials(prev => prev.map(m => m.id === selectedMaterial.id ? updatedMaterial : m));
      setShowEditModal(false);
      setSelectedMaterial(null);
      setError('');
      setSuccessMessage('Material updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating material:', err);
      setError('Failed to update material');
    }
  };

  // Delete material
  const handleDelete = async () => {
    try {
      await educationMaterialApi.deleteMaterial(selectedMaterial.id);
      setMaterials(prev => prev.filter(m => m.id !== selectedMaterial.id));
      setShowDeleteModal(false);
      setSelectedMaterial(null);
      setError('');
      setSuccessMessage('Material deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Failed to delete material');
    }
  };

  const openEditModal = (material) => {
    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  const openDeleteModal = (material) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (material) => {
    setSelectedMaterial(material);
    setShowDetailsModal(true);
    setVideoLoading(true);
    
    // Increment view count
    if (material.views !== undefined) {
      setMaterials(prev => prev.map(m => 
        m.id === material.id 
          ? { ...m, views: (m.views || 0) + 1 }
          : m
      ));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'waste-management',
      level: 'beginner',
      type: 'article',
      duration: '',
      author: '',
      image_url: '',
      content_url: '',
      youtube_url: '',
      featured: false,
      tags: []
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'waste-management': return 'bg-blue-100 text-blue-800';
      case 'recycling': return 'bg-green-100 text-green-800';
      case 'composting': return 'bg-emerald-100 text-emerald-800';
      case 'lifestyle': return 'bg-purple-100 text-purple-800';
      case 'e-waste': return 'bg-orange-100 text-orange-800';
      case 'packaging': return 'bg-pink-100 text-pink-800';
      case 'conservation': return 'bg-cyan-100 text-cyan-800';
      case 'materials': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Play;
      case 'article': return FileText;
      case 'guide': return BookOpen;
      default: return FileText;
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url; // Return original URL if no pattern matches
  };

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="px-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('educationMaterials.title')}</h1>
          <p className="text-gray-600">{t('educationMaterials.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} />
            {t('educationMaterials.createNew')}
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('educationMaterials.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-teal-50 border-teal-200 text-teal-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <category.icon size={16} />
                <span>{t(`educationMaterials.categories.${category.id}`)}</span>
              </button>
            ))}
          </div>

          {/* Level Filters */}
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  selectedLevel === level.id
                    ? 'bg-teal-50 border-teal-200 text-teal-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(`educationMaterials.levels.${level.id}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 text-center font-medium shadow-sm flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-900 font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Featured Materials */}
      {materials.filter(m => m.featured).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            {t('educationMaterials.featuredMaterials')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {materials
              .filter(material => material.featured)
              .map((material) => {
                const TypeIcon = getTypeIcon(material.type);
                return (
                  <div key={material.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="relative">
                      <img
                        src={material.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop'}
                        alt={material.title}
                        className="w-full h-48 object-cover"
                      />
                      {material.youtube_url && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <Play size={24} className="text-white fill-current" />
                          </div>
                        </div>
                      )}
                      {material.featured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => openEditModal(material)}
                              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(material)}
                              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleBookmark(material.id)}
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        >
                          <Bookmark 
                            size={16} 
                            className={bookmarkedMaterials.has(material.id) ? "text-teal-600 fill-current" : "text-gray-600"} 
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{material.title}</h3>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{material.rating || 0}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{material.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
                          {t(`educationMaterials.categories.${material.category}`)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(material.level)}`}>
                          {t(`educationMaterials.levels.${material.level}`)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <TypeIcon size={16} />
                            <span>{t(`educationMaterials.types.${material.type}`)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{material.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          <span>{material.author}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye size={16} />
                          <span>{material.views || 0} views</span>
                        </div>
                        <div className="flex gap-2">
                          {material.content_url && (
                            <a 
                              href={material.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <ExternalLink size={16} />
                              Read More
                            </a>
                          )}
                          <button 
                            onClick={() => openDetailsModal(material)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                          >
                            Watch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* All Materials */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('educationMaterials.allMaterials')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials
            .filter(material => !material.featured)
            .map((material) => {
              const TypeIcon = getTypeIcon(material.type);
              return (
                <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={material.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop'}
                      alt={material.title}
                      className="w-full h-40 object-cover"
                    />
                    {material.youtube_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <Play size={20} className="text-white fill-current" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => openEditModal(material)}
                            className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Edit size={14} className="text-blue-600" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(material)}
                            className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleBookmark(material.id)}
                        className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <Bookmark 
                          size={14} 
                          className={bookmarkedMaterials.has(material.id) ? "text-teal-600 fill-current" : "text-gray-600"} 
                        />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{material.title}</h3>
                      <div className="flex items-center gap-1 ml-2">
                        <Star size={14} className="text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{material.rating || 0}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
                        {t(`educationMaterials.categories.${material.category}`)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(material.level)}`}>
                        {t(`educationMaterials.levels.${material.level}`)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <TypeIcon size={14} />
                        <span>{t(`educationMaterials.types.${material.type}`)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{material.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Eye size={16} />
                        <span>{material.views || 0} views</span>
                      </div>
                      <div className="flex gap-2">
                        {material.content_url && (
                          <a 
                            href={material.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink size={16} />
                            Read More
                          </a>
                        )}
                        <button 
                          onClick={() => openDetailsModal(material)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Watch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Create Material Modal */}
      <EducationMaterialForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Edit Material Modal */}
      <EducationMaterialForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEdit}
        material={selectedMaterial}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Material"
        message="Are you sure you want to delete this material? This action cannot be undone."
        itemName={selectedMaterial?.title}
      />

      {/* Material Details Modal */}
      {showDetailsModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedMaterial.title}</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Video Section */}
              {selectedMaterial.youtube_url && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Play className="text-red-500" size={20} />
                    Video Content
                  </h3>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    {videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                      </div>
                    )}
                    <iframe
                      src={getYouTubeEmbedUrl(selectedMaterial.youtube_url)}
                      title={selectedMaterial.title}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setVideoLoading(false)}
                      onError={() => setVideoLoading(false)}
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Image Section (if no video but has image) */}
              {!selectedMaterial.youtube_url && selectedMaterial.image_url && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="text-teal-500" size={20} />
                    Material Preview
                  </h3>
                  <img
                    src={selectedMaterial.image_url}
                    alt={selectedMaterial.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Material Details */}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 