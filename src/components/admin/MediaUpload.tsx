import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, FileText, Video, Music, Image as ImageIcon, Trash2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { MediaItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: MediaItem | null;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem = null,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'books' as 'books' | 'videos' | 'music',
    ageGroup: '3-5',
    tags: '',
    mediaURL: '',
    thumbnailURL: '',
    duration: 0,
    isFeatured: false,
  });
  const [uploadType, setUploadType] = useState<'file' | 'url'>('url');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when editing
  React.useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        description: editingItem.description,
        category: editingItem.category,
        ageGroup: editingItem.ageGroup,
        tags: editingItem.tags.join(', '),
        mediaURL: editingItem.mediaURL,
        thumbnailURL: editingItem.thumbnailURL,
        duration: editingItem.duration || 0,
        isFeatured: editingItem.isFeatured,
      });
      setUploadType('url'); // Default to URL when editing
    } else {
      // Reset form for new upload
      setFormData({
        title: '',
        description: '',
        category: 'books',
        ageGroup: '3-5',
        tags: '',
        mediaURL: '',
        thumbnailURL: '',
        duration: 0,
        isFeatured: false,
      });
    }
  }, [editingItem]);

  const handleFileUpload = async (file: File, path: string, onProgress?: (progress: number) => void): Promise<string> => {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      
      // Use uploadBytesResumable for proper progress tracking
      const { uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Calculate progress percentage
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(Math.round(progress));
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error('Failed to upload file. Please check your internet connection and try again.'));
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(new Error('Failed to get download URL'));
            }
          }
        );
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file. Please check your internet connection and try again.');
    }
  };

  const handleFileUploadOld = async (file: File, path: string, onProgress?: (progress: number) => void): Promise<string> => {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      
      // Fallback method using uploadBytes
      if (onProgress) {
        onProgress(50);
      }
      
      const snapshot = await uploadBytes(storageRef, file);
      
      if (onProgress) {
        onProgress(100);
      }
      
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file. Please check your internet connection and try again.');
    }
  };

  const handleFileSelect = (selectedFile: File | null, type: 'main' | 'thumbnail') => {
    if (!selectedFile) {
      if (type === 'main') {
        setFile(null);
        setFilePreview(null);
      } else {
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }
      return;
    }

    // Validate file size (max 50MB for main files, 5MB for thumbnails)
    const maxSize = type === 'main' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File size too large. Maximum ${type === 'main' ? '50MB' : '5MB'} allowed.`);
      return;
    }

    if (type === 'main') {
      setFile(selectedFile);
      
      // Create preview for images and videos
      if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
    } else {
      setThumbnailFile(selectedFile);
      
      // Create preview for thumbnail (should be image)
      if (selectedFile.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setThumbnailPreview(previewUrl);
      }
    }

    setError(''); // Clear any previous errors
  };

  const removeFile = (type: 'main' | 'thumbnail') => {
    if (type === 'main') {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      setFile(null);
      setFilePreview(null);
    } else {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }
  };

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setError('Description is required');
        setLoading(false);
        return;
      }

      // Validate media source
      if (uploadType === 'file' && !file) {
        setError('Please select a file to upload');
        setLoading(false);
        return;
      }

      if (uploadType === 'url' && !formData.mediaURL.trim()) {
        setError('Please enter a media URL');
        setLoading(false);
        return;
      }

      let mediaURL = formData.mediaURL;
      let thumbnailURL = formData.thumbnailURL;

      // Upload files if provided
      if (uploadType === 'file' && file) {
        try {
          showToast('Uploading file...', 'info');
          setUploadProgress(0);
          mediaURL = await handleFileUpload(
            file, 
            `media/${formData.category}`,
            (progress) => setUploadProgress(progress)
          );
          setUploadProgress(100);
          showToast('File uploaded successfully!', 'success');
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setError(uploadError.message || 'Failed to upload file. Please try again.');
          setUploadProgress(0);
          setLoading(false);
          return;
        }
      }

      if (thumbnailFile) {
        try {
          showToast('Uploading thumbnail...', 'info');
          thumbnailURL = await handleFileUpload(thumbnailFile, 'thumbnails');
        } catch (uploadError) {
          console.error('Thumbnail upload error:', uploadError);
          setError(uploadError.message || 'Failed to upload thumbnail. Please try again.');
          setUploadProgress(0);
          setLoading(false);
          return;
        }
      }

      // Create media item
      const mediaItemData: Omit<MediaItem, 'id'> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ageGroup: formData.ageGroup,
        thumbnailURL: thumbnailURL || getDefaultThumbnail(formData.category),
        mediaURL,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isFeatured: formData.isFeatured,
        language: 'en',
        author: '',
        publisher: '',
        rating: 0,
        viewCount: 0,
        difficulty: 'easy',
        educationalValue: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add duration only if it's not undefined and not for books
      if (formData.category !== 'books' && formData.duration > 0) {
        mediaItemData.duration = formData.duration;
      }

      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, 'mediaItems', editingItem.id), {
          ...mediaItemData,
          updatedAt: new Date(),
        });
        showToast('Media content updated successfully!', 'success');
      } else {
        // Create new item
        await addDoc(collection(db, 'mediaItems'), mediaItemData);
        showToast('Media content uploaded successfully!', 'success');
      }

      // Reset form
      removeFile('main');
      removeFile('thumbnail');
      setFormData({
        title: '',
        description: '',
        category: 'books',
        ageGroup: '3-5',
        tags: '',
        mediaURL: '',
        thumbnailURL: '',
        duration: 0,
        isFeatured: false,
      });
      setUploadProgress(0);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Media upload error:', err);
      setError(err.message || 'Failed to upload media. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultThumbnail = (category: string) => {
    const defaults = {
      books: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      videos: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
      music: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg',
    };
    return defaults[category as keyof typeof defaults];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'books': return FileText;
      case 'videos': return Video;
      case 'music': return Music;
      default: return FileText;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {editingItem ? 'Edit Media Content' : 'Upload Media Content'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter content title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="books">📚 Books</option>
                <option value="videos">🎥 Videos</option>
                <option value="music">🎵 Music</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age Group *
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-8">6-8 years</option>
                <option value="9-12">9-12 years</option>
              </select>
            </div>

            {formData.category !== 'books' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Duration in seconds"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="Describe the content..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="educational, fun, interactive"
            />
          </div>

          {/* Upload Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Source
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  uploadType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                <span>URL/Link</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  uploadType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>File Upload</span>
              </button>
            </div>
          </div>

          {/* Content Upload */}
          {uploadType === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content URL *
              </label>
              <input
                type="url"
                value={formData.mediaURL}
                onChange={(e) => setFormData({ ...formData, mediaURL: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com/content"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File *
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'main')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  accept={
                    formData.category === 'books' ? '.pdf,.epub' :
                    formData.category === 'videos' ? 'video/*' :
                    'audio/*'
                  }
                  key={uploadType} // Force re-render when upload type changes
                  required
                />
                
                {/* File Preview */}
                {file && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('main')}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Preview for images and videos */}
                    {filePreview && (
                      <div className="mt-2">
                        {file.type.startsWith('image/') && (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-w-full h-32 object-cover rounded border"
                          />
                        )}
                        {file.type.startsWith('video/') && (
                          <video
                            src={filePreview}
                            className="max-w-full h-32 object-cover rounded border"
                            controls
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Upload Progress */}
                    {loading && uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: {
                  formData.category === 'books' ? 'PDF, EPUB' :
                  formData.category === 'videos' ? 'MP4, AVI, MOV' :
                  'MP3, WAV, AAC'
                }
              </p>
            </div>
          )}

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thumbnail (optional)
            </label>
            <div className="space-y-4">
              <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'thumbnail')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                accept="image/*"
                key={`thumbnail-${uploadType}`} // Force re-render when upload type changes
              />
              
              {/* Thumbnail Preview */}
              {thumbnailFile && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{thumbnailFile.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(thumbnailFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('thumbnail')}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {thumbnailPreview && (
                    <div className="mt-2">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="max-w-full h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supported formats: JPG, PNG, GIF. If not provided, a default thumbnail will be used.
            </p>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mark as featured content
            </label>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (editingItem ? 'Updating...' : 'Uploading...') : (editingItem ? 'Update Content' : 'Upload Content')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};