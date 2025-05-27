'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { MasjidWithRelations, MasjidType } from '@/types/masjid';
import { formatPhoneNumber } from '@/lib/phoneUtils';

export default function MasjidDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [masjid, setMasjid] = useState<MasjidWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMasjid();
    }
  }, [params.id]);

  const fetchMasjid = async () => {
    try {
      const response = await api.get(`/masjids/${params.id}`);
      setMasjid(response.data);
    } catch (error) {
      console.error('Failed to fetch masjid:', error);
      router.push('/masjids');
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

  if (!masjid) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{masjid.name}</h1>
          <div className="flex space-x-3">
            <Link
              href={`/masjids/${masjid.id}/edit`}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Edit Masjid
            </Link>
            <Link
              href="/masjids"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to List
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      masjid.type === MasjidType.MASJID
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {masjid.type === MasjidType.MASJID ? 'Masjid' : 'Musalla'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Established Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{masjid.established_year || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {masjid.capacity ? `${masjid.capacity} people` : 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Jummah Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">{masjid.jummah_time || 'Not specified'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Location</h2>
              <address className="not-italic text-sm text-gray-900">
                <p>{masjid.address}</p>
                {masjid.city && <p>{masjid.city}</p>}
                <p>{masjid.parish}</p>
                {masjid.postal_code && <p>{masjid.postal_code}</p>}
              </address>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
              <dl className="space-y-4">
                {masjid.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatPhoneNumber(masjid.phone)}</dd>
                  </div>
                )}
                {masjid.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${masjid.email}`} className="text-indigo-600 hover:text-indigo-900">
                        {masjid.email}
                      </a>
                    </dd>
                  </div>
                )}
                {masjid.website && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={masjid.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                        {masjid.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {masjid.facilities && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Facilities</h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{masjid.facilities}</p>
              </div>
            )}

            {masjid.prayer_times_info && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Prayer Times Information</h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{masjid.prayer_times_info}</p>
              </div>
            )}

            {masjid.activities && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Activities</h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{masjid.activities}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Leadership</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Imam</h3>
                {masjid.imam ? (
                  <Link
                    href={`/members/${masjid.imam.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    {masjid.imam.muslim_name} ({masjid.imam.legal_name})
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500">No imam assigned</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Shura Members ({masjid.shura_members.length})
                </h3>
                {masjid.shura_members.length > 0 ? (
                  <ul className="space-y-2">
                    {masjid.shura_members.map((member) => (
                      <li key={member.id}>
                        <Link
                          href={`/members/${member.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          {member.muslim_name} ({member.legal_name})
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No shura members</p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Statistics</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Affiliated Members</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {masjid.affiliated_members_count || 0}
                  </dd>
                </div>
              </dl>
              <Link
                href={`/members?masjid_id=${masjid.id}`}
                className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
              >
                View affiliated members →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}