const fs = require('fs');
const path = require('path');

const workspace = "F:\\Projetos Códigos\\Libs Angular\\felix-workspace";
const cliPath = path.join(workspace, "projects", "cli-felix-lib");
const templatesPath = path.join(cliPath, 'templates');
const rootAppPath = path.join(workspace, "projects", "root-app");
const mfeAppPath = path.join(workspace, "projects", "mfe-app");

try {
  if (!fs.existsSync(cliPath)) {
    fs.mkdirSync(cliPath, { recursive: true });
  }

  const packageJson = {
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
      "fs-extra": "^11.2.1",
      "inquirer": "^8.2.6"
    }
  };
  fs.writeFileSync(path.join(cliPath, 'package.json'), JSON.stringify(packageJson, null, 2));

  fs.mkdirSync(path.join(cliPath, 'bin'), { recursive: true });

  const excludeFolders = ['node_modules', 'dist', '.angular', '.git', 'docs'];
  const filterFunc = (src, dest) => {
    const name = path.basename(src);
    return !excludeFolders.includes(name);
  };

  const rootDest = path.join(templatesPath, 'root');
  const mfeDest = path.join(templatesPath, 'mfe');

  console.log("Copying root folder...");
  fs.cpSync(rootAppPath, rootDest, { recursive: true, filter: filterFunc });

  console.log("Copying mfe folder...");
  fs.cpSync(mfeAppPath, mfeDest, { recursive: true, filter: filterFunc });

  console.log("Renaming gitignores...");
  if (fs.existsSync(path.join(rootDest, '.gitignore'))) {
    fs.renameSync(path.join(rootDest, '.gitignore'), path.join(rootDest, '_gitignore'));
  }
  if (fs.existsSync(path.join(mfeDest, '.gitignore'))) {
    fs.renameSync(path.join(mfeDest, '.gitignore'), path.join(mfeDest, '_gitignore'));
  }

  console.log("All done!");
} catch(e) {
  console.error("FATAL ERROR:", e);
  process.exit(1);
}
