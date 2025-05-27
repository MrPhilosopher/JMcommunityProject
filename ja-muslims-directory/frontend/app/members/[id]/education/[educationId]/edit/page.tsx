'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/dashboard-layout';
import api from '@/lib/api';
import { Member } from '@/types';
import { 
  Education,
  EducationFormData, 
  EducationType, 
  EducationCategory,
  EDUCATION_TYPE_LABELS,
  FORMAL_EDUCATION_TYPES,
  ISLAMIC_EDUCATION_TYPES
} from '@/types/education';

const educationSchema = z.object({
  education_type: z.nativeEnum(EducationType),
  category: z.nativeEnum(EducationCategory),
  degree_name: z.string().min(1, 'Degree/Qualification name is required'),
  institution: z.string().min(1, 'Institution is required'),
  location: z.string().optional(),
  start_year: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  end_year: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  is_ongoing: z.boolean(),
  field_of_study: z.string().optional(),
  grade: z.string().optional(),
  achievements: z.string().optional(),
  islamic_qualification_details: z.string().optional(),
}).refine((data) => {
  if (data.start_year && data.end_year && !data.is_ongoing) {
    return data.end_year >= data.start_year;
  }
  return true;
}, {
  message: "End year must be after start year",
  path: ["end_year"],
}).refine((data) => {
  if (data.is_ongoing && data.end_year) {
    return false;
  }
  return true;
}, {
  message: "Cannot have end year if education is ongoing",
  path: ["end_year"],
});

export default function EditEducationPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [education, setEducation] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<EducationCategory>(EducationCategory.FORMAL);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  });

  const isOngoing = watch('is_ongoing');
  const educationType = watch('education_type');

  useEffect(() => {
    if (params.id && params.educationId) {
      Promise.all([fetchMember(), fetchEducation()]);
    }
  }, [params.id, params.educationId]);

  useEffect(() => {
    // Update category when education type changes
    if (educationType) {
      if (ISLAMIC_EDUCATION_TYPES.includes(educationType)) {
        setValue('category', EducationCategory.ISLAMIC);
        setSelectedCategory(EducationCategory.ISLAMIC);
      } else {
        setValue('category', EducationCategory.FORMAL);
        setSelectedCategory(EducationCategory.FORMAL);
      }
    }
  }, [educationType, setValue]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${params.id}`);
      setMember(response.data);
    } catch (error) {
      console.error('Failed to fetch member:', error);
    }
  };

  const fetchEducation = async () => {
    try {
      const response = await api.get(`/educations/${params.educationId}`);
      const edu: Education = response.data;
      setEducation(edu);
      setSelectedCategory(edu.category);
      
      reset({
        education_type: edu.education_type,
        category: edu.category,
        degree_name: edu.degree_name,
        institution: edu.institution,
        location: edu.location || '',
        start_year: edu.start_year || undefined,
        end_year: edu.end_year || undefined,
        is_ongoing: edu.is_ongoing,
        field_of_study: edu.field_of_study || '',
        grade: edu.grade || '',
        achievements: edu.achievements || '',
        islamic_qualification_details: edu.islamic_qualification_details || '',
      });
    } catch (error) {
      console.error('Failed to fetch education:', error);
      router.push(`/members/${params.id}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EducationFormData) => {
    try {
      await api.put(`/educations/${params.educationId}`, data);
      router.push(`/members/${params.id}`);
    } catch (error) {
      console.error('Failed to update education:', error);
      alert('Failed to update education. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      await api.delete(`/educations/${params.educationId}`);
      router.push(`/members/${params.id}`);
    } catch (error) {
      console.error('Failed to delete education:', error);
      alert('Failed to delete education. Please try again.');
    }
  };

  const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const textareaClassName = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  if (loading || !member || !education) {
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Education</h1>
          <p className="mt-1 text-sm text-gray-600">
            for {member.muslim_name} ({member.legal_name})
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Education Type</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={EducationCategory.FORMAL}
                      checked={selectedCategory === EducationCategory.FORMAL}
                      onChange={(e) => {
                        setSelectedCategory(EducationCategory.FORMAL);
                        setValue('category', EducationCategory.FORMAL);
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Formal Education</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={EducationCategory.ISLAMIC}
                      checked={selectedCategory === EducationCategory.ISLAMIC}
                      onChange={(e) => {
                        setSelectedCategory(EducationCategory.ISLAMIC);
                        setValue('category', EducationCategory.ISLAMIC);
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Islamic Education</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Education Type *
                </label>
                <select
                  {...register('education_type')}
                  className={inputClassName}
                >
                  <option value="">Select Education Type</option>
                  {selectedCategory === EducationCategory.FORMAL ? (
                    <optgroup label="Formal Education">
                      {FORMAL_EDUCATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {EDUCATION_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <optgroup label="Islamic Education">
                      {ISLAMIC_EDUCATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {EDUCATION_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {errors.education_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.education_type.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Education Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Degree/Qualification Name *
                </label>
                <input
                  type="text"
                  {...register('degree_name')}
                  placeholder={selectedCategory === EducationCategory.FORMAL 
                    ? "e.g., Bachelor of Science in Computer Science"
                    : "e.g., Completion of Hifz ul-Quran"
                  }
                  className={inputClassName}
                />
                {errors.degree_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.degree_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Institution *
                </label>
                <input
                  type="text"
                  {...register('institution')}
                  placeholder={selectedCategory === EducationCategory.FORMAL 
                    ? "e.g., University of the West Indies"
                    : "e.g., Islamic Institute of Jamaica"
                  }
                  className={inputClassName}
                />
                {errors.institution && (
                  <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    placeholder="e.g., Kingston, Jamaica"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    {...register('field_of_study')}
                    placeholder={selectedCategory === EducationCategory.FORMAL 
                      ? "e.g., Computer Science"
                      : "e.g., Quranic Studies"
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Year
                  </label>
                  <input
                    type="number"
                    {...register('start_year', { valueAsNumber: true })}
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    className={inputClassName}
                  />
                  {errors.start_year && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Year
                  </label>
                  <input
                    type="number"
                    {...register('end_year', { valueAsNumber: true })}
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    disabled={isOngoing}
                    className={inputClassName}
                  />
                  {errors.end_year && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_year.message}</p>
                  )}
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_ongoing')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Currently pursuing</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Grade/Result
                </label>
                <input
                  type="text"
                  {...register('grade')}
                  placeholder={selectedCategory === EducationCategory.FORMAL 
                    ? "e.g., First Class Honours, 3.8 GPA"
                    : "e.g., Completed with Distinction"
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Achievements/Awards
                </label>
                <textarea
                  {...register('achievements')}
                  rows={3}
                  placeholder="Notable achievements, awards, or honors received"
                  className={textareaClassName}
                />
              </div>

              {selectedCategory === EducationCategory.ISLAMIC && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Islamic Qualification Details
                  </label>
                  <textarea
                    {...register('islamic_qualification_details')}
                    rows={3}
                    placeholder="Additional details about Islamic education or certification"
                    className={textareaClassName}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Education
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/members/${params.id}`)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}