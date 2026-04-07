// ─── Installation ─────────────────────────────────────────────────────────────

export type WaterSource =
  | 'Borewell'
  | 'Municipal / BWSSB'
  | 'Open Well'
  | 'River / Canal'
  | 'Rainwater Harvesting'
  | 'Water Tanker'
  | 'Mixed / Not Sure'
  | 'Other';

export type WaterHardness = '<150' | '150-300' | '300-500' | '>500';
export type HeaterAge = '<1 year' | '1-3 years' | '3-5 years' | '>5 years';
export type ScaleRating = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type UsagePattern = 'Morning only' | 'Evening only' | 'Morning + Evening' | 'All day';
export type TempSetting = 'Low (<55°C)' | 'Medium (55-65°C)' | 'High (>65°C)';

export interface InstallationData {
  // Step 1 — Technician
  technicianName: string;
  technicianPhone: string;

  // Step 2 — Unit linking
  heaterSerialNumber: string;
  cartridgeNumber: string;
  cartridgeBatchCode: string;
  waterSampleCollected: boolean;

  // Step 3 — Customer details
  customerWhatsApp: string;
  installationDate: string;       // auto-captured ISO string
  gpsLat: string;                 // auto-captured
  gpsLng: string;                 // auto-captured
  gpsAccuracyMeters: number | null; // auto-captured
  pincode: string;
  waterSource: WaterSource | '';
  waterHardnessEstimate: WaterHardness | '';
  waterQualityFeel: string;

  // Step 3 — Heater specs
  heaterModel: string;
  heaterCapacity: string;         // litres
  heaterWattage: string;          // watts
  heaterAgeYears: HeaterAge | '';
  hotWaterTemperatureSetting: TempSetting | '';

  // Step 3 — Usage
  peoplePerDay: string;
  bathsPerDay: string;
  heaterUsagePattern: UsagePattern | '';
  additionalComments: string;

  // Step 3 — Installation Baseline
  existingScaleVisualRating: ScaleRating | '';

  // Step 4 — Photos
  frontPhotoUri: string | null;
  sidePhotoUri: string | null;
  scalePhotoUri: string | null;
}

export const EMPTY_INSTALLATION: InstallationData = {
  technicianName: '',
  technicianPhone: '',
  heaterSerialNumber: '',
  cartridgeNumber: '',
  cartridgeBatchCode: '',
  waterSampleCollected: false,
  customerWhatsApp: '',
  installationDate: '',
  gpsLat: '',
  gpsLng: '',
  gpsAccuracyMeters: null,
  pincode: '',
  waterSource: '',
  waterHardnessEstimate: '',
  waterQualityFeel: '',
  heaterModel: '',
  heaterCapacity: '',
  heaterWattage: '',
  heaterAgeYears: '',
  hotWaterTemperatureSetting: '',
  peoplePerDay: '',
  bathsPerDay: '',
  heaterUsagePattern: '',
  additionalComments: '',
  existingScaleVisualRating: '',
  frontPhotoUri: null,
  sidePhotoUri: null,
  scalePhotoUri: null,
};

// ─── Survey ───────────────────────────────────────────────────────────────────

export type SurveyRating = 'better' | 'same' | 'worse';
export type SurveyChange = 'less' | 'same' | 'more';
export type ScaleDeposit = 'less' | 'same' | 'more';
export type CartridgeCondition = 'Good' | 'Discoloured' | 'Damaged' | 'Missing';

export interface SurveyResponse {
  installationId: string;
  surveyRound: number;             // 1–5 (every 2 months)
  submittedAt: string;
  cartridgeConfirmed: boolean;     // first question — is cartridge still installed?
  treatmentActive: boolean;        // false if cartridge removed; flags remaining responses
  scaleDeposits: ScaleDeposit;
  waterFeelOnSkin: SurveyRating;  // covers both feel and dryness
  hairFeel: SurveyChange;
  soapLather: SurveyRating;
  leaksOrDamage: boolean;
  overallSatisfaction: number;     // 1–5
  cartridgeVisualCondition: CartridgeCondition | '';
  technicianScaleObservation: ScaleDeposit | '';  // objective tap aerator observation
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
