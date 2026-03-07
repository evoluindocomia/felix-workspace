#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
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
          if (!input.trim()) return 'O nome da pasta não pode ser vazio.';
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

    console.log(`\n🚀 Iniciando a cópia do projeto para: ${projectName} [Tipo: ${templateType.toUpperCase()}]...\n`);

    // 3. Validação Anti-Sobreposição
    if (fs.existsSync(targetPath)) {
      console.error(`❌ O diretório "${projectName}" já existe neste local. Escolha outro nome ou apague a pasta.`);
      process.exit(1);
    }

    // 4. Copiando os arquivos do template correspondente
    console.log(`📂 Clonando template base...`);
    fs.copySync(templatePath, targetPath);

    // 5. Restaurando a vida do .gitignore
    const gitignorePath = path.join(targetPath, '_gitignore');
    if (fs.existsSync(gitignorePath)) {
      fs.renameSync(gitignorePath, path.join(targetPath, '.gitignore'));
    }

    // Conclusão
    console.log(`\n🎉 Arquivos do template copiados com sucesso para "${projectName}"!`);
    console.log(`\n--- PRÓXIMOS PASSOS ---`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm run start`);
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
