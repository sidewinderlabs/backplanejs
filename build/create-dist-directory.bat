@ECHO OFF

REM Creates a dist directory and populates it with the current test material

rmdir /s "%~dp0dist" /q
mkdir "%~dp0dist"
mkdir "%~dp0dist\src"
mkdir "%~dp0dist\samples"
mkdir "%~dp0dist\testsuite"
mkdir "%~dp0dist\unit-tests"

xcopy /E /Q "%~dp0..\samples" "%~dp0dist\samples"
xcopy /E /Q "%~dp0..\testsuite" "%~dp0dist\testsuite"
xcopy /E /Q "%~dp0..\unit-tests" "%~dp0dist\unit-tests"
