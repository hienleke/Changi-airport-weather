export interface WeatherReport {
  id: number;
  timestamp: string;
  temp: number;
  pressure: number;
  humidity: number;
  clouds: number;
}

export interface WeatherDeviation {
  temp: number;
  pressure: number;
  humidity: number;
  clouds: number;
}

export interface WeatherComparison {
  report1: WeatherReport;
  report2: WeatherReport;
  deviation: WeatherDeviation;
}

export interface CompareRequest {
  report1_id: number;
  report2_id: number;
}

export interface OpenWeatherResponse {
  main: {
    temp: number;
    pressure: number;
    humidity: number;
  };
  clouds: {
    all: number;
  };
}

export interface WeatherHistoryParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  date?: string;
  temp?: string;
  humidity?: string;
  pressure?: string;
  clouds?: string;
} 