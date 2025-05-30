'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { Member } from '@/types';
import { numberToWords } from '@/lib/numberToWords';
import { Masjid } from '@/types/masjid';

const memberSchema = z.object({
  muslim_name: z.string().min(1, 'Muslim name is required'),
  legal_name: z.string().min(1, 'Legal name is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Please select a valid gender',
  }),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  date_of_conversion: z.string().optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  workplace: z.string().optional(),
  occupation: z.string().optional(),
  salary: z.number().optional(),
  salary_period: z.enum(['monthly', 'yearly']).optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  notes: z.string().optional(),
  burial_location: z.string().optional(),
  date_of_death: z.string().optional(),
  masjid_id: z.number().optional(),
});

type MemberForm = z.infer<typeof memberSchema>;

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salaryValue, setSalaryValue] = useState<string>('');
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
  });

  const salary = watch('salary');

  const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";
  const textareaClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";

  useEffect(() => {
    if (params.id) {
      fetchMember();
      fetchMasjids();
    }
  }, [params.id]);

  const fetchMasjids = async () => {
    try {
      const response = await api.get('/masjids');
      setMasjids(response.data);
    } catch (error) {
      console.error('Failed to fetch masjids:', error);
    }
  };

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${params.id}`);
      const member: Member = response.data;
      
      reset({
        muslim_name: member.muslim_name,
        legal_name: member.legal_name,
        gender: member.gender,
        date_of_birth: member.date_of_birth,
        date_of_conversion: member.date_of_conversion || '',
        marital_status: member.marital_status || undefined,
        present_address: member.present_address || '',
        permanent_address: member.permanent_address || '',
        phone_number: member.phone_number || '',
        email: member.email || '',
        workplace: member.workplace || '',
        occupation: member.occupation || '',
        salary: member.salary || undefined,
        salary_period: member.salary_period || 'monthly',
        father_name: member.father_name || '',
        mother_name: member.mother_name || '',
        burial_location: member.burial_location || '',
        date_of_death: member.date_of_death || '',
        notes: member.notes || '',
        masjid_id: member.masjid_id || undefined,
      });
      
      if (member.salary) {
        setSalaryValue(member.salary.toString());
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
      router.push('/members');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MemberForm) => {
    try {
      console.log('Form data:', data);
      const payload = {
        ...data,
        date_of_conversion: data.date_of_conversion || null,
        date_of_death: data.date_of_death || null,
        salary: data.salary || null,
        salary_period: data.salary_period || 'monthly',
        masjid_id: data.masjid_id || null,
      };
      console.log('Payload:', payload);
      await api.put(`/members/${params.id}`, payload);
      router.push('/members');
    } catch (error: any) {
      console.error('Update error:', error);
      if (error.response?.data?.detail) {
        alert(`Failed to update member: ${error.response.data.detail}`);
      } else {
        alert('Failed to update member');
      }
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
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Personal Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Muslim Name *
                </label>
                <input
                  {...register('muslim_name')}
                  type="text"
                  className={inputClassName}
                />
                {errors.muslim_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.muslim_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Legal Name *
                </label>
                <input
                  {...register('legal_name')}
                  type="text"
                  className={inputClassName}
                />
                {errors.legal_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.legal_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  {...register('gender')}
                  className={inputClassName}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  {...register('date_of_birth')}
                  type="date"
                  className={inputClassName}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Conversion
                </label>
                <input
                  {...register('date_of_conversion')}
                  type="date"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marital Status
                </label>
                <select
                  {...register('marital_status')}
                  className={inputClassName}
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  {...register('father_name')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Name
                </label>
                <input
                  {...register('mother_name')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Death
                </label>
                <input
                  {...register('date_of_death')}
                  type="date"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Burial Location
                </label>
                <input
                  {...register('burial_location')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Place of Worship
                </label>
                <select
                  {...register('masjid_id', { valueAsNumber: true })}
                  className={inputClassName}
                >
                  <option value="">Select Masjid/Musalla</option>
                  {masjids.map((masjid) => (
                    <option key={masjid.id} value={masjid.id}>
                      {masjid.name} ({masjid.type === 'masjid' ? 'Masjid' : 'Musalla'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register('phone_number')}
                  type="tel"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={inputClassName}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Present Address
                </label>
                <textarea
                  {...register('present_address')}
                  rows={3}
                  className={textareaClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Permanent Address
                </label>
                <textarea
                  {...register('permanent_address')}
                  rows={3}
                  className={textareaClassName}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Employment Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Workplace
                </label>
                <input
                  {...register('workplace')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  {...register('occupation')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Salary (JMD)
                </label>
                <div className="mt-1">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">JMD</span>
                      </div>
                      <input
                        {...register('salary', { 
                          setValueAs: (value) => value === '' ? undefined : Number(value) 
                        })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="block w-full rounded-md border border-gray-300 pl-12 pr-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <select
                      {...register('salary_period')}
                      className="block rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  {salary && (
                    <p className="mt-1 text-sm text-gray-600 italic">
                      {numberToWords(salary)} JMD
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Additional Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className={textareaClassName}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/members/${params.id}`)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}