import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_CONFIG, ApiConfig } from './api-config.token';

export interface EnterpriseEnvironment {
  apiBaseUrl: string;
  [key: string]: any;
}

export interface RepositoryOptions {
  environment: EnterpriseEnvironment | any;
}

export function provideEnterpriseArchitecture(options: RepositoryOptions): EnvironmentProviders {
  if (!options.environment || typeof options.environment.apiBaseUrl !== 'string') {
    throw new Error(
      '[ngx-felix-lib] ERRO CRÍTICO: A variável "apiBaseUrl" não foi encontrada no environment.'
    );
  }

  const apiConfig: ApiConfig = {
    baseUrl: options.environment.apiBaseUrl
  };

  return makeEnvironmentProviders([
    { provide: API_CONFIG, useValue: apiConfig }
  ]);
}
