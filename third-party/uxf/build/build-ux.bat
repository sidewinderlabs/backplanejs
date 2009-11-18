@ECHO OFF

REM Build script for creating rolled up versions of ubiquity-xforms.

if not "%1"=="no-compress" set compress-arg= & goto do-build
set compress-arg="/noCompression"
:do-build

if not exist "%~dp0..\package" mkdir "%~dp0..\package"

if exist "%~dp0..\package\ubiquity-xforms.js" copy /Y "%~dp0..\package\ubiquity-xforms.js" "%~dp0..\package\ubiquity-xforms.js.bak"
if exist "%~dp0..\package\ubiquity-xforms.css" copy /Y "%~dp0..\package\ubiquity-xforms.css" "%~dp0..\package\ubiquity-xforms.css.bak"

cscript "%~dp0rollup\make-rollup.wsf" %compress-arg% "/js:%~dp0..\package\ubiquity-xforms.js" "/css:%~dp0..\src\assets\style\ubiquity-xforms.css" "/paths:xforms-loader:file:///%~dp0../src/lib/xforms/" < "%~dp0..\src\lib\xforms\xforms-loader.js"

IF %ERRORLEVEL% NEQ 0 EXIT /B 1
