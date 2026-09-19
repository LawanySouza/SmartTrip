/**
 * Google Gemini Client & Orchestrator Stub
 *
 * Módulo previsto na Seção 13.3 da SPEC Mestre (RF-013 a RF-016).
 * Implementação programada para a Fase 3 do Roadmap (Geração com Gemini).
 *
 * NÃO IMPLEMENTADO AINDA nesta etapa de scaffolding.
 */

import { TripConfig, DayPlan } from '../../types';

export interface GenerateItineraryParams {
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  config: TripConfig;
  weatherSummary?: string;
  selectedPois?: string[];
}

export interface GenerateItineraryResult {
  success: boolean;
  itinerary?: DayPlan[];
  error?: string;
}

export async function generateTripItinerary(
  _params: GenerateItineraryParams
): Promise<GenerateItineraryResult> {
  // Stub intencional para validação de contratos e scaffolding
  return {
    success: false,
    error: 'Módulo Gemini ainda não implementado. Programado para a Fase 3 da SPEC.',
  };
}
