import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_CONFIG, ApiConfig } from './api-config.token';

export interface EnterpriseEnvironment {
  url_base_api: string;
  [key: string]: any;
}

export interface RepositoryOptions {
  environment: EnterpriseEnvironment | any;
}

export function provideEnterpriseArchitecture(options: RepositoryOptions): EnvironmentProviders {
  if (!options.environment || typeof options.environment.url_base_api !== 'string') {
    throw new Error(
      '[ngx-felix-lib] ERRO CRÍTICO: A variável "url_base_api" não foi encontrada no environment.'
    );
  }

  const apiConfig: ApiConfig = {
    baseUrl: options.environment.url_base_api
  };

  return makeEnvironmentProviders([
    { provide: API_CONFIG, useValue: apiConfig }
  ]);
}
