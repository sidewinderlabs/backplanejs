@ECHO OFF

REM Chains the operations needed for creating a distribution, pending QA and commission

CALL create-dist-directory.bat
CALL build-ux.bat

IF %ERRORLEVEL% NEQ 0 EXIT /B 1

CALL copy-distributables.bat
