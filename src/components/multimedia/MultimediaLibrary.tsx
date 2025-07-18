import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Search, Filter, Heart, Play, Book, Music, Video, Star } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MediaItem } from '../../types';

export const MultimediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');

  useEffect(() => {
    const q = query(
      collection(db, 'mediaItems'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as MediaItem[];

      setMediaItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'books', label: 'Books', icon: Book },
    { value: 'videos', label: 'Videos', icon: Video },
    { value: 'music', label: 'Music', icon: Music },
  ];

  const ageGroups = [
    { value: 'all', label: 'All Ages' },
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-8', label: '6-8 years' },
    { value: '9-12', label: '9-12 years' },
  ];

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesAgeGroup = selectedAgeGroup === 'all' || item.ageGroup === selectedAgeGroup;
    return matchesSearch && matchesCategory && matchesAgeGroup;
  });

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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Multimedia Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Educational content for children of all ages
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books, videos, music..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    selectedCategory === cat.value 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Group
            </label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {ageGroups.map(group => (
                <option key={group.value} value={group.value}>{group.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {/* Media Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map(item => {
              const Icon = getCategoryIcon(item.category);
              const color = getCategoryColor(item.category);
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img 
                      src={item.thumbnailURL} 
                      alt={item.title} 
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 shadow-sm`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm">
                        {item.ageGroup}
                      </span>
                    </div>
                    {item.isFeatured && (
                      <div className="absolute bottom-3 left-3">
                        <Star className="h-5 w-5 text-yellow-400 fill-current drop-shadow-sm" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {item.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                        <span className="mr-1">⏱️</span>
                        Duration: {formatDuration(item.duration)}
                      </p>
                    )}
                    
                    <div className="flex gap-1 flex-wrap mb-3">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{item.tags.length - 2} more
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => window.open(item.mediaURL, '_blank')}
                      className={`w-full py-3 text-sm font-medium text-white bg-${color}-600 hover:bg-${color}-700 rounded-lg flex justify-center items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md`}
                    >
                      <Play className="w-4 h-4" />
                      {item.category === 'books' ? 'Read Now' : item.category === 'videos' ? 'Watch Now' : 'Listen Now'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No content found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedCategory !== 'all' || selectedAgeGroup !== 'all'
                ? 'Try adjusting your search or filters to find more content.'
                : 'Educational content will appear here once added by administrators.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultimediaLibrary;
