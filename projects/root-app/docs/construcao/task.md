# Task: Construção de Apps para Validação da ngx-felix-lib

Esta lista de tarefas guiará o desenvolvimento das aplicações `root-app` e `nfe-app` conforme definido no PRD.

- [x] **Fase 1: Planejamento**
  - [x] Criar Documento de Requisitos (PRD).
  - [x] Criar e alinhar a lista de tarefas (_task.md_).

- [x] **Fase 2: Bootstrapping das Aplicações (Independência)**
  - [/] Criar projeto Angular Host: `ng new root-app --no-create-application --directory projects/root-app` (ou abordagem similar via CLI para não mesclar com workspace pai).
  - [ ] Criar aplicação root interna: `ng generate application root-app`.
  - [ ] Criar projeto Angular MFE: `ng new nfe-app --no-create-application --directory projects/nfe-app`.
  - [ ] Criar aplicação nfe interna: `ng generate application nfe-app`.

- [ ] **Fase 3: Configuração de Module Federation**
  - [ ] Adicionar `@angular-architects/module-federation` ao `root-app`.
  - [ ] Configurar o webpack/federation config do `root-app`.
  - [ ] Adicionar `@angular-architects/module-federation` ao `nfe-app`.
  - [ ] Configurar o webpack/federation config do `nfe-app` para expor o componente remoto.

- [ ] **Fase 4: Integração de Dependências**
  - [ ] Instalar `ngx-felix-lib`, `crypto-js` e `@types/crypto-js` no `root-app`.
  - [ ] Instalar `ngx-felix-lib`, `crypto-js` e `@types/crypto-js` no `nfe-app`.

- [ ] **Fase 5: Implementação do Host (`root-app`)**
  - [ ] Criar um serviço de Mock de Autenticação (`AuthMockService`) que crie tokens aleatórios ou fixos.
  - [ ] Configurar os `environment` variables expondo uma url base de API mockada.
  - [ ] Prover o `provideEnterpriseArchitecture()` no `app.config.ts`.
  - [ ] Modificar `app.component` para importar o `MfeOutletDirective`.
  - [ ] Declarar a configuração `mfeConfig`, os logs de segurança e os dados do payload, assim como o parâmetro puro "ola mundo".

- [ ] **Fase 6: Implementação do Remoto (`nfe-app`)**
  - [ ] Criar o componente a ser exposto (ex: `HelloMfeComponent`).
  - [ ] Alterar as configurações de exposedModule do Federation.
  - [ ] Definir `@Input() _secureContext: string` e `@Input() greetingParam: string`.
  - [ ] No `ngOnInit`, usar `EnterpriseContextService` para validar as credenciais recém decryptadas.
  - [ ] Adicionar o Interceptor corporativo no `app.config.ts` do `nfe-app`.
  - [ ] Criar `SupabaseMockService` e utilizá-lo para "bater numa API" com o token e resgatar o usuário `"Mock da Silva"`.
  - [ ] Concatenar os Inputs na _view_ e exibi-los condicionalmente caso a descriptografia da Lib funcione.

- [ ] **Fase 7: Testes e Validação Final**
  - [ ] Executar o `nfe-app` em uma porta específica (ex: 4201).
  - [ ] Executar o `root-app` (porta 4200) e checar nos logs e na tela a injeção funcional, validação e carregamento da `ngx-felix-lib`.
