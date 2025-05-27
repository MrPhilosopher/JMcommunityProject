'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { MasjidFormData, MasjidType, PARISHES } from '@/types/masjid';
import { Member } from '@/types';
import { formatPhoneNumber, validateJamaicanPhoneNumber, cleanPhoneNumber } from '@/lib/phoneUtils';

const masjidSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(MasjidType),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  parish: z.string().min(1, 'Parish is required'),
  postal_code: z.string().optional(),
  phone: z.string()
    .optional()
    .refine((val) => !val || validateJamaicanPhoneNumber(val), {
      message: 'Invalid phone number. Use format: 876-XXX-XXXX or XXX-XXXX',
    }),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  imam_id: z.number().optional(),
  established_year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  capacity: z.number().min(1).optional(),
  facilities: z.string().optional(),
  prayer_times_info: z.string().optional(),
  jummah_time: z.string().optional(),
  activities: z.string().optional(),
});

export default function NewMasjidPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedShuraMembers, setSelectedShuraMembers] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [shuraSearch, setShuraSearch] = useState('');
  const [showImamDropdown, setShowImamDropdown] = useState(false);
  const [showShuraDropdown, setShowShuraDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MasjidFormData>({
    resolver: zodResolver(masjidSchema),
    defaultValues: {
      type: MasjidType.MASJID,
    },
  });

  const imamId = watch('imam_id');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members?limit=1000');
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

  const filteredShuraMembers = members.filter(
    (member) =>
      (shuraSearch === '' ||
        member.muslim_name.toLowerCase().includes(shuraSearch.toLowerCase()) ||
        member.legal_name.toLowerCase().includes(shuraSearch.toLowerCase())) &&
      !selectedShuraMembers.includes(member.id) &&
      member.id !== imamId
  );

  const handleImamSelect = (member: Member) => {
    setValue('imam_id', member.id);
    setMemberSearch(member.legal_name);
    setShowImamDropdown(false);
  };

  const handleShuraAdd = (member: Member) => {
    setSelectedShuraMembers([...selectedShuraMembers, member.id]);
    setShuraSearch('');
    setShowShuraDropdown(false);
  };

  const handleShuraRemove = (memberId: number) => {
    setSelectedShuraMembers(selectedShuraMembers.filter(id => id !== memberId));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanPhoneNumber(value);
    
    if (value !== '' && value !== cleaned) {
      e.target.value = cleaned;
    }
  };

  const onSubmit = async (data: MasjidFormData) => {
    try {
      const submitData = {
        ...data,
        phone: data.phone ? cleanPhoneNumber(data.phone) : undefined,
        shura_member_ids: selectedShuraMembers,
      };
      
      await api.post('/masjids', submitData);
      router.push('/masjids');
    } catch (error) {
      console.error('Failed to create masjid:', error);
      alert('Failed to create masjid. Please try again.');
    }
  };

  const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const textareaClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Add New Masjid</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={inputClassName}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type *
                </label>
                <select
                  {...register('type')}
                  className={inputClassName}
                >
                  <option value={MasjidType.MASJID}>Masjid</option>
                  <option value={MasjidType.MUSALLA}>Musalla</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Location Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className={inputClassName}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parish *
                  </label>
                  <select
                    {...register('parish')}
                    className={inputClassName}
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
                    Postal Code
                  </label>
                  <input
                    type="text"
                    {...register('postal_code')}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                  className={inputClassName}
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
                  className={inputClassName}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className={inputClassName}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Leadership</h2>
            
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Imam
                </label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowImamDropdown(true);
                  }}
                  onFocus={() => setShowImamDropdown(true)}
                  placeholder="Search for imam..."
                  className={inputClassName}
                />
                {showImamDropdown && filteredMembers.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleImamSelect(member)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shura Members
                </label>
                
                {selectedShuraMembers.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {selectedShuraMembers.map((memberId) => {
                      const member = members.find(m => m.id === memberId);
                      return member ? (
                        <div key={memberId} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                          <span className="text-sm text-gray-700">
                            {member.muslim_name} ({member.legal_name})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleShuraRemove(memberId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={shuraSearch}
                    onChange={(e) => {
                      setShuraSearch(e.target.value);
                      setShowShuraDropdown(true);
                    }}
                    onFocus={() => setShowShuraDropdown(true)}
                    placeholder="Search to add shura members..."
                    className={inputClassName}
                  />
                  {showShuraDropdown && filteredShuraMembers.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                      {filteredShuraMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleShuraAdd(member)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="font-medium">{member.muslim_name}</div>
                          <div className="text-xs text-gray-500">{member.legal_name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Additional Information</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Established Year
                </label>
                <input
                  type="number"
                  {...register('established_year', { valueAsNumber: true })}
                  className={inputClassName}
                />
                {errors.established_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.established_year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  className={inputClassName}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jummah Time
                </label>
                <input
                  type="text"
                  {...register('jummah_time')}
                  placeholder="e.g., 1:00 PM"
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Facilities
                </label>
                <textarea
                  {...register('facilities')}
                  rows={3}
                  placeholder="e.g., Parking, Wudu area, Sisters' section, Library"
                  className={textareaClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prayer Times Information
                </label>
                <textarea
                  {...register('prayer_times_info')}
                  rows={3}
                  placeholder="Information about prayer times"
                  className={textareaClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activities
                </label>
                <textarea
                  {...register('activities')}
                  rows={3}
                  placeholder="Regular activities, classes, programs, etc."
                  className={textareaClassName}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/masjids')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Masjid'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}