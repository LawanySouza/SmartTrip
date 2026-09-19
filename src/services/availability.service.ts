/**
 * Serviço de Disponibilidade (Períodos de Folga) no Cloud Firestore.
 * SPEC: SPEC_FIRESTORE.md §2.3
 * Caminho: /users/{uid}/availability/{availabilityId}
 *
 * REGRAS:
 * - Valida ownership: uid verificado em todas as operações
 * - Não faz queries baixando dados de todos os usuários
 * - Usa serverTimestamp para createdAt e updatedAt
 * - Valida integridade de datas (startDate <= endDate, durationDays > 0)
 */
import {
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  doc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { availabilityCol, availabilityDoc } from './firebase/firestore';
import type { TimeOff, TimeOffType } from '../types/timeOff';

const VALID_TYPES: TimeOffType[] = ['vacation', 'holiday', 'long_weekend', 'other'];

/**
 * Cria um novo período de folga sob /users/{uid}/availability.
 */
export async function createAvailability(
  uid: string,
  data: Omit<TimeOff, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  customId?: string,
): Promise<TimeOff> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error('ID do usuário é obrigatório.');
  }

  if (!data.title || data.title.trim() === '') {
    throw new Error('Título do período de folga é obrigatório.');
  }

  if (!data.startDate || !data.endDate) {
    throw new Error('Datas de início e fim são obrigatórias.');
  }

  if (data.startDate > data.endDate) {
    throw new Error('A data de início não pode ser posterior à data de término.');
  }

  if (!data.durationDays || data.durationDays <= 0) {
    throw new Error('A duração em dias deve ser um número maior que zero.');
  }

  if (!VALID_TYPES.includes(data.type)) {
    throw new Error(`Tipo de período de folga inválido: ${data.type}`);
  }

  const colRef = availabilityCol(uid);
  const docRef = customId ? availabilityDoc(uid, customId) : doc(colRef);
  const id = docRef.id;

  const docData = {
    ...data,
    id,
    userId: uid,
    status: data.status || 'planned',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, docData);

  return {
    ...data,
    id,
    userId: uid,
    status: data.status || 'planned',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Consulta um período de folga específico pelo ID do documento.
 * Retorna null se não existir.
 */
export async function getAvailabilityById(uid: string, id: string): Promise<TimeOff | null> {
  if (!uid || !id) {
    throw new Error('UID e ID da disponibilidade são obrigatórios.');
  }

  const ref = availabilityDoc(uid, id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as TimeOff & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string };
  return normalizeAvailability(id, uid, data);
}

/**
 * Lista todos os períodos de folga do usuário, ordenados por data inicial.
 * A query é estritamente isolada na subcoleção do usuário — nunca baixa dados de outros usuários.
 */
export async function listAvailabilityByUser(uid: string): Promise<TimeOff[]> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error('ID do usuário é obrigatório para listar disponibilidade.');
  }

  const colRef = availabilityCol(uid);
  const q = query(colRef, orderBy('startDate', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as TimeOff & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string };
    return normalizeAvailability(docSnap.id, uid, data);
  });
}

/**
 * Atualiza um período de folga existente.
 * Valida consistência de datas se forem informadas.
 */
export async function updateAvailability(
  uid: string,
  id: string,
  updates: Partial<Omit<TimeOff, 'id' | 'userId' | 'createdAt'>>,
): Promise<void> {
  if (!uid || !id) {
    throw new Error('UID e ID são obrigatórios para atualização.');
  }

  // Verifica existência antes de atualizar
  const ref = availabilityDoc(uid, id);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error(`Período de folga com ID ${id} não encontrado.`);
  }

  const existingData = existing.data() as TimeOff;
  if (existingData.userId && existingData.userId !== uid) {
    throw new Error('Acesso negado: você não é o proprietário deste período de folga.');
  }

  const newStartDate = updates.startDate ?? existingData.startDate;
  const newEndDate = updates.endDate ?? existingData.endDate;

  if (newStartDate && newEndDate && newStartDate > newEndDate) {
    throw new Error('A data de início não pode ser posterior à data de término.');
  }

  if (updates.durationDays !== undefined && updates.durationDays <= 0) {
    throw new Error('A duração em dias deve ser maior que zero.');
  }

  if (updates.type && !VALID_TYPES.includes(updates.type)) {
    throw new Error(`Tipo de período de folga inválido: ${updates.type}`);
  }

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui um período de folga específico.
 */
export async function deleteAvailability(uid: string, id: string): Promise<void> {
  if (!uid || !id) {
    throw new Error('UID e ID são obrigatórios para exclusão.');
  }

  const ref = availabilityDoc(uid, id);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error(`Período de folga com ID ${id} não encontrado para exclusão.`);
  }

  const existingData = existing.data() as TimeOff;
  if (existingData.userId && existingData.userId !== uid) {
    throw new Error('Acesso negado: você não é o proprietário deste período de folga.');
  }

  await deleteDoc(ref);
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingTimeOffs: TimeOff[];
}

/**
 * Detecta conflito de sobreposição entre intervalos de folgas do usuário.
 */
export async function checkAvailabilityConflict(
  uid: string,
  startDate: string,
  endDate: string,
  excludeId?: string,
): Promise<ConflictResult> {
  const all = await listAvailabilityByUser(uid);
  const conflictingTimeOffs = all.filter((item) => {
    if (excludeId && item.id === excludeId) return false;
    return startDate <= item.endDate && endDate >= item.startDate;
  });

  return {
    hasConflict: conflictingTimeOffs.length > 0,
    conflictingTimeOffs,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizeAvailability(
  id: string,
  uid: string,
  data: TimeOff & { createdAt?: Timestamp | string; updatedAt?: Timestamp | string },
): TimeOff {
  const toIso = (v: Timestamp | string | undefined): string | undefined => {
    if (v && typeof v === 'object' && 'toDate' in v) {
      return (v as Timestamp).toDate().toISOString();
    }
    return v as string | undefined;
  };

  return {
    ...data,
    id,
    userId: uid,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}
