import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  responseAdapter?: (response: any) => any;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
