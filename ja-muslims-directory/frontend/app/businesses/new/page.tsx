'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { Member } from '@/types';
import { Search } from 'lucide-react';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  owner_id: z.number().min(1, 'Owner is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  parish: z.string().optional(),
  postal_code: z.string().optional(),
  operating_hours: z.string().optional(),
  year_established: z.number().optional(),
  number_of_employees: z.number().optional(),
  halal_certified: z.boolean().default(false),
  accepts_zakat: z.boolean().default(false),
  social_media: z.string().optional(),
  notes: z.string().optional(),
});

type BusinessForm = z.infer<typeof businessSchema>;

export default function NewBusinessPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
  });

  const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";
  const textareaClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";

  useEffect(() => {
    fetchMembers();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (memberSearch) {
      const filtered = members.filter(member => 
        member.muslim_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.legal_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (member.phone_number && member.phone_number.includes(memberSearch))
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members.slice(0, 10)); // Show first 10 when no search
    }
  }, [memberSearch, members]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members', { params: { limit: 1000 } });
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/businesses/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const selectMember = (member: Member) => {
    setSelectedMember(member);
    setValue('owner_id', member.id);
    setMemberSearch(member.muslim_name);
    setShowMemberDropdown(false);
  };

  const onSubmit = async (data: BusinessForm) => {
    try {
      // Ensure owner_id is set
      if (!data.owner_id || data.owner_id === 0) {
        alert('Please select a business owner');
        return;
      }

      // Clean up the payload
      const payload = {
        ...data,
        owner_id: parseInt(data.owner_id.toString()),
        year_established: data.year_established ? parseInt(data.year_established.toString()) : undefined,
        number_of_employees: data.number_of_employees ? parseInt(data.number_of_employees.toString()) : undefined,
        // Remove empty strings
        email: data.email || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
        phone_number: data.phone_number || undefined,
        city: data.city || undefined,
        parish: data.parish || undefined,
        postal_code: data.postal_code || undefined,
        operating_hours: data.operating_hours || undefined,
        social_media: data.social_media || undefined,
        notes: data.notes || undefined,
      };
      
      console.log('Submitting payload:', payload);
      const response = await api.post('/businesses', payload);
      router.push('/businesses');
    } catch (error: any) {
      console.error('Error creating business:', error.response?.data || error);
      const errorMessage = error.response?.data?.detail || 'Failed to create business';
      alert(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Add New Business</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Owner Information</h2>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Business Owner * (Must be an existing member)
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                  placeholder="Search by name or phone number..."
                  className={inputClassName + " pl-10"}
                />
                <input type="hidden" {...register('owner_id', { valueAsNumber: true })} />
              </div>
              
              {showMemberDropdown && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  {filteredMembers.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No members found</div>
                  ) : (
                    filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => selectMember(member)}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        <div className="font-medium text-gray-900">{member.muslim_name}</div>
                        <div className="text-gray-500">
                          {member.legal_name} {member.phone_number && `• ${member.phone_number}`}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {selectedMember && (
                <div className="mt-2 rounded-md bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    Selected: <span className="font-medium">{selectedMember.muslim_name}</span> ({selectedMember.legal_name})
                  </p>
                </div>
              )}
              
              {errors.owner_id && (
                <p className="mt-1 text-sm text-red-600">Please select a business owner</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Business Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className={inputClassName}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className={inputClassName}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className={textareaClassName}
                  placeholder="What does this business do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year Established
                </label>
                <input
                  {...register('year_established', { valueAsNumber: true })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Employees
                </label>
                <input
                  {...register('number_of_employees', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={inputClassName}
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  {...register('website')}
                  type="url"
                  placeholder="https://..."
                  className={inputClassName}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Social Media
                </label>
                <input
                  {...register('social_media')}
                  type="text"
                  placeholder="Instagram, Facebook links..."
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Location</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className={textareaClassName}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  {...register('city')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parish
                </label>
                <select
                  {...register('parish')}
                  className={inputClassName}
                >
                  <option value="">Select parish</option>
                  <option value="Kingston">Kingston</option>
                  <option value="St. Andrew">St. Andrew</option>
                  <option value="St. Catherine">St. Catherine</option>
                  <option value="Clarendon">Clarendon</option>
                  <option value="Manchester">Manchester</option>
                  <option value="St. Elizabeth">St. Elizabeth</option>
                  <option value="Westmoreland">Westmoreland</option>
                  <option value="Hanover">Hanover</option>
                  <option value="St. James">St. James</option>
                  <option value="Trelawny">Trelawny</option>
                  <option value="St. Ann">St. Ann</option>
                  <option value="St. Mary">St. Mary</option>
                  <option value="Portland">Portland</option>
                  <option value="St. Thomas">St. Thomas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  {...register('postal_code')}
                  type="text"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Operating Hours
                </label>
                <textarea
                  {...register('operating_hours')}
                  rows={2}
                  placeholder="Mon-Fri: 9AM-5PM, Sat: 10AM-2PM"
                  className={textareaClassName}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Additional Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('halal_certified')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Halal Certified
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('accepts_zakat')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Accepts Zakat
                </label>
              </div>

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
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/businesses')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}