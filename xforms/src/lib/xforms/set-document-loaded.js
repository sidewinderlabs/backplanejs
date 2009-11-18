var g_bDocumentLoaded = false;

function RegisterDocumentLoaded() {
  if (UX.isIE6) {
    UX.applySelectorsIE6(document);
  }
}

if (UX.isIE) {
  window.attachEvent("onload",RegisterDocumentLoaded);
}
else 
{
// If the scripts are loaded during the load of the document, then this line
//	should be uncommented, so that initialisation can occur on load
// If, however, the scripts are to be loaded only after the document has otherwise 
//	been fully loaded, then the document should not be considered "loaded" for the 
//	purposes of this processor, until much later.  This is handled by the "second-onload"
//	module.
//window.addEventListener("load",RegisterDocumentLoaded,false);
}
