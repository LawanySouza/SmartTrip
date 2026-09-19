import React, { useState, useEffect } from 'react';
import { ScreenType, DemoStateType, TimeOff, TimeOffType } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../contexts/AuthContext';
import {
  createAvailability,
  listAvailabilityByUser,
  updateAvailability,
  deleteAvailability,
  checkAvailabilityConflict,
} from '../services/availability.service';
import { MOCK_TIME_OFFS } from '../data/mockData';

interface AvailabilityScreenProps {
  onNavigate: (screen: ScreenType) => void;
  demoState?: DemoStateType;
}

export const AvailabilityScreen: React.FC<AvailabilityScreenProps> = ({
  onNavigate,
  demoState = 'normal',
}) => {
  const { user: authUser } = useAuth();
  const sessionUid = authUser?.uid;

  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<TimeOffType>('long_weekend');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de Exclusão
  const [deletingItem, setDeletingItem] = useState<TimeOff | null>(null);

  // Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega dados da sessão do usuário no Firestore
  const fetchTimeOffs = async () => {
    if (!sessionUid) {
      // Fallback para mock se não autenticado
      setTimeOffs(MOCK_TIME_OFFS);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await listAvailabilityByUser(sessionUid);
      setTimeOffs(data);
    } catch (err: any) {
      setLoadError(err?.message || 'Erro ao carregar períodos de folga.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeOffs();
  }, [sessionUid]);

  // Estados de demonstração da SPEC de Interface
  if (demoState === 'loading' || (isLoading && demoState === 'normal')) {
    return (
      <div className="flex flex-col w-full gap-5 pb-20 text-left">
        <SkeletonLoader type="line" count={2} />
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (demoState === 'error' || loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3 my-8 rounded-2xl bg-error/10 border border-error/20">
        <span className="material-symbols-outlined text-3xl text-error">event_busy</span>
        <h3 className="text-base font-bold text-on-surface">Erro ao carregar períodos de folga</h3>
        <p className="text-xs text-on-surface-variant">{loadError || 'Modo de demonstração de erro ativo.'}</p>
        <Button variant="primary" size="sm" onClick={fetchTimeOffs}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const displayedTimeOffs = demoState === 'empty' ? [] : timeOffs;

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setStartDate('');
    setEndDate('');
    setType('long_weekend');
    setNotes('');
    setFormError(null);
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TimeOff) => {
    setEditingId(item.id);
    setTitle(item.title);
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setType(item.type);
    setNotes(item.notes || '');
    setFormError(null);
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleSaveTimeOff = async (forceSave = false) => {
    if (!title.trim() || !startDate || !endDate) {
      setFormError('Por favor, preencha todos os campos obrigatórios (título, início e fim).');
      return;
    }

    if (startDate > endDate) {
      setFormError('A data de término deve ser igual ou posterior à data de início (RN-002).');
      return;
    }

    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (durationDays > 90) {
      setFormError('O período máximo de uma folga é de 90 dias.');
      return;
    }

    // Identidade estrita da sessão (NÃO confia em input do form)
    const targetUid = sessionUid || 'user-local';

    // Verificação de conflito de sobreposição
    if (!forceSave && sessionUid) {
      try {
        const conflict = await checkAvailabilityConflict(sessionUid, startDate, endDate, editingId || undefined);
        if (conflict.hasConflict) {
          const names = conflict.conflictingTimeOffs.map((c) => `"${c.title}"`).join(', ');
          setConflictWarning(
            `Atenção: Este intervalo sobrepõe período(s) já existente(s) (${names}). Deseja salvar mesmo assim?`
          );
          return;
        }
      } catch (err) {
        // Prossegue se der erro na verificação opcional
      }
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingId) {
        if (sessionUid) {
          await updateAvailability(sessionUid, editingId, {
            title,
            startDate,
            endDate,
            durationDays,
            type,
            notes,
          });
        }
        setTimeOffs((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, title, startDate, endDate, durationDays, type, notes }
              : item
          )
        );
        setToastMessage('Período de folga atualizado com sucesso!');
      } else {
        if (sessionUid) {
          const created = await createAvailability(sessionUid, {
            title,
            startDate,
            endDate,
            durationDays,
            type,
            notes,
          });
          setTimeOffs((prev) => [created, ...prev]);
        } else {
          const localItem: TimeOff = {
            id: `to-${Date.now()}`,
            userId: targetUid,
            title,
            startDate,
            endDate,
            durationDays,
            type,
            notes,
          };
          setTimeOffs((prev) => [localItem, ...prev]);
        }
        setToastMessage('Período de folga cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      setConflictWarning(null);
    } catch (err: any) {
      setFormError(err?.message || 'Erro ao salvar período de folga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      if (sessionUid) {
        await deleteAvailability(sessionUid, deletingItem.id);
      }
      setTimeOffs((prev) => prev.filter((t) => t.id !== deletingItem.id));
      setToastMessage('Período de folga excluído com sucesso.');
    } catch (err: any) {
      setToastMessage(`Erro ao excluir: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setDeletingItem(null);
    }
  };

  const typeLabels: Record<TimeOffType, { label: string; color: string }> = {
    vacation: { label: 'Férias', color: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' },
    holiday: { label: 'Feriado Nacional', color: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300' },
    long_weekend: { label: 'Fim de Semana / Ponte', color: 'bg-amber-500/20 text-amber-800 dark:text-amber-300' },
    other: { label: 'Outro', color: 'bg-slate-500/20 text-slate-800 dark:text-slate-300' },
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-24 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface">Meus Períodos de Folga</h1>
          <p className="text-xs text-on-surface-variant">
            Cadastre feriados, pontes e férias para sincronizar datas com seus roteiros.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          icon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          Nova Folga
        </Button>
      </div>

      {/* Lista de Folgas */}
      {displayedTimeOffs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTimeOffs.map((item) => {
            const typeInfo = typeLabels[item.type] || typeLabels.other;
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-surface-container-low border border-outline/30 flex flex-col justify-between gap-4 shadow-xs hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                        title="Editar período"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="text-on-surface-variant hover:text-error p-1 rounded transition-colors"
                        title="Excluir período"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-on-surface">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">date_range</span>
                    <span>
                      {item.startDate} até {item.endDate}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-on-surface-variant/80 italic bg-surface-container p-2 rounded-xl">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                  <span className="text-xs font-black text-secondary">
                    {item.durationDays} {item.durationDays === 1 ? 'dia livre' : 'dias livres'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('new_trip')}
                    icon={<span className="material-symbols-outlined text-[15px]">auto_awesome</span>}
                  >
                    Planejar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="event_available"
          title="Nenhuma folga cadastrada"
          description="Cadastre seu próximo feriado ou férias para que o SmartTrip saiba exatamente quando você pode viajar."
          actionLabel="+ Cadastrar Minha Primeira Folga"
          onAction={handleOpenCreateModal}
        />
      )}

      {/* Modal de Cadastro / Edição de Folga */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingId ? 'Editar Período de Folga' : 'Cadastrar Novo Período de Folga'}
        description="Defina o intervalo para que o motor de IA estruture o itinerário nessas datas."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            {conflictWarning ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleSaveTimeOff(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Mesmo com Conflito'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveTimeOff(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : editingId ? 'Atualizar Folga' : 'Salvar Folga'}
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input
            label="Título da Folga *"
            placeholder="Ex: Feriado Proclamação da República"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFormError(null);
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Data de Início *"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setFormError(null);
                setConflictWarning(null);
              }}
            />
            <Input
              label="Data de Término *"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setFormError(null);
                setConflictWarning(null);
              }}
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Tipo de Folga *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TimeOffType)}
              className="w-full rounded-xl border border-outline/40 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="long_weekend">Fim de Semana Prolongado / Ponte</option>
              <option value="holiday">Feriado Nacional / Regional</option>
              <option value="vacation">Férias</option>
              <option value="other">Outro Período</option>
            </select>
          </div>

          <Input
            label="Anotações Opcionais"
            placeholder="Ex: Destino pretendido, preferências ou amigos que vão junto"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {formError && (
            <div className="p-2.5 rounded-xl bg-error/15 border border-error/30 text-xs text-error font-medium">
              {formError}
            </div>
          )}

          {conflictWarning && (
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 font-medium">
              {conflictWarning}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Excluir Período de Folga"
        description={`Tem certeza que deseja excluir "${deletingItem?.title}" (${deletingItem?.startDate} a ${deletingItem?.endDate})?`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeletingItem(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Confirmar Exclusão
            </Button>
          </>
        }
      >
        <p className="text-xs text-on-surface-variant">
          Esta ação não pode ser desfeita. Se houver viagens planejadas para este período, elas continuarão salvas mas sem o vínculo da folga.
        </p>
      </Modal>

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
