
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

var mode = mode || { };

document.logger = { log: function(sText, sContext) { } };

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


function addScript(uri) {
	var head = document.getElementsByTagName("head")[0],
	    el = document.createElement('script');

	head.appendChild(el);
	el.setAttribute("type","text/javascript");
	el.setAttribute("src", uri);
	return;
}

var baseDefaultPath = pathToModule("ubiquity-loader"),
    loader;
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
    addScript(baseDefaultPath + "xforms/lib/sniffer.js");
    addScript(baseDefaultPath + "xforms/lib/xforms/ie-instance-fixer.js");
    addScript(baseDefaultPath + "xforms/lib/xforms/ie6-css-selectors-fixer.js");
    addScript(baseDefaultPath + "xforms/lib/xforms/set-document-loaded.js");
    //Add the script to determine whether or not to use the rollup.  Once this is ready, the application scripts can be added.
    addScript(baseDefaultPath + "uri/fragmentParsing.js", 
      function () {
        //Inspect the URL to see whether the application should be  loaded from the rollup, 
        //  or with the loader.
        if (typeof saveParametersFromURL === "function") {
          saveParametersFromURL(window.location.href, UX.vars);
        } 
        
        //Vars returned from the URL are just strings.
        if (UX.useRollup()) {
          addStyle(baseDefaultPath + "xforms/assets/style/ubiquity-xforms.css");
          addScript(baseDefaultPath + "xforms/package/ubiquity-xforms.js", self.onFinish);
        } else {
          addScript("http://yui.yahooapis.com/combo?2.7.0/build/yuiloader-dom-event/yuiloader-dom-event.js", 
            function () {
              addScript(baseDefaultPath + "xforms/lib/xforms/loader-begin.js", function () {
                addScript(baseDefaultPath + "core-loader.js");
                addScript(baseDefaultPath + "yowl-loader.js");
                addScript(baseDefaultPath + "rdfa-loader.js");
                addScript(baseDefaultPath + "smil-loader.js");
                addScript(baseDefaultPath + "xforms/lib/xforms/xforms-loader.js");

								loader.onSuccess = function(o) {
							    document.Yowl.register(
							        "backplane",
							        [ "Status" ],
							        [ 0 ],
							        null
							    );
							    document.Yowl.notify(
							        "Status",
							        "Backplane Library",
							        "Loading is complete",
							        "backplane",
							        null,
							        true,
							        "emergency"
							    );
									setTimeout(
										function() {
											get_metadata();
										},
										500
									);
								};
                addScript(baseDefaultPath + "xforms/lib/xforms/loader-end.js", self.onFinish);
              });
            }
          );
        }
      });
    self.addScript = addScript;
    return self; 
  }()
);


if (0) {
(
	function() {
		addScript("http://yui.yahooapis.com/combo?2.7.0/build/yuiloader-dom-event/yuiloader-dom-event.js");

		function waitForYahoo() {
			try {
				loader = new YAHOO.util.YUILoader();

				loader.addModule({ name: "backplane-core",   type: "js",  fullpath: baseDefaultPath + "core-loader.js" });
				loader.addModule({ name: "backplane-yowl", type: "js",  fullpath: baseDefaultPath + "yowl-loader.js" });
				loader.addModule({ name: "backplane-smil", type: "js",  fullpath: baseDefaultPath + "smil-loader.js" });

				if (mode.target) {
					loader.addModule({ name: "backplane-rdfa",  type: "js",  fullpath: baseDefaultPath + "target-loader.js" });
				} else {
					loader.addModule({ name: "backplane-rdfa",  type: "js",  fullpath: baseDefaultPath + "rdfa-loader.js" });
				}
				if (mode.unitTest) {
					loader.addModule({ name: "backplane-core-unit-test-loader", type: "js",  fullpath: baseDefaultPath + "_unit-tests/core/unit-test-loader.js" });
					loader.addModule({ name: "backplane-rdfa-unit-test-loader", type: "js",  fullpath: baseDefaultPath + "_unit-tests/rdfa/unit-test-loader.js" });
					loader.require( "backplane-rdfa-unit-test-loader" );
				}
				loader.require( "backplane-yowl", "backplane-core", "backplane-rdfa", "backplane-smil" );

				loader.onSuccess = function(o) {
					setTimeout(
						function() {
							get_metadata();
						},
						500
					);
			    document.Yowl.register(
			        "backplane",
			        [ "Status" ],
			        [ 0 ],
			        null
			    );
			    document.Yowl.notify(
			        "Status",
			        "Backplane Library",
			        "Loading is complete",
			        "backplane",
			        null,
			        true,
			        "emergency"
			    );
				};

			  loader.insert();
			} catch(e) {
				setTimeout(waitForYahoo, 50);
				return;
			}
		}
		waitForYahoo();
	}()
);
}
