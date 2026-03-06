import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MfeOutletDirective, MfeConfig, SecurityConfig, EnterprisePayload, CryptoService, MfeContext } from 'ngx-felix-lib';
import { AuthMockService } from './auth-mock';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MfeOutletDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  private crypto = inject(CryptoService);
  private auth = inject(AuthMockService);

  @ViewChild(MfeOutletDirective) mfeOutlet!: MfeOutletDirective;

  ngAfterViewInit() {
    // WORKAROUND: A biblioteca ngx-felix-lib possui um bug arquitetural no ngOnChanges.
    // Ela valida `changes['mfeOutlet']` em vez da propriedade correta da classe `changes['config']`.
    // Isso faz com que o método loadMfe() NUNCA seja chamado nativamente.
    // Disparamos o carregamento manualmente após a view inicializar.
    setTimeout(() => {
      if (this.mfeOutlet) {
        // Ignora a checagem de visibilidade privada do TypeScript
        (this.mfeOutlet as any)['loadMfe']().then(() => {
          // Também forçamos o disparo do injectSecureContext
          // Porque ele também era acionado no ngOnChanges que está quebrado
          this.mfeOutlet.contextData = this.enterpriseData;
          this.mfeOutlet.securityConfig = this.security;
          (this.mfeOutlet as any)['injectSecureContext']();
        });
      }
    });
  }

  mfeConfig: MfeConfig = {
    remoteName: 'nfe-app',
    exposedModule: './Component',
    componentName: 'HelloMfeComponent',
    loader: (options) =>
      loadRemoteModule({
        remoteEntry: 'http://localhost:4201/remoteEntry.json',
        exposedModule: options.exposedModule,
      } as any),
  };

  enterpriseData: EnterprisePayload | any = {
    apiToken: this.auth.getMockToken(),
    apiUrl: this.auth.getApiUrl(),
    greetingParam: 'ola mundo', // Passando dentro do payload genérico de contexto
  };

  security: SecurityConfig = {
    encryptionKey: environment.encryptionKey,
    originId: environment.mfeOriginId,
  };

  greetingParam = 'ola mundo';

  mfeResponseData: any = null;
  mfeResponseStatus: 'success' | 'error' | 'info' | null = null;
  mfeOriginId: string | null = null;

  handleMfeReturn(secureReturn: string) {
    try {
      // Abre o envelope seguro utilizando a chave raiz da host session
      const envelope = this.crypto.decrypt<MfeContext<EnterprisePayload>>(
        secureReturn,
        this.security.encryptionKey
      );

      this.mfeResponseStatus = envelope.payload.status || 'info';
      this.mfeResponseData = envelope.payload.data;
      this.mfeOriginId = envelope.origin;

      console.log(`[Host App] Mensagem recebida do MFE (${this.mfeOriginId}). Status:`, this.mfeResponseStatus);
      console.log('[Host App] Dados:', this.mfeResponseData);

    } catch (e) {
      console.error('[Host App] Falha ao descriptografar o roteamento reverso do MFE!', e);
      this.mfeResponseStatus = 'error';
      this.mfeResponseData = { error: 'Descriptografia Falhou', details: e };
    }
  }
}
