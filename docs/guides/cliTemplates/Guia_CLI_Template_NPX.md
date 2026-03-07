# Guia Completo: Transformando suas Aplicações em Templates NPM/NPX (Root e MFE)

Transformar suas aplicações existentes (como o Host/Root e os Micro-Frontends Angular) em templates reutilizáveis executáveis via `npx` (por exemplo, `npx cli-felix-lib`) é uma excelente forma de padronizar projetos e acelerar inicializações dentro da empresa.

Para que este comando funcione, você **não** publica a aplicação diretamente no diretório do NPM. Em vez disso, você constrói um pequeno aplicativo de linha de comando (CLI) interativo em Node.js. 
Este CLI vai conter os arquivos vivos da sua aplicação dentro de pastas específicas para cada "template" e terá um script inteligente para interagir com o usuário, perguntar qual projeto ele deseja baixar (Root ou MFE), qual será o nome/local da pasta, copiar os arquivos, alterar variáveis e baixar as dependências automaticamente.

Abaixo está o documento passo-a-passo detalhado da implementação.

---

## 1. Arquitetura do Seu Pacote CLI

Ao final do passo a passo, seu novo projeto CLI possuirá a seguinte estrutura para suportar múltiplos templates:

```text
cli-felix-lib/
├── package.json          # Configuração do pacote NPM e binários
├── README.md             # Instruções de uso
├── bin/
│   └── cli.js            # Node script contendo o menu e a regra de cópia
└── templates/            # <--- SUAS APLICAÇÕES ATUAIS SÃO COLADAS AQUI
    ├── root/             # Template da aplicação Root (Host)
    │   ├── package.json
    │   ├── src/
    │   └── _gitignore
    └── mfe/              # Template do Micro-Frontend
        ├── package.json
        ├── src/
        └── _gitignore
```

---

## 2. Passo a Passo da Implementação

### Passo 2.1: Inicializando o projeto da CLI

Crie uma nova pasta em seu diretório de projetos (100% isolada das aplicações atuais) e inicie um projeto Node de base:

```cmd
mkdir cli-felix-lib
cd cli-felix-lib
npm init -y
```

Abra o arquivo `package.json` gerado na raiz. Vamos configurá-lo para ser um CLI e adicionar as bibliotecas responsáveis por facilitar cópias de diretórios e a criação de menus interativos no terminal.

```json
{
  "name": "cli-felix-lib",
  "version": "1.0.0",
  "description": "CLI interativa para gerar scaffolding do Root e de Micro-Frontends",
  "main": "bin/cli.js",
  "bin": {
    "cli-felix-lib": "./bin/cli.js"
  },
  "keywords": ["cli", "create", "mfe", "root", "template"],
  "author": "Equipe de Arquitetura",
  "license": "MIT",
  "dependencies": {
    "fs-extra": "^11.2.0",
    "inquirer": "^8.2.6"
  }
}
```

> **Explicações Importantes:**
> - `name`: Será o nome oficial do seu pacote NPM. O usuário vai escrever `npx nome-do-pacote`.
> - `bin`: Mapeia o comando (ex: `cli-felix-lib`) para encontrar o script `.js` que fará a orquestração.
> - O `inquirer` é a biblioteca responsável por exibir o menu interativo e colher as respostas do usuário (como o tipo do projeto e a pasta de destino). (Atenção: A versão 8.x do inquiter suporta CommonJS `require`, versões mais novas usam ECMAScript Modules).
> 
> Execute `npm install fs-extra inquirer@^8.2.6` na raiz da sua CLI para baixar as bibliotecas.

### Passo 2.2: Criando as Pastas dos Templates

Dentro do diretório raiz da sua CLI recém configurada (`cli-felix-lib`):
1. Crie uma pasta designada `templates/`.
2. Dentro dela, crie duas sub-pastas: `root/` e `mfe/`.
3. Acesse sua aplicação real (`felix-workspace`).
4. **Copie todos os arquivos da sua aplicação Base (Host)** pra dentro do diretório `templates/root/`.
5. **Copie todos os arquivos da sua aplicação MFE** pra dentro do diretório `templates/mfe/`.
6. ⚠️ **O que NÃO copiar:** Nunca mantenha as pastas `node_modules`, `.angular`, pasta `dist`, nem o diretório `.git` nos templates.
7. **Atenção ao Gitignore:** Mude o nome do `.gitignore` original para `_gitignore` dentro de `root/` e `mfe/` (o NPM apaga implicitamente os arquivos chamados `.gitignore` ao realizar a publicação).

### Passo 2.3: Escrevendo a Lógica Interativa (O Comando `cli.js`)

Crie uma subpasta `/bin` com um arquivo em branco chamado `cli.js`:

```cmd
mkdir bin
type NUL > bin\cli.js
```

E cole o script abaixo dentro de `bin/cli.js`. Este script faz as perguntas e direciona a cópia de maneira condicional.

```javascript
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');

async function generateProject() {
  console.log('\n🚀 Bem-vindo ao Gerador de Projetos Felix!\n');

  try {
    // 1. Menu interativo para colher as escolhas do desenvolvedor
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateType',
        message: 'Qual tipo de projeto você deseja criar?',
        choices: [
          { name: 'Aplicação Root (Host)', value: 'root' },
          { name: 'Micro-Frontend (MFE)', value: 'mfe' }
        ]
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Qual é o nome da pasta de destino do projeto?',
        validate: (input) => {
          if (!input.trim()) return 'O nome do projeto não pode ser vazio.';
          return true;
        }
      }
    ]);

    const { templateType, projectName } = answers;

    // 2. Definindo Referências de Caminhos com base nas escolhas
    const currentPath = process.cwd(); 
    const targetPath = path.join(currentPath, projectName.trim()); 
    // Aponta dinamicamente para templates/root ou templates/mfe
    const templatePath = path.join(__dirname, '../templates', templateType); 

    console.log(`\n🚀 Iniciando a criação do projeto: ${projectName} [Tipo: ${templateType.toUpperCase()}]...\n`);

    // 3. Validação Anti-Sobreposição
    if (fs.existsSync(targetPath)) {
      console.error(`❌ O diretório "${projectName}" já existe neste local. Escolha outro nome ou apague a pasta.`);
      process.exit(1);
    }

    // 4. Copiando os arquivos do template correspondente
    console.log(`📂 Clonando template base...`);
    fs.copySync(templatePath, targetPath);

    // 5. Adequações Dinâmicas no novo Ambiente
    console.log(`⚙️ Padronizando configurações...`);
    
    // --> PACKAGE.JSON
    const packageJsonPath = path.join(targetPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageObj = fs.readJsonSync(packageJsonPath);
      packageObj.name = projectName;       
      packageObj.version = '0.0.0';       
      delete packageObj.repository;       
      fs.writeJsonSync(packageJsonPath, packageObj, { spaces: 2 });
    }

    // --> ANGULAR.JSON / OUTROS ARQUIVOS
    const angularJsonPath = path.join(targetPath, 'angular.json');
    if (fs.existsSync(angularJsonPath)) {
      let angJsonContent = fs.readFileSync(angularJsonPath, 'utf8');
      
      // Lógica amigável para alterar nomes de projetos padrão do template
      // Se era Root, altere o nome antigo do root para o novo. Se era MFE, mesmo princípio.
      const oldName = templateType === 'root' ? 'host-app' : 'mfe-app';
      const regex = new RegExp(oldName, 'g');
      
      angJsonContent = angJsonContent.replace(regex, projectName); 
      fs.writeFileSync(angularJsonPath, angJsonContent, 'utf8');
    }

    // 6. Restaurando a vida do .gitignore
    const gitignorePath = path.join(targetPath, '_gitignore');
    if (fs.existsSync(gitignorePath)) {
      fs.renameSync(gitignorePath, path.join(targetPath, '.gitignore'));
    }

    // 7. Configurações Finais de Ambiente
    console.log(`\n📦 Instalando dependências completas (Pode demorar vários minutos)...`);
    
    // Injeta repositorio GIT limpo no projeto recém-criado
    execSync('git init', { cwd: targetPath, stdio: 'ignore' });
    
    // Baixa pacotes de forma transparente
    execSync('npm install', { cwd: targetPath, stdio: 'inherit' });

    console.log(`\n🎉 Projeto "${projectName}" configurado e pronto!`);
    console.log(`\n--- PRÓXIMOS PASSOS ---`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm start`);
    console.log(`-----------------------\n`);

  } catch (error) {
    if (error.isTtyError) {
      console.error('❌ O prompt interativo não pode ser renderizado neste terminal.');
    } else {
      console.error('❌ Ocorreu um erro durante a criação do projeto:', error);
    }
    process.exit(1);
  }
}

generateProject();
```

> **Por que o `#!/usr/bin/env node` (Shebang)?**
> Esta instrução garante que sistemas operacionais executem o script chamando o interpretador Node diretamente. Sem isso, o utilitário binário não funcionará ao ser engatilhado pelo `npx`.

---

## 3. Testando, Publicando e Implantação

### 3.1: Testando Localmente a Interatividade

1. Na raiz do seu pacote CLI (`cli-felix-lib`), crie o link simpático (simulando a instalação global):
   ```cmd
   npm link
   ```

2. Vá para uma pasta de testes no seu computador  (ex: Desktop) e rode a CLI no terminal:
   ```cmd
   cli-felix-lib
   ```
   *(A CLI deverá assumir o terminal pedindo para você usar as setinhas do teclado para escolher entre **Aplicação Root (Host)** ou **Micro-Frontend (MFE)**, e em seguida perguntará o nome da pasta de destino).*

3. Verifique a pasta originada e se a instalação foi bem-sucedida.

4. Volte à pasta do seu pacote CLI e desfaça o link:
   ```cmd
   npm unlink
   ```

### 3.2: Fazendo Publicação NPM

Quando tudo estiver validado, efetue o login no NPM e publique no registro global:

```cmd
npm login
npm publish --access public
```

### 3.3: Operação de Rotina na Equipe

A partir da publicação, qualquer desenvolvedor, em qualquer máquina, começará um novo projeto corporativo disparando:

```cmd
npx cli-felix-lib
```
O menu interativo guiará os passos isolando por completo o atrito de configuração entre arquiteturas Root e plugins MFE. 🚀
