# Tutorial de Execução e Publicação da CLI `cli-felix-lib`

Este documento explica como você pode testar localmente o utilitário de scaffolding interativo e como realizar sua publicação no registro NPM corporativo (ou público) para que toda a sua equipe tenha acesso rápido aos templates do **Root** e **MFE**.

---

## 🏗️ 1. Validando e Testando a CLI Localmente

Antes de mandarmos o pacote de templates para o NPM, é extremamente recomendável simulá-lo rodando localmente no seu Terminal, como se ele já estivesse instalado pelo `npx`. Para isso usamos o comando `npm link`.

### Passo 1: Vincule o pacote
1. Abra um terminal apontando **exatamente** para a pasta construída da CLI.
   ```cmd
   cd "F:\Projetos Códigos\Libs Angular\felix-workspace\projects\cli-felix-lib"
   ```
2. Mande o Node "instalar globalmente um atalho" para a sua pasta da CLI executando:
   ```cmd
   npm link
   ```
   *Seu utilitário agora está disponível na sua máquina com o comando de atalho `cli-felix-lib`.*

### Passo 2: Gere um Projeto Falso
1. Em outra aba do terminal, vá para uma pasta segura, como sua **Área de Trabalho** (Desktop) ou uma pasta `Temp`.
   ```cmd
   cd %USERPROFILE%\Desktop
   ```
2. Mande rodar o comando da sua CLI:
   ```cmd
   cli-felix-lib
   ```
3. O painel interativo vai aparecer! 
   - Escolha usando as `Setinhas para Cima e para Baixo` se você quer gerar o MFE ou o Root.
   - Pressione `Enter`.
   - Digite o nome da pasta destino. (Exemplo: `meu-teste-mfe`).
   - Pressione `Enter`.

### Passo 3: Verifique a Mágica
1. Abra a pasta gerada (`meu-teste-mfe`).
2. Cheque se os arquivos da estrutura original do MFE estão lá dentro.
3. Se os arquivos vieram, **a CLI está validada e funcional!** 

### Passo 4: Limpe o atalho local
1. Volte ao terminal que está na pasta da CLI (`projects\cli-felix-lib`).
2. Desfaça o vinculo de teste rodando:
   ```cmd
   npm unlink
   ```

---

## 🚀 2. Publicando e Disponibilizando via NPM (Build)

Ao contrário dos projetos no Angular, onde fazemos `ng build` para empacotar o MFE e gerar a pasta `dist`, nosso projeto de CLI é construído em puramente em `Node.js`. Portanto **não precisamos compilar nem dar um build de TypeScript.** 

A pasta `projects\cli-felix-lib` em si já é o artefato final a ser mandado para o NPM, pois ela possui o `package.json` mapeando o arquivo executável.

### Passo 1: Autentique sua conta NPM
1. Pelo terminal (dentro da pasta `projects\cli-felix-lib`), autentique seu usuário do npm:
   ```cmd
   npm login
   ```
2. Siga as instruções no seu navegador ou insira as credenciais no próprio prompt (Nome de usuário, senha e Email, dependendo da sua versão do NPM).

### Passo 2: Efetue o Publish
1. Após logado com sucesso, lance a sua arquitetura para os repositórios NPM:
   ```cmd
   npm publish --access public
   ```
   *(Nota: Se você utiliza um registro de NPM privado na sua empresa como JFrog ou Nexus, você deve estar conectado à VPN e configurado pelo arquivo `.npmrc` com a URL do seu registry).*

---

## 💡 3. Fluxo de Vida Real (Para toda a Equipe)

Agora que subiu, qualquer máquina, de qualquer desenvolvedor do mundo (se o repo for público), ou da sua empresa (se for registro privado), pode simplesmente ir no terminal de sua preferência e gerar o seu MFE pronto na hora.

**Como o membro do time usa?**
Apenas digitando o comando atalho do Npx que instala momentaneamente sua CLI, abre o menu, copia e vai embora:

```cmd
npx cli-felix-lib
```

> **Nota para as Manutenções Futuras:** 
> Se o Root ou o MFE ganharem novas bibliotecas, estilos, etc. Tudo o que você tem que fazer é copiar as pastas atualizadas novamente para dentro de `projects\cli-felix-lib\templates`, ir no `package.json` da CLI (que hoje está `1.0.0`), e subir para `"1.0.1"`. Depois disso rode um novo `npm publish`. Muito rápido!
