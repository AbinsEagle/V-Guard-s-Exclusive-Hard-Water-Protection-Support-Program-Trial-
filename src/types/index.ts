// ─── Water Quality ────────────────────────────────────────────────────────────

export type HardnessLevel = 'soft' | 'moderate' | 'hard' | 'very_hard';

export interface WaterData {
  hardnessLevel: HardnessLevel;
  tds: number;           // Total Dissolved Solids in ppm
  ph: number;
  deviceName: string;
  filterHealth: number;  // 0–100 percentage
  nextServiceDate: string;
  lastUpdated: string;
  isActive: boolean;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  createdAt: string;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface ServicePlan {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ServiceVisit {
  id: string;
  date: string;
  technicianName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// ─── Support ──────────────────────────────────────────────────────────────────

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
