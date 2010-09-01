// Additions to JSLint for Ant
//
importClass(java.io.File);
importClass(Packages.org.apache.tools.ant.util.FileUtils);
importClass(java.io.FileReader);

var options = attributes.get("options");
var fileset;
var ds;
var srcFiles;
var jsfile;

project.log("Attribute options = " + options);
eval("options = " + options + ";");

if (elements.get("fileset").size() > 0) {
    // should only be one fileset
    fileset = elements.get("fileset").get(0);

    ds = fileset.getDirectoryScanner(project);
    srcFiles = ds.getIncludedFiles();

    // for each srcFile
    for (i = 0; i < srcFiles.length; i++) {
        jsfile = new File(fileset.getDir(project), srcFiles[i]);
        checkFile(jsfile, options);
    }
}

function checkFile(file, options) {
    // read the file into a string and make it a real
    // JavaScript string!
    var reader = new FileReader(file);
    // readFully returns java.lang.String
    // new String makes it a java String object
    var input = new String(FileUtils.readFully(reader));
    // this makes the type string, which is important
    // because JSLINT assumes that input is an array
    // if it is not typeof string.
    input = input.toString();
    if (!input) {
        print("jslint: Couldn't open file '" + file.toString() + "'.");
        return;
    }
    if (!JSLINT(input, options)) {
        project.log("jslint: Problems found in " + file.toString());
        for (var i = 0; i < JSLINT.errors.length; i += 1) {
            var e = JSLINT.errors[i];
            if (e) {
                project.log('  Lint at line ' + (e.line + 1) + ' character ' +
                        (e.character + 1) + ': ' + e.reason);
                //project.log((e.evidence || '').
                //        replace(/^s*(S*(s+S+)*)s*$/, "$1"));
                //project.log('');
            }
        }
    } else {
        project.log("jslint: No problems found in " + file.toString());
    }
}
