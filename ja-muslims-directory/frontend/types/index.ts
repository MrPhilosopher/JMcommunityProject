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
  marital_status_distribution: Record<string, number>;
  conversions_this_year: number;
  age_distribution: Record<string, number>;
  event_type_distribution: Record<string, number>;
  recent_events: Array<{
    id: number;
    event_type: string;
    event_date: string;
    member_id: number;
  }>;
}