// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
//
// Copyright (c) 2008-9 Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
  object: UX
*/
var UX = {
  /**
    object: vars 
    Container for variables gleaned from parameters passed in via the URL fragment.
  */
  config: {useRollup: false},
  /**
    function: useRollup
    returns true if the rollup is to be used, false otherwise.
  */
  useRollup: function () {
   // If the script appears to be being served as a distribution,
   //  set the default behaviour to use the rollup
    var path = pathToModule("ubiquity-loader");
    if (path.indexOf("/dist/") !== -1 || window.location.href.indexOf("/dist/") !== -1) {
      //only make useRollup false if it has explicitly been set so.
      this.config.useRollup = this.config.useRollup !== "false";
    } else {
      // Translate useRollup into a boolean, using the built in mechanism,  additionally 
      //  translating "false" into false.
      this.config.useRollup = this.config.useRollup && this.config.useRollup !== "false";
    }
    return this.config.useRollup;
  }
  
};

document.logger = { log: function(sText, sContext) { } };

function pathToModule(module) {
  if (!module) {
    throw "Missing or null parameter supplied.";
  }
  var i;
  var head = document.getElementsByTagName("head")[0];
  
  var childNodes = head.childNodes;
  var l = childNodes.length;
  var s = null;
  var el, src, pos;

  for (i = 0; i < l; ++i) {
    el = childNodes[i];
    if (el.nodeType === 1 && (el.nodeName.slice(el.nodeName.indexOf(":") + 1, el.nodeName.length).toLowerCase() === "script")) { 
      src = el.getAttribute("src");
      if (src) {
        pos = src.lastIndexOf(module + ".js");
        
        if (pos != -1 && (!pos || src.charAt(pos - 1) === "/" || src.charAt(pos - 1) === "\\")) {
          s = src.slice(0, pos);
          break;
        }
      }// if @src is present
    }// if we have a script element
  }// for each child node

  if (s === null) {
    throw "No Module called '" + module + "' was found.";
  }
  return s;
}


var baseDefaultPath = pathToModule("ubiquity-loader");
var g_sBehaviourDirectory = baseDefaultPath + "/behaviours/";
(
/**
object: preloader
Performs those loading steps that precede loading with either YUI or the rollup, 
  then initiates the appropriate loading mechanism.
*/
  UX.preloader = function () {
    var head = document.getElementsByTagName("head")[0],
    finished = false,
    /**
      function: put_onFinish
      Adds a function to be called once the loader has completed.  If called after load completion, executes immediately.
    */
    self = {
      onFinish: function () {
        finished = true;
      },
      put_onFinish: function (fn) {
        if (finished) {
          fn();
        } else {
          this.onFinish = function () {
            finished = true;
            fn();
          };
        }
      }
    },
    addScript,
    addStyle;
   /**
     function: addScript
     Adds a script to the document, and optionally executes a function when the script has finished loading
     
     scriptURL - The URL of the script to load
     onComplete - (optional) A function to execute once the script defined by <scriptURL> has finished loading, or failed to load.
   */
    addScript = function (scriptURL, onComplete) {
      var scriptElement;
      scriptElement = document.createElement("script");
      if (onComplete) {
        scriptElement.onreadystatechange  = function () {
          if (scriptElement.readyState === "complete" || scriptElement.readyState === "loaded") {
            scriptElement.onreadystatechange = null;
            onComplete();
          }
        };
        scriptElement.onload = onComplete;
        scriptElement.onerror = onComplete;
      }
      scriptElement.setAttribute("type", "text/javascript");
      scriptElement.setAttribute("src", scriptURL); 
      head.appendChild(scriptElement);
      return scriptElement;
    };
    
    /**
     function: addStyle
     (private) Adds a stylesheet to the document.
     
     styleURL - The URL of the stylesheet to load
   */
    addStyle = function (styleURL) {
      var styleElement;
      styleElement = document.createElement("link");
      head.appendChild(styleElement);
      styleElement.setAttribute("rel", "stylesheet");
      styleElement.setAttribute("href", styleURL); 
    };
    
    //Add preliminary scripts - in particular, ie-instance-fixer must come here, since adding it as part of addApplicationScripts is too late for it to have any effect
    //  The others may not need to be here, but I have left this set of scripts in the same order as I found them.
    addScript(baseDefaultPath + "lib/sniffer.js");
    addScript(baseDefaultPath + "lib/xforms/ie-instance-fixer.js");
    addScript(baseDefaultPath + "lib/xforms/ie6-css-selectors-fixer.js");
    addScript(baseDefaultPath + "lib/xforms/set-document-loaded.js");
    //Add the script to determine whether or not to use the rollup.  Once this is ready, the application scripts can be added.
    addScript(baseDefaultPath + "lib/backplane/uri/fragmentParsing.js", 
      function () {
        //Inspect the URL to see whether the application should be  loaded from the rollup, 
        //  or with the loader.
        if (typeof saveParametersFromURL === "function") {
          saveParametersFromURL(window.location.href, UX.vars);
        } 
        
        //Vars returned from the URL are just strings.
        if (UX.useRollup()) {
          addStyle(baseDefaultPath + "assets/style/ubiquity-xforms.css");
          addScript(baseDefaultPath + "package/ubiquity-xforms.js", self.onFinish);
        } else {
          addScript("http://yui.yahooapis.com/2.8.0/build/yuiloader/yuiloader-min.js", 
            function () {
              addScript(baseDefaultPath + "lib/xforms/loader-begin.js", function () {
                addScript(baseDefaultPath + "lib/xforms/xforms-loader.js", function () {
                  addScript(baseDefaultPath + "lib/xforms/loader-end.js", self.onFinish);
                });
              });
            }
          );
        }
      });
    self.addScript = addScript;
    return self; 
  }()
);


