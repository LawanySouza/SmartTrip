/**
 * Testes unitários e de integração — Períodos de Folga e Preferências de Viagem.
 * SPEC: SPEC_DISPONIBILIDADE_E_PREFERENCIAS.md
 *
 * Cenários Testados:
 * 1. Período válido (criação e cálculo de duração)
 * 2. Datas invertidas (rejeição tanto na criação quanto na edição)
 * 3. Campos ausentes (título vazio, datas ausentes, UID de sessão ausente)
 * 4. Edição (mutação de título, datas, notas e tipo)
 * 5. Exclusão (remoção de folga)
 * 6. Persistência após reload (leitura subsequente a partir do Firestore)
 * 7. Tentativa de alterar/excluir registro alheio (Usuário B tentando modificar registro de Usuário A)
 * 8. Preferências vazias (comportamento com payload vazio e reset de padrões)
 * 9. Seleção múltipla (interesses e modos de transporte aceitos)
 * 10. Atualização de preferências (merge de ritmo, orçamento, clima, distância)
 * 11. Detecção de conflitos de sobreposição (overlapping dates)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock in-memory do Cloud Firestore ───────────────────────────────────────

const store = new Map<string, any>();

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps:       vi.fn(() => []),
  getApp:        vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => {
  const getDocMock = vi.fn(async (docRef: any) => {
    const data = store.get(docRef.path);
    return {
      exists: () => !!data,
      data: () => data,
      id: docRef.id,
      ref: docRef,
    };
  });

  const setDocMock = vi.fn(async (docRef: any, data: any, options?: any) => {
    if (options?.merge && store.has(docRef.path)) {
      const existing = store.get(docRef.path);
      store.set(docRef.path, { ...existing, ...data });
    } else {
      store.set(docRef.path, data);
    }
  });

  const updateDocMock = vi.fn(async (docRef: any, updates: any) => {
    const existing = store.get(docRef.path);
    if (!existing) {
      throw new Error(`Document not found: ${docRef.path}`);
    }
    store.set(docRef.path, { ...existing, ...updates });
  });

  const deleteDocMock = vi.fn(async (docRef: any) => {
    store.delete(docRef.path);
  });

  const getDocsMock = vi.fn(async (queryOrCol: any) => {
    const colPath = queryOrCol.path || queryOrCol.colPath;
    const docs: any[] = [];

    for (const [path, data] of store.entries()) {
      if (path.startsWith(colPath + '/')) {
        const sub = path.slice(colPath.length + 1);
        if (!sub.includes('/')) {
          docs.push({ id: sub, data: () => data, ref: { path } });
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

  const queryMock = vi.fn((colRef: any, ...clauses: any[]) => ({
    colPath: colRef.path,
    clauses,
    type: 'query',
  }));

  const orderByMock = vi.fn((field: string, direction = 'asc') => ({
    type: 'orderBy',
    field,
    direction,
  }));

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
    orderBy:         orderByMock,
    where:           vi.fn(),
    limit:           vi.fn(),
    serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  };
});

// ── Import dos serviços a testar ────────────────────────────────────────────

import {
  createAvailability,
  getAvailabilityById,
  listAvailabilityByUser,
  updateAvailability,
  deleteAvailability,
  checkAvailabilityConflict,
} from '../../availability.service';

import {
  getUserPreferences,
  saveUserPreferences,
  resetUserPreferences,
  DEFAULT_PREFERENCES,
} from '../../preferences.service';

// ── Usuários de Teste (SPEC_AUTH §11.1) ──────────────────────────────────────

const USER_A = 'uid-alice-777';
const USER_B = 'uid-bob-888';

describe('Disponibilidade e Preferências — SPEC Conjunta', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. PERÍODO VÁLIDO
  // =========================================================================
  describe('1. Período Válido', () => {
    it('deve criar período de folga com dados válidos e calcular durationDays', async () => {
      const folga = await createAvailability(
        USER_A,
        {
          title: 'Férias de Julho 2026',
          startDate: '2026-07-01',
          endDate: '2026-07-15',
          durationDays: 15,
          type: 'vacation',
          notes: 'Férias aprovadas no trabalho',
        },
        'folga_jul_01',
      );

      expect(folga.id).toBe('folga_jul_01');
      expect(folga.userId).toBe(USER_A);
      expect(folga.durationDays).toBe(15);
      expect(folga.type).toBe('vacation');
      expect(folga.status).toBe('planned');
      expect(store.has(`users/${USER_A}/availability/folga_jul_01`)).toBe(true);
    });

    it('deve suportar período de 1 dia único (startDate == endDate)', async () => {
      const folga = await createAvailability(
        USER_A,
        {
          title: 'Feriado Tiradentes',
          startDate: '2026-04-21',
          endDate: '2026-04-21',
          durationDays: 1,
          type: 'holiday',
        },
        'folga_tiradentes',
      );

      expect(folga.durationDays).toBe(1);
      expect(folga.startDate).toBe('2026-04-21');
      expect(folga.endDate).toBe('2026-04-21');
    });
  });

  // =========================================================================
  // 2. DATAS INVERTIDAS
  // =========================================================================
  describe('2. Datas Invertidas', () => {
    it('deve rejeitar criação quando startDate for posterior a endDate', async () => {
      await expect(
        createAvailability(USER_A, {
          title: 'Folga Invertida',
          startDate: '2026-08-20',
          endDate: '2026-08-10', // Erro
          durationDays: 5,
          type: 'vacation',
        })
      ).rejects.toThrow('A data de início não pode ser posterior à data de término.');
    });

    it('deve rejeitar atualização quando startDate for posterior a endDate', async () => {
      await createAvailability(
        USER_A,
        {
          title: 'Folga Normal',
          startDate: '2026-09-01',
          endDate: '2026-09-05',
          durationDays: 5,
          type: 'long_weekend',
        },
        'folga_edit_dates',
      );

      await expect(
        updateAvailability(USER_A, 'folga_edit_dates', {
          startDate: '2026-09-10',
          endDate: '2026-09-02',
        })
      ).rejects.toThrow('A data de início não pode ser posterior à data de término.');
    });
  });

  // =========================================================================
  // 3. CAMPOS AUSENTES
  // =========================================================================
  describe('3. Campos Ausentes', () => {
    it('deve rejeitar criação com título em branco', async () => {
      await expect(
        createAvailability(USER_A, {
          title: '   ',
          startDate: '2026-07-01',
          endDate: '2026-07-05',
          durationDays: 5,
          type: 'vacation',
        })
      ).rejects.toThrow('Título do período de folga é obrigatório.');
    });

    it('deve rejeitar criação sem datas de início ou fim', async () => {
      await expect(
        createAvailability(USER_A, {
          title: 'Sem Datas',
          startDate: '',
          endDate: '2026-07-05',
          durationDays: 5,
          type: 'vacation',
        })
      ).rejects.toThrow('Datas de início e fim são obrigatórias.');
    });

    it('deve rejeitar criação sem UID de sessão do usuário', async () => {
      await expect(
        createAvailability('', {
          title: 'Sem Sessão',
          startDate: '2026-07-01',
          endDate: '2026-07-05',
          durationDays: 5,
          type: 'vacation',
        })
      ).rejects.toThrow('ID do usuário é obrigatório.');
    });

    it('deve rejeitar criação com durationDays <= 0', async () => {
      await expect(
        createAvailability(USER_A, {
          title: 'Duração Zero',
          startDate: '2026-07-01',
          endDate: '2026-07-05',
          durationDays: 0,
          type: 'vacation',
        })
      ).rejects.toThrow('A duração em dias deve ser um número maior que zero.');
    });
  });

  // =========================================================================
  // 4. EDIÇÃO (Update)
  // =========================================================================
  describe('4. Edição', () => {
    it('deve atualizar título, notas e status da folga', async () => {
      await createAvailability(
        USER_A,
        {
          title: 'Viagem Serra',
          startDate: '2026-08-01',
          endDate: '2026-08-04',
          durationDays: 4,
          type: 'long_weekend',
          notes: 'Nota inicial',
        },
        'folga_serra',
      );

      await updateAvailability(USER_A, 'folga_serra', {
        title: 'Viagem Serra Gaúcha (Confirmado)',
        notes: 'Pousada reservada',
        status: 'confirmed',
      });

      const updated = await getAvailabilityById(USER_A, 'folga_serra');
      expect(updated?.title).toBe('Viagem Serra Gaúcha (Confirmado)');
      expect(updated?.notes).toBe('Pousada reservada');
      expect(updated?.status).toBe('confirmed');
    });
  });

  // =========================================================================
  // 5. EXCLUSÃO (Delete)
  // =========================================================================
  describe('5. Exclusão', () => {
    it('deve excluir o período de folga do Firestore', async () => {
      await createAvailability(
        USER_A,
        {
          title: 'Folga Cancelada',
          startDate: '2026-10-10',
          endDate: '2026-10-12',
          durationDays: 3,
          type: 'other',
        },
        'folga_cancelar',
      );

      expect(store.has(`users/${USER_A}/availability/folga_cancelar`)).toBe(true);

      await deleteAvailability(USER_A, 'folga_cancelar');

      expect(store.has(`users/${USER_A}/availability/folga_cancelar`)).toBe(false);
      const res = await getAvailabilityById(USER_A, 'folga_cancelar');
      expect(res).toBeNull();
    });
  });

  // =========================================================================
  // 6. PERSISTÊNCIA APÓS RELOAD
  // =========================================================================
  describe('6. Persistência após Reload (Estado Persistido)', () => {
    it('deve restaurar a lista de folgas a partir do Firestore em nova consulta', async () => {
      await createAvailability(USER_A, {
        title: 'Folga 1',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        durationDays: 3,
        type: 'long_weekend',
      }, 'reload_f1');

      await createAvailability(USER_A, {
        title: 'Folga 2',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        durationDays: 5,
        type: 'vacation',
      }, 'reload_f2');

      // Simula reload da página
      const reloaded = await listAvailabilityByUser(USER_A);
      expect(reloaded.length).toBe(2);
      expect(reloaded.map((r) => r.id)).toContain('reload_f1');
      expect(reloaded.map((r) => r.id)).toContain('reload_f2');
    });

    it('deve restaurar preferências salvas a partir do Firestore em nova consulta', async () => {
      await saveUserPreferences(USER_A, {
        travelStyle: 'relaxed',
        budget: 'luxury',
        preferredClimate: 'warm',
        maxTravelDistance: 'global',
        homeAirport: 'GRU',
      });

      // Simula reload da página
      const reloadedPrefs = await getUserPreferences(USER_A);
      expect(reloadedPrefs).not.toBeNull();
      expect(reloadedPrefs?.travelStyle).toBe('relaxed');
      expect(reloadedPrefs?.budget).toBe('luxury');
      expect(reloadedPrefs?.preferredClimate).toBe('warm');
      expect(reloadedPrefs?.maxTravelDistance).toBe('global');
      expect(reloadedPrefs?.homeAirport).toBe('GRU');
    });
  });

  // =========================================================================
  // 7. TENTATIVA DE ALTERAR REGISTRO ALHEIO (Usuário A vs. B)
  // =========================================================================
  describe('7. Tentativa de Alterar Registro Alheio', () => {
    it('Usuário B NÃO deve conseguir atualizar período de folga do Usuário A', async () => {
      await createAvailability(
        USER_A,
        {
          title: 'Folga de Alice',
          startDate: '2026-07-01',
          endDate: '2026-07-10',
          durationDays: 10,
          type: 'vacation',
        },
        'folga_alice',
      );

      // Usuário B tenta atualizar a folga de Alice no sub-path de B
      await expect(
        updateAvailability(USER_B, 'folga_alice', { title: 'Hackeado por Bob' })
      ).rejects.toThrow('Período de folga com ID folga_alice não encontrado.');

      // O registro de Alice permanece intacto
      const aliceDoc = await getAvailabilityById(USER_A, 'folga_alice');
      expect(aliceDoc?.title).toBe('Folga de Alice');
    });

    it('Usuário B NÃO deve conseguir excluir período de folga do Usuário A', async () => {
      await createAvailability(
        USER_A,
        {
          title: 'Folga de Alice 2',
          startDate: '2026-08-01',
          endDate: '2026-08-05',
          durationDays: 5,
          type: 'vacation',
        },
        'folga_alice_2',
      );

      // Usuário B tenta deletar passando seu próprio UID
      await expect(
        deleteAvailability(USER_B, 'folga_alice_2')
      ).rejects.toThrow('Período de folga com ID folga_alice_2 não encontrado para exclusão.');

      // O registro de Alice não foi apagado
      expect(store.has(`users/${USER_A}/availability/folga_alice_2`)).toBe(true);
    });
  });

  // =========================================================================
  // 8. PREFERÊNCIAS VAZIAS (Defaults & Reset)
  // =========================================================================
  describe('8. Preferências Vazias', () => {
    it('saveUserPreferences com objeto vazio deve preservar valores padrão sem erro', async () => {
      const prefs = await saveUserPreferences(USER_A, {});
      expect(prefs.travelStyle).toBe(DEFAULT_PREFERENCES.travelStyle);
      expect(prefs.budget).toBe(DEFAULT_PREFERENCES.budget);
      expect(prefs.currency).toBe('BRL');
    });

    it('resetUserPreferences deve restaurar preferências para os valores padrão', async () => {
      await saveUserPreferences(USER_A, {
        travelStyle: 'intense',
        budget: 'luxury',
        preferredClimate: 'cool',
      });

      const reset = await resetUserPreferences(USER_A);
      expect(reset.travelStyle).toBe('moderate');
      expect(reset.budget).toBe('moderate');
      expect(reset.currency).toBe('BRL');
    });
  });

  // =========================================================================
  // 9. SELEÇÃO MÚLTIPLA
  // =========================================================================
  describe('9. Seleção Múltipla (Interesses e Modos de Transporte)', () => {
    it('deve persistir múltiplos interesses e modos de transporte', async () => {
      const interests = [
        'Gastronomia típica',
        'Centro Histórico & Cultura',
        'Praias & Natureza',
        'Vida Noturna',
      ];
      const transports = ['walking', 'public_transit', 'rideshare'] as const;

      const prefs = await saveUserPreferences(USER_A, {
        preferredInterests: [...interests],
        transportationModes: [...transports],
      });

      expect(prefs.preferredInterests).toEqual(interests);
      expect(prefs.transportationModes).toEqual(transports);
    });

    it('deve rejeitar preferredInterests que não seja array', async () => {
      await expect(
        saveUserPreferences(USER_A, {
          preferredInterests: 'não é array' as any,
        })
      ).rejects.toThrow('Interesses preferidos devem ser um array de strings.');
    });

    it('deve rejeitar transportationModes com modo inválido', async () => {
      await expect(
        saveUserPreferences(USER_A, {
          transportationModes: ['walking', 'spaceship' as any],
        })
      ).rejects.toThrow('Modo de transporte inválido: spaceship');
    });
  });

  // =========================================================================
  // 10. ATUALIZAÇÃO DE PREFERÊNCIAS (Merge)
  // =========================================================================
  describe('10. Atualização de Preferências (Merge)', () => {
    it('deve atualizar parâmetros específicos mantendo dados anteriores', async () => {
      // 1ª gravação: ritmo e aeroporto
      await saveUserPreferences(USER_A, {
        travelStyle: 'relaxed',
        homeAirport: 'SDU',
      });

      // 2ª gravação: orçamento e clima
      await saveUserPreferences(USER_A, {
        budget: 'budget',
        preferredClimate: 'warm',
      });

      const final = await getUserPreferences(USER_A);
      expect(final?.travelStyle).toBe('relaxed'); // preservado
      expect(final?.homeAirport).toBe('SDU');     // preservado
      expect(final?.budget).toBe('budget');       // atualizado
      expect(final?.preferredClimate).toBe('warm'); // atualizado
    });

    it('deve rejeitar preferredClimate inválido', async () => {
      await expect(
        saveUserPreferences(USER_A, { preferredClimate: 'polar_freeze' as any })
      ).rejects.toThrow('Clima preferido inválido: polar_freeze');
    });

    it('deve rejeitar maxTravelDistance inválido', async () => {
      await expect(
        saveUserPreferences(USER_A, { maxTravelDistance: 'intergalactic' as any })
      ).rejects.toThrow('Distância máxima inválida: intergalactic');
    });
  });

  // =========================================================================
  // 11. DETECÇÃO DE CONFLITOS DE SOBREPOSIÇÃO (Overlapping Dates)
  // =========================================================================
  describe('11. Detecção de Conflitos de Sobreposição', () => {
    it('deve detectar conflito quando o novo período coincide com um período existente', async () => {
      await createAvailability(USER_A, {
        title: 'Férias de Julho',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        durationDays: 15,
        type: 'vacation',
      }, 'existente_julho');

      // Tenta novo período de 10 a 20 de julho (sobrepõe dias 10 a 15)
      const conflict = await checkAvailabilityConflict(USER_A, '2026-07-10', '2026-07-20');
      expect(conflict.hasConflict).toBe(true);
      expect(conflict.conflictingTimeOffs.length).toBe(1);
      expect(conflict.conflictingTimeOffs[0].id).toBe('existente_julho');
    });

    it('não deve indicar conflito para períodos disjuntos', async () => {
      await createAvailability(USER_A, {
        title: 'Férias de Julho',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        durationDays: 15,
        type: 'vacation',
      }, 'existente_julho_2');

      // Período em agosto (sem conflito)
      const conflict = await checkAvailabilityConflict(USER_A, '2026-08-01', '2026-08-10');
      expect(conflict.hasConflict).toBe(false);
      expect(conflict.conflictingTimeOffs.length).toBe(0);
    });

    it('deve ignorar o próprio ID durante a edição de um período', async () => {
      await createAvailability(USER_A, {
        title: 'Férias de Julho',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        durationDays: 15,
        type: 'vacation',
      }, 'editando_julho');

      // Ao editar o próprio registro, o excludeId evita falso positivo de conflito consigo mesmo
      const conflict = await checkAvailabilityConflict(
        USER_A,
        '2026-07-01',
        '2026-07-16',
        'editando_julho',
      );
      expect(conflict.hasConflict).toBe(false);
    });
  });
});
