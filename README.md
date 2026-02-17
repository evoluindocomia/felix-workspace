# FelixWorkspace

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

# 🚀 ngx-felix-lib

![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-15.0%2B-red.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)



Um framework corporativo de alto nível para Angular que resolve dois dos maiores desafios em aplicações à escala empresarial: **Orquestração segura de Micro Frontends (MFEs)** com Zero-Trust e a **padronização reativa da camada de dados** através do padrão *Agnostic Repository*.

Se você já se cansou de reescrever o mesmo boilerplate de `HttpClient` para cada novo serviço, ou se já teve dores de cabeça tentando passar tokens de autenticação de forma segura entre uma aplicação Host e um MFE, esta biblioteca é para você. ☕

## ✨ Funcionalidades

* 🛡️ **MFE Zero-Trust Security:** Comunicação entre Host e MFE 100% criptografada via AES.
* 📡 **Agnostic Repository Pattern:** CRUD completo, paginação e query builder prontos a usar com apenas uma linha de configuração.
* 💉 **Interceptor Funcional Nativo:** Injeção automática de tokens (Bearer) em todas as chamadas HTTP.
* ⚡ **Reatividade com Signals:** Gestão de contexto global ultra-rápida e livre de heranças (`extends`).
* 🛑 **Fail-Fast Configuration:** A aplicação recusa-se a iniciar se o ambiente não estiver devidamente configurado (adeus erros silenciosos em produção!).

---

## 📦 Instalação

A biblioteca necessita do `crypto-js` como dependência par para a segurança do tráfego de dados.

```bash
npm install ngx-felix-lib
npm install crypto-js
npm install --save-dev @types/crypto-js
```

---

# 🛠️ Configuração Inicial (O Padrão Fail-Fast)

💡 Curiosidade Arquitetural: Você sabia que o conceito de Fail-Fast foi formalizado nos anos 2000 por Jim Shore? Nós trouxemos isso para o Angular. Se alguém da equipa esquecer de configurar a URL da API, a aplicação "grita" um erro no console logo na inicialização, impedindo que requisições fantasmas aconteçam.

No seu ficheiro de ambiente (environment.ts), adicione a variável obrigatória url_base_api:

TypeScript
// src/environments/environment.ts

```bash
export const environment = {
  production: false,
  url_base_api: '[https://api.suaempresa.com/v1](https://api.suaempresa.com/v1)', // Obrigatório!
};

```
Em seguida, no app.config.ts (ou AppModule se ainda for old-school), inicialize a arquitetura fornecendo o environment e ativando o nosso interceptor mágico:

```bash
TypeScript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEnterpriseArchitecture, enterpriseHttpInterceptor } from 'ngx-enterprise-arch';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Inicia a arquitetura e valida o seu environment
    provideEnterpriseArchitecture({ environment }),
    
    // 2. Adiciona o interceptor que injetará tokens automaticamente
    provideHttpClient(withInterceptors([enterpriseHttpInterceptor]))
  ]
};

```

## 💻 Como Usar: O Passo a Passo
A beleza desta biblioteca está na separação de responsabilidades. O Host apenas envia dados, o MFE apenas recebe, e a camada de dados trabalha sozinha nos bastidores.

* Passo 1: Construindo a Camada de Dados (Dentro do MFE ou Host)
Acabe com as dezenas de linhas injetando HttpClient. Basta estender o BaseRepository e definir o seu endpoint.


```bash
import { Injectable } from '@angular/core';
import { BaseRepository, IResource } from 'ngx-enterprise-arch';

export interface Produto extends IResource {
  nome: string;
  preco: number;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService extends BaseRepository<Produto> {
  // Apenas defina o endpoint. A URL base será descoberta automaticamente!
  protected resourceEndpoint = 'produtos'; 
}
```

🧠 Nota: O BaseRepository já tem métodos como getAll(), getById(), create(), update() e delete(). E o melhor: ele resolve a URL olhando primeiro para o contexto do MFE e, se não encontrar (ex: desenvolvendo localmente), faz fallback para o seu environment.ts.

* Passo 2: Carregando o MFE a partir da Aplicação Host (Shell)
A aplicação Shell é a dona da segurança. Ela pega no Token do utilizador e na URL, encripta tudo e injeta no MFE.


```bash
import { Component } from '@angular/core';
import { MfeOutletDirective } from 'ngx-enterprise-arch';
import { loadRemoteModule } from '@angular-architects/native-federation'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MfeOutletDirective],
  template: `
    <nav>Portal Corporativo Seguro</nav>
    <main>
      <ng-container *mfeOutlet="mfeConfig; 
                                contextData: dadosSensiveis; 
                                securityConfig: chavesSeguranca">
      </ng-container>
    </main>
  `
})
export class AppComponent {
  mfeConfig = { 
    remoteName: 'mfe-vendas', 
    exposedModule: './PainelVendas',
    loader: loadRemoteModule 
  };

  chavesSeguranca = {
    encryptionKey: 'CHAVE_FORTE_DO_SEU_CI_CD', 
    originId: 'AppShell'
  };

  dadosSensiveis = {
    apiToken: 'Bearer eyJhbGciOi...', // Token real do utilizador logado
    apiUrl: '[https://api-dinamica.gateway.corp/v2](https://api-dinamica.gateway.corp/v2)' // URL que o MFE deve usar
  };
}
```

* Passo 3: Recebendo os Dados no MFE (Sem Heranças!)

💡 Curiosidade Arquitetural: Nas primeiras versões destas arquiteturas, obrigávamos os componentes a herdar de classes base como MfeReceiver. Mas Composição é melhor que Herança. Atualizamos para usar Signals num serviço Singleton. O seu componente fica limpo, focado apenas no negócio!

No MFE, você recebe o input _secureContext (injetado automaticamente pela diretiva do Host) e passa para o nosso serviço.

```bash
import { Component, Input, OnInit, inject } from '@angular/core';
import { EnterpriseContextService } from 'ngx-enterprise-arch';
import { ProdutoService } from './produto.service';

@Component({
  selector: 'app-painel-vendas',
  standalone: true,
  template: `
    <h1>Produtos</h1>
    <ul *ngIf="produtos.length">
      <li *ngFor="let prod of produtos">{{ prod.nome }} - €{{ prod.preco }}</li>
    </ul>
  `
})
export class PainelVendasComponent implements OnInit {
  // A string criptografada injetada pelo Host
  @Input() _secureContext!: string;
  
  private contextService = inject(EnterpriseContextService);
  private produtoService = inject(ProdutoService);
  
  produtos: any[] = [];

  ngOnInit() {
    // 1. "Abre o cofre" e guarda o token/url na memória global do MFE
    this.contextService.initialize(this._secureContext, 'CHAVE_FORTE_DO_SEU_CI_CD');

    // 2. Chama a API. 
    // Magia: O Interceptor vai automaticamente apanhar o token e colocar no Header!
    this.produtoService.getAll({ sort: 'preco', order: 'desc' }).subscribe(dados => {
      this.produtos = dados;
    });
  }
}
```
🎯 Exemplo Prático: O Fluxo de Vida Real
Imagine a Joana, uma utilizadora que faz login no Portal Central.

* O Portal recebe um token JWT (eyJ...).
* O utilizador clica na aba "Gestão de Produtos".
* O Portal aciona o MfeOutletDirective para carregar o micro frontend da equipa de produtos. Ele empacota o Token da Joana, tranca com uma chave AES e envia.
* O MFE de Produtos acorda, pega no pacote encriptado (_secureContext) e manda para o EnterpriseContextService desencriptar.
* O MFE de Produtos agora precisa listar o catálogo. O componente chama produtoService.getAll().
* O BaseRepository forma a URL correta, e antes de a requisição sair para a internet, o nosso enterpriseHttpInterceptor discretamente adiciona: Authorization: Bearer eyJ....
* Os dados aparecem no ecrã da Joana, de forma rápida, segura e com meia dúzia de linhas de código escrito pela sua equipa.

🤝 Contribuindo
Sinta-se à vontade para abrir Issues ou Pull Requests. Lembre-se, boa arquitetura é um processo colaborativo.

Feito com ☕ e TypeScript.
