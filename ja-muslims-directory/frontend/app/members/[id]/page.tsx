'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Calendar, Mail, MapPin, Phone, Briefcase, Edit, Building, GraduationCap, Plus } from 'lucide-react';
import api from '@/lib/api';
import { Member, LifeEvent } from '@/types';
import { Masjid } from '@/types/masjid';
import { Education, EDUCATION_TYPE_LABELS } from '@/types/education';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMember();
      fetchLifeEvents();
      fetchEducations();
    }
  }, [params.id]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${params.id}`);
      setMember(response.data);
      
      // Fetch masjid if member is affiliated with one
      if (response.data.masjid_id) {
        try {
          const masjidResponse = await api.get(`/masjids/${response.data.masjid_id}`);
          setMasjid(masjidResponse.data);
        } catch (error) {
          console.error('Failed to fetch masjid:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
      router.push('/members');
    } finally {
      setLoading(false);
    }
  };

  const fetchLifeEvents = async () => {
    try {
      const response = await api.get('/life-events', {
        params: { member_id: params.id },
      });
      setLifeEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch life events:', error);
    }
  };

  const fetchEducations = async () => {
    try {
      const response = await api.get(`/educations/member/${params.id}`);
      setEducations(response.data);
    } catch (error) {
      console.error('Failed to fetch educations:', error);
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

  if (!member) {
    return null;
  }

  const age = member.date_of_birth
    ? Math.floor(
        (new Date().getTime() - new Date(member.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{member.muslim_name}</h1>
          <Link
            href={`/members/${member.id}/edit`}
            className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Personal Information</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.legal_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {member.gender || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(member.date_of_birth).toLocaleDateString()} ({age} years)
                  </dd>
                </div>
                {member.date_of_conversion && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Conversion</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(member.date_of_conversion).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {member.marital_status || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Place of Worship</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {masjid ? (
                      <Link href={`/masjids/${masjid.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {masjid.name}
                      </Link>
                    ) : (
                      'Not specified'
                    )}
                  </dd>
                </div>
                {member.father_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.father_name}</dd>
                  </div>
                )}
                {member.mother_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.mother_name}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
              <div className="space-y-3">
                {member.phone_number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{member.phone_number}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{member.email}</span>
                  </div>
                )}
                {member.present_address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Present Address</p>
                      <p className="text-sm text-gray-600">{member.present_address}</p>
                    </div>
                  </div>
                )}
                {member.permanent_address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Permanent Address</p>
                      <p className="text-sm text-gray-600">{member.permanent_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(member.workplace || member.occupation || member.salary) && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Employment Information</h2>
                <div className="space-y-3">
                  {member.workplace && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.workplace}</p>
                        {member.occupation && (
                          <p className="text-sm text-gray-600">{member.occupation}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {member.salary && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Salary</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        JMD {member.salary.toLocaleString()} {member.salary_period && `(${member.salary_period})`}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Education</h2>
                <button
                  onClick={() => router.push(`/members/${member.id}/education/new`)}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Education
                </button>
              </div>
              
              {educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-gray-200 pl-4 hover:border-indigo-500 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {edu.degree_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {edu.institution}
                            {edu.location && ` • ${edu.location}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {edu.start_year && `${edu.start_year} - `}
                            {edu.is_ongoing ? 'Present' : edu.end_year || 'N/A'}
                            {edu.field_of_study && ` • ${edu.field_of_study}`}
                          </p>
                          {edu.grade && (
                            <p className="text-xs text-gray-500">Grade: {edu.grade}</p>
                          )}
                          {edu.achievements && (
                            <p className="text-xs text-gray-600 mt-1">{edu.achievements}</p>
                          )}
                          <span className={`inline-flex mt-2 rounded-full px-2 py-1 text-xs font-semibold ${
                            edu.category === 'islamic' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {EDUCATION_TYPE_LABELS[edu.education_type]}
                          </span>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => router.push(`/members/${member.id}/education/${edu.id}/edit`)}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No education records added yet.</p>
              )}
            </div>

            {member.notes && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Notes</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Status</h2>
              <div className="text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    member.date_of_death
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {member.date_of_death ? 'Deceased' : 'Active'}
                </span>
                {member.date_of_death && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Date of Death</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(member.date_of_death).toLocaleDateString()}
                    </p>
                    {member.burial_location && (
                      <>
                        <p className="mt-2 text-sm text-gray-500">Burial Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {member.burial_location}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Life Events</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">
                  Add Event
                </button>
              </div>
              {lifeEvents.length > 0 ? (
                <ul className="space-y-3">
                  {lifeEvents.map((event) => (
                    <li key={event.id} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {event.event_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No life events recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}