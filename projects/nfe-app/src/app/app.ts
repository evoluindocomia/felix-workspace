import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HelloMfeComponent } from './hello-mfe/hello-mfe';
import { CryptoService, generateDevSecureContext } from 'ngx-felix-lib';
import { MY_MFE_DEV_CONFIG } from './dev-config.mock';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HelloMfeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('nfe-app');
  public mockContext = signal<string>('');

  // No build standalone (Isolated Dev), App é a raiz e simula o host.
  // Importante assegurar que a injeção do CryptoService funciona adequadamente.
  private crypto = inject(CryptoService);

  ngOnInit() {
    // Mesma chave de proteção que o MFE espera na ponta descriptográfica
    const config = {
      payload: MY_MFE_DEV_CONFIG,
      encryptionKey: 'MINHA_CHAVE_SUPER_SECRETA_H1B2',
      originId: 'NFE_DEV_BUILD',
    };

    // Gerar o envelope encriptado idêntico a produção e passar para o component filho
    const envelope = generateDevSecureContext(config, this.crypto);
    this.mockContext.set(envelope);
  }
}
