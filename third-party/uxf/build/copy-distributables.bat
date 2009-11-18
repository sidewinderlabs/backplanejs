@ECHO OFF

REM Copies the rolled up build and other distributables into a waiting dist directory

setlocal

set deploy=%1
if not "%deploy%"=="" goto do-deploy
set deploy=%~dp0dist
:do-deploy

if not exist "%deploy%\src\lib\xforms" mkdir "%deploy%\src\lib\xforms"

xcopy /Y /F "%~dp0..\package" "%deploy%\src\package" /I
xcopy /Y /F "%~dp0..\src\assets" "%deploy%\src\assets" /I /S
xcopy /Y /F "%~dp0..\src\behaviours" "%deploy%\src\behaviours" /I
xcopy /Y /F "%~dp0..\src\ubiquity-loader.js" "%deploy%\src"
xcopy /Y /F "%~dp0..\src\lib\sniffer.js" "%deploy%\src\lib"
xcopy /Y /F "%~dp0..\src\lib\xforms\ie-instance-fixer.js" "%deploy%\src\lib\xforms"
xcopy /Y /F "%~dp0..\src\lib\xforms\ie6-css-selectors-fixer.js" "%deploy%\src\lib\xforms"
xcopy /Y /F "%~dp0..\src\lib\xforms\set-document-loaded.js" "%deploy%\src\lib\xforms"
