'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Calendar, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  Edit, 
  Users,
  Clock,
  CheckCircle,
  Heart
} from 'lucide-react';
import api from '@/lib/api';
import { Business } from '@/types';

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBusiness();
    }
  }, [params.id]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/businesses/${params.id}`);
      setBusiness(response.data);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      router.push('/businesses');
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

  if (!business) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            <p className="mt-1 text-lg text-gray-600 capitalize">
              {business.category.replace(/_/g, ' ')}
            </p>
          </div>
          <Link
            href={`/businesses/${business.id}/edit`}
            className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {business.description && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">About</h2>
                <p className="text-gray-700">{business.description}</p>
              </div>
            )}

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
              <div className="space-y-3">
                {business.phone_number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{business.phone_number}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <a
                      href={`mailto:${business.email}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {business.email}
                    </a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {business.website}
                    </a>
                  </div>
                )}
                {business.social_media && (
                  <div className="flex items-start space-x-3">
                    <Heart className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Social Media</p>
                      <p className="text-sm text-gray-600">{business.social_media}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Location</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{business.address}</p>
                    {(business.city || business.parish) && (
                      <p className="text-sm text-gray-600">
                        {business.city}
                        {business.city && business.parish && ', '}
                        {business.parish}
                      </p>
                    )}
                    {business.postal_code && (
                      <p className="text-sm text-gray-600">Postal Code: {business.postal_code}</p>
                    )}
                  </div>
                </div>
                
                {business.operating_hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Operating Hours</p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {business.operating_hours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {business.notes && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Notes</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{business.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Owner</h2>
              <div className="text-center">
                <p className="font-medium text-gray-900">{business.owner_name}</p>
                {business.owner_phone && (
                  <p className="mt-1 text-sm text-gray-600">{business.owner_phone}</p>
                )}
                <Link
                  href={`/members/${business.owner_id}`}
                  className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                >
                  View Member Profile
                </Link>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Business Details</h2>
              <dl className="space-y-3">
                {business.year_established && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Established</dt>
                    <dd className="mt-1 text-sm text-gray-900">{business.year_established}</dd>
                  </div>
                )}
                {business.number_of_employees && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employees</dt>
                    <dd className="mt-1 text-sm text-gray-900">{business.number_of_employees}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        business.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {business.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Certifications</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Halal Certified</span>
                  {business.halal_certified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <span className="text-sm text-gray-400">No</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Accepts Zakat</span>
                  {business.accepts_zakat ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <span className="text-sm text-gray-400">No</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}