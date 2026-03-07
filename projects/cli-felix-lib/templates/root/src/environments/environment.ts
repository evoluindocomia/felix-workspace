export const environment = {
  production: true,
  staging: false,
  apiBaseUrl: 'https://api.empresa.com.br/v1',
  mfeBaseUrl: 'https://mfe.empresa.com.br',
  encryptionKey: '', // Em prod: injetado via processo de build ou servidor seguro
  mfeOriginId: 'ROOT_APP_HOST_PROD',
};
