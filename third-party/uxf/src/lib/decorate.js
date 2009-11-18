/*
 * Copyright (c) 2008-9 Backplane Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
	@fileoverview
	Contains functions used in the decoration of elements and objects. Along with the mechanism for 
		setting up decoration.
	
*/

/*global document, UX, NamespaceManager, g_bDocumentLoaded, g_sBehaviourDirectory, navigator, alert, window, YAHOO, spawn  */

var DECORATOR = function () {

  /**
      The decorator maintains a set of rules that it applies to each element
      that needs to be decorated. Rules have the following properties:
       * name - Used to identify the rule (not currently used)
       * match - The optional function that returns true iff the candidate
                 element needs to be decorated by the rule (see notes on
                 rules partitioning below as to why this is optional)
       * apply - The function that manipulates the list of class names
      For performance, the rules are partitioned by namespace URI and
      further by element name. The match() function is optional since if
      the only criteria for matching is element QName, that is handled by
      the partitioning. A missing match() is the same as always returning
      true.
      For rules that may be applicable across element names within a
      namespace (for example, the presence of a "ref" attribute in XForms
      mark-up), a "wildcard" partition is used (we have no such rules at
      present).
      There is also a wildcard partition to match any element across any
      namespace (expected to be used sparingly, if at all).
      @see xforms/xforms-defs.js for an example of such rules.
  **/
	var g_DecorationRules = { },
	//globals used in non-IE browsers.
	g_arrHandlersToCallOnLoad = [],
	innerSetupDecorator = null,
	getCustomCSSProperty,
	isIE,
	itself = {},
	m_elementsInSuspension = [],
	m_suspended = 0;


	function extendDecorationRules(rules, additions) {
	    var key;
	    for (key in additions) {
	        if (rules[key]) {
	            rules[key] = rules[key].concat(additions[key]);
	        } else {
	            rules[key] = additions[key];
	        }
	    }
	}
	
	function addDecorationRulesForNamespace(namespaceURI, rules) {
	    if (g_DecorationRules[namespaceURI]) {
	        extendDecorationRules(g_DecorationRules[namespaceURI], rules);
	    } else {
	        g_DecorationRules[namespaceURI] = rules;
	    }
	}
	
	function addDecorationRules(decorationRules) {
	    if (decorationRules.namespaceURI && decorationRules.rules) {
	        addDecorationRulesForNamespace(decorationRules.namespaceURI, decorationRules.rules);
	    } else if (decorationRules.rules) {
	        addDecorationRulesForNamespace("*", decorationRules.rules);
	    }
	}


  /**
   * Apply current decoration rules to the document. Logically, we:
   * (a) select elements having QNames that have rules registered against them,
   *     one QName at a time, and
   * (b) apply decoration rules to each of the elements selected
   *
   * Currently a single pass operation, this does not support repeats and other
   * dynamic operations.
   *
   * @param {Document} doc The optional document object
   *                       (<code>document</code> is used if not provided)
   */
	function applyDecorationRules(doc) {
		var currentDocument = doc || document,
		    nsURI,
		    nsRules,
		    localName,
		    nsPrefixes,
		    nsPrefix,
		    elements,
		    count;
		if (UX.hasDecorationSupport) {
		    // quit if there is a better decoration mechanism
		    return;
		}
		for (nsURI in g_DecorationRules) {
		    if (nsURI === "*") {
		        // ignoring wildcard rules, TBD how to handle these,
		        // given CSS selectors are not available for this purpose
		        continue;
		    }
		    nsRules = g_DecorationRules[nsURI];
		    for (localName in nsRules) {
		        if (localName === "*" || localName === "pe-value") {
		            // <pe-value> is special, @see ISSUE 62
		            continue;
		        }
		        if (UX.isXHTML) {
		            elements = currentDocument.getElementsByTagNameNS(nsURI, localName);
		        } else {
		            nsPrefixes = NamespaceManager.getOutputPrefixesFromURI(nsURI);
		            nsPrefix = nsPrefixes[nsPrefixes.length - 1];
		            elements = currentDocument.getElementsByTagName(nsPrefix + ":" + localName);
		        }
		        for (count = 0; count < elements.length; count++) {
		            DECORATOR.attachDecoration(elements[count], true, true);
		            // depth-first decoration for container form controls
		            if (nsURI === "http://www.w3.org/2002/xforms" &&
									 (localName === "repeat" || localName === "case" || localName === "group" || localName === "header")) {
										DECORATOR.applyDecorationRules(elements[count]);
		            }
		        }
		    }
		}
		// <pe-value> is a special case, since its not in the XForms namespace
		elements = currentDocument.getElementsByTagName("pe-value");
		for (count = 0; count < elements.length; count++) {
		    DECORATOR.attachDecoration(elements[count], true, true);
		}
		if (!doc) {
		    this.callDocumentReadyHandlers();
		}
	}

	/**
		runs through a list of functions and calls them in the context of obj as this
		@param {Object} obj object in whose context the functions in handlers should be executed.
		@param {Array} handlers list of functions that should be executed with obj as this
	*/
	function callHandlers(obj, handlers) {
		if (handlers) {
			obj.oHandler = handlers.pop();
			while (obj.oHandler) {
				obj.oHandler();
				obj.oHandler = handlers.pop();
			}
		}
	}

	/**
		Called by implementations that do not natively support a documentReady event.
			on document load, this function calls any documentready handlers that have 
			been registered so far, then sets the g_bDocumentLoaded flag to true, so that 
			any documentready handlers that attempt to register later can execute immediately.	
		Now that all the scripts are loaded after the rest of the document, this is also required
		by IE, to call the handlers at the end of processing.
	*/
	function callDocumentReadyHandlers() {
		var o = g_arrHandlersToCallOnLoad.pop();
		while (o) {
			callHandlers(o[0], o[1]);
			o = g_arrHandlersToCallOnLoad.pop();
		}
		
		g_bDocumentLoaded = true;
	}

		
	/**
		Called by implementations that do not natively support a documentReady event.
			If the document has already loaded, handlers passed into this function 
			will execute immediately, otherwise, they will be appended to the list of 
			handlers waiting to be called on load.
	*/
	function registerForOnloadOrCallNow(obj, arr) {
		if (g_bDocumentLoaded) {
			callHandlers(obj, arr);
		} else {
			g_arrHandlersToCallOnLoad.push([obj, arr]);
		}
	}

	/**
		Adds a function (func) to a named list of functions within an object (dest)
		If a list with that name does not exist, creates the list.
		The purpose of this mechanism of extension, is for functions such as constructors and
		event handlers, which are cumulative, rather than overriding.
		@param {Object} dest object that contains the named list
		@param {String} name of the list property within dest that func should be appended to.
		@param {Object} func function to add to the list
		
	*/		
	function addFunction(dest, name, func) {
		if (!dest[name]) {
			dest[name] = [];
		}
		return dest[name].push(func);
	}

	
/**
	creates a CSS style declaration that causes the decoration of its referent with the objects in objs
	@param {Array} objs array of strings specifying the names of objects to be used in decorating an element.
	@returns String representation of the appropriate -moz-binding declaration.
*/		
	function generateMozBindingStyle(objs) {
		if (objs !== undefined) {
			return "-moz-binding: url(\"" + g_sBehaviourDirectory + "decorator.xml" + (objs.length > 0 ? "?" + objs.join("&") : "") + "#decorator\");";
		} else {
			return "";
		}
	}

/**
	Adds rules to the document's stylesheet cascade that cause the decoration of elements in IE. 
	Do not call directly, Call setupDecorator(defs)
	@param {Array} defs decorator definitions 
	@see (somewhere else)
*/	
	function ieSetupDecorator(defs) {
		var bDocumentAlreadyLoaded, oStyleSheet, sBehaviourRule, sRule, alternateSelectors, i, j;
		bDocumentAlreadyLoaded = g_bDocumentLoaded;
		g_bDocumentLoaded = false;
		oStyleSheet = document.createStyleSheet("", 0);

		// IE 8+ doesn't support CSS expressions, so we must defer to an HTC.
		sBehaviourRule = "\nbehavior: " + (UX.isIE6 || UX.isIE7 ?
		                                  "expression(DECORATOR.decorate(this));" :
		                                  "url(" + g_sBehaviourDirectory + "decorate.htc);");


		for (i = 0;defs.length > i;++i) {
			sRule = "";
			if (defs[i].objects !== undefined) { 
				sRule += generateMozBindingStyle(defs[i].objects) + sBehaviourRule;
			}
			sRule += (defs[i].cssText || "");
			
			//strip out child selectors, (replacing with the inferior descendent selectors)
			//	These do not work in IE and even sometimes cause IE to close without warning
			defs[i].selector = defs[i].selector.replace(/>/g, '');
			alternateSelectors = defs[i].selector.split(",");
			//IE doesn't like multiple selectors to be inserted at once.
			//	Split them on "," and do it one-at-a time
			for (j = 0; j < alternateSelectors.length; ++j) {
				oStyleSheet.addRule(alternateSelectors[j], sRule);
			}
		}
		g_bDocumentLoaded = bDocumentAlreadyLoaded;
		if (bDocumentAlreadyLoaded) {
			callDocumentReadyHandlers();
		}

	}
	
	function isFirefox3() {
		return (navigator.oscpu && document.getElementsByClassName);
	}
/**
	Adds rules to the document's stylesheet cascade that cause the decoration of elements in Firefox.
	Do not call directly, Call setupDecorator(defs)
	@param {Array} defs decorator definitions 
	@see (somewhere else)
*/	
	function ffSetupDecorator(defs, ns) {
		var cssNode, oHead, oStyle, s, htmlPrefix, htmlNamespaceURI, xformsPrefix, 
		xformsNamespaceURI, anHTMLPrefix, aXFormsPrefix, i, sRule, styleTextNode;
	  //HACK: in order to get XBLs working in firefox 3, a prebuilt stylesheet has been created, and 
	  //  unexpected namespace prefixes are ignored.
		if (ns === "http://www.w3.org/2002/xforms" && isFirefox3()) {
			try {
				cssNode = document.createElement('link');
				cssNode.type = 'text/css';
				cssNode.rel = 'stylesheet';
				cssNode.href = g_sBehaviourDirectory + "generated-css.css";
				cssNode.media = 'screen';
				cssNode.title = 'dynamicLoadedSheet';
				document.getElementsByTagName("head")[0].appendChild(cssNode);
			}
			catch (e) {
				alert(e);  
			}
		} else if (ns === "http://www.w3.org/2005/SMIL21/BasicAnimation" && isFirefox3()) {
    //ignore, this is already in generated-css
 /*     try{
        var cssNode = document.createElement('link');
        cssNode.type = 'text/css';
        cssNode.rel = 'stylesheet';
        cssNode.href = g_sBehaviourDirectory +"smil.css";
        cssNode.media = 'screen';
        cssNode.title = 'dynamicLoadedSheet';
        document.getElementsByTagName("head")[0].appendChild(cssNode);
      }
      catch(e) {
        alert(e);  
      }
   */ 
		} else {

    	oHead = document.getElementsByTagName("head")[0];
    	oStyle = document.createElement('style');
    	s = "";
    	
    	oStyle.setAttribute("type", "text/css");
    	
    	if (UX.isXHTML) {
				// look for prefixes from the document and figure out what to use
				htmlPrefix = "h";
				htmlNamespaceURI = "http://www.w3.org/1999/xhtml";
				xformsPrefix = "xf";
				xformsNamespaceURI = "http://www.w3.org/2002/xforms";
				 
				anHTMLPrefix = NamespaceManager.getOutputPrefixesFromURI(htmlNamespaceURI);
				if ((anHTMLPrefix !== undefined) && (anHTMLPrefix !== null)) {
					htmlPrefix = anHTMLPrefix[0];
				}
				
				aXFormsPrefix = NamespaceManager.getOutputPrefixesFromURI(xformsNamespaceURI);
				 if ((aXFormsPrefix !== undefined) && (aXFormsPrefix !== null)) {
				  xformsPrefix =  aXFormsPrefix[0];
				}
				
				s += "@namespace smil url(http://www.w3.org/2005/SMIL21/BasicAnimation);";
				s += "@namespace" + " " + xformsPrefix + " " + "url(" + xformsNamespaceURI +");";
				s += "@namespace" + " " + htmlPrefix  + " " + "url(" + htmlNamespaceURI + ");";
    	}
    	
    	for (i = 0; defs.length > i; ++i) {
    		if (UX.isXHTML) {
    		    defs[i].selector = defs[i].selector.replace(/\\:/g,"|");
    		}
    	
    		sRule = defs[i].selector + "{" + generateMozBindingStyle(defs[i].objects) + (defs[i].cssText || "") + "}";
    		//oStyle.sheet.insertRule(sRule, oStyle.sheet.length);
    		s += sRule;
    	}
    	styleTextNode = document.createTextNode(s);
			oStyle.appendChild(styleTextNode);
    	oHead.insertBefore(oStyle, null);
    }
  		
		return;
		
	}//ffSetupDecorator
	
	function ffXHTMLSetupDecorator(defs) {
		var oHead, htmlPrefix, htmlNamespaceURI, xformsPrefix, xformsNamespaceURI, anHTMLPrefix, aXFormsPrefix, oStyle, s,
		i, sRule;
		oHead = document.getElementsByTagName("head")[0];

	  htmlPrefix = "h";
	  htmlNamespaceURI = "http://www.w3.org/1999/xhtml";
	  xformsPrefix = "xf";
	  xformsNamespaceURI = "http://www.w3.org/2002/xforms";
	
	  if (UX.isXHTML) {
			anHTMLPrefix = NamespaceManager.getOutputPrefixesFromURI(htmlNamespaceURI);
			if ((anHTMLPrefix !== undefined) && (anHTMLPrefix !== null)) {
				htmlPrefix =  anHTMLPrefix[0];
			}
			aXFormsPrefix = NamespaceManager.getOutputPrefixesFromURI(xformsNamespaceURI);
			if ((aXFormsPrefix !== undefined) && (aXFormsPrefix !== null)) {
				xformsPrefix = aXFormsPrefix[0];
			}
		}

		oStyle = document.createElement('style');
		oStyle.setAttribute("type", "text/css");
		s = '';
		s += "@namespace smil url(http://www.w3.org/2005/SMIL21/BasicAnimation);";
		s += "@namespace" + " " + xformsPrefix + " " + "url(" + xformsNamespaceURI + ");";
		s += "@namespace" + " " + htmlPrefix + " " + "url(" + htmlNamespaceURI + ");";		

		for (i = 0; defs.length > i; ++i) {
			if(UX.isXHTML) {
				defs[i].selector = defs[i].selector.replace(/\\:/g, "|");
			}
			sRule = defs[i].selector + "{" + generateMozBindingStyle(defs[i].objects) + (defs[i].cssText || "") + "}";
			s += sRule;			
			//oStyle.sheet.insertRule(sRule,oStyle.sheet.length);
		}
		oStyle.innerHTML = s;
		oHead.insertBefore(oStyle,null);

		
	}

	
/**
	Extends the functionality of the destination object with the members of source
	@param {Object} destination object to be extended
	@param {Object} source source of new members for destination.
	
*/		
	function extend(destination, source, bExecuteConstructorsImmediately) {
		var property, ix;
		for (property in source) {
			switch (property) {	
				//In the case of these known named functions, add this member to the cumulative list
				//	of members with that name, rather than overriding.
				//	(this member should be a function, but, since we are using Javascript which is far superior
				//	to any typed language, this can only be constrained by hoping that authors read and obey
				//	this comment)
				case "ctor":
				case "onContentReady":
					if (bExecuteConstructorsImmediately) {
    					destination[property] = source[property];
					} else { 
    					addFunction(destination, property, source[property]);
					}
				break;
				case "onDocumentReady":
					if (g_bDocumentLoaded && bExecuteConstructorsImmediately) {
    					destination[property] = source[property];
					} else {
    					addFunction(destination, property, source[property]);
					}

				break;
				default:
					//	Otherwise, create this member anew, or override any existing homonymous member.
					destination[property] = source[property];
			}
		}
		
		//If immediate execution of constructors has been requested, do so.
		if (bExecuteConstructorsImmediately) {
			if (destination.ctor) {
				destination.ctor();
			}
			if (destination.onContentReady) {
				destination.onContentReady();
			}
			if (destination.onDocumentReady) {
				destination.onDocumentReady();
			}
		}
		return destination;
	}
	

/**
	Adds rules to the document's stylesheet cascade that cause the decoration of elements in the appropriate browser.
	@param {Array} defs decorator definitions 
	@see (somewhere else)
*/	
	innerSetupDecorator = null;
	function setupDecorator(defs,ns) {
		var bDocumentAlreadyLoaded, i;
		bDocumentAlreadyLoaded = g_bDocumentLoaded;
		g_bDocumentLoaded = false;
		NamespaceManager.readOutputNamespacesFromDocument();
		for (i = 0; i < defs.length; ++i) {
			defs[i].selector = NamespaceManager.translateCSSSelector(defs[i].selector);	
		}
		
		innerSetupDecorator(defs, ns);
		if (bDocumentAlreadyLoaded) {
			spawn(callDocumentReadyHandlers);
		}
		//g_bDocumentLoaded = bDocumentAlreadyLoaded;
	}
	
	if (UX.isIE) {
		innerSetupDecorator = ieSetupDecorator;
	} else if (UX.isXHTML) {
		innerSetupDecorator = ffXHTMLSetupDecorator;
	}	else {
		innerSetupDecorator = ffSetupDecorator;
	}
	
	/**
		Retrieves the computed style value of a given non-standard CSS property.
		non-standard CSS properties begin with "-".
		For retrieval, IE6 and earlier removes preceding "-", IE7 leaves it in.
		@param {Element} element The element whose custom property is desired.
		@param {String} propertyName The name of the property, with or without preceding "-"
		@returns The computed value of the property, if neither "property", nor "-property" exist, this function will return undefined.
	*/
	function getCustomCSSPropertyIE(element,propertyName) {
		//first try to get the property as originally requested.
		//Rather than checking the version of IE being used, here, it is preferable
		//	to operate on a features-available mechanism.
		var propertyValue = element.currentStyle[propertyName];
		if (propertyValue  === undefined) {
			//Since the property value as requested was not found, try the other way.
			if(propertyName.charAt(0) === '-') {
				//if the requested property name begins with '-', chop it off
				propertyName = propertyName.slice(1);
			}	else {
				// if '-' was omitted, prepend it.
				propertyName = "-" + propertyName;
			}
			propertyValue =  element.currentStyle[propertyName];
		}
		return propertyValue;
	}
	
	
	function getCustomCSSPropertyFF(element,propertyName) {
		var currentStyle = window.getComputedStyle(element,"");
		return currentStyle.getPropertyValue(propertyName);
	}
	
	isIE  = (navigator.appVersion.indexOf("MSIE") !== -1) ? true : false;
	getCustomCSSProperty = isIE?getCustomCSSPropertyIE:getCustomCSSPropertyFF;
	
	
	function getDecorationObjectNames(element) {
		var sBehaviours = getCustomCSSProperty(element,"-moz-binding"),
		    arrBehaviours = [];
		if(sBehaviours !== undefined && sBehaviours !== null && sBehaviours.indexOf('?') !== -1) {
			sBehaviours = sBehaviours.substring(sBehaviours.indexOf('?')+1,sBehaviours.lastIndexOf('#') );
			arrBehaviours = sBehaviours.split("&");
		}
		return arrBehaviours;
	}

	/**
		Creates an object of type sBehaviour and extends elmnt with it.
		@param {Object} elmnt element to decorate with the members of sBehaviour
		@param {String} sBehaviour name of the objecy to create in order ot decorate elmnt
	*/
	function addObjectBehaviour(elmnt,Behaviour,bExecuteConstructorsImmediately) {
		try {
			var behaviourInstance = new Behaviour(elmnt);
			DECORATOR.extend(elmnt, behaviourInstance, bExecuteConstructorsImmediately);
		} catch(e) {
			debugger;
		}

	}	
	
	function attachSingleBehaviour(sBehaviour) {
		addObjectBehaviour(this,sBehaviour,false);
	}



  function updateDecorationObjectNames(element,arrBehaviours) {
      var arrUpdatedBehaviours = arrBehaviours, // default is no change
          elementNSURI = NamespaceManager.getNamespaceURI(element),
          elementLocalName = NamespaceManager.getLowerCaseLocalName(element),
          elementRules,
          wildcardRules,
          rules,
          rulecount;

      // Rules are a concatenation of the element name rules and
      // wildcard rules (if any) for the given element namespace ...
      if (g_DecorationRules[elementNSURI]) {
          elementRules = g_DecorationRules[elementNSURI][elementLocalName] ? g_DecorationRules[elementNSURI][elementLocalName] : [];
          wildcardRules = g_DecorationRules[elementNSURI]["*"] ? g_DecorationRules[elementNSURI]["*"] : [];
          rules = elementRules.concat(wildcardRules);
      }
      // ... and wildcard rules across namespaces (if any)
      if (g_DecorationRules["*"]) {
          rules = rules ? rules.concat(g_DecorationRules["*"]) : g_DecorationRules["*"];
      }

      // <pe-value> is a special case, since its not in the XForms namespace
      if (elementLocalName === "pe-value") {
          rules = rules ? rules.concat(g_DecorationRules["http://www.w3.org/2002/xforms"][elementLocalName]) : g_DecorationRules["http://www.w3.org/2002/xforms"][elementLocalName];
          rules = rules.concat(g_DecorationRules["http://www.w3.org/2002/xforms"]["*"]);
      }

      for (rulecount = 0; rules && rulecount < rules.length; rulecount++) {
          if (rules[rulecount].match === undefined || rules[rulecount].match(element)) {
              arrUpdatedBehaviours = rules[rulecount].apply(arrUpdatedBehaviours);
          }
      }

      return arrUpdatedBehaviours;
  }
  
	function attachDecoration(element,handleContentReady, handleDocumentReady) {
		//window.status = "decorating: " + element.nodeName; 
		var bReturn = false, tIndex, arrBehaviours, i;
		tIndex = element.getAttribute("tabindex");
		//quit if already manually decorated
		if (!UX.hasDecorationSupport && element.decorated) {
			return bReturn;
		}
		if (tIndex === 0){
			element.tabIndex = 1;
		}

		element.decorated = true;
		element.constructors = [];
		element.contentReadyHandlers = [];
		element.documentReadyHandlers = [];
		//add capability to 
		element.attachSingleBehaviour = attachSingleBehaviour;

		arrBehaviours = getDecorationObjectNames(element);				
		arrBehaviours = updateDecorationObjectNames(element,arrBehaviours);
		if (arrBehaviours.length  > 0) {
			for (i = 0;i < arrBehaviours.length;++i) {
				addObjectBehaviour(element,arrBehaviours[i],false);
			}
			if (m_suspended) {
				m_elementsInSuspension.push(element);
			} else {
	
				callConstructionFunctions(element, handleContentReady, handleDocumentReady);
				
				bReturn =  true;
			}
		}
		return bReturn;
	}
	
	function callConstructionFunctions(element, handleContentReady, handleDocumentReady) {
		callHandlers(element,element.ctor);
	
				//If the caller has requested that this function shoudl sort out 
				//	contentReady and documentReady, sort them out now.
				if (handleContentReady) {
					callHandlers(element,element.onContentReady);
				}
				
				if (handleDocumentReady) {
					registerForOnloadOrCallNow(element,element.onDocumentReady);
				}
	}
	
	//Once the decorator has been set up, in IE, this function wil be called to decorate the elements.
	function decorate(e) {   
		//Don't decorate a second time.
		if (e.decorated) {
			//During development, it may be handy to provide visual feedback
			//	 that excess decorations are occurring.
			//window.status += "|";
		} else {
			// ignore binding request, if binding-ignore is true;
			var s = getCustomCSSProperty(e,"-binding-ignore");
			
			if(s === undefined || s === "false") {
				//Now that the elemnt is being decorated, switch off the behaviour expression
				//	to prevent it continually trying to get decorated.
				e.style.behavior = ("url()");
				e.decorated = true;
				//Do the decoration.
				DECORATOR.attachDecoration(e,true,true);					
				//window.status = "decorating: " + e.tagName;
			}
		}
		return;
	}
	
	var isInDocument = function (element) {
		var parent = element.parentNode;
		while (parent) {	
			if (parent === document) {
				return true;
			}
			parent = parent.parentNode;
		}
		return false;
	};
	
	itself.extend = extend;
	itself.setupDecorator = setupDecorator;
	itself.attachDecoration = attachDecoration;
	itself.decorate = decorate;
	itself.callDocumentReadyHandlers = callDocumentReadyHandlers;
	itself.addDecorationRules = addDecorationRules;
	itself.applyDecorationRules = applyDecorationRules;
  itself.onAllBindingsAttached = function (obj) {
    obj.parentNode.removeChild(obj);
    this.callDocumentReadyHandlers();
  };

	itself.suspend = function () {
		++m_suspended;
	};
	
	itself.resume = function () {
		var element;
		if (!--m_suspended) {
			while (m_elementsInSuspension[0]) {
				element = m_elementsInSuspension.pop();
				//A new element may have been added, then removed from the document
				//	during the suspension.  Check if it still exists before initialising.
				if (isInDocument(element)) {
					callConstructionFunctions(element, true, true);
				}
			}
		}
	};
	return itself;
}();

YAHOO.util.Event.onDOMReady(
  function() {
    DECORATOR.applyDecorationRules();
    window.status = "ready";
  }
);

//for debugging
function SomeObject(elmnt) {
	//this.banana = "This object has been decorated with SomeObject";
}
		
