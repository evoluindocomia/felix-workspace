# Documentação de Uso: ngx-felix-lib

A `ngx-felix-lib` é uma biblioteca Angular responsável por prover o contexto arquitetural padrão corporativo, visando padronizar aplicações "Host" (Root) e "Remote" (MFE). Ela automatiza e padroniza a injeção do contexto corporativo de forma segura (criptografada) através das fronteiras de Micro-Frontends, além de disponibilizar um padrão robusto de Repositório para o consumo de APIs.

## Índice

1. [Requisitos para Utilização](#requisitos-para-utilização)
2. [Estrutura de Comunicação e Segurança](#estrutura-de-comunicação-e-segurança)
3. [Passo a Passo: Aplicação Root (Host)](#passo-a-passo-aplicação-root-host)
4. [Passo a Passo: Aplicação MFE (Remote)](#passo-a-passo-aplicação-mfe-remote)
5. [Padrão Repository](#padrão-repository)

---

## Requisitos para Utilização

Para integrar a `ngx-felix-lib`, sua aplicação deve cumprir os requisitos abaixo:

- **Angular**: Versão 17 ou superior (o código faz uso de `signal`, Injeção via `inject()` e APIs Standalone). Neste repositório, observamos as versões da família Angular 21.0+.
- **Dependências Peer / de Runtime**:
  - `crypto-js`: Para criptografia e decriptografia (`^4.2.0`).
  - `@types/crypto-js`: Para suporte do TypeScript.
  - O projeto base deve ter `url_base_api` populada nas configurações de diretivas do ambiente (`environment.ts`).

---

## Estrutura de Comunicação e Segurança

A comunicação entre uma aplicação **Host** e um **MFE (Remote)** é resolvida mantendo o contexto de empresa limpo e seguro ao trafegar pelo navegador.

**Fluxo de injeção segura:**

1. A **App Host** fornece uma URL de API e chaves de segurança.
2. Usando a diretiva `mfeOutlet`, a **App Host** carrega o MFE remotamente.
3. Antes do bootstrap do MFE no host, o `CryptoService` empacota os dados da Host (payload com _apiToken_, _apiUrl_ e outros metadados operacionais) em um **Envelope Seguro** (`MfeContext`).
4. Esse envelope é **Criptografado** (AES) com uma `encryptionKey` partilhada.
5. O componente renderizado recebe uma única string críptica injetada na propriedade `@Input() _secureContext`.
6. O **MFE Remote** aciona o `EnterpriseContextService` com esta string críptica e sua própria checagem do `encryptionKey`.
7. O envelope é descriptografado e armazenado de forma reativa localmente (`signal`), para uso nos _Interceptors_ de HTTP e injeção do _Bearer Token_.

---

## Passo a Passo: Aplicação Root (Host)

### 1. Injetando a Arquitetura Principal

Na aplicação Host, ao executar o seu `main.ts` ou sua configuração de providers `app.config.ts`, insira a arquitetura na injeção de Providers contendo as informações de `environment`.

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideEnterpriseArchitecture } from "ngx-felix-lib";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    // Injeção da arquitetura base informando o 'url_base_api' a partir do environment
    provideEnterpriseArchitecture({ environment }),
  ],
};
```

### 2. Carregando Micro-Frontends com `mfeOutlet`

A aplicação Root utiliza a diretiva `[mfeOutlet]` para injetar os MFEs remotamente. Para isso, no template:

```html
<ng-container [mfeOutlet]="mfeConfig" [contextData]="enterpriseData" [securityConfig]="security"> </ng-container>
```

No Componente TypeScript correspondente (`app.component.ts` por exemplo):

```typescript
import { Component } from "@angular/core";
import { MfeOutletDirective, MfeConfig, SecurityConfig, EnterprisePayload } from "ngx-felix-lib";
// Exemplo se estiver usando o utilitário nativo de federation
import { loadRemoteModule } from "@angular-architects/module-federation";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [MfeOutletDirective],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  // 1. Configuração do componente ou modulo que deve ser carregado e injetado do manifest do Host
  mfeConfig: MfeConfig = {
    remoteName: "mfe-app",
    exposedModule: "./DashboardComponent",
    componentName: "DashboardComponent",
    loader: (options) =>
      loadRemoteModule({
        type: "module",
        remoteEntry: "http://localhost:4201/remoteEntry.js",
        exposedModule: options.exposedModule,
      }),
  };

  // 2. Dados Enterprise que a Host disponibiliza (token de usuário, custom URL)
  enterpriseData: EnterprisePayload = {
    apiToken: "JWT_OU_TOKEN_DE_SESSAO",
    apiUrl: "https://api.empresa.com.br/v1",
  };

  // 3. A chave de Encriptação (deve bater com a chave instanciada no MFE) e o escopo da origem de Host
  security: SecurityConfig = {
    encryptionKey: "MINHA_CHAVE_SUPER_SECRETA_H1B2",
    originId: "ROOT_APP_HOST",
  };
}
```

---

## Passo a Passo: Aplicação MFE (Remote)

### 1. Recebendo o Contexto Seguro

O componente importado na ponta remota (no exemplo, o `DashboardComponent` mapeado pelo Host) deve necessariamente expor um `@Input()` chamado `_secureContext`. A diretiva do Host garantirá que o envelope criptografado chegue até aqui.

```typescript
import { Component, Input, OnInit, inject } from "@angular/core";
import { EnterpriseContextService } from "ngx-felix-lib";

@Component({
  selector: "app-dashboard",
  standalone: true,
  template: `<h2>Painel MFE</h2>`,
})
export class DashboardComponent implements OnInit {
  // Input recebido pela Host que engloba o token e meta informações de proxy de rota
  @Input() _secureContext!: string;

  private contextService = inject(EnterpriseContextService);

  ngOnInit() {
    // A chave DEVE ser idêntica àquela definida no MfeOutletDirective na Host.
    const CHAVE_COMPARTILHADA = "MINHA_CHAVE_SUPER_SECRETA_H1B2";

    // Inicializa o state reativo base. Se mal-sucedido, disparará uma exception alertando corrupção de hash.
    this.contextService.initialize(this._secureContext, CHAVE_COMPARTILHADA);
  }
}
```

### 2. Configurando o Interceptor Corporativo

Para que toda requisição contemple nativa e magicamente o contexto criptografável que o Host entregou, basta injetar o _Interceptor_ exposto pela Lib na raiz das provisões do Micro-Frontend (`app.config.ts` do MFE).

```typescript
import { ApplicationConfig, provideHttpClient, withInterceptors } from "@angular/core";
import { enterpriseHttpInterceptor } from "ngx-felix-lib";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([enterpriseHttpInterceptor]))],
};
```

Sempre que você utilizar o `HttpClient` padrão do seu MFE, caso o Token esteja estabelecido, as requisições ganharão um _Header_ na propriedade `Authorization` (`Bearer {token}`).

---

## Padrão Repository

A `ngx-felix-lib` fornece uma abstração escalável e inteligente de repositórios base através da classe abstrata `BaseRepository<T>`.

### Implementando um Repositório

```typescript
import { Injectable } from "@angular/core";
import { BaseRepository, IResource } from "ngx-felix-lib";

// 1. Defina a tipagem de dados da sua entidade aderente à infraestrutura IResource (requer mínimo "id")
export interface Produto extends IResource {
  id: number;
  nome: string;
  preco: number;
}

@Injectable({ providedIn: "root" })
export class ProdutoRepository extends BaseRepository<Produto> {
  // 2. Aponte qual é o slug final do path. A unificação da config.baseUrl acontece nos bastidores.
  protected resourceEndpoint = "produtos";
}
```

### Consumindo um Repositório

```typescript
import { Component, OnInit, inject } from "@angular/core";
import { ProdutoRepository } from "./produto.repository";

@Component({
  selector: "app-produtos",
  template: `<ul>
    <li *ngFor="let p of produtos">{{ p.nome }}</li>
  </ul>`,
})
export class ProdutosComponent implements OnInit {
  private repo = inject(ProdutoRepository);
  produtos: any[] = [];

  ngOnInit() {
    // GetAll já oferece fallback com parâmetros de query builder integrados (paginação, order, filter).
    this.repo.getAll({ page: 1, pageSize: 10, sort: "nome", order: "asc" }).subscribe((data) => {
      // O getAll já se debruça tratando paginação nos pipes
      this.produtos = data;
    });
  }
}
```

**Como as rotas se complementam?**
A resolução de proxy nos repositórios segue a seguinte lógica:  
`URL_FINAL = (Dynamic URL via Signal Context na Host) ?? (Fallback para a InjectionToken API_CONFIG local)`  
Isso permite que se a Root App pedir para o MFE consumir do link **A** ele acate, mesmo que localmente a constante de `.env` seja **B**.
