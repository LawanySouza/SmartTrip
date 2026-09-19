/**
 * Modelo de dados climáticos (RF-011, RN-007)
 * Conforme Seção 12 e 13 da SPEC Mestre do SmartTrip.
 */

export type WeatherCondition = 'sunny' | 'partly_cloudy' | 'rain' | 'cloudy' | 'storm';

export interface WeatherDayForecast {
  dayName: string;
  dateStr: string;
  minTemp: number;
  maxTemp: number;
  avgTemp?: number;
  rainProbability: number;
  condition: WeatherCondition;
  icon: string;
  alert?: string;
  isHistoricalFallback?: boolean;
}

export interface WeatherForecastSummary {
  destination: string;
  averageTemp: number;
  conditionSummary: string;
  rainProbability: number;
  days: WeatherDayForecast[];
}
