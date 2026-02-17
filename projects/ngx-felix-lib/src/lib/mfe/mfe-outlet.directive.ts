import {
  Directive, Input, Output, EventEmitter,
  ViewContainerRef, ComponentRef, OnChanges,
  SimpleChanges, Type, TemplateRef, Injector, OnDestroy
} from '@angular/core';
import {
  MfeConfig,
  SecurityConfig,
  MfeContext,
  MfeMessage
} from './mfe.config';
import { CryptoService } from './crypto.service';

@Directive({
  selector: '[mfeOutlet]', // Uso: <ng-container *mfeOutlet="...">
  standalone: true
})
export class MfeOutletDirective implements OnChanges, OnDestroy {

  // --- INPUTS ---
  @Input('mfeOutlet') config!: MfeConfig; // A config principal
  @Input() securityConfig!: SecurityConfig; // Obrigatório
  @Input() contextData: any = {}; // Dados sensíveis (serão criptografados)
  @Input() parameters: any[] = []; // Dados de negócio (array aberto)

  // Templates Opcionais
  @Input() loadingTemplate?: TemplateRef<any>;
  @Input() errorTemplate?: TemplateRef<any>;

  // --- OUTPUTS ---
  /** Canal de retorno de dados de negócio (Two-way binding) */
  @Output() parametersChange = new EventEmitter<any[]>();

  /** Canal unificado de status (Erros, Sucessos, Avisos) */
  @Output() mfeStatus = new EventEmitter<MfeMessage>();

  private componentRef?: ComponentRef<any>;
  private subscriptions: any[] = [];

  constructor(
    private vcr: ViewContainerRef,
    private crypto: CryptoService
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    // Validação de Segurança
    if (this.config && !this.securityConfig) {
      this.emitStatus({ type: 'ERROR', code: 'SEC_MISSING', text: 'Configuração de segurança obrigatória.', timestamp: new Date() });
      return;
    }

    // 1. Carregamento do MFE (Se mudar a config)
    if (changes['config'] && this.config) {
      await this.loadMfe();
    }

    // 2. Atualização de Estado (Se mudar dados ou params)
    if ((changes['contextData'] || changes['parameters']) && this.componentRef) {
      this.updateState();
    }
  }

  private async loadMfe() {
    this.destroyCurrent();

    if (this.loadingTemplate) {
      this.vcr.createEmbeddedView(this.loadingTemplate);
    }

    try {
      // Executa o loader passado por injeção
      const module = await this.config.loader({
        remoteName: this.config.remoteName,
        exposedModule: this.config.exposedModule
      });

      const ComponentType: Type<any> = this.config.componentName
        ? module[this.config.componentName]
        : module.default;

      if (!ComponentType) throw new Error(`Componente não encontrado em ${this.config.exposedModule}`);

      this.vcr.clear(); // Remove loading
      this.componentRef = this.vcr.createComponent(ComponentType);

      // Configurações Iniciais
      this.updateState();
      this.bindOutputs();

    } catch (error: any) {
      this.vcr.clear();
      this.emitStatus({
        type: 'ERROR', code: 'LOAD_FAIL', text: 'Erro ao carregar módulo remoto.', details: error.message, timestamp: new Date()
      });
      if (this.errorTemplate) {
        this.vcr.createEmbeddedView(this.errorTemplate, { $implicit: error });
      }
    }
  }

  private updateState() {
    if (!this.componentRef) return;
    const instance = this.componentRef.instance;

    // A. Injeta Parâmetros de Negócio (Input: _inParams)
    instance.setInput('_inParams', this.parameters || []);

    // B. Criptografa e Injeta Contexto (Input: _secureContext)
    if (this.contextData && this.securityConfig) {
      const envelope: MfeContext = {
        origin: this.securityConfig.originId,
        timestamp: Date.now(),
        payload: this.contextData
      };
      const encrypted = this.crypto.encrypt(envelope, this.securityConfig.encryptionKey);
      instance.setInput('_secureContext', encrypted);
    }
  }

  private bindOutputs() {
    if (!this.componentRef) return;
    const instance = this.componentRef.instance;

    // 1. Captura retorno de dados (_outParams)
    if (instance._outParams?.subscribe) {
      this.subscriptions.push(
        instance._outParams.subscribe((data: any[]) => this.parametersChange.emit(data))
      );
    }

    // 2. Captura mensagens de status (_statusMessage)
    if (instance._statusMessage?.subscribe) {
      this.subscriptions.push(
        instance._statusMessage.subscribe((msg: MfeMessage) => this.emitStatus(msg))
      );
    }
  }

  private emitStatus(msg: MfeMessage) {
    this.mfeStatus.emit(msg);
  }

  private destroyCurrent() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    this.vcr.clear();
    if (this.componentRef) this.componentRef.destroy();
  }

  ngOnDestroy() {
    this.destroyCurrent();
  }
}
