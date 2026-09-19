/**
 * Instância do Cloud Firestore e helpers de coleção tipados.
 * SPEC: SPEC_FIRESTORE.md (Modelagem Firestore MVP)
 *
 * Helpers centralizam os caminhos e referências — evita strings mágicas espalhadas.
 */
import {
  getFirestore,
  collection,
  type CollectionReference,
  type DocumentReference,
  doc,
} from 'firebase/firestore';
import app from './config';
import type { UserProfile, UserPreferences } from '../../types/user';
import type { TimeOff } from '../../types/timeOff';
import type { Trip, ItineraryItem } from '../../types/trip';

export const db = getFirestore(app);

// ── 1. users: /users/{uid} ───────────────────────────────────────────────────
export const usersCol = () =>
  collection(db, 'users') as CollectionReference<UserProfile>;

export const userDoc = (uid: string) =>
  doc(db, 'users', uid) as DocumentReference<UserProfile>;

// ── 2. preferences: /users/{uid}/settings/preferences ─────────────────────────
export const preferencesDoc = (uid: string) =>
  doc(db, 'users', uid, 'settings', 'preferences') as DocumentReference<UserPreferences>;

// ── 3. availability: /users/{uid}/availability/{availabilityId} ───────────────
export const availabilityCol = (uid: string) =>
  collection(db, 'users', uid, 'availability') as CollectionReference<TimeOff>;

export const availabilityDoc = (uid: string, id: string) =>
  doc(db, 'users', uid, 'availability', id) as DocumentReference<TimeOff>;

// ── 4. trips: /trips/{tripId} (Coleção Raiz) ──────────────────────────────────
export const tripsCol = () =>
  collection(db, 'trips') as CollectionReference<Trip>;

export const tripDoc = (tripId: string) =>
  doc(db, 'trips', tripId) as DocumentReference<Trip>;

// ── 5. itineraryItems: /trips/{tripId}/itineraryItems/{itemId} ─────────────────
export const itineraryItemsCol = (tripId: string) =>
  collection(db, 'trips', tripId, 'itineraryItems') as CollectionReference<ItineraryItem>;

export const itineraryItemDoc = (tripId: string, itemId: string) =>
  doc(db, 'trips', tripId, 'itineraryItems', itemId) as DocumentReference<ItineraryItem>;
