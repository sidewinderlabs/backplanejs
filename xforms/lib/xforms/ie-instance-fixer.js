/*jslint browser:true*/
/*members  length, name, namespaces, urn, write*/
/*global g_sBehaviourDirectory*/
/**
Inserts htc instruction to prevent IE mangling instancedata markup.
@returns if an instancedata guard was successfully added, false, if no instancedata guard is implemented for the current environment.
*/
(
  function(){
    if (document.namespaces) {
      var collNamespaces = document.namespaces;
      var i;
      //set a default behaviour directory, if none exists already,
      if (typeof g_sBehaviourDirectory === "undefined") {
        g_sBehaviourDirectory = baseDefaultPath + "behaviours/";
      }
      
      //import the instance htc for all prefixes that match xforms.
      for (i = 0; i < collNamespaces.length; ++i) {
        if (collNamespaces[i].urn == "http://www.w3.org/2002/xforms") {
          document.write('<?import  namespace="' + collNamespaces[i].name + '" implementation="' + g_sBehaviourDirectory + 'instance.htc"?>');
          }
        }
      }
  }()
);