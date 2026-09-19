/**
 * Modelos de dados para Usuário e Preferências (RF-005, RF-008)
 * Conforme Seção 12 da SPEC Mestre do SmartTrip.
 * Atualizado na SPEC_AUTH.md §2.1 — campos Firebase Auth.
 */

export type TravelStyle = 'relaxed' | 'moderate' | 'intense';
export type BudgetLevel = 'budget' | 'moderate' | 'luxury';

/**
 * Papel do usuário no sistema.
 * SEGURANÇA: 'user' é atribuído no cadastro pelo código (user.service).
 * Elevação para 'admin' exige Admin SDK no servidor — jamais pelo cliente.
 */
export type UserRole = 'user' | 'admin';

export type TransportationMode = 'walking' | 'public_transit' | 'rideshare' | 'rental_car';
export type ClimatePreference = 'warm' | 'mild' | 'cool' | 'any';
export type TravelDistancePreference = 'regional' | 'national' | 'continental' | 'global';

export interface UserPreferences {
  travelStyle: TravelStyle;
  budget: BudgetLevel;
  preferredInterests: string[];
  restrictions: string[];
  currency: string;
  homeAirport?: string;
  transportationModes?: TransportationMode[];
  preferredClimate?: ClimatePreference;
  maxTravelDistance?: TravelDistancePreference;
  updatedAt?: string;
}

export interface UserProfile {
  name:              string;
  email:             string;
  avatar:            string;
  isPro?:            boolean;
  savedTripsCount?:  number;
  preferences?:      UserPreferences;
  createdAt?:        string;
  updatedAt?:        string;
  // ── Campos Firebase Auth (lidos, nunca enviados pelo cliente) ──
  uid?:              string;   // uid do Firebase Auth — sempre de auth.currentUser
  role?:             UserRole; // 'user' na criação; 'admin' só via Admin SDK
  emailVerified?:    boolean;  // espelha Firebase Auth
}
