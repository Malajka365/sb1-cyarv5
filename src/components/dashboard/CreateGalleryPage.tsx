import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus,
  Video,
  Music,
  Image,
  BookOpen,
  Code,
  Gamepad2,
  Palette,
  Camera,
  Film,
  Microscope,
  Globe,
  Heart,
  Trophy,
  Dumbbell,
  Lightbulb
} from 'lucide-react';
import { createGallery } from '../../lib/gallery-service';

const GALLERY_ICONS = [
  { icon: Video, name: 'Video', value: 'video' },
  { icon: Music, name: 'Music', value: 'music' },
  { icon: Image, name: 'Image', value: 'image' },
  { icon: BookOpen, name: 'Education', value: 'education' },
  { icon: Code, name: 'Programming', value: 'programming' },
  { icon: Gamepad2, name: 'Gaming', value: 'gaming' },
  { icon: Palette, name: 'Art', value: 'art' },
  { icon: Camera, name: 'Photography', value: 'photography' },
  { icon: Film, name: 'Movies', value: 'movies' },
  { icon: Microscope, name: 'Science', value: 'science' },
  { icon: Globe, name: 'Travel', value: 'travel' },
  { icon: Heart, name: 'Health', value: 'health' },
  { icon: Trophy, name: 'Sports', value: 'sports' },
  { icon: Dumbbell, name: 'Fitness', value: 'fitness' },
  { icon: Lightbulb, name: 'Ideas', value: 'ideas' },
];

const CreateGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    icon: GALLERY_ICONS[0].value
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (formData.name.length < 3) {
      setError('Gallery name must be at least 3 characters long');
      return false;
    }
    if (formData.category.length < 3) {
      setError('Category must be at least 3 characters long');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.category)) {
      setError('Category can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await createGallery(
        formData.name,
        formData.description,
        formData.category.toLowerCase(),
        formData.isPublic,
        formData.icon
      );
      navigate('/dashboard/galleries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Gallery</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Gallery Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={3}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category ID
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                placeholder="e.g., handball, physical"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={3}
                pattern="[a-z0-9-]+"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be used in the URL: yoursite.com/category-id. Use only lowercase letters, numbers, and hyphens.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gallery Icon
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {GALLERY_ICONS.map(({ icon: Icon, name, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: value })}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      formData.icon === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${
                      formData.icon === value ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                    <span className="mt-2 text-xs text-center font-medium">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: true })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Public</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: false })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Private</span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Create Gallery
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGalleryPage;