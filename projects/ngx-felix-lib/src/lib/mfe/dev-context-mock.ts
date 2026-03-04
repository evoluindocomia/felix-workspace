import { MfeContext } from './mfe.interfaces';
import { CryptoService } from '../context/crypto.service';

/**
 * Função utilitária para gerar e criptografar o contexto MFE em modo de desenvolvimento (Standalone).
 * Simula a diretiva [mfeOutlet] enviando dados simulados (mock) do Host.
 *
 * @param config A configuração do Mock (payload genérico e The Encryption Key idêntica à de envio)
 * @param crypto A instância do CryptoService
 * @returns A string base64 cifrada para uso no @Input() _secureContext
 */
export function generateDevSecureContext<T = any>(
  config: import('./mfe.interfaces').DevContextMockConfig<T>,
  crypto: CryptoService,
): string {
  if (!crypto) {
    throw new Error(
      '[DevContextMock] Instância de CryptoService é obrigatória.',
    );
  }

  const envelope: MfeContext<T> = {
    origin: config.originId || 'DEV_MOCK_HOST',
    timestamp: Date.now(),
    payload: config.payload,
  };

  return crypto.encrypt(envelope, config.encryptionKey);
}
