import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HelloMfeComponent } from './hello-mfe/hello-mfe';
import { CryptoService, generateDevSecureContext } from 'ngx-felix-lib';
import { MY_MFE_DEV_CONFIG } from './dev-config.mock';
import { MFE_ENCRYPTION_KEY, MFE_ORIGIN_ID } from './app.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HelloMfeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('mfe-app');
  public mockContext = signal<string>('');

  private crypto: CryptoService;
  private encryptionKey: string;
  private originId: string;

  constructor() {
    this.crypto = inject(CryptoService);
    this.encryptionKey = inject(MFE_ENCRYPTION_KEY);
    this.originId = inject(MFE_ORIGIN_ID);
  }

  ngOnInit() {
    console.log('[App DEBUG] environment token injetado no App:', this.encryptionKey);
    console.log('[App DEBUG] app Origin ID injetado:', this.originId);

    if (!this.encryptionKey) {
      console.error('[App DEBUG] A chave de encriptação está FALSY na inicialização do App! Valor local do environment devia ter sido Injetado.');
    }

    const config = {
      payload: MY_MFE_DEV_CONFIG,
      encryptionKey: this.encryptionKey,
      originId: this.originId,
    };

    console.log('[App DEBUG] Configuração passada para generateDevSecureContext:', config);

    try {
      const envelope = generateDevSecureContext(config, this.crypto);
      console.log('[App DEBUG] Contexto simulado gerado com sucesso:', envelope);
      this.mockContext.set(envelope);
    } catch (e) {
      console.error('[App DEBUG] Erro detectado no mockContext:', e);
    }
  }
}
