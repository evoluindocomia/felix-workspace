import { Component, Input, inject, signal, Output, EventEmitter } from '@angular/core';
import { EnterpriseContextService, MFE_ENCRYPTION_KEY, MFE_ORIGIN_ID } from 'ngx-felix-lib';
import { SupabaseMockService } from '../supabase-mock';

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
  @Output() mfeReturn = new EventEmitter<string>();

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

          // Enviando o resultado de volta para o Root informando sucesso e os dados
          // Aqui passamos the userInfo() como data e 'success' como status
          const secureReturn = this.contextService.buildReturnContext(this.userInfo(), 'success');
          this.mfeReturn.emit(secureReturn);
        },
        error: (err) => {
          this.errorMessage.set('Erro ao buscar dados do mock: ' + err.message);

          // Opcional: Avisar o Root sobre a falha interna
          const errorReturn = this.contextService.buildReturnContext({ error: err.message }, 'error');
          this.mfeReturn.emit(errorReturn);
        },
      });
    } catch (e: any) {
      this.errorMessage.set('Falha ao descriptografar o contexto MFE. Chave inválida?');
      console.error(e);
    }
  }
}
