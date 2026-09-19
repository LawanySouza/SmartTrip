/**
 * Ponto de entrada central de tipos do SmartTrip.
 * Re-exporta contratos da SPEC Mestre e tipos de navegação da UI.
 */

// Modelos centrais da SPEC Mestre
export * from './user';
export * from './timeOff';
export * from './weather';
export * from './trip';

// Rotas homologadas na SPEC de Interface
export type ScreenType =
  | '/'
  | '/login'
  | '/register'
  | '/dashboard'
  | '/profile'
  | '/availability'
  | '/explore'
  | '/trips'
  | '/trips/[id]'
  // Aliases para compatibilidade legada
  | 'home'
  | 'new_trip'
  | 'itinerary'
  | 'trip_details'
  | 'upgrade'
  | 'checkout'
  | 'success'
  | 'login'
  | 'register'
  | 'forgot_password';

// Estados demonstráveis de interface para inspeção da SPEC
export type DemoStateType = 'normal' | 'empty' | 'loading' | 'error';

export interface WeatherDay {
  dayName: string;
  dateStr: string;
  temp: number;
  condition: 'sunny' | 'partly_cloudy' | 'rain';
  icon: string;
  alert?: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  badge?: string;
  category: string;
  rating?: number;
  price?: string;
  tip?: string;
  imageUrl?: string;
  location: string;
}

export interface SavedTrip {
  id: string;
  title: string;
  location: string;
  duration: string;
  imageUrl: string;
  tag?: string;
  discount?: string;
  isUpcoming?: boolean;
  progress?: number;
  spotsCount?: number;
  budgetTotal?: number;
  pendingTasks?: number;
}

export interface POIItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rating: number;
  selected?: boolean;
}
