export enum BusinessCategory {
  RESTAURANT = "restaurant",
  GROCERY = "grocery",
  CLOTHING = "clothing",
  ELECTRONICS = "electronics",
  AUTOMOTIVE = "automotive",
  HEALTHCARE = "healthcare",
  EDUCATION = "education",
  REAL_ESTATE = "real_estate",
  CONSTRUCTION = "construction",
  PROFESSIONAL_SERVICES = "professional_services",
  RETAIL = "retail",
  WHOLESALE = "wholesale",
  MANUFACTURING = "manufacturing",
  TRANSPORTATION = "transportation",
  HOSPITALITY = "hospitality",
  BEAUTY_SALON = "beauty_salon",
  HALAL_MEAT = "halal_meat",
  ISLAMIC_FINANCE = "islamic_finance",
  BOOKSTORE = "bookstore",
  OTHER = "other"
}

export interface BusinessOwner {
  id: number;
  first_name: string;
  last_name: string;
  muslim_name: string;
  email?: string;
  phone_number?: string;
}

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
  owner: BusinessOwner;
}

export interface BusinessFormData {
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
}