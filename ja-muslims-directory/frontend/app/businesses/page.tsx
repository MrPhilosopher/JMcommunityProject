'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Search, Edit, Trash2, Eye, Plus, Phone, Globe, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { Business } from '@/types';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, [search, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/businesses/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const params: any = { search, limit: 100 };
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      const response = await api.get('/businesses', { params });
      setBusinesses(response.data);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await api.delete(`/businesses/${id}`);
      fetchBusinesses();
    } catch (error) {
      alert('Failed to delete business');
    }
  };

  const inputClassName = "rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Muslim-Owned Businesses</h1>
          <Link
            href="/businesses/new"
            className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Business</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name, owner, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClassName + " w-full pl-10"}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={inputClassName + " w-full sm:w-auto"}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
            </div>
          ) : businesses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No businesses found
            </div>
          ) : (
            businesses.map((business) => (
              <div
                key={business.id}
                className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {business.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      href={`/businesses/${business.id}`}
                      className="p-1 text-gray-600 hover:text-indigo-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/businesses/${business.id}/edit`}
                      className="p-1 text-gray-600 hover:text-indigo-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {business.owner_name && (
                    <p className="text-gray-700">
                      <span className="font-medium">Owner:</span> {business.owner_name}
                    </p>
                  )}
                  
                  {business.phone_number && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{business.phone_number}</span>
                    </div>
                  )}

                  {business.address && (
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span className="flex-1">
                        {business.address}
                        {business.city && `, ${business.city}`}
                        {business.parish && `, ${business.parish}`}
                      </span>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600 underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center space-x-3">
                  {business.halal_certified && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Halal Certified
                    </span>
                  )}
                  {business.accepts_zakat && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      Accepts Zakat
                    </span>
                  )}
                  {!business.is_active && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}