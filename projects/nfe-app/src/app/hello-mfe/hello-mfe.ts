import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterpriseContextService } from 'ngx-felix-lib';
import { SupabaseMockService } from '../supabase-mock';

@Component({
  selector: 'app-hello-mfe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hello-mfe.html',
  styleUrl: './hello-mfe.scss',
})
export class HelloMfeComponent {
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

  userInfo: any = null;
  errorMessage: string =
    'Nenhum contexto seguro (Token/URL) recebido do Host ainda... Aguardando injeção.';

  constructor(
    private contextService: EnterpriseContextService,
    private supabaseMock: SupabaseMockService,
  ) {}

  private processContext() {
    try {
      // Mesma chave definida no MfeOutlet da Host
      const CHAVE_COMPARTILHADA = 'MINHA_CHAVE_SUPER_SECRETA_H1B2';
      this.contextService.initialize(this._secureContext, CHAVE_COMPARTILHADA);

      console.log('MFE - Contexto Descriptografado com Sucesso!');

      // Limpa mensagem de erro pois recebeu contexto
      this.errorMessage = '';

      // Se a lib desempatocu e disponibilizou no contextState o payload genérico:
      const customData = this.contextService.getPayloadData<{ greetingParam: string }>();
      if (customData && customData.greetingParam) {
        this.greetingParam = customData.greetingParam;
      }

      // Agora que o contexto/token está na memória (signal) gerenciado pela ngx-felix-lib,
      // qualquer requisição HTTP passará pelo Interceptor Corporativo automaticamente.
      this.supabaseMock.getUserData().subscribe({
        next: (data) => {
          // Vamos forçar o nome esperado nos requisitos
          this.userInfo = { ...data, name: 'Mock da Silva' };
        },
        error: (err) => {
          this.errorMessage = 'Erro ao buscar dados do mock: ' + err.message;
        },
      });
    } catch (e: any) {
      this.errorMessage = 'Falha ao descriptografar o contexto MFE. Chave inválida?';
      console.error(e);
    }
  }
}
