export interface RestaurantMenu {
  id: number;
  restaurant_id: number;
  file_name: string;
  file_path: string;
  file_type: 'pdf' | 'image';
  uploaded_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  parish: string;
  phone?: string;
  email?: string;
  website?: string;
  is_halal_certified: boolean;
  has_halal_options: boolean;
  has_vegetarian_options: boolean;
  has_vegan_options: boolean;
  cuisine_types?: string;
  opening_hours?: string;
  description?: string;
  business_id?: number;
  created_at: string;
  updated_at?: string;
  menu_files: RestaurantMenu[];
}

export interface RestaurantWithBusiness extends Restaurant {
  business_name?: string;
  owner_name?: string;
}

export interface RestaurantFormData {
  name: string;
  address: string;
  parish: string;
  phone?: string;
  email?: string;
  website?: string;
  is_halal_certified: boolean;
  has_halal_options: boolean;
  has_vegetarian_options: boolean;
  has_vegan_options: boolean;
  cuisine_types?: string;
  opening_hours?: string;
  description?: string;
  business_id?: number;
}

export const CUISINE_TYPES = [
  { value: 'jamaican', label: 'Jamaican' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'indian', label: 'Indian' },
  { value: 'pakistani', label: 'Pakistani' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'african', label: 'African' },
  { value: 'american', label: 'American' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'other', label: 'Other' },
];

export const PARISHES = [
  'Kingston',
  'St. Andrew',
  'St. Catherine',
  'Clarendon',
  'Manchester',
  'St. Elizabeth',
  'Westmoreland',
  'Hanover',
  'St. James',
  'Trelawny',
  'St. Ann',
  'St. Mary',
  'Portland',
  'St. Thomas',
];