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

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
