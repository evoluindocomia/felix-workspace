import {
  Directive,
  Input,
  ViewContainerRef,
  ComponentRef,
  OnChanges,
  SimpleChanges,
  Type,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { MfeConfig, SecurityConfig, MfeContext } from './mfe.interfaces';
import { CryptoService } from '../context/crypto.service';

@Directive({
  selector: '[mfeOutlet]',
  standalone: true,
})
export class MfeOutletDirective implements OnChanges, OnDestroy {
  @Input('mfeOutlet') config!: MfeConfig;
  @Input() contextData: any = {};
  @Input() securityConfig!: SecurityConfig;

  @Output() mfeReturn = new EventEmitter<string>();

  private componentRef?: ComponentRef<any>;
  private returnSubscription?: any; // Guarda a store da subscription

  constructor(
    private vcr: ViewContainerRef,
    private crypto: CryptoService,
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['mfeOutlet'] && this.config) {
      await this.loadMfe();
    }
    if (changes['contextData'] && this.componentRef) {
      this.injectSecureContext();
    }
  }

  ngOnDestroy() {
    this.cleanSubscription();
  }

  private cleanSubscription() {
    if (this.returnSubscription) {
      this.returnSubscription.unsubscribe();
      this.returnSubscription = undefined;
    }
  }

  private async loadMfe() {
    try {
      const module = await this.config.loader({
        remoteName: this.config.remoteName,
        exposedModule: this.config.exposedModule,
      });

      const ComponentType: Type<any> = this.config.componentName
        ? module[this.config.componentName]
        : module.default;

      this.vcr.clear();
      this.cleanSubscription();
      this.componentRef = this.vcr.createComponent(ComponentType);

      // Adiciona a "escuta"/proxy de retorno caso o MFE tenha registrado um @Output() mfeReturn
      const instance = this.componentRef.instance as any;
      if (instance['mfeReturn'] && typeof instance['mfeReturn'].subscribe === 'function') {
        this.returnSubscription = instance['mfeReturn'].subscribe((eventData: string) => {
          this.mfeReturn.emit(eventData);
        });
      }

      this.injectSecureContext();
    } catch (error) {
      console.error('[MFE Loader] Erro ao carregar o micro frontend:', error);
    }
  }

  private injectSecureContext() {
    if (!this.componentRef || !this.contextData || !this.securityConfig) return;

    // Prepara o envelope e encripta os dados
    const envelope: MfeContext = {
      origin: this.securityConfig.originId,
      timestamp: Date.now(),
      payload: this.contextData,
    };

    const encryptedPayload = this.crypto.encrypt(
      envelope,
      this.securityConfig.encryptionKey,
    );

    // Passa a string encriptada para o componente remoto
    this.componentRef.setInput('_secureContext', encryptedPayload);
  }
}
