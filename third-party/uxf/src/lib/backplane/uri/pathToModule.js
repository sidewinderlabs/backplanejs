
function pathToModule(module) { 
  if (!module) {
    throw("Missing or null parameter supplied.");
  }

  var scriptNodes = document.getElementsByTagName( "script" );
  var l = scriptNodes.length;
  var i;
  var head;
  var s = null;
  var el, src, pos;

  for (i = 0; i < l; ++i) {
    el = scriptNodes[i];
    // See if the module name we are looking for is present in any of the
    // following forms:
    //
    //  [path]/module.js
    //  [path]\\module.js
    //  module.js
    //
    src = el.src;
    if (src) {
      pos = src.lastIndexOf(module + ".js");
      
      if (pos != -1 && (!pos || src.charAt(pos - 1) === "/" || src.charAt(pos - 1) === "\\")) {
        s = src.slice(0, pos);
        break;
      }
    }// if @src is present
  }// for each script node

  if (!s) {
    throw("No Module called '" + module + "' was found.");
  }
  return s;
}
