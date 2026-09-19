import React, { useState } from 'react';
import { ScreenType, DemoStateType } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ChipGroup } from '../components/common/ChipGroup';
import { WeatherBadge } from '../components/trips/WeatherBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { MOCK_POIS, MOCK_WEATHER, MOCK_TIME_OFFS } from '../data/mockData';

interface ExploreScreenProps {
  onNavigate: (screen: ScreenType) => void;
  demoState?: DemoStateType;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onNavigate,
  demoState = 'normal',
}) => {
  const [destination, setDestination] = useState('Salvador, Bahia, Brasil');
  const [selectedTimeOff, setSelectedTimeOff] = useState<string>('to-01');
  const [startDate, setStartDate] = useState('2026-10-20');
  const [endDate, setEndDate] = useState('2026-10-23');
  const [pace, setPace] = useState('moderate');
  const [pois, setPois] = useState(MOCK_POIS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  if (demoState === 'loading') {
    return (
      <div className="flex flex-col w-full gap-5 pb-20 text-left">
        <SkeletonLoader type="line" count={2} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3 my-8 rounded-2xl bg-error/10 border border-error/20">
        <span className="material-symbols-outlined text-3xl text-error">travel_explore</span>
        <h3 className="text-base font-bold text-on-surface">Erro ao carregar dados do destino</h3>
        <p className="text-xs text-on-surface-variant">Modo de demonstração de erro ativo.</p>
        <Button variant="primary" size="sm" onClick={() => onNavigate('/explore')}>
          Recarregar
        </Button>
      </div>
    );
  }

  const handleUseLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setDestination('Belo Horizonte, MG (Origem detectada)');
    }, 800);
  };

  const togglePoi = (id: string) => {
    setPois(
      pois.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 700);
    setTimeout(() => setGenerationStep(3), 1400);
    setTimeout(() => {
      setIsGenerating(false);
      onNavigate('/trips/[id]');
    }, 2000);
  };

  const paceOptions = [
    { value: 'relaxed', label: 'Relaxado', subtitle: '1 a 2 passeios/dia' },
    { value: 'moderate', label: 'Moderado', subtitle: '3 a 4 passeios/dia' },
    { value: 'intense', label: 'Intenso', subtitle: 'Dia cheio e vibrante' },
  ];

  return (
    <div className="flex flex-col w-full gap-6 pb-24 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/70 text-on-secondary text-[11px] font-bold w-fit">
          <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
          Assistente de Criação
        </div>
        <h1 className="text-2xl font-black text-on-surface">Planejar Nova Viagem</h1>
        <p className="text-xs text-on-surface-variant">
          Insira seu destino, defina as datas e selecione seus pontos favoritos. O Gemini cuidará do cronograma.
        </p>
      </div>

      {/* Etapa 1: Destino e Origem */}
      <section className="p-5 rounded-3xl bg-surface-container-low border border-outline/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
            1. Destino da Viagem
          </h2>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="text-xs text-secondary font-bold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isLocating ? 'hourglass_top' : 'my_location'}
            </span>
            {isLocating ? 'Detectando...' : 'Usar minha localização'}
          </button>
        </div>

        <Input
          placeholder="Para onde você quer ir? (ex: Salvador, Curitiba, Paris)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          leftIcon={<span className="material-symbols-outlined text-[18px]">search</span>}
        />
      </section>

      {/* Etapa 2: Datas & Resumo do Clima */}
      <section className="p-5 rounded-3xl bg-surface-container-low border border-outline/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
            2. Período & Previsão Meteorológica
          </h2>
          <WeatherBadge
            temperature={MOCK_WEATHER.averageTemp}
            condition={MOCK_WEATHER.conditionSummary.slice(0, 20)}
            rainProbability={MOCK_WEATHER.rainProbability}
          />
        </div>

        {/* Selecionar Folga Salva */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Vincular a uma Folga Cadastrada (Opcional)
          </label>
          <select
            value={selectedTimeOff}
            onChange={(e) => {
              setSelectedTimeOff(e.target.value);
              const found = MOCK_TIME_OFFS.find((to) => to.id === e.target.value);
              if (found) {
                setStartDate(found.startDate);
                setEndDate(found.endDate);
              }
            }}
            className="w-full rounded-xl border border-outline/40 bg-surface px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Datas avulsas (sem vincular a folga)</option>
            {MOCK_TIME_OFFS.map((to) => (
              <option key={to.id} value={to.id}>
                {to.title} ({to.startDate} a {to.endDate} • {to.durationDays} dias)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Card Meteorológico */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-outline/20 flex flex-col gap-1.5 text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5 font-bold text-on-surface">
            <span className="material-symbols-outlined text-secondary text-[16px]">thermostat</span>
            <span>Clima Previsto para o Período:</span>
          </div>
          <p className="leading-relaxed">{MOCK_WEATHER.conditionSummary}</p>
        </div>
      </section>

      {/* Etapa 3: Ritmo e Pontos de Interesse (POIs) */}
      <section className="p-5 rounded-3xl bg-surface-container-low border border-outline/30 flex flex-col gap-4">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
          3. Ritmo & Atrações Imperdíveis
        </h2>

        <ChipGroup
          label="Ritmo desta Viagem"
          options={paceOptions}
          selected={pace}
          onChange={(v) => setPace(v)}
        />

        <div className="flex flex-col gap-2 pt-2">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Selecione atrações que você quer priorizar:
          </span>
          <div className="grid sm:grid-cols-3 gap-3">
            {pois.map((poi) => (
              <div
                key={poi.id}
                onClick={() => togglePoi(poi.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 text-left ${
                  poi.selected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-outline/30 bg-surface hover:border-outline'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                    {poi.category}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {poi.selected ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface">{poi.name}</h4>
                <p className="text-[11px] text-on-surface-variant line-clamp-2">
                  {poi.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Botão de Ação */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          isLoading={isGenerating}
          icon={<span className="material-symbols-outlined text-[20px]">auto_awesome</span>}
          className="w-full sm:w-auto"
        >
          Gerar Roteiro Inteligente com IA
        </Button>
      </div>

      {/* Modal / Overlay de Loading de Geração com IA */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-surface-container border border-outline/30 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary animate-pulse">
              <span className="material-symbols-outlined text-[32px] animate-spin">
                sync
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-on-surface">
                Criando Seu Roteiro...
              </h3>
              <p className="text-xs text-on-surface-variant">
                O Google Gemini está sintetizando clima, folgas e atrações ideais.
              </p>
            </div>

            {/* Etapas de Progresso */}
            <div className="w-full space-y-2 text-left pt-2">
              <div
                className={`flex items-center gap-2 text-xs p-2 rounded-xl transition-all ${
                  generationStep >= 1 ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {generationStep > 1 ? 'check_circle' : 'wb_sunny'}
                </span>
                <span>Analisando previsão do tempo e histórico</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xs p-2 rounded-xl transition-all ${
                  generationStep >= 2 ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {generationStep > 2 ? 'check_circle' : 'attractions'}
                </span>
                <span>Selecionando atrações e proximidade logística</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xs p-2 rounded-xl transition-all ${
                  generationStep >= 3 ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {generationStep >= 3 ? 'check_circle' : 'format_list_bulleted'}
                </span>
                <span>Estruturando turnos (Manhã, Tarde e Noite)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
