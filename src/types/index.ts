// ─── Installation ─────────────────────────────────────────────────────────────

export type WaterSource = 'Borewell' | 'Municipal' | 'Tank' | 'Other';

export interface InstallationData {
  // Step 1 — Technician
  technicianName: string;
  technicianPhone: string;

  // Step 2 — Unit linking
  heaterSerialNumber: string;
  cartridgeNumber: string;

  // Step 3 — Customer details
  customerWhatsApp: string;
  installationDate: string;       // auto-captured ISO string
  gpsLat: string;                 // auto-captured
  gpsLng: string;                 // auto-captured
  pincode: string;
  waterSource: WaterSource | '';
  waterQualityFeel: string;

  // Step 3 — Heater specs
  heaterModel: string;
  heaterCapacity: string;         // litres
  heaterWattage: string;          // watts

  // Step 3 — Usage
  peoplePerDay: string;
  bathsPerDay: string;
  additionalComments: string;

  // Step 4 — Photos
  frontPhotoUri: string | null;
  sidePhotoUri: string | null;
}

export const EMPTY_INSTALLATION: InstallationData = {
  technicianName: '',
  technicianPhone: '',
  heaterSerialNumber: '',
  cartridgeNumber: '',
  customerWhatsApp: '',
  installationDate: '',
  gpsLat: '',
  gpsLng: '',
  pincode: '',
  waterSource: '',
  waterQualityFeel: '',
  heaterModel: '',
  heaterCapacity: '',
  heaterWattage: '',
  peoplePerDay: '',
  bathsPerDay: '',
  additionalComments: '',
  frontPhotoUri: null,
  sidePhotoUri: null,
};

// ─── Survey ───────────────────────────────────────────────────────────────────

export type SurveyRating = 'better' | 'same' | 'worse';
export type SurveyChange = 'less' | 'same' | 'more';
export type ScaleDeposit = 'less' | 'same' | 'more';

export interface SurveyResponse {
  installationId: string;
  surveyRound: number;             // 1–5 (every 2 months)
  submittedAt: string;
  scaleDeposits: ScaleDeposit;
  waterFeelOnSkin: SurveyRating;
  skinDryness: SurveyChange;
  hairFeel: SurveyChange;
  soapLather: SurveyRating;
  leaksOrDamage: boolean;
  overallSatisfaction: number;     // 1–5
  comments?: string;
}

// ─── Water Quality (legacy, keep for dashboard) ──────────────────────────────

export type HardnessLevel = 'soft' | 'moderate' | 'hard' | 'very_hard';

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

// ─── Support / FAQ (used in dashboard) ───────────────────────────────────────

export interface SupportOption {
  id: string;
  label: string;
  detail: string;
  icon: string;
  action: string;
  color: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServicePlan {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
}
