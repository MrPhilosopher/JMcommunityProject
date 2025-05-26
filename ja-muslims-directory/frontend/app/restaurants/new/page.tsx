'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { RestaurantFormData, CUISINE_TYPES, PARISHES } from '@/types/restaurant';
import { Business } from '@/types/business';
import { BusinessCategory } from '@/types/business';
import { formatPhoneNumber, validateJamaicanPhoneNumber, cleanPhoneNumber } from '@/lib/phoneUtils';

const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  parish: z.string().min(1, 'Parish is required'),
  phone: z.string()
    .optional()
    .refine((val) => !val || validateJamaicanPhoneNumber(val), {
      message: 'Invalid phone number. Use format: 876-XXX-XXXX or XXX-XXXX',
    }),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_halal_certified: z.boolean(),
  has_halal_options: z.boolean(),
  has_vegetarian_options: z.boolean(),
  has_vegan_options: z.boolean(),
  cuisine_types: z.string().optional(),
  opening_hours: z.string().optional(),
  description: z.string().optional(),
  business_id: z.number().optional(),
});

export default function NewRestaurantPage() {
  const router = useRouter();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [menuFiles, setMenuFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      is_halal_certified: false,
      has_halal_options: false,
      has_vegetarian_options: false,
      has_vegan_options: false,
    },
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      // Filter only restaurant businesses
      const restaurantBusinesses = response.data.filter(
        (b: Business) => b.category === BusinessCategory.RESTAURANT
      );
      setBusinesses(restaurantBusinesses);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  };

  const filteredBusinesses = businesses.filter(
    (business) =>
      businessSearch === '' ||
      business.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
      `${business.owner.first_name} ${business.owner.last_name}`
        .toLowerCase()
        .includes(businessSearch.toLowerCase())
  );

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    setValue('business_id', business.id);
    setBusinessSearch(business.name);
    setShowBusinessDropdown(false);
  };

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines((prev) => {
      const newCuisines = prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine];
      setValue('cuisine_types', newCuisines.join(', '));
      return newCuisines;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMenuFiles(Array.from(e.target.files));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanPhoneNumber(value);
    
    // Only allow digits
    if (value !== '' && value !== cleaned) {
      e.target.value = cleaned;
    }
  };

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      // Clean phone number before submission
      const submitData = {
        ...data,
        phone: data.phone ? cleanPhoneNumber(data.phone) : undefined,
      };
      
      // Create restaurant
      const response = await api.post('/restaurants', submitData);
      const restaurantId = response.data.id;

      // Upload menu files if any
      for (const file of menuFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          await api.post(`/restaurants/${restaurantId}/menu`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (error) {
          console.error('Failed to upload menu file:', error);
        }
      }

      router.push('/restaurants');
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      alert('Failed to create restaurant. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Add New Restaurant</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Link to Muslim-Owned Business (Optional)
              </label>
              <input
                type="text"
                value={businessSearch}
                onChange={(e) => {
                  setBusinessSearch(e.target.value);
                  setShowBusinessDropdown(true);
                }}
                onFocus={() => setShowBusinessDropdown(true)}
                placeholder="Search for business..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {showBusinessDropdown && filteredBusinesses.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                  {filteredBusinesses.map((business) => (
                    <button
                      key={business.id}
                      type="button"
                      onClick={() => handleBusinessSelect(business)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="font-medium">{business.name}</div>
                      <div className="text-xs text-gray-500">
                        Owner: {business.owner.first_name} {business.owner.last_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              type="text"
              {...register('address')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Parish *
              </label>
              <select
                {...register('parish')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Parish</option>
                {PARISHES.map((parish) => (
                  <option key={parish} value={parish}>
                    {parish}
                  </option>
                ))}
              </select>
              {errors.parish && (
                <p className="mt-1 text-sm text-red-600">{errors.parish.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                {...register('phone')}
                onChange={(e) => {
                  handlePhoneChange(e);
                  register('phone').onChange(e);
                }}
                placeholder="876XXXXXXX or XXXXXXX"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              {...register('website')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_halal_certified')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Halal Certified</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('has_halal_options')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Halal Options</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('has_vegetarian_options')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Vegetarian Options</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('has_vegan_options')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Vegan Options</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Types
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {CUISINE_TYPES.map((cuisine) => (
                <label key={cuisine.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCuisines.includes(cuisine.value)}
                    onChange={() => handleCuisineToggle(cuisine.value)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cuisine.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Opening Hours
            </label>
            <textarea
              {...register('opening_hours')}
              rows={3}
              placeholder="Monday - Friday: 9:00 AM - 10:00 PM&#10;Saturday: 10:00 AM - 11:00 PM&#10;Sunday: Closed"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Menu Files (PDF or Images)
            </label>
            <input
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {menuFiles.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {menuFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/restaurants')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}