/**
 * Modelo de dados para Viagens, Itinerários e Atividades (RF-013 a RF-021)
 * Conforme Seção 12 da SPEC Mestre do SmartTrip.
 */

import { TravelStyle, BudgetLevel } from './user';
import { WeatherForecastSummary } from './weather';

export type ActivityCategory = 'culture' | 'food' | 'nature' | 'leisure' | 'transport' | 'other';
export type TripStatus = 'draft' | 'saved' | 'completed' | 'archived';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  suggestedTime: string;       // ex: "09:30"
  estimatedDuration: string;   // ex: "2h30min"
  estimatedCost: string;       // ex: "R$ 30,00 por pessoa"
  locationName?: string;
  address?: string;
  tips?: string;
}

export interface DayShifts {
  morning: Activity[];
  afternoon: Activity[];
  night: Activity[];
}

export interface DayPlan {
  dayNumber: number;
  date: string; // "YYYY-MM-DD"
  theme: string;
  weatherHint: string;
  shifts: DayShifts;
}

export interface TripDestination {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface TripPeriod {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  totalDays: number;
}

export interface TripConfig {
  pace: TravelStyle;
  budget: BudgetLevel;
  interests: string[];
  restrictions: string[];
}

export type TripVisibility = 'private' | 'shared' | 'public';

export interface ItineraryItem {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  order: number;
  title: string;
  description: string;
  category: ActivityCategory;
  suggestedTime: string;
  estimatedDuration: string;
  estimatedCost: string;
  locationName?: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  tips?: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trip {
  id: string;
  userId: string;
  title?: string;
  destination: TripDestination;
  period: TripPeriod;
  config: TripConfig;
  weatherForecast?: WeatherForecastSummary;
  weatherSummary?: {
    tempMin: number;
    tempMax: number;
    condition: string;
    recommendation?: string;
  };
  status: TripStatus;
  visibility?: TripVisibility;
  daysCount?: number;
  totalEstimatedCost?: string;
  coverImageUrl?: string;
  generationMeta?: {
    model: string;
    promptVersion?: string;
    generatedAt?: string;
  };
  itinerary: DayPlan[];
  createdAt: string;
  updatedAt: string;
}
