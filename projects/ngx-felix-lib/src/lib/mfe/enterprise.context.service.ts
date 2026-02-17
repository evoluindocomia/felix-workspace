// projects/ngx-enterprise-arch/src/lib/mfe/enterprise-context.service.ts
import { Injectable, signal } from '@angular/core';
import { CryptoService } from './crypto.service';
import { MfeContext } from './mfe.config';

export interface EnterprisePayload {
  apiToken?: string;
  apiUrl?: string;
  [key: string]: any; // Flexibilidade para outros dados (user roles, etc)
}

@Injectable({ providedIn: 'root' })
export class EnterpriseContextService {
  // Utilizamos Signals para garantir reatividade moderna
  private contextState = signal<EnterprisePayload | null>(null);

  constructor(private crypto: CryptoService) {}

  /**
   * Método chamado pelo componente raiz do MFE para inicializar o contexto
   */
  public initialize(secureContext: string, encryptionKey: string): void {
    if (!secureContext) return;

    try {
      const envelope = this.crypto.decrypt<MfeContext<EnterprisePayload>>(secureContext, encryptionKey);
      this.contextState.set(envelope.payload);
      console.log('[ngx-enterprise-arch] Contexto de segurança carregado com sucesso.');
    } catch (error) {
      console.error('[ngx-enterprise-arch] Falha crítica: Violação ou quebra na descriptografia do contexto.');
      throw error;
    }
  }

  // Getters reativos
  public get context() { return this.contextState(); }
  public get token() { return this.contextState()?.apiToken; }
  public get dynamicApiUrl() { return this.contextState()?.apiUrl; }
}
