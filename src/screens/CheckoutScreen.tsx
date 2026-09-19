import React, { useState } from 'react';
import { ScreenType } from '../types';

interface CheckoutScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onNavigate }) => {
  const [paymentTab, setPaymentTab] = useState<'card' | 'pix' | 'wallets'>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 4289');
  const [cardHolder, setCardHolder] = useState('CAMILA ALBUQUERQUE');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('834');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onNavigate('success');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-4">
      {/* Security Micro-Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container rounded-2xl border border-surface-container-high">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
          <span className="font-label-md text-label-md font-semibold">
            Checkout 100% Criptografado
          </span>
        </div>
        <span className="font-label-sm text-label-sm uppercase px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold tracking-wider">
          PCI-DSS
        </span>
      </div>

      {/* 1. Resumo do Pedido */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Plano Anual SmartTrip PRO
              </span>
              <span className="bg-primary text-on-primary text-[10px] font-label-sm font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                7D Free
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Acesso ilimitado a roteiros generativos por IA, concierge 24h e sincronização offline.
            </p>
          </div>
        </div>

        {/* Pricing Ledger Breakdown */}
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 text-on-surface">
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>Preço regular (1 ano)</span>
            <span className="line-through text-outline">R$ 478,80</span>
          </div>
          <div className="flex justify-between items-center text-secondary font-body-sm text-body-sm font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">percent</span>
              Desconto Plano Anual (25%)
            </span>
            <span>- R$ 120,00</span>
          </div>
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-label-sm text-label-sm uppercase px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-bold tracking-wider">
                BEMVINDOIA
              </span>
              <span
                className="material-symbols-outlined text-[16px] text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <span className="text-secondary font-semibold">- R$ 20,00</span>
          </div>
          <div className="my-1 h-[1px] bg-surface-container-highest w-full" />
          <div className="flex justify-between items-baseline">
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">
                Total cobrado hoje
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Após 7 dias: 12x de R$ 28,23 (R$ 338,80/ano)
              </span>
            </div>
            <div className="text-right">
              <span className="font-headline-lg text-headline-lg text-secondary font-bold">
                R$ 0,00
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Formas de Pagamento Selector */}
      <section className="flex flex-col gap-2.5">
        <span className="font-headline-sm text-headline-sm text-on-surface px-1 font-bold">
          Método de Pagamento
        </span>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card */}
          <button
            type="button"
            onClick={() => setPaymentTab('card')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all text-center border ${
              paymentTab === 'card'
                ? 'bg-surface-container-lowest border-secondary-container shadow-sm text-on-surface'
                : 'bg-surface-container-low border-transparent text-on-surface-variant opacity-85'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] mb-1 ${
                paymentTab === 'card' ? 'text-secondary' : 'text-on-surface-variant'
              }`}
            >
              credit_card
            </span>
            <span className="font-label-md text-label-md font-bold">Cartão</span>
            <span className="text-[10px] text-on-surface-variant">Até 12x</span>
          </button>

          {/* PIX */}
          <button
            type="button"
            onClick={() => setPaymentTab('pix')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all text-center border ${
              paymentTab === 'pix'
                ? 'bg-surface-container-lowest border-secondary-container shadow-sm text-on-surface'
                : 'bg-surface-container-low border-transparent text-on-surface-variant opacity-85'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] mb-1 ${
                paymentTab === 'pix' ? 'text-secondary' : 'text-on-surface-variant'
              }`}
            >
              qr_code_2
            </span>
            <span className="font-label-md text-label-md font-bold">PIX</span>
            <span className="text-[10px] font-bold text-secondary">+5% OFF</span>
          </button>

          {/* Wallets */}
          <button
            type="button"
            onClick={() => setPaymentTab('wallets')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all text-center border ${
              paymentTab === 'wallets'
                ? 'bg-surface-container-lowest border-secondary-container shadow-sm text-on-surface'
                : 'bg-surface-container-low border-transparent text-on-surface-variant opacity-85'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] mb-1 ${
                paymentTab === 'wallets' ? 'text-secondary' : 'text-on-surface-variant'
              }`}
            >
              account_balance_wallet
            </span>
            <span className="font-label-md text-label-md font-bold">Carteiras</span>
            <span className="text-[10px] text-on-surface-variant">Apple/GPay</span>
          </button>
        </div>

        {/* Credit Card Panel */}
        {paymentTab === 'card' && (
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-1">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">
                Dados do Cartão de Crédito
              </span>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                <span className="material-symbols-outlined text-[20px]">contactless</span>
              </div>
            </div>

            {/* Card Number */}
            <div className="flex flex-col gap-1">
              <label htmlFor="card-number" className="font-label-md text-label-md text-on-surface-variant">
                Número do Cartão
              </label>
              <div className="relative flex items-center">
                <input
                  id="card-number"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
                />
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
                  credit_card
                </span>
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="card-holder" className="font-label-md text-label-md text-on-surface-variant">
                Nome Impresso no Cartão
              </label>
              <div className="relative flex items-center">
                <input
                  id="card-holder"
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="NOME COMO NO CARTÃO"
                  className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 uppercase font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
                />
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
                  person
                </span>
              </div>
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="card-exp" className="font-label-md text-label-md text-on-surface-variant">
                  Validade
                </label>
                <div className="relative flex items-center">
                  <input
                    id="card-exp"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    placeholder="MM/AA"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
                  />
                  <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
                    calendar_today
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="card-cvv" className="font-label-md text-label-md text-on-surface-variant">
                    CVV
                  </label>
                  <span className="material-symbols-outlined text-[16px] text-outline cursor-pointer" title="3 dígitos no verso do cartão">
                    help
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="card-cvv"
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={4}
                    placeholder="123"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
                  />
                  <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
                    shield
                  </span>
                </div>
              </div>
            </div>

            {/* Installments dropdown */}
            <div className="flex flex-col gap-1">
              <label htmlFor="installments" className="font-label-md text-label-md text-on-surface-variant">
                Opções de Parcelamento
              </label>
              <div className="relative flex items-center">
                <select
                  id="installments"
                  defaultValue="12x de R$ 28,23 sem juros (R$ 338,80)"
                  className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 pr-8 font-body-md text-body-md text-on-surface outline-none appearance-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
                >
                  <option>12x de R$ 28,23 sem juros (R$ 338,80)</option>
                  <option>6x de R$ 56,46 sem juros</option>
                  <option>3x de R$ 112,93 sem juros</option>
                  <option>1x de R$ 338,80 à vista</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline pointer-events-none">
                  payments
                </span>
                <span className="material-symbols-outlined absolute right-3 text-[20px] text-outline pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Save card switch */}
            <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-secondary accent-secondary focus:ring-0"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                Salvar dados de pagamento para futuras viagens com segurança de 1 clique
              </span>
            </label>
          </form>
        )}

        {/* PIX Panel */}
        {paymentTab === 'pix' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Ativação Imediata via PIX
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-1">
                O código copia-e-cola com 5% de desconto extra será gerado após confirmar o teste de
                7 dias.
              </span>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-full font-label-md text-label-md text-secondary font-bold">
              Desconto final: R$ 321,86 no primeiro ano
            </div>
          </div>
        )}

        {/* Wallets Panel */}
        {paymentTab === 'wallets' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onNavigate('success')}
              className="w-full h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-sm font-semibold active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
              Pagar com Apple Pay
            </button>
            <button
              type="button"
              onClick={() => onNavigate('success')}
              className="w-full h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center gap-2 font-label-lg text-label-lg font-semibold active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]">android</span>
              Pagar com Google Pay
            </button>
          </div>
        )}
      </section>

      {/* 3. Informações de Faturamento */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Dados de Cobrança
          </span>
          <span className="material-symbols-outlined text-[20px] text-outline">receipt_long</span>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="billing-cpf" className="font-label-md text-label-md text-on-surface-variant">
            CPF do Titular (para Nota Fiscal)
          </label>
          <div className="relative flex items-center">
            <input
              id="billing-cpf"
              type="text"
              defaultValue="382.491.028-44"
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
              badge
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 flex flex-col gap-1">
            <label htmlFor="billing-cep" className="font-label-md text-label-md text-on-surface-variant">
              CEP
            </label>
            <input
              id="billing-cep"
              type="text"
              defaultValue="40140-110"
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="billing-city" className="font-label-md text-label-md text-on-surface-variant">
              Cidade / UF
            </label>
            <input
              id="billing-city"
              type="text"
              defaultValue="Salvador, BA"
              readOnly
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 font-body-md text-body-md text-on-surface outline-none opacity-80 font-medium"
            />
          </div>
        </div>
      </section>

      {/* 4. Selos de Confiança e Segurança */}
      <section className="grid grid-cols-3 gap-2 text-center py-1">
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant border border-surface-container">
          <span className="material-symbols-outlined text-secondary text-[22px] mb-1">
            verified_user
          </span>
          <span className="font-label-sm text-label-sm font-bold text-on-surface">
            Garantia 7 Dias
          </span>
          <span className="text-[10px]">Reembolso 100%</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant border border-surface-container">
          <span className="material-symbols-outlined text-secondary text-[22px] mb-1">
            encrypted
          </span>
          <span className="font-label-sm text-label-sm font-bold text-on-surface">SSL 256-Bit</span>
          <span className="text-[10px]">Dados Blindados</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant border border-surface-container">
          <span className="material-symbols-outlined text-secondary text-[22px] mb-1">cancel</span>
          <span className="font-label-sm text-label-sm font-bold text-on-surface">Sem Multas</span>
          <span className="text-[10px]">Cancele no App</span>
        </div>
      </section>

      {/* 5. CTA e Conclusão */}
      <section className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full h-14 bg-secondary-container hover:bg-secondary text-on-secondary active:scale-[0.99] rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-80 font-bold"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[24px] animate-spin">
                progress_activity
              </span>
              <span className="font-label-lg text-label-lg tracking-wide uppercase font-bold">
                Processando Assinatura...
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
              <span className="font-label-lg text-label-lg tracking-wide uppercase font-bold">
                Confirmar com 7 Dias Grátis
              </span>
            </>
          )}
        </button>
        <p className="text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
          Você não será cobrado se cancelar antes do 7º dia.
        </p>
      </section>
    </div>
  );
};
