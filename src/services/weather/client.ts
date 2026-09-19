/**
 * Open-Meteo Weather Service Stub
 *
 * Módulo previsto na Seção 13.4 da SPEC Mestre (RF-011, RN-007).
 * Implementação programada para a Fase 2 do Roadmap (Destino e Clima).
 *
 * NÃO IMPLEMENTADO AINDA nesta etapa de scaffolding.
 */

import { WeatherForecastSummary } from '../../types';

export interface FetchWeatherParams {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
}

export async function fetchWeatherForecast(
  _params: FetchWeatherParams
): Promise<WeatherForecastSummary | null> {
  // Stub intencional para validação de contratos e scaffolding
  return null;
}
