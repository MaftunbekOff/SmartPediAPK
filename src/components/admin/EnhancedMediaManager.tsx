import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star, 
  Play, 
  Book, 
  Music, 
  Video,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  where,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MediaItem } from '../../types';
import { MediaUpload } from './MediaUpload';

export const EnhancedMediaManager: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'books' | 'videos' | 'music'>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter items in memory
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesAgeGroup = ageGroupFilter === 'all' || item.ageGroup === ageGroupFilter;
    const matchesFeatured = featuredFilter === 'all' || 
      (featuredFilter === 'featured' && item.isFeatured) ||
      (featuredFilter === 'regular' && !item.isFeatured);
    
    return matchesSearch && matchesCategory && matchesAgeGroup && matchesFeatured;
  });

  useEffect(() => {
    const loadMediaItems = async () => {
      try {
        // Split the query to avoid composite index requirement
        const q = query(
          collection(db, 'mediaItems'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const allItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as MediaItem[];

        setMediaItems(allItems);
        setLoading(false);
      } catch (error) {
        console.error('Error loading media items:', error);
        setLoading(false);
      }
    };

    loadMediaItems();

    // Set up real-time listener for updates
    const q = query(collection(db, 'mediaItems'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as MediaItem[];
        
        setMediaItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading media items:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleFeatured = async (item: MediaItem) => {
    try {
      await updateDoc(doc(db, 'mediaItems', item.id), {
        isFeatured: !item.isFeatured,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await deleteDoc(doc(db, 'mediaItems', itemId));
      } catch (error) {
        console.error('Error deleting media item:', error);
      }
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'books': return Book;
      case 'videos': return Video;
      case 'music': return Music;
      default: return Play;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'books': return 'blue';
      case 'videos': return 'red';
      case 'music': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Media Library Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredItems.length} of {mediaItems.length} items
          </p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Media</span>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="books">📚 Books</option>
              <option value="videos">🎥 Videos</option>
              <option value="music">🎵 Music</option>
            </select>

            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Ages</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-8">6-8 years</option>
              <option value="9-12">9-12 years</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Items</option>
              <option value="featured">⭐ Featured Only</option>
              <option value="regular">Regular Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const color = getCategoryColor(item.category);
          
          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative">
                <img
                  src={item.thumbnailURL}
                  alt={item.title}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.ageGroup}
                  </span>
                </div>
                {item.isFeatured && (
                  <div className="absolute bottom-2 left-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                {/* File Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-1">
                  {item.mediaURL.includes('firebasestorage.googleapis.com') && (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Stored in Firebase</span>
                    </div>
                  )}
                  {item.mediaURL.startsWith('http') && !item.mediaURL.includes('firebasestorage.googleapis.com') && (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>External URL</span>
                    </div>
                  )}
                </div>
                
                {item.duration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Duration: {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        item.isFeatured
                          ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                      }`}
                      title={item.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className={`h-4 w-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => window.open(item.mediaURL, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                      title="Preview content"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No media items found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter !== 'all' || ageGroupFilter !== 'all' || featuredFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first media item'
            }
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Add Media Item
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <MediaUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        editingItem={null}
        onSuccess={() => {
          // Items will update automatically via real-time listener
        }}
      />

      {/* Edit Modal */}
      <MediaUpload
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSuccess={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
      />
    </div>
  );
};