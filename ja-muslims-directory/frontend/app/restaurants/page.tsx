'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Search, Plus, Utensils, Award, Leaf, Edit, Trash2, FileText, Image } from 'lucide-react';
import api from '@/lib/api';
import { RestaurantWithBusiness } from '@/types/restaurant';
import { formatPhoneNumber } from '@/lib/phoneUtils';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithBusiness[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithBusiness[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [halal_only, setHalalOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, halal_only, restaurants]);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
      setFilteredRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    if (searchQuery) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.parish.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (restaurant.cuisine_types && restaurant.cuisine_types.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (halal_only) {
      filtered = filtered.filter(
        (restaurant) => restaurant.is_halal_certified || restaurant.has_halal_options
      );
    }

    setFilteredRestaurants(filtered);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/restaurants/${id}`);
        fetchRestaurants();
      } catch (error) {
        console.error('Failed to delete restaurant:', error);
      }
    }
  };

  const getCuisineTypeLabel = (types: string | undefined) => {
    if (!types) return 'Not specified';
    return types.split(',').map(t => t.trim()).map(t => 
      t.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ).join(', ');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Halal Restaurants & Eateries</h1>
          <Link
            href="/restaurants/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Link>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, or cuisine type..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={halal_only}
              onChange={(e) => setHalalOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Halal Only</span>
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="rounded-lg bg-white shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                      {restaurant.business_name && (
                        <p className="text-sm text-indigo-600">Muslim-owned by {restaurant.owner_name}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {restaurant.is_halal_certified && (
                        <Award className="h-5 w-5 text-emerald-600" title="Halal Certified" />
                      )}
                      {restaurant.has_vegetarian_options && (
                        <Leaf className="h-5 w-5 text-green-600" title="Vegetarian Options" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{restaurant.address}</p>
                    <p className="font-medium">{restaurant.parish}</p>
                    {restaurant.phone && <p>📞 {formatPhoneNumber(restaurant.phone)}</p>}
                    {restaurant.cuisine_types && (
                      <p className="text-xs">
                        <span className="font-medium">Cuisine:</span> {getCuisineTypeLabel(restaurant.cuisine_types)}
                      </p>
                    )}
                  </div>

                  {restaurant.description && (
                    <p className="mt-3 text-sm text-gray-700 line-clamp-2">{restaurant.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      {restaurant.menu_files.length > 0 && (
                        <span className="inline-flex items-center text-xs text-gray-500">
                          {restaurant.menu_files.filter(m => m.file_type === 'pdf').length > 0 && (
                            <FileText className="mr-1 h-3 w-3" />
                          )}
                          {restaurant.menu_files.filter(m => m.file_type === 'image').length > 0 && (
                            <Image className="mr-1 h-3 w-3" />
                          )}
                          {restaurant.menu_files.length} menu(s)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {restaurant.id > 0 && (
                        <>
                          <Link
                            href={`/restaurants/${restaurant.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {restaurant.has_halal_options && !restaurant.is_halal_certified && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Halal Options
                      </span>
                    )}
                    {restaurant.has_vegan_options && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Vegan Options
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRestaurants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No restaurants found matching your criteria.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}