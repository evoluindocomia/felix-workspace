import { MfeContext } from './mfe.config';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CryptoService } from './crypto.service';
import { MfeMessage } from './mfe.config';

@Component({ template: '' })
export abstract class MfeBaseComponent<TContext, TParams> implements OnChanges {

  // --- ENTRADAS PADRONIZADAS (Gerenciadas pela Diretiva) ---
  @Input() _secureContext: string = '';
  @Input() _inParams: TParams[] = [];

  // --- SAÍDAS PADRONIZADAS ---
  @Output() _outParams = new EventEmitter<TParams[]>();
  @Output() _statusMessage = new EventEmitter<MfeMessage>();

  // --- SERVIÇOS ---
  protected crypto = inject(CryptoService);

  // --- ESTADO INTERNO ---
  protected context: TContext | null = null;

  // --- CONFIGURAÇÃO OBRIGATÓRIA PELO FILHO ---
  protected abstract encryptionKey: string;

  // --- GETTER HELPER ---
  protected get params(): TParams[] {
    return this._inParams || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 1. Processa Segurança
    if (changes['_secureContext'] && this._secureContext) {
      this.processSecurity();
    }

    // 2. Processa Parâmetros
    if (changes['_inParams'] && this._inParams) {
      const validation = this.validateParams(this._inParams);

      if (validation) {
        this.emitStatus(validation);
        // Se for erro, interrompe e não notifica recebimento
        if (validation.type === 'ERROR') return;
      }

      this.onParamsReceived(this._inParams);
    }
  }

  // --- LÓGICA DE SEGURANÇA ---
  private processSecurity() {
    try {
      const envelope = this.crypto.decrypt<MfeContext<TContext>>(
        this._secureContext,
        this.encryptionKey
      );
      this.validateContext(envelope.payload); // Hook de validação
      this.context = envelope.payload;
      this.onContextReady(this.context);      // Hook de sucesso
    } catch (err: any) {
      console.error('[MFE Security] Bloqueio:', err);
      this.reportError('Falha de segurança ou acesso negado.', 'SEC_BLOCK', err.message);
      this.context = null;
    }
  }

  // --- MÉTODOS PÚBLICOS PARA O DESENVOLVEDOR ---

  /** Devolve dados atualizados para o Shell */
  protected returnParams(data: TParams[]): void {
    this._outParams.emit(data);
  }

  /** Reporta Erro para o Shell */
  protected reportError(text: string, code = 'GENERIC', details?: any) {
    this.emitStatus({ type: 'ERROR', code, text, details, timestamp: new Date() });
  }

  /** Reporta Sucesso para o Shell */
  protected reportSuccess(text: string) {
    this.emitStatus({ type: 'SUCCESS', code: 'OK', text, timestamp: new Date() });
  }

  private emitStatus(msg: MfeMessage) {
    this._statusMessage.emit(msg);
  }

  // --- HOOKS ABSTRATOS (OBRIGATÓRIOS) ---

  /** Valide se o token/usuário tem permissão. Lance erro se falhar. */
  protected abstract validateContext(ctx: any): void;

  /** Chamado quando o contexto está seguro e pronto para uso. */
  protected abstract onContextReady(ctx: TContext): void;

  /**
   * Valide os dados de entrada. Retorne MfeMessage se houver erro/aviso.
   * Retorne null se estiver tudo OK.
   */
  protected abstract validateParams(params: TParams[]): MfeMessage | null;

  // --- HOOKS OPCIONAIS ---
  protected onParamsReceived(params: TParams[]): void {}
}
