import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class CryptoService {

  encrypt(data: any, key: string): string {
    if (!key) throw new Error('[MFE Security] Chave de criptografia ausente.');
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, key).toString();
  }

  decrypt<T>(ciphertext: string, key: string): T {
    if (!key) throw new Error('[MFE Security] Chave de descriptografia ausente.');
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalText) throw new Error('Dados corrompidos ou chave inválida');

      return JSON.parse(originalText) as T;
    } catch (e) {
      throw new Error('[MFE Security] Falha crítica de segurança na descriptografia.');
    }
  }
}
