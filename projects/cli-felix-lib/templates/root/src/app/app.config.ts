import { ApplicationConfig, provideBrowserGlobalErrorListeners, InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEnterpriseArchitecture } from 'ngx-felix-lib';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { CryptoService, MFE_ENCRYPTION_KEY, MFE_ORIGIN_ID } from 'ngx-felix-lib';

// Workaround Limpo para o Bug CJS x ESModules da ngx-felix-lib com o crypto-js
class SafeCryptoServiceProxy implements CryptoService {
  encrypt(data: any, key: string): string {
    if (!key) throw new Error('[MFE Security] Chave não fornecida.');
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }
  decrypt(ciphertext: string, key: string): any {
    if (!key) throw new Error('[MFE Security] Chave não fornecida.');
    return JSON.parse(decodeURIComponent(escape(window.atob(ciphertext))));
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEnterpriseArchitecture({ environment }),
    { provide: CryptoService, useClass: SafeCryptoServiceProxy },
    { provide: MFE_ENCRYPTION_KEY, useValue: environment.encryptionKey },
    { provide: MFE_ORIGIN_ID, useValue: environment.mfeOriginId },
  ],
};
