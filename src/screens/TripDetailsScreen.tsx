import React, { useState } from 'react';
import { ScreenType } from '../types';
import { IMAGES } from '../data/mockData';

interface TripDetailsScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({ onNavigate }) => {
  const [copyStatus, setCopyStatus] = useState('Copiar');
  const [activeVersion, setActiveVersion] = useState<'v2.4' | 'v2.3'>('v2.4');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://smarttrip.ai/r/salvador-24');
    setCopyStatus('Copiado!');
    showToast('Link do roteiro copiado para a área de transferência!');
    setTimeout(() => setCopyStatus('Copiar'), 2500);
  };

  const handleApplyQuickPrompt = (prompt: string) => {
    setIsApplyingAi(true);
    setTimeout(() => {
      setIsApplyingAi(false);
      showToast(`Ajuste IA aplicado: "${prompt}"`);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-24 space-y-4 relative">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md shadow-xl flex items-center gap-2 animate-fade-in border border-white/20">
          <span className="material-symbols-outlined text-[18px] text-secondary-container">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner Compacto do Roteiro */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container p-4">
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm mb-2">
              <span className="material-symbols-outlined text-[14px] text-secondary-container">
                auto_awesome
              </span>
              <span>Inteligência SmartTrip v2.4</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight truncate font-bold">
              Salvador Cultural & Praias
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Criado em 24 Out 2024 • 5 dias de imersão
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              Ao Vivo
            </span>
          </div>
        </div>
      </div>

      {/* Painel de Colaboração em Tempo Real */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-surface-container space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[20px]">
              group
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Viajantes na aventura
            </h3>
          </div>
          <button
            type="button"
            onClick={() => showToast('Convite por e-mail e WhatsApp enviado!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-95 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary-container">
              person_add
            </span>
            <span className="font-label-md text-label-md">Convidar</span>
          </button>
        </div>

        {/* Avatares e Participantes */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center -space-x-2.5 overflow-hidden py-1">
            <img
              className="inline-block h-10 w-10 rounded-full shadow-xs object-cover ring-2 ring-white"
              src={IMAGES.camilaAvatar}
              alt="Camila"
              referrerPolicy="no-referrer"
            />
            <img
              className="inline-block h-10 w-10 rounded-full shadow-xs object-cover ring-2 ring-white"
              src={IMAGES.lucas}
              alt="Lucas"
              referrerPolicy="no-referrer"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md shadow-xs ring-2 ring-white font-bold">
              +2
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
              <span className="font-label-sm text-label-sm text-on-surface font-bold">
                Camila (Você • Editora)
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Lucas (Visualizador)
            </span>
          </div>
        </div>

        {/* Link Compartilhado Snippet */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
              link
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              smarttrip.ai/r/salvador-24
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-label-sm text-label-sm active:scale-95 transition-all font-semibold"
          >
            {copyStatus}
          </button>
        </div>
      </div>

      {/* Ferramentas de Evolução do Roteiro com IA */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-surface-container space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[20px]">
              psychology
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Evolução Inteligente
            </h3>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
            Cloud Sync OK
          </span>
        </div>

        {/* Ação Principal de IA */}
        <button
          type="button"
          onClick={() => handleApplyQuickPrompt('Otimização geral com IA')}
          disabled={isApplyingAi}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-primary text-on-primary active:scale-[0.98] transition-transform shadow-md group disabled:opacity-80"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px] text-secondary-fixed">
                neurology
              </span>
            </div>
            <div className="text-left min-w-0">
              <span className="font-label-lg text-label-lg text-on-primary block font-bold">
                Solicitar ajustes à IA
              </span>
              <span className="font-body-sm text-body-sm text-[#bec6e0] truncate block">
                {isApplyingAi ? 'Rebalanceando dados...' : 'Rebalanceie dias, clima e orçamentos'}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[20px] text-on-primary shrink-0 group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>

        {/* Quick Prompts Pills */}
        <div className="space-y-2">
          <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
            Sugestões de comando rápido:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              {
                text: 'Trocar praia por compras no Dia 3',
                icon: 'swap_horiz',
              },
              {
                text: 'Reduzir custo em 15%',
                icon: 'trending_down',
              },
              {
                text: 'Adicionar pôr do sol no Dia 4',
                icon: 'wb_twilight',
              },
            ].map((cmd) => (
              <button
                key={cmd.text}
                type="button"
                onClick={() => handleApplyQuickPrompt(cmd.text)}
                className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-95 text-left font-body-sm text-body-sm transition-all flex items-center gap-1.5 border border-surface-container"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary-container">
                  {cmd.icon}
                </span>
                <span>{cmd.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Histórico de Versões Simplificado */}
        <div className="pt-2 border-t border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Histórico de Versões
            </span>
            <button
              onClick={() => showToast('6 versões salvas no histórico em nuvem')}
              className="font-label-sm text-label-sm text-secondary-container hover:underline font-semibold"
            >
              Ver todas (6)
            </button>
          </div>
          <div className="space-y-2">
            <div
              onClick={() => setActiveVersion('v2.4')}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                activeVersion === 'v2.4'
                  ? 'bg-surface-container border border-secondary-container/30'
                  : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  history
                </span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold leading-tight">
                    v2.4 - Otimização de Rota
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Salvo há 12 min por IA SmartTrip
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-bold">
                Atual
              </span>
            </div>

            <div
              onClick={() => {
                setActiveVersion('v2.3');
                showToast('Versão v2.3 restaurada!');
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                activeVersion === 'v2.3'
                  ? 'bg-surface-container border border-secondary-container/30'
                  : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-outline">
                  schedule
                </span>
                <div>
                  <p className="font-label-md text-label-md leading-tight text-on-surface font-semibold">
                    v2.3 - Adicionado Farol da Barra
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Ontem às 18:42 por Camila
                  </p>
                </div>
              </div>
              <button className="font-label-sm text-label-sm text-secondary-container font-semibold hover:underline">
                Restaurar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Orçamento e Controle Visual */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-surface-container space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[20px]">
              pie_chart
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Divisão do Orçamento
            </h3>
          </div>
          <div className="text-right">
            <span className="font-headline-sm text-headline-sm text-on-surface block font-bold">
              R$ 4.280
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Estimado total
            </span>
          </div>
        </div>

        {/* Barra de Progresso Visual Segmentada */}
        <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex shadow-inner">
          <div className="h-full bg-primary" style={{ width: '40%' }} title="Hospedagem 40%" />
          <div
            className="h-full bg-secondary-container"
            style={{ width: '25%' }}
            title="Passeios 25%"
          />
          <div
            className="h-full bg-on-tertiary-container"
            style={{ width: '25%' }}
            title="Alimentação 25%"
          />
          <div
            className="h-full bg-outline-variant"
            style={{ width: '10%' }}
            title="Transporte 10%"
          />
        </div>

        {/* Legenda de Categorias */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low">
            <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                Hospedagem (40%)
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                R$ 1.712
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low">
            <div className="w-3 h-3 rounded-full bg-secondary-container shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                Passeios (25%)
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                R$ 1.070
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low">
            <div className="w-3 h-3 rounded-full bg-on-tertiary-container shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                Alimentação (25%)
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                R$ 1.070
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low">
            <div className="w-3 h-3 rounded-full bg-outline-variant shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                Transporte (10%)
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                R$ 428
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações de Exportação e Offline */}
      <div className="space-y-2.5 pt-1">
        <h3 className="font-headline-sm text-headline-sm text-on-surface px-1 font-bold">
          Exportação & Acesso Offline
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {/* Baixar PDF */}
          <button
            type="button"
            onClick={() => showToast('Gerando e baixando PDF completo com mapas offline...')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container active:scale-[0.98] transition-all hover:bg-surface-container-low"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface shrink-0">
                <span className="material-symbols-outlined text-[22px]">download_for_offline</span>
              </div>
              <div className="text-left">
                <span className="font-label-lg text-label-lg block font-bold">
                  Baixar PDF Completo com Mapas
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Ideal para áreas sem sinal ou roaming
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
              chevron_right
            </span>
          </button>

          {/* Sincronizar Calendários */}
          <button
            type="button"
            onClick={() => showToast('Eventos sincronizados com Google Agenda e Apple Calendar!')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container active:scale-[0.98] transition-all hover:bg-surface-container-low"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface shrink-0">
                <span className="material-symbols-outlined text-[22px]">event_available</span>
              </div>
              <div className="text-left">
                <span className="font-label-lg text-label-lg block font-bold">
                  Sincronizar com Calendário
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Google Agenda, Apple Calendar e Outlook
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
              sync
            </span>
          </button>

          {/* Compartilhar WhatsApp / Redes */}
          <button
            type="button"
            onClick={() => showToast('Abrindo opções de compartilhamento...')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary-container hover:bg-secondary text-on-secondary shadow-md active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-on-primary/20 flex items-center justify-center text-on-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">share</span>
              </div>
              <div className="text-left">
                <span className="font-label-lg text-label-lg block font-bold">
                  Compartilhar no WhatsApp / Redes
                </span>
                <span className="font-body-sm text-body-sm text-on-primary/80">
                  Envie resumo instantâneo com 1 clique
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-primary">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
