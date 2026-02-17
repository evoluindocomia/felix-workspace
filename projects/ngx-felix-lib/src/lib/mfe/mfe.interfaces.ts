export interface LoadRemoteOptions {
  remoteName: string;
  exposedModule: string;
}

export interface MfeConfig {
  remoteName: string;
  exposedModule: string;
  componentName?: string;
  loader: (options: LoadRemoteOptions) => Promise<any>;
}

export interface SecurityConfig {
  encryptionKey: string;
  originId: string;
}

// O Envelope Seguro que é criptografado
export interface MfeContext<T = any> {
  origin: string;
  timestamp: number;
  payload: T;
}

// O que esperamos trafegar dentro do payload
export interface EnterprisePayload {
  apiToken?: string;
  apiUrl?: string;
  [key: string]: any;
}
