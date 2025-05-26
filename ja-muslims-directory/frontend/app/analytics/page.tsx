'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { TrendingUp, Users, DollarSign, Building2, Briefcase } from 'lucide-react';

interface MemberStatistics {
  average_salary: number;
  employment_rate: number;
  business_ownership_rate: number;
  members_with_businesses: number;
  conversions_by_year: Record<string, number>;
  top_business_categories: Array<{ category: string; count: number }>;
}

export default function AnalyticsPage() {
  const [statistics, setStatistics] = useState<MemberStatistics | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsResponse, dashboardResponse] = await Promise.all([
        api.get('/analytics/members/statistics'),
        api.get('/analytics/dashboard')
      ]);
      setStatistics(statsResponse.data);
      setDashboardData(dashboardResponse.data);
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

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

  const ageData = dashboardData?.age_distribution
    ? Object.entries(dashboardData.age_distribution).map(([age, count]) => ({
        name: age,
        value: count as number,
      }))
    : [];

  const maritalData = dashboardData?.marital_status_distribution
    ? Object.entries(dashboardData.marital_status_distribution)
        .filter(([status]) => status)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count as number,
        }))
    : [];

  const conversionData = statistics?.conversions_by_year
    ? Object.entries(statistics.conversions_by_year)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, count]) => ({
          year: year,
          conversions: count,
        }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Average Salary</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  <span className="text-lg">JMD</span> {statistics?.average_salary ? statistics.average_salary.toLocaleString() : '0'}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Employment Rate</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {statistics?.employment_rate ? statistics.employment_rate.toFixed(1) : '0'}%
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Business Ownership</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {statistics?.business_ownership_rate ? statistics.business_ownership_rate.toFixed(1) : '0'}%
                </p>
              </div>
              <Building2 className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Business Owners</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {statistics?.members_with_businesses || 0}
                </p>
              </div>
              <Briefcase className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Age Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Marital Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={maritalData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {maritalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {conversionData.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Conversions by Year</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversions" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {statistics?.top_business_categories && statistics.top_business_categories.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Top Business Categories</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.top_business_categories.map(cat => ({
                  ...cat,
                  name: cat.category.replace(/_/g, ' ').charAt(0).toUpperCase() + cat.category.replace(/_/g, ' ').slice(1)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}