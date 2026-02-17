import { Injectable, signal } from '@angular/core';
import { CryptoService } from './crypto.service';
import { MfeContext, EnterprisePayload } from '../mfe/mfe.interfaces';

@Injectable({ providedIn: 'root' })
export class EnterpriseContextService {
  // Estado global do MFE gerido por Signals
  private contextState = signal<EnterprisePayload | null>(null);

  constructor(private crypto: CryptoService) {}

  public initialize(secureContext: string, encryptionKey: string): void {
    if (!secureContext) return;

    try {
      const envelope = this.crypto.decrypt<MfeContext<EnterprisePayload>>(secureContext, encryptionKey);
      this.contextState.set(envelope.payload); // Salva o token e a URL no signal
    } catch (error) {
      console.error('[ngx-felix-lib] Falha na descriptografia do contexto.');
      throw error;
    }
  }

  // Getters reativos para o resto da aplicação consumir
  public get context() { return this.contextState(); }
  public get token() { return this.contextState()?.apiToken; }
  public get dynamicApiUrl() { return this.contextState()?.apiUrl; }
}
