/**
 * Testes unitários — Camada de Persistência Cloud Firestore.
 * SPEC: SPEC_FIRESTORE.md (users, preferences, availability, trips, itineraryItems)
 *
 * Cenários Obrigatórios:
 * 1. Criar (create)
 * 2. Ler (read)
 * 3. Atualizar (update)
 * 4. Excluir (delete)
 * 5. Usuário A vs. Usuário B (isolamento de propriedade e permissões)
 * 6. Documento inexistente (tratamento gracioso de null ou exceção clara)
 * 7. Dados inválidos (rejeição de enums incorretos, datas invertidas, durações <= 0)
 *
 * REGRAS DE ARQUITETURA:
 * - Consultas nunca baixam dados de todos os usuários
 * - serverTimestamp() é utilizado para createdAt e updatedAt
 * - Validação estrita de ownership antes de mutações
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// ── Mock de Firebase App e Firestore ────────────────────────────────────────

const mockStore = new Map<string, any>();

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps:       vi.fn(() => []),
  getApp:        vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => {
  const getDocMock = vi.fn(async (docRef: any) => {
    const data = mockStore.get(docRef.path);
    return {
      exists: () => !!data,
      data: () => data,
      id: docRef.id,
      ref: docRef,
    };
  });

  const setDocMock = vi.fn(async (docRef: any, data: any, options?: any) => {
    if (options?.merge && mockStore.has(docRef.path)) {
      const existing = mockStore.get(docRef.path);
      mockStore.set(docRef.path, { ...existing, ...data });
    } else {
      mockStore.set(docRef.path, data);
    }
  });

  const updateDocMock = vi.fn(async (docRef: any, updates: any) => {
    const existing = mockStore.get(docRef.path);
    if (!existing) {
      throw new Error(`No document to update: ${docRef.path}`);
    }
    mockStore.set(docRef.path, { ...existing, ...updates });
  });

  const deleteDocMock = vi.fn(async (docRef: any) => {
    mockStore.delete(docRef.path);
  });

  const getDocsMock = vi.fn(async (queryOrCol: any) => {
    const colPath = queryOrCol.path || queryOrCol.colPath;
    const docs: any[] = [];

    for (const [path, data] of mockStore.entries()) {
      if (path.startsWith(colPath + '/')) {
        const sub = path.slice(colPath.length + 1);
        if (!sub.includes('/')) {
          // Filtro simulado de where se presente
          if (queryOrCol.filters && queryOrCol.filters.length > 0) {
            const matchesAll = queryOrCol.filters.every((f: any) => data[f.field] === f.value);
            if (matchesAll) {
              docs.push({ id: sub, data: () => data, ref: { path } });
            }
          } else {
            docs.push({ id: sub, data: () => data, ref: { path } });
          }
        }
      }
    }

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
    };
  });

  const collectionMock = vi.fn((_db: any, ...segments: string[]) => {
    const path = segments.join('/');
    return { path, type: 'collection' };
  });

  const docMock = vi.fn((parentOrDb: any, ...segments: string[]) => {
    let path = '';
    if (typeof parentOrDb === 'string') {
      path = [parentOrDb, ...segments].join('/');
    } else if (parentOrDb?.path) {
      path = [parentOrDb.path, ...segments].join('/');
    } else {
      path = segments.join('/');
    }
    const id = segments.length > 0 ? segments[segments.length - 1] : `gen_${Math.random().toString(36).slice(2, 9)}`;
    if (segments.length === 0) {
      path = `${path}/${id}`;
    }
    return { path, id, type: 'document' };
  });

  const queryMock = vi.fn((colRef: any, ...clauses: any[]) => {
    const filters = clauses.filter((c: any) => c?.type === 'where');
    const orderings = clauses.filter((c: any) => c?.type === 'orderBy');
    return {
      colPath: colRef.path,
      filters,
      orderings,
      type: 'query',
    };
  });

  const whereMock = vi.fn((field: string, op: string, value: any) => ({
    type: 'where',
    field,
    op,
    value,
  }));

  const orderByMock = vi.fn((field: string, direction = 'asc') => ({
    type: 'orderBy',
    field,
    direction,
  }));

  const limitMock = vi.fn((count: number) => ({
    type: 'limit',
    count,
  }));

  const writeBatchMock = vi.fn(() => {
    const operations: (() => void)[] = [];
    return {
      set: (ref: any, data: any) => operations.push(() => mockStore.set(ref.path, data)),
      delete: (ref: any) => operations.push(() => mockStore.delete(ref.path)),
      commit: async () => {
        operations.forEach((op) => op());
      },
    };
  });

  return {
    getFirestore:    vi.fn(() => ({})),
    collection:      collectionMock,
    doc:             docMock,
    getDoc:          getDocMock,
    setDoc:          setDocMock,
    updateDoc:       updateDocMock,
    deleteDoc:       deleteDocMock,
    getDocs:         getDocsMock,
    query:           queryMock,
    where:           whereMock,
    orderBy:         orderByMock,
    limit:           limitMock,
    writeBatch:      writeBatchMock,
    serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  };
});

// ── Import dos serviços após mocks ──────────────────────────────────────────

import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from '../../user.service';

import {
  getUserPreferences,
  saveUserPreferences,
  resetUserPreferences,
  DEFAULT_PREFERENCES,
} from '../../preferences.service';

import {
  createAvailability,
  getAvailabilityById,
  listAvailabilityByUser,
  updateAvailability,
  deleteAvailability,
} from '../../availability.service';

import {
  createTrip,
  getTripById,
  listUserTrips,
  listPublicTrips,
  updateTrip,
  deleteTrip,
  addItineraryItem,
  getItineraryItems,
  updateItineraryItem,
  deleteItineraryItem,
} from '../../trip.service';

// ── Usuários de Teste ───────────────────────────────────────────────────────

const USER_ALICE = 'uid_alice_123';
const USER_BOB = 'uid_bob_456';

// ── Início dos Testes ───────────────────────────────────────────────────────

describe('Camada de Persistência Firestore — SmartTrip MVP', () => {
  beforeEach(() => {
    mockStore.clear();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. CRIAR (Create)
  // =========================================================================
  describe('1. Operações de Criação (Create)', () => {
    it('deve criar perfil de usuário em /users/{uid} com role padrão "user"', async () => {
      const profile = await createUserProfile(USER_ALICE, 'Alice Silva', 'alice@test.com');

      expect(profile.uid).toBe(USER_ALICE);
      expect(profile.role).toBe('user');
      expect(profile.isPro).toBe(false);
      expect(mockStore.has(`users/${USER_ALICE}`)).toBe(true);
    });

    it('deve criar preferências em /users/{uid}/settings/preferences', async () => {
      const prefs = await saveUserPreferences(USER_ALICE, {
        travelStyle: 'relaxed',
        budget: 'luxury',
        preferredInterests: ['Gastronomia', 'Praias'],
      });

      expect(prefs.travelStyle).toBe('relaxed');
      expect(prefs.budget).toBe('luxury');
      expect(mockStore.has(`users/${USER_ALICE}/settings/preferences`)).toBe(true);
    });

    it('deve criar período de folga em subcoleção /users/{uid}/availability', async () => {
      const timeOff = await createAvailability(
        USER_ALICE,
        {
          title: 'Férias de Julho',
          startDate: '2026-07-01',
          endDate: '2026-07-15',
          durationDays: 15,
          type: 'vacation',
        },
        'folga_julho_2026',
      );

      expect(timeOff.id).toBe('folga_julho_2026');
      expect(timeOff.userId).toBe(USER_ALICE);
      expect(mockStore.has(`users/${USER_ALICE}/availability/folga_julho_2026`)).toBe(true);
    });

    it('deve criar viagem na coleção raiz /trips/{tripId}', async () => {
      const trip = await createTrip(
        USER_ALICE,
        {
          destination: { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6, longitude: -58.3 },
          period: { startDate: '2026-10-01', endDate: '2026-10-06', totalDays: 6 },
          config: { pace: 'moderate', budget: 'moderate', interests: ['Cultura'], restrictions: [] },
          status: 'saved',
          visibility: 'private',
        },
        'trip_bue_001',
      );

      expect(trip.id).toBe('trip_bue_001');
      expect(trip.userId).toBe(USER_ALICE);
      expect(trip.visibility).toBe('private');
      expect(mockStore.has('trips/trip_bue_001')).toBe(true);
    });

    it('deve adicionar item de itinerário em subcoleção /trips/{tripId}/itineraryItems/{itemId}', async () => {
      // Cria a viagem pai primeiro
      await createTrip(
        USER_ALICE,
        {
          destination: { name: 'Paris', country: 'França', latitude: 48.8, longitude: 2.3 },
          period: { startDate: '2026-08-01', endDate: '2026-08-05', totalDays: 5 },
          config: { pace: 'moderate', budget: 'luxury', interests: [], restrictions: [] },
        },
        'trip_paris_001',
      );

      const item = await addItineraryItem(
        'trip_paris_001',
        USER_ALICE,
        {
          dayNumber: 1,
          date: '2026-08-01',
          shift: 'morning',
          order: 1,
          title: 'Torre Eiffel',
          description: 'Subida e fotos panorâmicas',
          category: 'culture',
          suggestedTime: '09:00',
          estimatedDuration: '2h',
          estimatedCost: '€ 30,00',
          isCompleted: false,
        },
        'item_eiffel_001',
      );

      expect(item.id).toBe('item_eiffel_001');
      expect(item.tripId).toBe('trip_paris_001');
      expect(mockStore.has('trips/trip_paris_001/itineraryItems/item_eiffel_001')).toBe(true);
    });
  });

  // =========================================================================
  // 2. LER (Read)
  // =========================================================================
  describe('2. Operações de Leitura (Read)', () => {
    it('deve ler perfil existente do usuário', async () => {
      await createUserProfile(USER_ALICE, 'Alice Silva', 'alice@test.com');
      const profile = await getUserProfile(USER_ALICE);

      expect(profile).not.toBeNull();
      expect(profile?.name).toBe('Alice Silva');
      expect(profile?.email).toBe('alice@test.com');
    });

    it('deve ler preferências do usuário', async () => {
      await saveUserPreferences(USER_ALICE, { travelStyle: 'intense', currency: 'EUR' });
      const prefs = await getUserPreferences(USER_ALICE);

      expect(prefs).not.toBeNull();
      expect(prefs?.travelStyle).toBe('intense');
      expect(prefs?.currency).toBe('EUR');
    });

    it('deve listar períodos de folga do usuário ordenados por data inicial', async () => {
      await createAvailability(USER_ALICE, {
        title: 'Folga 1',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        durationDays: 3,
        type: 'long_weekend',
      }, 'f1');

      await createAvailability(USER_ALICE, {
        title: 'Folga 2',
        startDate: '2026-11-15',
        endDate: '2026-11-20',
        durationDays: 5,
        type: 'vacation',
      }, 'f2');

      const list = await listAvailabilityByUser(USER_ALICE);
      expect(list.length).toBe(2);
      expect(list.map(f => f.id)).toContain('f1');
      expect(list.map(f => f.id)).toContain('f2');
    });

    it('deve listar viagens do usuário usando cláusula where(userId == uid)', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Roma', country: 'Itália', latitude: 41.9, longitude: 12.5 },
        period: { startDate: '2026-09-01', endDate: '2026-09-07', totalDays: 7 },
        config: { pace: 'relaxed', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_roma');

      const userTrips = await listUserTrips(USER_ALICE);
      expect(userTrips.length).toBe(1);
      expect(userTrips[0].id).toBe('trip_roma');
    });

    it('deve listar viagens públicas para tela de exploração', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1 },
        period: { startDate: '2026-06-01', endDate: '2026-06-05', totalDays: 5 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
        visibility: 'public',
      }, 'trip_lisboa_pub');

      const publicTrips = await listPublicTrips();
      expect(publicTrips.length).toBe(1);
      expect(publicTrips[0].id).toBe('trip_lisboa_pub');
    });

    it('deve listar itens de itinerário ordenados por dia e sequência', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Madrid', country: 'Espanha', latitude: 40.4, longitude: -3.7 },
        period: { startDate: '2026-04-01', endDate: '2026-04-03', totalDays: 3 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_madrid');

      await addItineraryItem('trip_madrid', USER_ALICE, {
        dayNumber: 1,
        date: '2026-04-01',
        shift: 'morning',
        order: 1,
        title: 'Museu do Prado',
        description: 'Pinturas clássicas',
        category: 'culture',
        suggestedTime: '10:00',
        estimatedDuration: '2h',
        estimatedCost: '€ 15,00',
        isCompleted: false,
      }, 'item_prado');

      const items = await getItineraryItems('trip_madrid');
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('Museu do Prado');
    });
  });

  // =========================================================================
  // 3. ATUALIZAR (Update)
  // =========================================================================
  describe('3. Operações de Atualização (Update)', () => {
    it('deve atualizar campos do perfil sem sobrescrever dados imutáveis', async () => {
      await createUserProfile(USER_ALICE, 'Alice Silva', 'alice@test.com');

      await updateUserProfile(USER_ALICE, { name: 'Alice Silva Santos', savedTripsCount: 4 });

      const updated = await getUserProfile(USER_ALICE);
      expect(updated?.name).toBe('Alice Silva Santos');
      expect(updated?.savedTripsCount).toBe(4);
      expect(updated?.email).toBe('alice@test.com'); // preservado
    });

    it('deve atualizar preferências parciais mantendo valores não editados', async () => {
      await saveUserPreferences(USER_ALICE, { travelStyle: 'relaxed', currency: 'USD' });
      await saveUserPreferences(USER_ALICE, { budget: 'luxury' });

      const prefs = await getUserPreferences(USER_ALICE);
      expect(prefs?.travelStyle).toBe('relaxed');
      expect(prefs?.budget).toBe('luxury');
      expect(prefs?.currency).toBe('USD');
    });

    it('deve atualizar período de folga existente', async () => {
      await createAvailability(USER_ALICE, {
        title: 'Férias de Julho',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        durationDays: 15,
        type: 'vacation',
      }, 'folga_julho');

      await updateAvailability(USER_ALICE, 'folga_julho', {
        title: 'Férias de Julho (Alterado)',
        durationDays: 16,
      });

      const updated = await getAvailabilityById(USER_ALICE, 'folga_julho');
      expect(updated?.title).toBe('Férias de Julho (Alterado)');
      expect(updated?.durationDays).toBe(16);
    });

    it('deve atualizar status da viagem pelo proprietário', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Tóquio', country: 'Japão', latitude: 35.6, longitude: 139.6 },
        period: { startDate: '2026-11-01', endDate: '2026-11-10', totalDays: 10 },
        config: { pace: 'intense', budget: 'luxury', interests: [], restrictions: [] },
        status: 'draft',
      }, 'trip_tokyo');

      await updateTrip('trip_tokyo', USER_ALICE, { status: 'completed' });

      const updated = await getTripById('trip_tokyo', USER_ALICE);
      expect(updated?.status).toBe('completed');
    });

    it('deve atualizar status isCompleted de um item de itinerário', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Berlim', country: 'Alemanha', latitude: 52.5, longitude: 13.4 },
        period: { startDate: '2026-05-01', endDate: '2026-05-04', totalDays: 4 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_berlim');

      await addItineraryItem('trip_berlim', USER_ALICE, {
        dayNumber: 1,
        date: '2026-05-01',
        shift: 'afternoon',
        order: 1,
        title: 'Portão de Brandemburgo',
        description: 'Passeio a pé',
        category: 'culture',
        suggestedTime: '15:00',
        estimatedDuration: '1h',
        estimatedCost: 'Grátis',
        isCompleted: false,
      }, 'item_brandemburgo');

      await updateItineraryItem('trip_berlim', USER_ALICE, 'item_brandemburgo', { isCompleted: true });

      const items = await getItineraryItems('trip_berlim');
      expect(items[0].isCompleted).toBe(true);
    });
  });

  // =========================================================================
  // 4. EXCLUIR (Delete)
  // =========================================================================
  describe('4. Operações de Exclusão (Delete)', () => {
    it('deve excluir período de folga do usuário', async () => {
      await createAvailability(USER_ALICE, {
        title: 'Folga a Deletar',
        startDate: '2026-03-01',
        endDate: '2026-03-02',
        durationDays: 2,
        type: 'other',
      }, 'folga_delete');

      expect(mockStore.has(`users/${USER_ALICE}/availability/folga_delete`)).toBe(true);

      await deleteAvailability(USER_ALICE, 'folga_delete');

      expect(mockStore.has(`users/${USER_ALICE}/availability/folga_delete`)).toBe(false);
      const res = await getAvailabilityById(USER_ALICE, 'folga_delete');
      expect(res).toBeNull();
    });

    it('deve excluir viagem e seus itens em lote (Batch Delete)', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Santiago', country: 'Chile', latitude: -33.4, longitude: -70.6 },
        period: { startDate: '2026-09-10', endDate: '2026-09-15', totalDays: 6 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_santiago');

      await addItineraryItem('trip_santiago', USER_ALICE, {
        dayNumber: 1,
        date: '2026-09-10',
        shift: 'morning',
        order: 1,
        title: 'Cerro San Cristóbal',
        description: 'Funicular e mirante',
        category: 'nature',
        suggestedTime: '10:00',
        estimatedDuration: '2h',
        estimatedCost: 'CLP 8000',
        isCompleted: false,
      }, 'item_cerro');

      expect(mockStore.has('trips/trip_santiago')).toBe(true);
      expect(mockStore.has('trips/trip_santiago/itineraryItems/item_cerro')).toBe(true);

      await deleteTrip('trip_santiago', USER_ALICE);

      expect(mockStore.has('trips/trip_santiago')).toBe(false);
      expect(mockStore.has('trips/trip_santiago/itineraryItems/item_cerro')).toBe(false);
    });

    it('deve excluir item de itinerário específico', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Cancún', country: 'México', latitude: 21.1, longitude: -86.8 },
        period: { startDate: '2026-12-01', endDate: '2026-12-07', totalDays: 7 },
        config: { pace: 'relaxed', budget: 'luxury', interests: [], restrictions: [] },
      }, 'trip_cancun');

      await addItineraryItem('trip_cancun', USER_ALICE, {
        dayNumber: 1,
        date: '2026-12-01',
        shift: 'morning',
        order: 1,
        title: 'Praia Delfines',
        description: 'Descanso na praia',
        category: 'leisure',
        suggestedTime: '10:00',
        estimatedDuration: '3h',
        estimatedCost: 'Grátis',
        isCompleted: false,
      }, 'item_delfines');

      await deleteItineraryItem('trip_cancun', USER_ALICE, 'item_delfines');

      expect(mockStore.has('trips/trip_cancun/itineraryItems/item_delfines')).toBe(false);
    });
  });

  // =========================================================================
  // 5. USUÁRIO A vs. USUÁRIO B (Ownership & Isolation)
  // =========================================================================
  describe('5. Usuário A versus Usuário B (Isolamento de Dados e Autorização)', () => {
    it('Usuário B NÃO deve conseguir atualizar viagem do Usuário A', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Viena', country: 'Áustria', latitude: 48.2, longitude: 16.3 },
        period: { startDate: '2026-05-10', endDate: '2026-05-15', totalDays: 6 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_viena');

      await expect(
        updateTrip('trip_viena', USER_BOB, { status: 'archived' })
      ).rejects.toThrow('Acesso negado: você não é o proprietário desta viagem.');
    });

    it('Usuário B NÃO deve conseguir excluir viagem do Usuário A', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Praga', country: 'República Tcheca', latitude: 50.0, longitude: 14.4 },
        period: { startDate: '2026-06-10', endDate: '2026-06-15', totalDays: 6 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_praga');

      await expect(
        deleteTrip('trip_praga', USER_BOB)
      ).rejects.toThrow('Acesso negado: você não é o proprietário desta viagem.');

      // Viagem de Alice deve permanecer intacta
      expect(mockStore.has('trips/trip_praga')).toBe(true);
    });

    it('Usuário B NÃO deve conseguir adicionar item na viagem do Usuário A', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Bruxelas', country: 'Bélgica', latitude: 50.8, longitude: 4.3 },
        period: { startDate: '2026-07-10', endDate: '2026-07-14', totalDays: 5 },
        config: { pace: 'relaxed', budget: 'moderate', interests: [], restrictions: [] },
      }, 'trip_bruxelas');

      await expect(
        addItineraryItem('trip_bruxelas', USER_BOB, {
          dayNumber: 1,
          date: '2026-07-10',
          shift: 'morning',
          order: 1,
          title: 'Grand Place',
          description: 'Visita à praça',
          category: 'culture',
          suggestedTime: '10:00',
          estimatedDuration: '1h',
          estimatedCost: 'Grátis',
          isCompleted: false,
        })
      ).rejects.toThrow('Acesso negado: você não é o proprietário desta viagem.');
    });

    it('Usuário B NÃO deve conseguir acessar viagem privada do Usuário A', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Amsterdã', country: 'Holanda', latitude: 52.3, longitude: 4.9 },
        period: { startDate: '2026-08-10', endDate: '2026-08-15', totalDays: 6 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
        visibility: 'private',
      }, 'trip_amsterda');

      await expect(
        getTripById('trip_amsterda', USER_BOB)
      ).rejects.toThrow('Acesso negado: esta viagem é privada.');
    });

    it('listUserTrips do Usuário A não deve retornar viagens do Usuário B', async () => {
      await createTrip(USER_ALICE, {
        destination: { name: 'Londres', country: 'Reino Unido', latitude: 51.5, longitude: -0.1 },
        period: { startDate: '2026-09-01', endDate: '2026-09-05', totalDays: 5 },
        config: { pace: 'intense', budget: 'luxury', interests: [], restrictions: [] },
      }, 'trip_londres_alice');

      await createTrip(USER_BOB, {
        destination: { name: 'Dublin', country: 'Irlanda', latitude: 53.3, longitude: -6.2 },
        period: { startDate: '2026-09-01', endDate: '2026-09-05', totalDays: 5 },
        config: { pace: 'relaxed', budget: 'budget', interests: [], restrictions: [] },
      }, 'trip_dublin_bob');

      const aliceTrips = await listUserTrips(USER_ALICE);
      const bobTrips = await listUserTrips(USER_BOB);

      expect(aliceTrips.map(t => t.id)).toEqual(['trip_londres_alice']);
      expect(bobTrips.map(t => t.id)).toEqual(['trip_dublin_bob']);
    });
  });

  // =========================================================================
  // 6. DOCUMENTO INEXISTENTE (Not Found Handling)
  // =========================================================================
  describe('6. Tratamento de Documentos Inexistentes', () => {
    it('getUserProfile deve retornar null para UID não cadastrado', async () => {
      const res = await getUserProfile('uid_fantasma');
      expect(res).toBeNull();
    });

    it('getUserPreferences deve retornar null quando ainda não configurado', async () => {
      const res = await getUserPreferences('uid_fantasma');
      expect(res).toBeNull();
    });

    it('getAvailabilityById deve retornar null para ID inexistente', async () => {
      const res = await getAvailabilityById(USER_ALICE, 'folga_inexistente');
      expect(res).toBeNull();
    });

    it('getTripById deve retornar null para ID inexistente', async () => {
      const res = await getTripById('trip_inexistente', USER_ALICE);
      expect(res).toBeNull();
    });

    it('updateAvailability deve lançar erro claro para ID inexistente', async () => {
      await expect(
        updateAvailability(USER_ALICE, 'folga_inexistente', { title: 'Novo' })
      ).rejects.toThrow('Período de folga com ID folga_inexistente não encontrado.');
    });

    it('updateTrip deve lançar erro claro para viagem inexistente', async () => {
      await expect(
        updateTrip('trip_inexistente', USER_ALICE, { status: 'completed' })
      ).rejects.toThrow('Viagem com ID trip_inexistente não encontrada.');
    });

    it('deleteAvailability deve lançar erro claro para ID inexistente', async () => {
      await expect(
        deleteAvailability(USER_ALICE, 'folga_inexistente')
      ).rejects.toThrow('Período de folga com ID folga_inexistente não encontrado para exclusão.');
    });
  });

  // =========================================================================
  // 7. DADOS INVÁLIDOS (Validation & Rejection)
  // =========================================================================
  describe('7. Validação de Dados Inválidos', () => {
    it('deve rejeitar preferências com travelStyle inválido', async () => {
      await expect(
        saveUserPreferences(USER_ALICE, { travelStyle: 'ultra-speed' as any })
      ).rejects.toThrow('Estilo de viagem inválido: ultra-speed');
    });

    it('deve rejeitar preferências com budget inválido', async () => {
      await expect(
        saveUserPreferences(USER_ALICE, { budget: 'free' as any })
      ).rejects.toThrow('Nível de orçamento inválido: free');
    });

    it('deve rejeitar período de folga com data inicial posterior à data final', async () => {
      await expect(
        createAvailability(USER_ALICE, {
          title: 'Datas Invertidas',
          startDate: '2026-10-20',
          endDate: '2026-10-10', // Erro: posterior
          durationDays: 5,
          type: 'vacation',
        })
      ).rejects.toThrow('A data de início não pode ser posterior à data de término.');
    });

    it('deve rejeitar período de folga com durationDays <= 0', async () => {
      await expect(
        createAvailability(USER_ALICE, {
          title: 'Duração Zero',
          startDate: '2026-10-10',
          endDate: '2026-10-15',
          durationDays: 0,
          type: 'vacation',
        })
      ).rejects.toThrow('A duração em dias deve ser um número maior que zero.');
    });

    it('deve rejeitar criação de viagem sem destino ou país', async () => {
      await expect(
        createTrip(USER_ALICE, {
          destination: { name: '', country: '', latitude: 0, longitude: 0 },
          period: { startDate: '2026-10-01', endDate: '2026-10-05', totalDays: 5 },
          config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
        })
      ).rejects.toThrow('Destino com nome e país é obrigatório.');
    });

    it('deve rejeitar criação de viagem com data inicial posterior à data final', async () => {
      await expect(
        createTrip(USER_ALICE, {
          destination: { name: 'Roma', country: 'Itália', latitude: 41.9, longitude: 12.5 },
          period: { startDate: '2026-11-20', endDate: '2026-11-10', totalDays: 5 }, // Invertido
          config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
        })
      ).rejects.toThrow('Data inicial não pode ser posterior à data final da viagem.');
    });

    it('deve rejeitar status de viagem inválido', async () => {
      await expect(
        createTrip(USER_ALICE, {
          destination: { name: 'Roma', country: 'Itália', latitude: 41.9, longitude: 12.5 },
          period: { startDate: '2026-11-10', endDate: '2026-11-15', totalDays: 5 },
          config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
          status: 'invalid_status' as any,
        })
      ).rejects.toThrow('Status de viagem inválido: invalid_status');
    });
  });
});
