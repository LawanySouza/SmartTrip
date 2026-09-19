import React, { useState } from 'react';
import { ScreenType } from '../types';
import { IMAGES } from '../data/mockData';

interface NewTripScreenProps {
  onNavigate: (screen: ScreenType) => void;
  initialDestination?: string;
}

export const NewTripScreen: React.FC<NewTripScreenProps> = ({
  onNavigate,
  initialDestination = 'Salvador, Bahia, Brasil',
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<'eco' | 'mod' | 'prem'>('mod');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Gastronomia típica',
    'Praias & Natureza',
    'Centro Histórico & Cultura',
  ]);
  const [smartClimate, setSmartClimate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const availableTags = [
    { id: 'gastronomia', label: 'Gastronomia típica', icon: 'restaurant' },
    { id: 'praias', label: 'Praias & Natureza', icon: 'waves' },
    { id: 'cultura', label: 'Centro Histórico & Cultura', icon: 'account_balance' },
    { id: 'noite', label: 'Vida Noturna', icon: 'nightlife' },
    { id: 'tranquilo', label: 'Ritmo Tranquilo', icon: 'self_improvement' },
    { id: 'fotos', label: 'Pontos Instagramáveis', icon: 'photo_camera' },
  ];

  const toggleTag = (label: string) => {
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter((t) => t !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onNavigate('itinerary');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-24 space-y-4">
      {/* Stepper de Progresso Visual Compacto */}
      <div className="w-full bg-surface-container-low rounded-2xl p-3.5 shadow-xs border border-surface-container">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary font-label-sm text-label-sm font-bold">
              1
            </span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Configuração Básica
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Etapa 1 de 3
          </span>
        </div>

        {/* Barra de Progresso com 3 segmentos */}
        <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
          <div className="h-full bg-secondary-container rounded-full" />
          <div className="h-full bg-surface-variant rounded-full" />
          <div className="h-full bg-surface-variant rounded-full" />
        </div>

        <div className="flex justify-between items-center mt-2 font-label-sm text-label-sm text-on-surface-variant">
          <span className="font-semibold text-secondary">Destino & Período</span>
          <span>Orçamento</span>
          <span>Estilo de Viagem</span>
        </div>
      </div>

      {/* Header da Seção & Mensagem de Boas-Vindas da IA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container via-surface-container-low to-surface-bright p-4 shadow-sm border border-surface-container">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-tertiary-container shadow-md shrink-0">
            <span className="material-symbols-outlined text-[22px] text-tertiary-fixed">
              auto_awesome
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight leading-tight font-bold">
              Novo Roteiro com IA
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Conte-nos os detalhes e deixe a inteligência do SmartTrip cuidar do resto.
            </p>
          </div>
        </div>

        {/* Mini badge de IA preditiva ativo */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/60 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Algoritmo calibrado para tendências de Outubro
          </span>
        </div>
      </div>

      {/* Card do Formulário Principal */}
      <div className="w-full space-y-4">
        {/* Destino com Busca Inteligente */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[18px] text-secondary">explore</span>
              Para onde você vai?
            </label>
            <span className="font-label-sm text-label-sm text-on-tertiary-container bg-surface-container-high px-2 py-0.5 rounded-full font-medium">
              Destino Sugerido
            </span>
          </div>

          {/* Campo de destino pré-preenchido / interativo */}
          <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-3.5 py-3 transition-colors hover:bg-surface-container">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {isEditingDestination ? (
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onBlur={() => setIsEditingDestination(false)}
                  autoFocus
                  className="w-full font-label-lg text-label-lg text-on-surface bg-white rounded px-2 py-1 outline-none border border-secondary"
                />
              ) : (
                <>
                  <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">
                    {destination}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Costa Atlântica • Clima tropical e ensolarado
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsEditingDestination(!isEditingDestination)}
              aria-label="Alterar destino"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>

          {/* Preview do Destino Selecionado com IA Highlight */}
          <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner mt-2">
            <div
              className="bg-cover bg-center w-full h-full"
              style={{ backgroundImage: `url('${IMAGES.salvadorPelourinho}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container/85 via-transparent to-transparent flex items-end p-3">
              <div className="flex items-center justify-between w-full text-on-primary font-label-sm text-label-sm">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[15px] text-secondary-fixed">
                    wb_sunny
                  </span>
                  27°C Previstos
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/30 backdrop-blur-md text-surface-bright font-medium">
                  Pelourinho & Orla
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de Datas e Duração */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                calendar_today
              </span>
              Datas disponíveis
            </label>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Flexível (+/- 1 dia)
            </span>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-3.5 py-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[20px]">date_range</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-lg text-label-lg text-on-surface font-semibold">
                20 a 25 de Outubro
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Terça a Domingo • 6 dias completos
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">
                6 DIAS
              </span>
            </div>
          </div>
        </div>

        {/* Seletor de Orçamento Diário Interativo */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  payments
                </span>
                Orçamento Diário Estimado
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Inclui alimentação, passeios e deslocamento
              </p>
            </div>
          </div>

          {/* Lista de Opções de Orçamento */}
          <div className="space-y-2.5">
            {/* Opção 1: Econômico */}
            <button
              type="button"
              onClick={() => setSelectedBudget('eco')}
              className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                selectedBudget === 'eco'
                  ? 'bg-surface-container-high border-secondary-container shadow-sm'
                  : 'bg-surface-container-low border-transparent hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[20px]">backpack</span>
                </div>
                <div className="truncate">
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Econômico (Mochileiro)
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Transporte público & comidas de rua
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-label-md text-label-md text-on-surface font-bold">R$ 150</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">/dia</p>
              </div>
            </button>

            {/* Opção 2: Moderado (Recomendado) */}
            <button
              type="button"
              onClick={() => setSelectedBudget('mod')}
              className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 flex items-center justify-between relative overflow-hidden border ${
                selectedBudget === 'mod'
                  ? 'bg-surface-container-high border-secondary-container shadow-sm'
                  : 'bg-surface-container-low border-transparent hover:bg-surface-container'
              }`}
            >
              <div className="absolute -right-6 -top-6 w-16 h-16 bg-secondary-container/10 rounded-full pointer-events-none" />
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">hotel_class</span>
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="font-label-md text-label-md text-on-surface font-bold">
                      Moderado (Conforto)
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold text-[9px] tracking-wider uppercase">
                      Recomendado
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Bistrôs, apps de viagem e ingressos rápidos
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-label-md text-label-md text-secondary font-bold">R$ 380</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">/dia</p>
              </div>
            </button>

            {/* Opção 3: Premium */}
            <button
              type="button"
              onClick={() => setSelectedBudget('prem')}
              className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                selectedBudget === 'prem'
                  ? 'bg-surface-container-high border-secondary-container shadow-sm'
                  : 'bg-surface-container-low border-transparent hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[20px]">diamond</span>
                </div>
                <div className="truncate">
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Premium (Luxo & Exclusivo)
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Alta gastronomia, transfers privados e VIP
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-label-md text-label-md text-on-surface font-bold">R$ 850+</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">/dia</p>
              </div>
            </button>
          </div>
        </div>

        {/* Preferências de Viagem (Pills Multisseleção) */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                Estilo e Interesses
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Selecione o que não pode faltar na sua jornada
              </p>
            </div>
            <span className="font-label-sm text-label-sm text-on-tertiary-container bg-surface-container-high px-2.5 py-0.5 rounded-full font-bold">
              {selectedTags.length} ativos
            </span>
          </div>

          {/* Nuvem de Tags Interativas */}
          <div className="flex flex-wrap gap-2 pt-1">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`px-3.5 py-2 rounded-full font-label-md text-label-md flex items-center gap-1.5 shadow-xs active:scale-95 transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isSelected ? 'text-secondary-fixed' : 'text-on-surface-variant'
                    }`}
                  >
                    {tag.icon}
                  </span>
                  <span>{tag.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle Inteligente de Clima */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-tertiary-container shrink-0">
              <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
            </div>
            <div>
              <p className="font-label-lg text-label-lg text-on-surface font-semibold leading-snug">
                Clima Inteligente
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ajustar passeios automaticamente conforme a previsão do tempo em Salvador
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setSmartClimate(!smartClimate)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              smartClimate ? 'bg-secondary-container' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                smartClimate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Ação Principal / Botão de Geração com IA */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          id="generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] transition-all group disabled:opacity-80"
        >
          {isGenerating ? (
            <>
              <span className="material-symbols-outlined text-[22px] text-on-secondary animate-spin">
                progress_activity
              </span>
              <span className="tracking-wide">Otimizando rotas e experiências...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px] text-on-secondary animate-bounce">
                auto_awesome
              </span>
              <span className="tracking-wide font-bold">Gerar Roteiro Inteligente com IA</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px] text-secondary">
            verified_user
          </span>
          <p className="font-label-sm text-label-sm">
            Estimativa de geração: ~4 segundos • Cancelável a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
};
