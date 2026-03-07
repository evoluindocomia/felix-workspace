@echo off
set "CLI_DIR=F:\Projetos Códigos\Libs Angular\felix-workspace\projects\cli-felix-lib"
set "ROOT_APP=F:\Projetos Códigos\Libs Angular\felix-workspace\projects\root-app"
set "MFE_APP=F:\Projetos Códigos\Libs Angular\felix-workspace\projects\mfe-app"

if not exist "%CLI_DIR%\templates" mkdir "%CLI_DIR%\templates"
if not exist "%CLI_DIR%\templates\root" mkdir "%CLI_DIR%\templates\root"
if not exist "%CLI_DIR%\templates\mfe" mkdir "%CLI_DIR%\templates\mfe"

echo Copying root app...
xcopy "%ROOT_APP%" "%CLI_DIR%\templates\root" /E /I /Y /EXCLUDE:%CLI_DIR%\exclude.txt

echo Copying mfe app...
xcopy "%MFE_APP%" "%CLI_DIR%\templates\mfe" /E /I /Y /EXCLUDE:%CLI_DIR%\exclude.txt

echo Renaming gitignores
move /y "%CLI_DIR%\templates\root\.gitignore" "%CLI_DIR%\templates\root\_gitignore"
move /y "%CLI_DIR%\templates\mfe\.gitignore" "%CLI_DIR%\templates\mfe\_gitignore"

echo Done
