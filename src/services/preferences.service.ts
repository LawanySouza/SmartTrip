/**
 * Serviço de Preferências de Viagem do Usuário no Cloud Firestore.
 * SPEC: SPEC_FIRESTORE.md §2.2
 * Caminho: /users/{uid}/settings/preferences
 *
 * REGRAS:
 * - Valida ownership: uid obrigatório e verificado
 * - Valida campos contra enums permitidos
 * - Usa serverTimestamp para updatedAt
 */
import {
  getDoc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { preferencesDoc } from './firebase/firestore';
import type { UserPreferences, TravelStyle, BudgetLevel } from '../types/user';

export const DEFAULT_PREFERENCES: UserPreferences = {
  travelStyle: 'moderate',
  budget: 'moderate',
  preferredInterests: [],
  restrictions: [],
  currency: 'BRL',
};

const VALID_TRAVEL_STYLES: TravelStyle[] = ['relaxed', 'moderate', 'intense'];
const VALID_BUDGET_LEVELS: BudgetLevel[] = ['budget', 'moderate', 'luxury'];
const VALID_CLIMATES = ['warm', 'mild', 'cool', 'any'];
const VALID_DISTANCES = ['regional', 'national', 'continental', 'global'];
const VALID_TRANSPORTS = ['walking', 'public_transit', 'rideshare', 'rental_car'];

/**
 * Lê as preferências do usuário no documento /users/{uid}/settings/preferences.
 * Retorna null caso o documento ainda não exista.
 */
export async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error('ID do usuário é obrigatório para consultar preferências.');
  }

  const ref = preferencesDoc(uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as UserPreferences & { updatedAt?: Timestamp | string };
  return normalizePreferences(data);
}

/**
 * Salva ou atualiza as preferências do usuário.
 * Valida formatos e tipos antes de persistir.
 */
export async function saveUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error('ID do usuário é obrigatório para salvar preferências.');
  }

  // Validações de dados
  if (preferences.travelStyle && !VALID_TRAVEL_STYLES.includes(preferences.travelStyle)) {
    throw new Error(`Estilo de viagem inválido: ${preferences.travelStyle}`);
  }

  if (preferences.budget && !VALID_BUDGET_LEVELS.includes(preferences.budget)) {
    throw new Error(`Nível de orçamento inválido: ${preferences.budget}`);
  }

  if (preferences.preferredInterests && !Array.isArray(preferences.preferredInterests)) {
    throw new Error('Interesses preferidos devem ser um array de strings.');
  }

  if (preferences.restrictions && !Array.isArray(preferences.restrictions)) {
    throw new Error('Restrições devem ser um array de strings.');
  }

  if (preferences.preferredClimate && !VALID_CLIMATES.includes(preferences.preferredClimate)) {
    throw new Error(`Clima preferido inválido: ${preferences.preferredClimate}`);
  }

  if (preferences.maxTravelDistance && !VALID_DISTANCES.includes(preferences.maxTravelDistance)) {
    throw new Error(`Distância máxima inválida: ${preferences.maxTravelDistance}`);
  }

  if (preferences.transportationModes) {
    if (!Array.isArray(preferences.transportationModes)) {
      throw new Error('Modos de transporte devem ser um array.');
    }
    const invalidTransport = preferences.transportationModes.find((t) => !VALID_TRANSPORTS.includes(t));
    if (invalidTransport) {
      throw new Error(`Modo de transporte inválido: ${invalidTransport}`);
    }
  }

  const ref = preferencesDoc(uid);
  const dataToSave = {
    ...preferences,
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, dataToSave, { merge: true });

  const current = await getUserPreferences(uid);
  return current || { ...DEFAULT_PREFERENCES, ...preferences, updatedAt: new Date().toISOString() };
}

/**
 * Redefine as preferências do usuário para os valores padrão.
 */
export async function resetUserPreferences(uid: string): Promise<UserPreferences> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error('ID do usuário é obrigatório para redefinir preferências.');
  }

  const ref = preferencesDoc(uid);
  const dataToSave = {
    ...DEFAULT_PREFERENCES,
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, dataToSave);
  return { ...DEFAULT_PREFERENCES, updatedAt: new Date().toISOString() };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizePreferences(
  data: UserPreferences & { updatedAt?: Timestamp | string },
): UserPreferences {
  const toIso = (v: Timestamp | string | undefined): string | undefined => {
    if (v && typeof v === 'object' && 'toDate' in v) {
      return (v as Timestamp).toDate().toISOString();
    }
    return v as string | undefined;
  };

  return {
    travelStyle: data.travelStyle || DEFAULT_PREFERENCES.travelStyle,
    budget: data.budget || DEFAULT_PREFERENCES.budget,
    preferredInterests: Array.isArray(data.preferredInterests) ? data.preferredInterests : [],
    restrictions: Array.isArray(data.restrictions) ? data.restrictions : [],
    currency: data.currency || DEFAULT_PREFERENCES.currency,
    homeAirport: data.homeAirport,
    transportationModes: Array.isArray(data.transportationModes) ? data.transportationModes : [],
    preferredClimate: data.preferredClimate,
    maxTravelDistance: data.maxTravelDistance,
    updatedAt: toIso(data.updatedAt),
  };
}
