/*
 * Public API Surface of ngx-felix-lib
 */

// export * from './lib/ngx-felix-lib';
// export * from './lib/apagar/repository/repository.interfaces';
// export * from './lib/apagar/repository/query-builder';
// export * from './lib/apagar/repository/api-config.token';
// export * from './lib/apagar/repository/base-repository.service';

// // MFE
// export * from './lib/apagar/mfe/mfe.config';
// export * from './lib/apagar/mfe/crypto.service';
// export * from './lib/apagar/mfe/mfe-outlet.directive';
// export * from './lib/apagar/mfe/mfe-receiver';

// Exportações de Orquestração e MFE
export * from './lib/mfe/mfe.interfaces';
export * from './lib/mfe/mfe-outlet.directive';

// Exportações de Controle de Contexto e Interceptação
export * from './lib/context/crypto.service';
export * from './lib/context/enterprise.interceptor';
export * from './lib/context/enterprise-context.service';

// Exportações de Repositório e HTTP
export * from './lib/repository/repository.interfaces';
export * from './lib/repository/query-builder';
export * from './lib/repository/api-config.token';
export * from './lib/repository/base-repository.service';
export * from './lib/repository/repository.provider';
