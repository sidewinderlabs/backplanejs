@ECHO OFF

REM Chains the operations needed for deploying ubiquity to a web server. 
REM @param 1: the directory that's to be the root of the deployment. Default: %~dp0
REM @param 2: whether to compress the JavaScript before deploying. Default: true
  
CALL build-ux.bat %2
CALL copy-distributables.bat %1
