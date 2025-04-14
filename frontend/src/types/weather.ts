export interface WeatherReport {
  id: number;
  timestamp: string;
  temp: number;
  humidity: number;
  pressure: number;
  clouds: number;
}

export interface WeatherComparison {
  id: number;
  temperatureDiff: number;
  humidityDiff: number;
  pressureDiff: number;
  cloudsDiff: number;
}

export interface CompareRequest {
  report1_id: number;
  report2_id: number;
} 

export interface WeatherHistoryParams {
  page?: number;
  limit?: number;
  date?: string;
  temp?: string;
  humidity?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WeatherHistoryResponse {
  data: WeatherReport[];
  total: number;
}
