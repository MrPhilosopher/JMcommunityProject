export enum MasjidType {
  MASJID = 'masjid',
  MUSALLA = 'musalla',
}

export interface MemberBasic {
  id: number;
  muslim_name: string;
  legal_name: string;
}

export interface Masjid {
  id: number;
  name: string;
  type: MasjidType;
  address: string;
  city?: string;
  parish: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  imam_id?: number;
  established_year?: number;
  capacity?: number;
  facilities?: string;
  prayer_times_info?: string;
  jummah_time?: string;
  activities?: string;
  created_at: string;
  updated_at?: string;
}

export interface MasjidWithRelations extends Masjid {
  imam?: MemberBasic;
  shura_members: MemberBasic[];
  affiliated_members_count?: number;
}

export interface MasjidFormData {
  name: string;
  type: MasjidType;
  address: string;
  city?: string;
  parish: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  imam_id?: number;
  established_year?: number;
  capacity?: number;
  facilities?: string;
  prayer_times_info?: string;
  jummah_time?: string;
  activities?: string;
  shura_member_ids?: number[];
}

// Jamaican parishes (same as in restaurant types)
export const PARISHES = [
  'Kingston',
  'St. Andrew',
  'St. Thomas',
  'Portland',
  'St. Mary',
  'St. Ann',
  'Trelawny',
  'St. James',
  'Hanover',
  'Westmoreland',
  'St. Elizabeth',
  'Manchester',
  'Clarendon',
  'St. Catherine',
] as const;