::
:: 'Tidy's all .html files in a given directory. Tidy executable dir must be on the %PATH.
:: 
:: %1 is name of the sub directory (relative to this script dir) containing html files that tidy will be run on
::
@echo off
for %%i in (%1/*.html) do tidy -m -q -asxhtml %1/%%i 