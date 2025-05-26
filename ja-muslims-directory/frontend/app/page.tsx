'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Users, UserCheck, UserX, TrendingUp, Building2, Award, Heart } from 'lucide-react';
import api from '@/lib/api';
import { DashboardAnalytics } from '@/types';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Members Statistics */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Community Members</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {analytics?.total_members || 0}
                </p>
              </div>
              <Users className="h-12 w-12 text-indigo-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {analytics?.active_members || 0}
                </p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Deceased Members</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {analytics?.deceased_members || 0}
                </p>
              </div>
              <UserX className="h-12 w-12 text-gray-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Conversions This Year</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {analytics?.conversions_this_year || 0}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          </div>
        </div>

        {/* Business Statistics */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Muslim-Owned Businesses</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.total_businesses || 0}
                  </p>
                </div>
                <Building2 className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.active_businesses || 0}
                  </p>
                </div>
                <Building2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Halal Certified</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.halal_certified_businesses || 0}
                  </p>
                </div>
                <Award className="h-12 w-12 text-emerald-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Accept Zakat</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.zakat_accepting_businesses || 0}
                  </p>
                </div>
                <Heart className="h-12 w-12 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Age Distribution</h2>
            <div className="mt-4 space-y-2">
              {analytics?.age_distribution &&
                Object.entries(analytics.age_distribution).map(([age, count]) => (
                  <div key={age} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{age}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Marital Status</h2>
            <div className="mt-4 space-y-2">
              {analytics?.marital_status_distribution &&
                Object.entries(analytics.marital_status_distribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status || 'Not specified'}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Business Categories</h2>
            <div className="mt-4 space-y-2">
              {analytics?.business_category_distribution &&
                Object.entries(analytics.business_category_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Recent Life Events</h2>
          <div className="mt-4">
            {analytics?.recent_events && analytics.recent_events.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {analytics.recent_events.map((event) => (
                  <li key={event.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{event.event_type}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent events</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}