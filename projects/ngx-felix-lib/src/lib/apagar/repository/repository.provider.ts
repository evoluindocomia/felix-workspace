// projects/ngx-felix-api/src/lib/repository/repository.provider.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_CONFIG, ApiConfig } from './api-config.token';

// Tipagem para garantir inteligência de código (IntelliSense) no projeto consumidor
export interface EnterpriseEnvironment {
  url_base_api: string;
  [key: string]: any; // Permite que o environment tenha outras variáveis da aplicação
}

export interface RepositoryOptions {
  environment: EnterpriseEnvironment | any;
  responseAdapter?: (response: any) => any;
}

export function provideEnterpriseArchitecture(options: RepositoryOptions): EnvironmentProviders {
  if (!options.environment || !options.environment.url_base_api) {
    throw new Error('[ngx-felix-lib] A variável "url_base_api" é obrigatória no environment.');
  }

  const apiConfig: ApiConfig = { baseUrl: options.environment.url_base_api };

  return makeEnvironmentProviders([
    { provide: API_CONFIG, useValue: apiConfig }
  ]);
}

// Exportar o interceptor para ser usado no MFE
export { enterpriseHttpInterceptor } from '../context/enterprise.httpinterceptor';

/**
 * Provedor de configuração do Repositório Agnóstico.
 * Implementa validação Fail-Fast para garantir a integridade da configuração.
 */
export function provideEnterpriseRepository(options: RepositoryOptions): EnvironmentProviders {
  // Validação estrita (Fail-Fast)
  if (!options.environment) {
    throw new Error(
      '[ngx-felix-api] ERRO CRÍTICO: O objeto environment não foi fornecido na inicialização do repositório.'
    );
  }

  if (!options.environment.url_base_api || typeof options.environment.url_base_api !== 'string') {
    throw new Error(
      '[ngx-felix-api] ERRO CRÍTICO: A variável "url_base_api" não foi encontrada no arquivo de environment fornecido ou é inválida. ' +
      'Certifique-se de configurar sua url base da API (ex: url_base_api: "https://api.exemplo.com/v1").'
    );
  }

  // Mapeamento dinâmico para o Token interno do Repositório
  const apiConfig: ApiConfig = {
    baseUrl: options.environment.url_base_api,
    responseAdapter: options.responseAdapter
  };

  return makeEnvironmentProviders([
    {
      provide: API_CONFIG,
      useValue: apiConfig
    }
  ]);
}
