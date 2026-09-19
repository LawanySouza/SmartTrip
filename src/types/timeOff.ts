/**
 * Modelo de dados para Períodos de Folga (RF-006, RF-007, RN-002)
 * Conforme Seção 12 da SPEC Mestre do SmartTrip.
 */

export type TimeOffType = 'vacation' | 'holiday' | 'long_weekend' | 'other';
export type TimeOffStatus = 'planned' | 'confirmed' | 'used';

export interface TimeOff {
  id: string;
  userId: string;
  title: string;
  startDate: string; // Formato ISO "YYYY-MM-DD"
  endDate: string;   // Formato ISO "YYYY-MM-DD"
  durationDays: number;
  type: TimeOffType;
  status?: TimeOffStatus;
  notes?: string;
  linkedTripId?: string;
  createdAt?: string;
  updatedAt?: string;
}
