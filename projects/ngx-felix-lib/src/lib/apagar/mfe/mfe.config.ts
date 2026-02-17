export interface MfeConfig {
  /** Nome único do MFE (deve bater com o federation.manifest) */
  remoteName: string;
  /** Caminho do módulo exposto (ex: './TransactionWidget') */
  exposedModule: string;
  /** (Opcional) Nome do componente exportado. Default: 'default' */
  componentName?: string;
  /** Estratégia de carregamento (Injeção de Dependência da função loadRemoteModule) */
  loader: (options: LoadRemoteOptions) => Promise<any>;
}


export interface LoadRemoteOptions {
  remoteName: string;
  exposedModule: string;
}


export interface MfeEvent<T = any> {
  type: string;
  payload: T;
}

export interface SecurityConfig {
  /** Chave simétrica (AES) compartilhada entre Host e MFE */
  encryptionKey: string;
  /** Identificador da origem para validação (ex: 'PortalCorporativo') */
  originId: string;
}

export interface MfeContext<T = any> {
  origin: string;
  timestamp: number;
  payload: T;
}

// --- SISTEMA DE MENSAGENS E STATUS ---
export type MfeMessageType = 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface MfeMessage {
  type: MfeMessageType;
  code: string;       // Ex: 'AUTH_FAIL', 'INVALID_PARAM'
  text: string;       // Mensagem para UI
  details?: any;      // Payload técnico para logs
  timestamp: Date;
}
