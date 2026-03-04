---
title: "MFE Integration Dossier (Native Federation + ngx-felix-lib)"
description: "Dossiê completo de falhas, correções e melhores práticas para orquestração de Micro-Frontends no Angular 17+ usando Native Federation e a biblioteca ngx-felix-lib."
---

# 📚 Dossiê de Integração MFE: Native Federation & ngx-felix-lib

Este documento contém o histórico das tentativas, falhas silenciosas e os contornos (workarounds) arquiteturais finais utilizados para estabilizar a comunicação e a injeção segura de contexto entre um _Root App_ e um _Remote App_ utilizando o Angular 17+ (Native Federation) juntamente com a biblioteca `ngx-felix-lib`.

## 1. Histórico de Falhas e Degradação (O Dossiê)

A sequência de quebra da arquitetura não possuía **nenhum alerta no console ou falha de build**, transformando a depuração em uma engenharia reversa do código compilado das dependências. A cronologia dos bloqueios foi a seguinte:

### Falha A: Incompatibilidade de Assinatura do Loader (Webpack vs Native)

- **O que aconteceu:** Ao seguirmos a documentação da biblioteca (pensada para _Webpack Module Federation_), incluímos `type: "module"` e o caminho `remoteEntry.js` no `mfeConfig.loader`.
- **O Efeito:** O TypeScript acusou alertas sobre a falta do tipo correspondente e o _Native Federation_ foi incapaz de baixar o chunk binário esbuild porque a sua extensão nativa é sempre `remoteEntry.json`.
- **A Solução:** Ajustamos o contrato explícito passando `{ remoteEntry: 'http://localhost:4201/remoteEntry.json', exposedModule: options.exposedModule } as any` no arquivo `app.ts`.

### Falha B: O Silenciamento Lethal `url_base_api`

- **O que aconteceu:** Localmente (rodando `npm run start`), o arquivo `environment.development.ts` das aplicações estava completamente VAZIO.
- **O Efeito:** A biblioteca exige rigorosamente esta propriedade e invoca interrupção precoce. O MFE não exibia nenhum erro avermelhado no console, simplesmente mantinha um Container Tracejado ("Painel MFE") fantasmagoricamente vazio na página Host.
- **A Solução:** Populou-se o arquivo `src/environments/environment.development.ts` declarando o endpoint da API no formato `{ url_base_api: 'https://api.empresa.fake.com.br/v1' }`.

### Falha C: Bug Nativo de LifeCycle do `ngx-felix-lib` (`MfeOutletDirective`)

- **O que aconteceu:** O autor da biblioteca atrelou o disparo realístico de renderização do componente remoto e a injeção do ambiente de segurança ao hook `ngOnChanges`. Contudo, ele condicionou o disparo validando o nome da variável no HTML (`if (changes['mfeOutlet'])`) e não a propriedade da classe Angular (`changes['config']`).
- **O Efeito:** Toda a diretiva lia essa alteração como `undefined` e **NUNCA** chamava `this.loadMfe()`. Isso é um Anti-Pattern do Angular que enterra a federação sem log explícito.
- **A Solução:** Implementamos na _Root App_ uma injeção explícita da Diretiva no `app.ts` usando `@ViewChild`. Logo no `ngAfterViewInit()`, invocamos um bypass manual por via de um Hook: `setTimeout(() => this.mfeOutlet.loadMfe())`.

### Falha D: Módulos Fantasmas no ESBuild (O Crash do CryptoService)

- **O que aconteceu:** Acionamos fisicamente o MFE, ele preencheu a tela. Porém, o componente NUNCA despachava a mensagem do contexto (_Aguardando Injeção..._).
- **O Efeito:** No sub-console escondido havia um alerta `TypeError: Cannot read properties of undefined (reading 'encrypt')`. O Angular esbuild não compreendeu a compilação do pacote legadão CJS (`crypto-js`) no meio do pool do Web Modules da _ngx-felix-lib_.
- **A Solução:** Realizamos o override total da classe `CryptoService` ao nível global de arquitetura, injetando nosso próprio `SafeCryptoServiceProxy` via Native Dependency Injector no `app.config.ts`, driblando o bug e fornecendo Base64/Crypto seguro e compatível com Native Modules.

---

## 2. Melhores Práticas e Caminho a Seguir

Com o cenário operante desmentificado, o caminho para as próximas sprints precisa de guias rígidos para que não voltemos ao vácuo dos erros invisíveis.

### Para o Desenvolvimento do Root-App (Host)

1. **Padronização do `app.config.ts`**: Nunca remova o bypass da injeção de dependência (`{ provide: CryptoService, useClass: SafeCryptoServiceProxy }`). Ele permite que todo o ecossistema do Native Federation do Angular 21 (extremamente ultra-rápido) trafegue tranquilamente contra a lentidão bibliográfica do Webpack (legado).
2. **Ambiente é Soberano**: **Sempre garanta que seu `environment.ts` E `environment.development.ts` sejam simétricos**. Ferramentas corporativas empacotatas costumam explodir silenciosamente se faltar chaves primordiais como o `url_base_api`.
3. **Mantenha os Workarounds Centrais Isolados**: O script de ignição manual contendo o `@ViewChild` usado no `app.ts` e o hook `ngAfterViewInit` deve ser clonado sempre que você for colocar novos painéis na página principal. Mantenha os comentários explicativos para novos engenheiros entenderem que existe um motivo para o MFE não carregar auto-magicamente.

### Para o Desenvolvimento do MFE (Remote App)

1. **O Gatilho `_secureContext` é Lei**: Construa novos módulos MFE garantindo que você possua o setter explícito `@Input() set _secureContext(val: string)` recebendo o valor do Host.
2. **Reações Imediatas a Dados Pessoais (Tokens)**: Ao capturar o setter supracitado, passe a decriptação para o `EnterpriseContextService` apenas utilizando a Chave compartilhada (`CHAVE_COMPARTILHADA`). Após obter exito, o MFE está liberado para operar consultas livremente as APIs — a interceptação Http embutida (`enterpriseHttpInterceptor`) assinará todas as rotas com o Bearer Token injetado de forma autônoma.
3. **Isolamento de Estado**: Como o Angular ES Modules mantém um Signal global isolado pro Container (`contextState` do `EnterpriseContextService`), não tente recuperar variaveis do "Pai" (Host) manipulando `window.` ou caches globais impuros. Permaneça dentro do design de federação.

## 3. Arquitetura Ideal (O Padrão Golden-Path)

**Se for criar um novo MFE ou Sub-rota:**

1. Crie o App/Lib via CLI tradicional de Native Federation remoto.
2. Certifique-se nas Configs de `federation.config.js` que a linha `remoteEntry.json` é a exposta.
3. Garanta que todas as instâncias dependentes, sejam modulos ou rotas, compartilhem o Mock no desenvolvimento, mas engatilhem seus construtores buscando o token pela injeção pura.
4. Teste em modo "Isolado" (Porta 4201 apenas) providenciando manualmente um input base. E depois conecte ao Host (Porta 4200), utilizando a mesma Chave.

> **Regra de Ouro**: A regra primária é não retornar para o **Webpack Module Federation**. O sacrifício em tempo de build não traria ganhos, as dependências são defasadas, e a maioria dos bugs encontrados residiam dentro das decisões imperativas e ciclos defeituosos de uma biblioteca particular (ngx-felix-lib), e não devido a alguma instabilidade de compilação federada.

---

**Relatório Compilado pelo Antigravity Core**
