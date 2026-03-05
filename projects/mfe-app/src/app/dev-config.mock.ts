import { EnterprisePayload } from 'ngx-felix-lib';

export interface NfeCustomData {
  greetingParam: string;
  isMocked: boolean;
}

export const MY_MFE_DEV_CONFIG: EnterprisePayload = {
  apiToken: 'DEV_TOKEN_MOCK_XYZ123',
  originHost: 'NFE_ISOLATED_DEV',
  // O JSON flexível com dados específicos do app:
  data: {
    greetingParam: 'Bem vindo ao MFE Isolado via JSON!',
    isMocked: true,
  } as NfeCustomData,
};
