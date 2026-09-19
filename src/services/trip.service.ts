/**
 * Serviço de Roteiros de Viagem e Itinerários no Cloud Firestore.
 * SPEC: SPEC_FIRESTORE.md §2.4 (trips) e §2.5 (itineraryItems)
 *
 * Caminhos:
 * - /trips/{tripId} (Coleção Raiz)
 * - /trips/{tripId}/itineraryItems/{itemId} (Subcoleção)
 *
 * REGRAS:
 * - Valida ownership em mutações: requestingUserId == trip.userId
 * - Queries usam cláusulas where('userId', '==', uid) ou where('visibility', '==', 'public')
 * - Usa serverTimestamp para createdAt e updatedAt
 * - Suporta exclusão com remoção de itens em batch
 */
import {
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  writeBatch,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db, tripsCol, tripDoc, itineraryItemsCol, itineraryItemDoc } from './firebase/firestore';
import type { Trip, ItineraryItem, TripStatus, TripVisibility } from '../types/trip';

const VALID_STATUSES: TripStatus[] = ['draft', 'saved', 'completed', 'archived'];
const VALID_VISIBILITIES: TripVisibility[] = ['private', 'shared', 'public'];

export interface CreateTripInput {
  title?: string;
  destination: Trip['destination'];
  period: Trip['period'];
  config: Trip['config'];
  weatherSummary?: Trip['weatherSummary'];
  weatherForecast?: Trip['weatherForecast'];
  status?: TripStatus;
  visibility?: TripVisibility;
  daysCount?: number;
  totalEstimatedCost?: string;
  coverImageUrl?: string;
  generationMeta?: Trip['generationMeta'];
  itinerary?: Trip['itinerary'];
}

/**
 * Cria uma nova viagem na coleção raiz /trips/{tripId}.
 */
export async function createTrip(
  userId: string,
  input: CreateTripInput,
  customTripId?: string,
): Promise<Trip> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('ID do usuário é obrigatório para criar uma viagem.');
  }

  if (!input.destination || !input.destination.name || !input.destination.country) {
    throw new Error('Destino com nome e país é obrigatório.');
  }

  if (!input.period || !input.period.startDate || !input.period.endDate) {
    throw new Error('Período de viagem com data inicial e final é obrigatório.');
  }

  if (input.period.startDate > input.period.endDate) {
    throw new Error('Data inicial não pode ser posterior à data final da viagem.');
  }

  const daysCount = input.daysCount || input.period.totalDays || 1;
  if (daysCount <= 0) {
    throw new Error('A quantidade de dias da viagem deve ser maior que zero.');
  }

  const status: TripStatus = input.status || 'saved';
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Status de viagem inválido: ${status}`);
  }

  const visibility: TripVisibility = input.visibility || 'private';
  if (!VALID_VISIBILITIES.includes(visibility)) {
    throw new Error(`Visibilidade de viagem inválida: ${visibility}`);
  }

  const colRef = tripsCol();
  const docRef = customTripId ? tripDoc(customTripId) : doc(colRef);
  const tripId = docRef.id;

  const docData = {
    ...input,
    id: tripId,
    userId,
    status,
    visibility,
    daysCount,
    itinerary: input.itinerary || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, docData);

  return {
    ...input,
    id: tripId,
    userId,
    status,
    visibility,
    daysCount,
    itinerary: input.itinerary || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Consulta uma viagem específica por ID.
 * Valida visibilidade e propriedade em relação ao solicitante.
 */
export async function getTripById(
  tripId: string,
  requestingUserId?: string,
): Promise<Trip | null> {
  if (!tripId) {
    throw new Error('ID da viagem é obrigatório.');
  }

  const ref = tripDoc(tripId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Trip & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string };

  // Validação de acesso: viagens privadas só podem ser lidas pelo autor
  const isOwner = requestingUserId && data.userId === requestingUserId;
  const isPublic = data.visibility === 'public';

  if (!isOwner && !isPublic && requestingUserId !== undefined) {
    throw new Error('Acesso negado: esta viagem é privada.');
  }

  return normalizeTrip(tripId, data);
}

/**
 * Lista as viagens de um usuário específico.
 * Utiliza cláusula WHERE direta no Firestore — nunca filtra no cliente.
 */
export async function listUserTrips(userId: string): Promise<Trip[]> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('ID do usuário é obrigatório para listar viagens.');
  }

  const q = query(
    tripsCol(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Trip & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string };
    return normalizeTrip(docSnap.id, data);
  });
}

/**
 * Lista viagens públicas para inspiração (tela /explore).
 */
export async function listPublicTrips(limitCount = 20): Promise<Trip[]> {
  const q = query(
    tripsCol(),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Trip & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string };
    return normalizeTrip(docSnap.id, data);
  });
}

/**
 * Atualiza campos de uma viagem, verificando ownership.
 */
export async function updateTrip(
  tripId: string,
  requestingUserId: string,
  updates: Partial<Omit<Trip, 'id' | 'userId' | 'createdAt'>>,
): Promise<void> {
  if (!tripId || !requestingUserId) {
    throw new Error('ID da viagem e do usuário solicitante são obrigatórios.');
  }

  const ref = tripDoc(tripId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error(`Viagem com ID ${tripId} não encontrada.`);
  }

  const currentTrip = snapshot.data() as Trip;
  if (currentTrip.userId !== requestingUserId) {
    throw new Error('Acesso negado: você não é o proprietário desta viagem.');
  }

  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    throw new Error(`Status inválido: ${updates.status}`);
  }

  if (updates.visibility && !VALID_VISIBILITIES.includes(updates.visibility)) {
    throw new Error(`Visibilidade inválida: ${updates.visibility}`);
  }

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui uma viagem e todos os seus itens de itinerário em lote (Batch).
 */
export async function deleteTrip(
  tripId: string,
  requestingUserId: string,
): Promise<void> {
  if (!tripId || !requestingUserId) {
    throw new Error('ID da viagem e do usuário solicitante são obrigatórios.');
  }

  const ref = tripDoc(tripId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error(`Viagem com ID ${tripId} não encontrada para exclusão.`);
  }

  const currentTrip = snapshot.data() as Trip;
  if (currentTrip.userId !== requestingUserId) {
    throw new Error('Acesso negado: você não é o proprietário desta viagem.');
  }

  // Deleta itens da subcoleção em batch para evitar órfãos
  const batch = writeBatch(db);
  const itemsSnapshot = await getDocs(itineraryItemsCol(tripId));

  itemsSnapshot.docs.forEach((itemDoc) => {
    batch.delete(itemDoc.ref);
  });

  // Deleta a viagem principal
  batch.delete(ref);
  await batch.commit();
}

// ── Subcoleção itineraryItems ───────────────────────────────────────────────

/**
 * Adiciona um item de atividade ao itinerário da viagem.
 */
export async function addItineraryItem(
  tripId: string,
  requestingUserId: string,
  itemData: Omit<ItineraryItem, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>,
  customItemId?: string,
): Promise<ItineraryItem> {
  if (!tripId || !requestingUserId) {
    throw new Error('tripId e requestingUserId são obrigatórios.');
  }

  const parentTrip = await tripDoc(tripId);
  const tripSnap = await getDoc(parentTrip);
  if (!tripSnap.exists()) {
    throw new Error(`Viagem com ID ${tripId} não existe.`);
  }

  if (tripSnap.data().userId !== requestingUserId) {
    throw new Error('Acesso negado: você não é o proprietário desta viagem.');
  }

  if (!itemData.title || itemData.title.trim() === '') {
    throw new Error('Título da atividade é obrigatório.');
  }

  if (itemData.dayNumber <= 0) {
    throw new Error('dayNumber deve ser maior que zero.');
  }

  const colRef = itineraryItemsCol(tripId);
  const itemRef = customItemId ? itineraryItemDoc(tripId, customItemId) : doc(colRef);
  const itemId = itemRef.id;

  const docPayload = {
    ...itemData,
    id: itemId,
    tripId,
    isCompleted: itemData.isCompleted ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(itemRef, docPayload);

  return {
    ...itemData,
    id: itemId,
    tripId,
    isCompleted: itemData.isCompleted ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lista todos os itens de itinerário de uma viagem, ordenados por dia e sequência.
 */
export async function getItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  if (!tripId) {
    throw new Error('tripId é obrigatório para consultar itens do itinerário.');
  }

  const q = query(
    itineraryItemsCol(tripId),
    orderBy('dayNumber', 'asc'),
    orderBy('order', 'asc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data() as ItineraryItem & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string };
    return normalizeItem(d.id, tripId, data);
  });
}

/**
 * Atualiza um item de itinerário específico.
 */
export async function updateItineraryItem(
  tripId: string,
  requestingUserId: string,
  itemId: string,
  updates: Partial<Omit<ItineraryItem, 'id' | 'tripId' | 'createdAt'>>,
): Promise<void> {
  const tripSnap = await getDoc(tripDoc(tripId));
  if (!tripSnap.exists() || tripSnap.data().userId !== requestingUserId) {
    throw new Error('Acesso negado ou viagem não encontrada.');
  }

  const itemRef = itineraryItemDoc(tripId, itemId);
  const itemSnap = await getDoc(itemRef);
  if (!itemSnap.exists()) {
    throw new Error(`Item ${itemId} não encontrado.`);
  }

  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui um item de itinerário específico.
 */
export async function deleteItineraryItem(
  tripId: string,
  requestingUserId: string,
  itemId: string,
): Promise<void> {
  const tripSnap = await getDoc(tripDoc(tripId));
  if (!tripSnap.exists() || tripSnap.data().userId !== requestingUserId) {
    throw new Error('Acesso negado ou viagem não encontrada.');
  }

  const itemRef = itineraryItemDoc(tripId, itemId);
  await deleteDoc(itemRef);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizeTrip(
  id: string,
  data: Trip & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string },
): Trip {
  const toIso = (v: Timestamp | string | undefined): string | undefined => {
    if (v && typeof v === 'object' && 'toDate' in v) {
      return (v as Timestamp).toDate().toISOString();
    }
    return v as string | undefined;
  };

  return {
    ...data,
    id,
    itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
    createdAt: toIso(data.createdAt) || new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) || new Date().toISOString(),
  };
}

function normalizeItem(
  id: string,
  tripId: string,
  data: ItineraryItem & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string },
): ItineraryItem {
  const toIso = (v: Timestamp | string | undefined): string | undefined => {
    if (v && typeof v === 'object' && 'toDate' in v) {
      return (v as Timestamp).toDate().toISOString();
    }
    return v as string | undefined;
  };

  return {
    ...data,
    id,
    tripId,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}
