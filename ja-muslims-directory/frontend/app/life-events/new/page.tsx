'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { Member } from '@/types';

const eventTypes = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'divorce', label: 'Divorce' },
  { value: 'birth', label: 'Birth' },
  { value: 'death', label: 'Death' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'hajj', label: 'Hajj' },
  { value: 'umrah', label: 'Umrah' },
  { value: 'education', label: 'Education' },
  { value: 'employment', label: 'Employment' },
  { value: 'other', label: 'Other' },
];

const lifeEventSchema = z.object({
  member_id: z.number().min(1, 'Member is required'),
  event_type: z.string().min(1, 'Event type is required'),
  event_date: z.string().min(1, 'Event date is required'),
  event_location: z.string().optional(),
  description: z.string().optional(),
  related_member_id: z.number().optional(),
});

type LifeEventFormData = z.infer<typeof lifeEventSchema>;

export default function NewLifeEventPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [relatedMemberSearch, setRelatedMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showRelatedDropdown, setShowRelatedDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRelatedMember, setSelectedRelatedMember] = useState<Member | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LifeEventFormData>({
    resolver: zodResolver(lifeEventSchema),
  });

  const eventType = watch('event_type');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members', { params: { limit: 1000 } });
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      memberSearch === '' ||
      member.muslim_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.legal_name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredRelatedMembers = members.filter(
    (member) =>
      relatedMemberSearch === '' ||
      member.muslim_name.toLowerCase().includes(relatedMemberSearch.toLowerCase()) ||
      member.legal_name.toLowerCase().includes(relatedMemberSearch.toLowerCase())
  );

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setValue('member_id', member.id);
    setMemberSearch(`${member.muslim_name} (${member.legal_name})`);
    setShowMemberDropdown(false);
  };

  const handleRelatedMemberSelect = (member: Member) => {
    setSelectedRelatedMember(member);
    setValue('related_member_id', member.id);
    setRelatedMemberSearch(`${member.muslim_name} (${member.legal_name})`);
    setShowRelatedDropdown(false);
  };

  const onSubmit = async (data: LifeEventFormData) => {
    try {
      await api.post('/life-events', data);
      router.push('/life-events');
    } catch (error) {
      console.error('Failed to create life event:', error);
      alert('Failed to create life event. Please try again.');
    }
  };

  const showRelatedMemberField = ['marriage', 'divorce', 'birth'].includes(eventType);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Add New Life Event</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Member *
            </label>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setShowMemberDropdown(true);
              }}
              onFocus={() => setShowMemberDropdown(true)}
              placeholder="Search for member..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.member_id && (
              <p className="mt-1 text-sm text-red-600">{errors.member_id.message}</p>
            )}
            {showMemberDropdown && filteredMembers.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleMemberSelect(member)}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="font-medium">{member.muslim_name}</div>
                    <div className="text-xs text-gray-500">{member.legal_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Type *
            </label>
            <select
              {...register('event_type')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select event type</option>
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.event_type && (
              <p className="mt-1 text-sm text-red-600">{errors.event_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Date *
            </label>
            <input
              type="date"
              {...register('event_date')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.event_date && (
              <p className="mt-1 text-sm text-red-600">{errors.event_date.message}</p>
            )}
          </div>

          {showRelatedMemberField && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Related Member {eventType === 'marriage' && '(Spouse)'} {eventType === 'birth' && '(Child)'}
              </label>
              <input
                type="text"
                value={relatedMemberSearch}
                onChange={(e) => {
                  setRelatedMemberSearch(e.target.value);
                  setShowRelatedDropdown(true);
                  if (e.target.value === '') {
                    setValue('related_member_id', undefined);
                  }
                }}
                onFocus={() => setShowRelatedDropdown(true)}
                placeholder="Search for related member..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {showRelatedDropdown && filteredRelatedMembers.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                  {filteredRelatedMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleRelatedMemberSelect(member)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="font-medium">{member.muslim_name}</div>
                      <div className="text-xs text-gray-500">{member.legal_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              {...register('event_location')}
              placeholder="e.g., Kingston Masjid, Jamaica"
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
              placeholder="Additional details about the event..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/life-events')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}