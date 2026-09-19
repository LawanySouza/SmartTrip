import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  DemoStateType,
  UserProfile,
  TravelStyle,
  BudgetLevel,
  TransportationMode,
  ClimatePreference,
  TravelDistancePreference,
  UserPreferences,
} from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ChipGroup } from '../components/common/ChipGroup';
import { Toast } from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserPreferences,
  saveUserPreferences,
  resetUserPreferences,
  DEFAULT_PREFERENCES,
} from '../services/preferences.service';
import { updateUserProfile } from '../services/user.service';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: ScreenType) => void;
  demoState?: DemoStateType;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  demoState = 'normal',
}) => {
  const { user: authUser, logout } = useAuth();
  const sessionUid = authUser?.uid;

  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [homeAirport, setHomeAirport] = useState(user.preferences?.homeAirport || '');

  // Preferências
  const [pace, setPace] = useState<TravelStyle>(user.preferences?.travelStyle || 'moderate');
  const [budget, setBudget] = useState<BudgetLevel>(user.preferences?.budget || 'moderate');
  const [interests, setInterests] = useState<string[]>(
    user.preferences?.preferredInterests || ['Gastronomia típica', 'Centro Histórico & Cultura']
  );
  const [transports, setTransports] = useState<TransportationMode[]>(
    user.preferences?.transportationModes || ['walking', 'public_transit']
  );
  const [climate, setClimate] = useState<ClimatePreference>(
    user.preferences?.preferredClimate || 'mild'
  );
  const [maxDistance, setMaxDistance] = useState<TravelDistancePreference>(
    user.preferences?.maxTravelDistance || 'national'
  );
  const [restrictionInput, setRestrictionInput] = useState(
    user.preferences?.restrictions?.join(', ') || 'Vegetariano'
  );

  // Estados de carregamento e feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega preferências salvas no Firestore no mount
  useEffect(() => {
    async function loadPreferences() {
      if (!sessionUid) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const stored = await getUserPreferences(sessionUid);
        if (stored) {
          setPace(stored.travelStyle);
          setBudget(stored.budget);
          if (stored.preferredInterests && stored.preferredInterests.length > 0) {
            setInterests(stored.preferredInterests);
          }
          if (stored.restrictions) {
            setRestrictionInput(stored.restrictions.join(', '));
          }
          if (stored.homeAirport) {
            setHomeAirport(stored.homeAirport);
          }
          if (stored.transportationModes && stored.transportationModes.length > 0) {
            setTransports(stored.transportationModes);
          }
          if (stored.preferredClimate) {
            setClimate(stored.preferredClimate);
          }
          if (stored.maxTravelDistance) {
            setMaxDistance(stored.maxTravelDistance);
          }
        }
      } catch (err: any) {
        setSaveError('Não foi possível carregar as preferências da nuvem.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, [sessionUid]);

  if (demoState === 'loading' || (isLoading && demoState === 'normal')) {
    return (
      <div className="flex flex-col w-full gap-5 pb-20 text-left">
        <SkeletonLoader type="line" count={3} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3 my-8 rounded-2xl bg-error/10 border border-error/20">
        <span className="material-symbols-outlined text-3xl text-error">person_off</span>
        <h3 className="text-base font-bold text-on-surface">Erro ao carregar perfil do viajante</h3>
        <p className="text-xs text-on-surface-variant">Modo de demonstração de erro ativo.</p>
        <Button variant="primary" size="sm" onClick={() => onNavigate('/profile')}>
          Recarregar
        </Button>
      </div>
    );
  }

  const paceOptions = [
    { value: 'relaxed', label: 'Relaxado', subtitle: '1 a 2 passeios/dia' },
    { value: 'moderate', label: 'Moderado', subtitle: '3 a 4 passeios/dia' },
    { value: 'intense', label: 'Intenso', subtitle: 'Dia cheio e dinâmico' },
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Econômico', subtitle: 'Mochilão & grátis' },
    { value: 'moderate', label: 'Conforto', subtitle: 'Bom custo-benefício' },
    { value: 'luxury', label: 'Luxo', subtitle: 'Experiências exclusivas' },
  ];

  const interestOptions = [
    { value: 'Gastronomia típica', label: 'Gastronomia' },
    { value: 'Centro Histórico & Cultura', label: 'Cultura & Museus' },
    { value: 'Praias & Natureza', label: 'Praias & Ecoturismo' },
    { value: 'Vida Noturna', label: 'Vida Noturna' },
    { value: 'Compras & Feiras', label: 'Compras' },
    { value: 'Trilhas & Aventura', label: 'Aventura' },
    { value: 'Parques & Jardins', label: 'Parques' },
    { value: 'Fotografia & Mirantes', label: 'Mirantes' },
  ];

  const transportOptions = [
    { value: 'walking', label: 'Caminhada' },
    { value: 'public_transit', label: 'Metrô / Ônibus' },
    { value: 'rideshare', label: 'Uber / Táxi' },
    { value: 'rental_car', label: 'Carro Alugado' },
  ];

  const climateOptions = [
    { value: 'warm', label: 'Ensolarado / Quente' },
    { value: 'mild', label: 'Ameno / Temperado' },
    { value: 'cool', label: 'Frio de Serra / Neve' },
    { value: 'any', label: 'Indiferente' },
  ];

  const distanceOptions = [
    { value: 'regional', label: 'Regional (até 500 km)' },
    { value: 'national', label: 'Nacional (até 2500 km)' },
    { value: 'continental', label: 'América do Sul (até 6000 km)' },
    { value: 'global', label: 'Global / Sem limite' },
  ];

  const handleInterestToggle = (val: string) => {
    if (interests.includes(val)) {
      setInterests(interests.filter((i) => i !== val));
    } else {
      if (interests.length >= 10) {
        setSaveError('Limite máximo de 10 interesses permitidos.');
        return;
      }
      setInterests([...interests, val]);
      setSaveError(null);
    }
  };

  const handleTransportToggle = (val: string) => {
    const mode = val as TransportationMode;
    if (transports.includes(mode)) {
      if (transports.length === 1) {
        setSaveError('Selecione pelo menos um modo de transporte aceito.');
        return;
      }
      setTransports(transports.filter((t) => t !== mode));
    } else {
      setTransports([...transports, mode]);
      setSaveError(null);
    }
  };

  const handleSave = async () => {
    setSaveError(null);

    if (interests.length === 0) {
      setSaveError('Selecione pelo menos um interesse principal para orientar a IA.');
      return;
    }

    const restrictions = restrictionInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const preferencesPayload: Partial<UserPreferences> = {
      travelStyle: pace,
      budget,
      preferredInterests: interests,
      restrictions,
      currency: 'BRL',
      homeAirport: homeAirport.trim() || undefined,
      transportationModes: transports,
      preferredClimate: climate,
      maxTravelDistance: maxDistance,
    };

    try {
      setIsSaving(true);

      // Persistência em Firestore usando estritamente a identidade da sessão
      if (sessionUid) {
        await saveUserPreferences(sessionUid, preferencesPayload);
        if (name.trim() && name !== user.name) {
          await updateUserProfile(sessionUid, { name: name.trim() });
        }
      }

      onUpdateUser({
        name: name.trim() || user.name,
        preferences: {
          travelStyle: pace,
          budget,
          preferredInterests: interests,
          restrictions,
          currency: 'BRL',
          homeAirport: homeAirport.trim() || undefined,
          transportationModes: transports,
          preferredClimate: climate,
          maxTravelDistance: maxDistance,
        },
      });

      setToastMessage('Preferências salvas com sucesso!');
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar preferências no servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      setIsSaving(true);
      if (sessionUid) {
        await resetUserPreferences(sessionUid);
      }
      setPace(DEFAULT_PREFERENCES.travelStyle);
      setBudget(DEFAULT_PREFERENCES.budget);
      setInterests(['Gastronomia típica', 'Centro Histórico & Cultura']);
      setTransports(['walking', 'public_transit']);
      setClimate('mild');
      setMaxDistance('national');
      setRestrictionInput('');
      setHomeAirport('');
      setToastMessage('Preferências restauradas para os padrões.');
    } catch (err: any) {
      setSaveError('Erro ao redefinir preferências.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-24 text-left">
      {/* Header da Tela */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-on-surface">Perfil & Preferências</h1>
        <p className="text-xs text-on-surface-variant">
          Personalize seu estilo de viagem para que os roteiros reflitam seus gostos automaticamente.
        </p>
      </div>

      {/* Dados Pessoais */}
      <section className="p-5 rounded-3xl bg-surface-container-low border border-outline/30 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider text-primary">
          Dados do Viajante
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
          <Input
            label="E-mail (Autenticado)"
            value={email}
            disabled
            helperText="E-mail vinculado via Firebase Auth"
          />
        </div>
        <Input
          label="Origem / Aeroporto Habitual"
          value={homeAirport}
          onChange={(e) => setHomeAirport(e.target.value)}
          placeholder="Ex: GRU, São Paulo - SP, Santos Dumont"
          helperText="Ponto de partida padrão para estimativas de rota e distância."
        />
      </section>

      {/* Preferências de Viagem */}
      <section className="p-5 rounded-3xl bg-surface-container-low border border-outline/30 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider text-primary">
            Estilo Padrão de Viagem
          </h2>
          <button
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors underline"
          >
            Restaurar Padrões
          </button>
        </div>

        {/* Ritmo */}
        <ChipGroup
          label="Ritmo Preferido"
          options={paceOptions}
          selected={pace}
          onChange={(v) => setPace(v as TravelStyle)}
        />

        {/* Orçamento */}
        <ChipGroup
          label="Faixa de Orçamento"
          options={budgetOptions}
          selected={budget}
          onChange={(v) => setBudget(v as BudgetLevel)}
        />

        {/* Interesses com Seleção Múltipla */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Interesses Principais (Múltipla Seleção)
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {interests.length}/10 selecionados
            </span>
          </div>
          <ChipGroup
            options={interestOptions}
            selected={interests}
            onChange={handleInterestToggle}
            multiple
          />
        </div>

        {/* Meios de Transporte com Seleção Múltipla */}
        <div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
            Meios de Transporte Aceitos
          </span>
          <ChipGroup
            options={transportOptions}
            selected={transports}
            onChange={handleTransportToggle}
            multiple
          />
        </div>

        {/* Clima Preferido */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Clima Predileto
          </label>
          <select
            value={climate}
            onChange={(e) => setClimate(e.target.value as ClimatePreference)}
            className="w-full rounded-xl border border-outline/40 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {climateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Distância Máxima */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Raio Máximo de Deslocamento
          </label>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value as TravelDistancePreference)}
            className="w-full rounded-xl border border-outline/40 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {distanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Restrições Especiais */}
        <Input
          label="Restrições Alimentares ou Mobilidade"
          value={restrictionInput}
          onChange={(e) => setRestrictionInput(e.target.value)}
          placeholder="Ex: Vegetariano, evitar escadas, alergia a frutos do mar"
          helperText="Separe restrições por vírgula. Elas serão consideradas pelo Gemini."
        />

        {saveError && (
          <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-xs text-error font-medium">
            {saveError}
          </div>
        )}
      </section>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="danger"
          size="md"
          onClick={async () => {
            await logout();
            onNavigate('login');
          }}
        >
          Desconectar
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
          icon={<span className="material-symbols-outlined text-[18px]">save</span>}
        >
          {isSaving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>

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
