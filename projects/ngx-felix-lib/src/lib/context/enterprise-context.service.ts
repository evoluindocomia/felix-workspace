import { Injectable, signal } from '@angular/core';
import { CryptoService } from './crypto.service';
import { MfeContext, EnterprisePayload } from '../mfe/mfe.interfaces';

@Injectable({ providedIn: 'root' })
export class EnterpriseContextService {
  // Estado global do MFE gerido por Signals
  private contextState = signal<EnterprisePayload | null>(null);

  constructor(private crypto: CryptoService) {}

  public initialize(secureContext: string, encryptionKey: string, expectedOriginId?: string): void {
    if (!secureContext) return;

    try {
      const envelope = this.crypto.decrypt<MfeContext<EnterprisePayload>>(
        secureContext,
        encryptionKey,
      );

      // Proteção 1: Anti-Replay (Expiração Temporal Estrita - 5 minutos)
      const MAX_TOLERANCE_MS = 5 * 60 * 1000;
      const timeDiff = Date.now() - envelope.timestamp;

      if (timeDiff > MAX_TOLERANCE_MS || timeDiff < -MAX_TOLERANCE_MS) { // Protege contra relógios dessincronizados do Host pro futuro também
        throw new Error('[MFE Security] O token de segurança expirou (Replay Attack mitigado).');
      }

      // Proteção 2: Origin Spoofing (Só valida se o Consumidor enviar o Origin Esperado)
      if (expectedOriginId && envelope.origin !== expectedOriginId) {
        throw new Error(`[MFE Security] Origem desconhecida da Host interceptada. Esperado: ${expectedOriginId}, Recebido: ${envelope.origin}`);
      }

      this.contextState.set(envelope.payload); // Salva o token e a URL no signal
    } catch (error: any) {
      console.error('[ngx-felix-lib] Falha na descriptografia ou validação do contexto:', error.message);
      throw error;
    }
  }

  // Getters reativos para o resto da aplicação consumir
  public get context() {
    return this.contextState();
  }
  public get token() {
    return this.contextState()?.apiToken;
  }
  public get dynamicApiUrl() {
    return this.contextState()?.apiUrl;
  }

  // Acesso direto e tipável ao objeto JSON flexível trafegado
  public getPayloadData<T = any>(): T | undefined {
    const currentState = this.contextState();
    return currentState?.data ? (currentState.data as T) : undefined;
  }
}
