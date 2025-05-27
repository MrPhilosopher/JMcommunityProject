'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { MasjidWithRelations, MasjidType } from '@/types/masjid';

export default function MasjidsPage() {
  const router = useRouter();
  const [masjids, setMasjids] = useState<MasjidWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchMasjids();
  }, [search, typeFilter]);

  const fetchMasjids = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('masjid_type', typeFilter);

      const response = await api.get(`/masjids?${params.toString()}`);
      setMasjids(response.data);
    } catch (error) {
      console.error('Failed to fetch masjids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this masjid?')) return;

    try {
      await api.delete(`/masjids/${id}`);
      await fetchMasjids();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete masjid');
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Masjids & Musallas</h1>
          <Link
            href="/masjids/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Masjid
          </Link>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name, address, or activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value={MasjidType.MASJID}>Masjid</option>
            <option value={MasjidType.MUSALLA}>Musalla</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Imam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Jummah Time
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {masjids.map((masjid) => (
                <tr key={masjid.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <Link href={`/masjids/${masjid.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {masjid.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      masjid.type === MasjidType.MASJID
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {masjid.type === MasjidType.MASJID ? 'Masjid' : 'Musalla'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{masjid.address}</div>
                    <div className="text-xs text-gray-400">{masjid.parish}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {masjid.imam ? masjid.imam.legal_name : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {masjid.affiliated_members_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {masjid.jummah_time || '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/masjids/${masjid.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(masjid.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {masjids.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No masjids found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}