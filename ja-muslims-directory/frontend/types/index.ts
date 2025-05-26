export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Member {
  id: number;
  muslim_name: string;
  legal_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  date_of_conversion?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  present_address?: string;
  permanent_address?: string;
  phone_number?: string;
  email?: string;
  workplace?: string;
  occupation?: string;
  salary?: number;
  salary_period?: 'monthly' | 'yearly';
  spouse_id?: number;
  father_name?: string;
  mother_name?: string;
  burial_location?: string;
  date_of_death?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  life_events?: LifeEvent[];
}

export interface LifeEvent {
  id: number;
  member_id: number;
  event_type: 'marriage' | 'divorce' | 'birth' | 'death' | 'conversion' | 'hajj' | 'umrah' | 'education' | 'employment' | 'other';
  event_date: string;
  event_location?: string;
  description?: string;
  related_member_id?: number;
  created_at: string;
  created_by?: number;
}

export interface DashboardAnalytics {
  total_members: number;
  active_members: number;
  deceased_members: number;
  total_businesses: number;
  active_businesses: number;
  halal_certified_businesses: number;
  zakat_accepting_businesses: number;
  marital_status_distribution: Record<string, number>;
  conversions_this_year: number;
  age_distribution: Record<string, number>;
  business_category_distribution: Record<string, number>;
  event_type_distribution: Record<string, number>;
  recent_events: Array<{
    id: number;
    event_type: string;
    event_date: string;
    member_id: number;
  }>;
}

export type BusinessCategory = 
  | 'restaurant'
  | 'grocery'
  | 'clothing'
  | 'electronics'
  | 'automotive'
  | 'healthcare'
  | 'education'
  | 'real_estate'
  | 'construction'
  | 'professional_services'
  | 'retail'
  | 'wholesale'
  | 'manufacturing'
  | 'transportation'
  | 'hospitality'
  | 'beauty_salon'
  | 'halal_meat'
  | 'islamic_finance'
  | 'bookstore'
  | 'other';

export interface Business {
  id: number;
  name: string;
  owner_id: number;
  category: BusinessCategory;
  description?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  parish?: string;
  postal_code?: string;
  operating_hours?: string;
  year_established?: number;
  number_of_employees?: number;
  halal_certified: boolean;
  accepts_zakat: boolean;
  social_media?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  owner_name?: string;
  owner_phone?: string;
}