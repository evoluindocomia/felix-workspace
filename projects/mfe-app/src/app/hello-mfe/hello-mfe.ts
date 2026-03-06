import { Component, Input, inject, signal } from '@angular/core';
import { EnterpriseContextService } from 'ngx-felix-lib';
import { SupabaseMockService } from '../supabase-mock';
import { MFE_ENCRYPTION_KEY, MFE_ORIGIN_ID } from '../app.config';

@Component({
  selector: 'app-hello-mfe',
  standalone: true,
  imports: [],
  templateUrl: './hello-mfe.html',
  styleUrl: './hello-mfe.scss',
})
export class HelloMfeComponent {
  private contextService = inject(EnterpriseContextService);
  private supabaseMock = inject(SupabaseMockService);
  private encryptionKey = inject(MFE_ENCRYPTION_KEY);
  private expectedOriginId = inject(MFE_ORIGIN_ID);

  private _secureContextValue!: string;

  @Input()
  set _secureContext(val: string) {
    if (val) {
      this._secureContextValue = val;
      this.processContext();
    }
  }
  get _secureContext(): string {
    return this._secureContextValue;
  }

  @Input() greetingParam!: string;

  readonly userInfo = signal<any>(null);
  readonly errorMessage = signal<string>(
    'Nenhum contexto seguro (Token/URL) recebido do Host ainda... Aguardando injeção.',
  );

  private processContext() {
    try {
      // Chave injetada via InjectionToken e Origin Esperada para Anti-Spoofing
      this.contextService.initialize(this._secureContext, this.encryptionKey, this.expectedOriginId);

      console.log('MFE - Contexto Descriptografado com Sucesso!');
      this.errorMessage.set('');

      const customData = this.contextService.getPayloadData<{ greetingParam: string }>();
      if (customData?.greetingParam) {
        this.greetingParam = customData.greetingParam;
      }

      this.supabaseMock.getUserData().subscribe({
        next: (data) => {
          this.userInfo.set({ ...data, name: 'Mock da Silva' });
        },
        error: (err) => {
          this.errorMessage.set('Erro ao buscar dados do mock: ' + err.message);
        },
      });
    } catch (e: any) {
      this.errorMessage.set('Falha ao descriptografar o contexto MFE. Chave inválida?');
      console.error(e);
    }
  }
}
