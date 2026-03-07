import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { enterpriseHttpInterceptor, CryptoService, MFE_ENCRYPTION_KEY, MFE_ORIGIN_ID } from 'ngx-felix-lib';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

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

console.log('[AppConfig DEBUG] environment.encryptionKey lido no config:', environment.encryptionKey);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([enterpriseHttpInterceptor])),
    { provide: CryptoService, useClass: SafeCryptoServiceProxy },
    { provide: MFE_ENCRYPTION_KEY, useValue: environment.encryptionKey },
    { provide: MFE_ORIGIN_ID, useValue: environment.mfeOriginId },
  ],
};
