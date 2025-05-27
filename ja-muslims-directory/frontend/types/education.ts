export enum EducationType {
  // Formal Education
  HIGH_SCHOOL = 'high_school',
  DIPLOMA = 'diploma',
  ASSOCIATE = 'associate',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  PHD = 'phd',
  PROFESSIONAL = 'professional',
  VOCATIONAL = 'vocational',
  
  // Islamic Education
  HIFZ = 'hifz',
  AALIM = 'aalim',
  MUFTI = 'mufti',
  QARI = 'qari',
  ARABIC = 'arabic',
  ISLAMIC_STUDIES = 'islamic_studies',
  SHARIAH = 'shariah',
  HADITH = 'hadith',
  TAFSEER = 'tafseer',
  FIQH = 'fiqh',
  OTHER_ISLAMIC = 'other_islamic',
  OTHER = 'other',
}

export enum EducationCategory {
  FORMAL = 'formal',
  ISLAMIC = 'islamic',
}

export interface Education {
  id: number;
  member_id: number;
  education_type: EducationType;
  category: EducationCategory;
  degree_name: string;
  institution: string;
  location?: string;
  start_year?: number;
  end_year?: number;
  is_ongoing: boolean;
  field_of_study?: string;
  grade?: string;
  achievements?: string;
  islamic_qualification_details?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface EducationFormData {
  education_type: EducationType;
  category: EducationCategory;
  degree_name: string;
  institution: string;
  location?: string;
  start_year?: number;
  end_year?: number;
  is_ongoing: boolean;
  field_of_study?: string;
  grade?: string;
  achievements?: string;
  islamic_qualification_details?: string;
}

export const EDUCATION_TYPE_LABELS: Record<EducationType, string> = {
  // Formal Education
  [EducationType.HIGH_SCHOOL]: 'High School',
  [EducationType.DIPLOMA]: 'Diploma',
  [EducationType.ASSOCIATE]: 'Associate Degree',
  [EducationType.BACHELORS]: "Bachelor's Degree",
  [EducationType.MASTERS]: "Master's Degree",
  [EducationType.PHD]: 'Ph.D.',
  [EducationType.PROFESSIONAL]: 'Professional Certification',
  [EducationType.VOCATIONAL]: 'Vocational Training',
  
  // Islamic Education
  [EducationType.HIFZ]: 'Hifz (Quran Memorization)',
  [EducationType.AALIM]: 'Aalim Course',
  [EducationType.MUFTI]: 'Mufti Course',
  [EducationType.QARI]: 'Qari (Quran Recitation)',
  [EducationType.ARABIC]: 'Arabic Language',
  [EducationType.ISLAMIC_STUDIES]: 'Islamic Studies',
  [EducationType.SHARIAH]: 'Shariah Studies',
  [EducationType.HADITH]: 'Hadith Studies',
  [EducationType.TAFSEER]: 'Tafseer (Quranic Exegesis)',
  [EducationType.FIQH]: 'Fiqh (Islamic Jurisprudence)',
  [EducationType.OTHER_ISLAMIC]: 'Other Islamic Education',
  [EducationType.OTHER]: 'Other',
};

export const FORMAL_EDUCATION_TYPES = [
  EducationType.HIGH_SCHOOL,
  EducationType.DIPLOMA,
  EducationType.ASSOCIATE,
  EducationType.BACHELORS,
  EducationType.MASTERS,
  EducationType.PHD,
  EducationType.PROFESSIONAL,
  EducationType.VOCATIONAL,
  EducationType.OTHER,
];

export const ISLAMIC_EDUCATION_TYPES = [
  EducationType.HIFZ,
  EducationType.AALIM,
  EducationType.MUFTI,
  EducationType.QARI,
  EducationType.ARABIC,
  EducationType.ISLAMIC_STUDIES,
  EducationType.SHARIAH,
  EducationType.HADITH,
  EducationType.TAFSEER,
  EducationType.FIQH,
  EducationType.OTHER_ISLAMIC,
];