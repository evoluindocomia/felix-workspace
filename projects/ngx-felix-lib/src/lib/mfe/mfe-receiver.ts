import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CryptoService } from './crypto.service';
import { MfeContext } from './mfe.config';

@Component({ template: '' })
export abstract class MfeSecureReceiver<TContext> implements OnChanges {
  @Input() _secureContext: string = '';
  protected crypto = inject(CryptoService);
  protected abstract encryptionKey: string;
  protected context: TContext | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['_secureContext'] && this._secureContext) {
      this.processContext();
    }
  }

  private processContext() {
    try {
      const envelope = this.crypto.decrypt<MfeContext<TContext>>(
        this._secureContext,
        this.encryptionKey
      );
      this.validateContext(envelope.payload);
      this.context = envelope.payload;
      this.onContextReady(this.context);
    } catch (error) {
      console.error('[MFE Security] Acesso negado ou dados corrompidos.', error);
      this.onContextError(error);
    }
  }

  protected abstract validateContext(payload: any): void;
  protected abstract onContextReady(context: TContext): void;
  protected onContextError(error: any): void {
    this.context = null;
  }
}
