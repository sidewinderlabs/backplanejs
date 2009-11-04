echo Downloading test suite.
start /wait wget --accept=xhtml --no-parent --wait 0 --recursive --no-host-directories --cut-dirs=4 --exclude-directories=MarkUp/Forms/Test/XForms1.1/Edition1/driverPages/,MarkUp/Forms/Test/XForms1.1/Edition1/zip/ http://www.w3.org/MarkUp/Forms/Test/XForms1.1/Edition1/
echo Starting Apache Ant XSLT.
call runant.bat
echo Compiling Java post processor.
start /wait javac RecursiveStringReplacer.java
echo Making Ubiquity JavaScript URIs relative.
start /wait java RecursiveStringReplacer replace Edition1 "http://ubiquity-xforms.googlecode.com/trunk/ubiquity-loader.js" "../../../src/ubiquity-loader.js" "../"
echo Adding namespace to instance tags.
start /wait java RecursiveStringReplacer xmlns Edition1
echo Removing robots.txt.
del robots.txt
echo Removing driverPages directory.
rmdir /Q /S Edition1\driverPages
echo Removing zip directory.
rmdir /Q /S Edition1\zip
echo Removing backup files.
del /Q /S Edition1\*.bak
echo DONE!
pause