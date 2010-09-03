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

//= provide "../behaviours"
/**
 @fileoverview
 Contains functions used in the decoration of elements and objects. Along with the mechanism for
 setting up decoration.
 
 */

/*global document, UX, NamespaceManager, g_bDocumentLoaded, g_sBehaviourDirectory, navigator, alert, window, YAHOO, spawn  */



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
var DECORATOR = {
	
	decorationRules: {},
	
	handlersToCallOnLoad: [],
	
	inSuspension: [],
	
	suspended: 0,
	
	
	/**
	 Extends the functionality of the destination object with the members of source
	 @param {Object} destination object to be extended
	 @param {Object} source source of new members for destination.
	 */
	extend: function (dst, src, executeNow) {
		for (var p in src) {
			switch (p) {
				//In the case of these known named functions, add this member to the cumulative list
				//	of members with that name, rather than overriding.
				//	(this member should be a function, but, since we are using Javascript which is far superior
				//	to any typed language, this can only be constrained by hoping that authors read and obey
				//	this comment)
			case "ctor":
			case "onContentReady":
				if (executeNow) {
					dst[p] = src[p];
				} else {
					this._addFunction(dst, p, src[p]);


				}
				break;
			case "onDocumentReady":
				if (g_bDocumentLoaded && executeNow) {
					dst[p] = src[p];
				} else {
					this._addFunction(dst, p, src[p]);
				}
				break;
			default: //	Otherwise, create this member anew, or override any existing homonymous member.
				dst[p] = src[p];


			}
		}

		//If immediate execution of constructors has been requested, do so.
		if (executeNow) {
			var props = ['ctor', 'onContentReady', 'onDocumentReady'];
			for(var i = 0; i < 3; i++){
				if(dst[props[i]]) dst[props[i]]();


			}
		}
		return dst;
	},
	
	/**
	 Adds a function (func) to a named list of functions within an object (dest)
	 If a list with that name does not exist, creates the list.
	 The purpose of this mechanism of extension, is for functions such as constructors and
	 event handlers, which are cumulative, rather than overriding.
	 @param {Object} dst object that contains the named list
	 @param {String} name of the list property within dest that func should be appended to.
	 @param {Object} func function to add to the list
	 */
	_addFunction: function(dst, name, func) {
		if (!dst[name]) {
			dst[name] = [];
		}
		return dst[name].push(func);
	},
	
	/**
	 Adds rules to the document's stylesheet cascade that cause the decoration of elements in the appropriate browser.
	 @param {Array} defs decorator definitions
	 @see (somewhere else)
	 */
	setupDecorator: function(defs, ns) {
		var isLoaded = g_bDocumentLoaded;
		g_bDocumentLoaded = false;
		NamespaceManager.readOutputNamespacesFromDocument();
		for (var i = 0; i < defs.length; ++i) {
			defs[i].selector = NamespaceManager.translateCSSSelector(defs[i].selector);
		}
		this._setupDecorator(defs, ns);
		if (isLoaded) {
			spawn(this.callDocumentReadyHandlers);
		}
		//g_bDocumentLoaded = bDocumentAlreadyLoaded;
	},
	
	_setupDecorator: UX.isIE ? function(defs) {//ie
		/**
		 Adds rules to the document's stylesheet cascade that cause the decoration of elements in IE.
		 @param {Array} defs decorator definitions
		 @see (somewhere else)
		 */
		var isLoaded = g_bDocumentLoaded;
		g_bDocumentLoaded = false;
		var sheet = document.createStyleSheet("", 0);

		// IE 8+ doesn't support CSS expressions, so we must defer to an HTC.
		var behaviourRule = "\nbehavior: " + (UX.isIE6 || UX.isIE7 ? 
			"expression(DECORATOR.decorate(this));" :
			 "url(" + g_sBehaviourDirectory + "decorate.htc);"
		);

		for (var i = 0; i < defs.length; ++i) {
			var rule = "";
			if (defs[i].objects != undefined) {
				rule += this._generateMozBindingStyle(defs[i].objects) + behaviourRule;
			}
			rule += (defs[i].cssText || "");

			//strip out child selectors, (replacing with the inferior descendent selectors)
			//	These do not work in IE and even sometimes cause IE to close without warning
			defs[i].selector = defs[i].selector.replace(/>/g, '');
			var alternateSelectors = defs[i].selector.split(",");
			//IE doesn't like multiple selectors to be inserted at once.
			//	Split them on "," and do it one-at-a time
			for (var j = 0; j < alternateSelectors.length; ++j) {
				sheet.addRule(alternateSelectors[j], rule);
			}
		}
		g_bDocumentLoaded = isLoaded;
		if (isLoaded) {
			this.callDocumentReadyHandlers();
		}
			
	} : (UX.isXHTML ? function(defs) {//ff xhtml
		var head = document.getElementsByTagName("head")[0];

		var htmlPrefix = "h";
		var htmlNamespaceURI = "http://www.w3.org/1999/xhtml";
		var xformsPrefix = "xf";
		var xformsNamespaceURI = "http://www.w3.org/2002/xforms";

		var anHTMLPrefix = NamespaceManager.getOutputPrefixesFromURI(htmlNamespaceURI);
		if (anHTMLPrefix) {
			htmlPrefix = anHTMLPrefix[0];
		}
		var aXFormsPrefix = NamespaceManager.getOutputPrefixesFromURI(xformsNamespaceURI);
		if (aXFormsPrefix) {
			xformsPrefix = aXFormsPrefix[0];
		}

		var style = document.createElement('style');
		style.setAttribute("type", "text/css");
		var s = "";
		s += "@namespace smil url(http://www.w3.org/2005/SMIL21/BasicAnimation);";
		s += "@namespace" + " " + xformsPrefix + " " + "url(" + xformsNamespaceURI + ");";
		s += "@namespace" + " " + htmlPrefix + " " + "url(" + htmlNamespaceURI + ");";

		for (var i = 0; i < defs.length; ++i) {
			defs[i].selector = defs[i].selector.replace(/\\:/g, "|");
			s += defs[i].selector + "{" + 
				this._generateMozBindingStyle(defs[i].objects) + (defs[i].cssText || "") + 
			"}";
		}
		style.innerHTML = s;
		head.insertBefore(style, null);	
		
	} : function(defs, ns) {//ff
		/**
		 Adds rules to the document's stylesheet cascade that cause the decoration of elements in Firefox.
		 @param {Array} defs decorator definitions
		 @see (somewhere else)
		*/

		// HACK: in order to get XBLs working in firefox 3, a prebuilt stylesheet has been created, and
		// unexpected namespace prefixes are ignored. This prebuilt stylesheet is at "generated-css.css"
		// and is imported at build time, so if we're running on FF there's nothing left to do.
		if(UX.isFF3) return;

		var head = document.getElementsByTagName("head")[0];
		var style = document.createElement("style");
		style.setAttribute("type", "text/css");
		
		var s = "";
		for (var i = 0; i < defs.length; ++i) {
			s += defs[i].selector + "{" + 
				this._generateMozBindingStyle(defs[i].objects) + (defs[i].cssText || "") + 
			"}";
		}
		style.appendChild(document.createTextNode(s));
		head.insertBefore(style, null);
		
	}),
	
	/**
	 creates a CSS style declaration that causes the decoration of its referent with the objects in objects
	 @param {Array} objs array of strings specifying the names of objects to be used in decorating an element.
	 @returns String representation of the appropriate -moz-binding declaration.
	 */
	_generateMozBindingStyle: function(objects) {
		if(!objects) return "";
		return "-moz-binding: url(\"" + g_sBehaviourDirectory + "decorator.xml" + (objects.length > 0 ? "?" + objects.join("&") : "") + "#decorator\");";
	},
	
	attachDecoration: function(element, handleContentReady, handleDocumentReady) {
		if (!UX.hasDecorationSupport && element.decorated) return false;//quit if already manually decorated
		//window.status = "decorating: " + element.nodeName;

		if (element.getAttribute("tabindex") == 0) {
			element.tabIndex = 1;
		}
		element.decorated = true;
		element.constructors = [];
		element.contentReadyHandlers = [];
		element.documentReadyHandlers = [];
		//add capability to
		element.attachSingleBehaviour = this._attachSingleBehaviour;

		var behaviours = this._getBehaviours(element);
		if(!behaviours.length) return false;




		
		for (var i = 0, l = behaviours.length; i < l; ++i) {
			this._addObjectBehaviour(element, behaviours[i], false);
		}
		if (this.suspended) {
			this.inSuspension.push(element);
			return false;
		}
		this._callConstructionFunctions(element, handleContentReady, handleDocumentReady);
		return true;
	},
	
	_attachSingleBehaviour: function(Behaviour) {
		DECORATOR._addObjectBehaviour(this, Behaviour, false);
	},
	
	_getBehaviours: function(element) {
		var sBehaviours = this._getCustomCSSProperty(element, "-moz-binding");
		var arrBehaviours = [];
		if (sBehaviours && sBehaviours.indexOf('?') !== -1) {
			sBehaviours = sBehaviours.substring(sBehaviours.indexOf('?') + 1, sBehaviours.lastIndexOf('#'));
			arrBehaviours = sBehaviours.split("&");
		}
		
		var nsURI = NamespaceManager.getNamespaceURI(element);
		var localName = NamespaceManager.getLowerCaseLocalName(element);
	 
		// Rules are a concatenation of the element name rules and
		// wildcard rules (if any) for the given element namespace ...
		var rules = [];
		if (this.decorationRules[nsURI]) {
			var elementRules = this.decorationRules[nsURI][localName] || [];
			var wildcardRules = this.decorationRules[nsURI]["*"] || [];
			rules = elementRules.concat(wildcardRules);
		}
		if (this.decorationRules["*"]) {// ... and wildcard rules across namespaces (if any)
			rules = rules.concat(this.decorationRules["*"]);
		}
		if (localName == "pe-value") {// <pe-value> is a special case, since its not in the XForms namespace
			rules = rules.concat(this.decorationRules["http://www.w3.org/2002/xforms"][localName])
			.concat(this.decorationRules["http://www.w3.org/2002/xforms"]["*"]);
		}
		
		for (var i = 0, l = rules.length; i < l; i++) {
			if (!rules[i].match || rules[i].match(element)) {
				arrBehaviours = rules[i].apply(arrBehaviours);
			}
		}

		return arrBehaviours;
		
	},
	
	/**
	 Creates an object of type sBehaviour and extends elmnt with it.
	 @param {Object} element - element to decorate with the members of sBehaviour
	 @param {String} sBehaviour name of the objecy to create in order ot decorate elmnt
	 */
	_addObjectBehaviour: function(element, Behaviour, executeNow) {
		this.extend(element, new Behaviour(element), executeNow);
	},
	
	_getCustomCSSProperty: UX.isIE ?  function(element, property) {//ie
		//first try to get the property as originally requested.
		//Rather than checking the version of IE being used, here, it is preferable
		//	to operate on a features-available mechanism.
		var value = element.currentStyle[property];
		if(value != undefined) return value;
		//Since the property value as requested was not found, try the other way.
		if (property.charAt(0) == '-') {
			property = property.slice(1);//if the requested property name begins with '-', chop it off
		} else {
			property = "-" + property;// if '-' was omitted, prepend it.
		}
		value = element.currentStyle[property];
		
		return value;
		
	} : function(element, property) {//ff
		
		return window.getComputedStyle(element, "").getPropertyValue(property);
		
	},
	
	_callConstructionFunctions: function(element, handleContentReady, handleDocumentReady) {
		this._callHandlers(element, element.ctor);
		//If the caller has requested that this function shoudl sort out
		//	contentReady and documentReady, sort them out now.
		if (handleContentReady) {
			this._callHandlers(element, element.onContentReady);
		}
		if (handleDocumentReady) {
			this._registerForOnloadOrCallNow(element, element.onDocumentReady);
		}
	},
	
	/**
	 runs through a list of functions and calls them in the context of obj as this
	 @param {Object} obj object in whose context the functions in handlers should be executed.
	 @param {Array} handlers list of functions that should be executed with obj as this
	 */
	_callHandlers: function(obj, handlers) {
		if (handlers) {
			obj.oHandler = handlers.pop();
			while (obj.oHandler) {
				obj.oHandler();
				obj.oHandler = handlers.pop();
			}
		}
	},

	/**
	 Called by implementations that do not natively support a documentReady event.
	 If the document has already loaded, handlers passed into this function
	 will execute immediately, otherwise, they will be appended to the list of
	 handlers waiting to be called on load.
	 */
	_registerForOnloadOrCallNow: function(obj, arr) {
		if (g_bDocumentLoaded) {
			this._callHandlers(obj, arr);
		} else {
			this.handlersToCallOnLoad.push([obj, arr]);
		}
	},
	
	//Once the decorator has been set up, in IE, this function wil be called to decorate the elements.
	decorate: function(element) {
		if (element.decorated) return;
		// ignore binding request, if binding-ignore is true;
		var s = this._getCustomCSSProperty(element, "-binding-ignore");
		if (s == undefined || s == "false") {
			//Now that the element is being decorated, switch off the behaviour expression
			//	to prevent it continually trying to get decorated.
			element.style.behavior = ("url()");
			element.decorated = true;
			DECORATOR.attachDecoration(element, true, true);
		}
	},
	
	/**
	 Called by implementations that do not natively support a documentReady event.
	 on document load, this function calls any documentready handlers that have
	 been registered so far, then sets the g_bDocumentLoaded flag to true, so that
	 any documentready handlers that attempt to register later can execute immediately.
	 Now that all the scripts are loaded after the rest of the document, this is also required
	 by IE, to call the handlers at the end of processing.
	 */
	callDocumentReadyHandlers: function() {
		var o = DECORATOR.handlersToCallOnLoad.pop();
		while (o) {
			DECORATOR._callHandlers(o[0], o[1]);
			o = DECORATOR.handlersToCallOnLoad.pop();
		}
		g_bDocumentLoaded = true;
	},
	
	addDecorationRules: function(decorationRules) {
		if (decorationRules.namespaceURI && decorationRules.rules) {
			this._addDecorationRulesForNamespace(decorationRules.namespaceURI, decorationRules.rules);
		} else if (decorationRules.rules) {
			this._addDecorationRulesForNamespace("*", decorationRules.rules);
		}
	},
	
	_addDecorationRulesForNamespace: function(namespaceURI, rules) {
		if (this.decorationRules[namespaceURI]) {
			for (var key in rules) {
				if (this.decorationRules[namespaceURI][key]) {
					this.decorationRules[namespaceURI][key] = this.decorationRules[namespaceURI][key].concat(rules[key]);
				} else {
					this.decorationRules[namespaceURI][key] = rules[key];
				}
			}
		} else {
			this.decorationRules[namespaceURI] = rules;
		}
	},
	
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
	applyDecorationRules: function(doc) {
		var currentDocument = doc || document, i, l;
		if (UX.hasDecorationSupport) return;
		
		for (var nsURI in this.decorationRules) {
			if (nsURI == "*") {
				// ignoring wildcard rules, TBD how to handle these,
				// given CSS selectors are not available for this purpose
				continue;
			}
			var nsRules = this.decorationRules[nsURI];
			var elements;
			for (var name in nsRules) {
				if (name === "*" || name === "pe-value") {
					// <pe-value> is special, @see ISSUE 62
					continue;
				}
				elements = NamespaceManager.getElementsByTagNameNS(currentDocument, nsURI, name);
				for (i = 0, l = elements.length; i < l; i++) {
					DECORATOR.attachDecoration(elements[i], true, true);
					// depth-first decoration for container form controls
					if (nsURI == "http://www.w3.org/2002/xforms" && (name == "repeat" || name == "case" || name == "header")) {
						DECORATOR.applyDecorationRules(elements[i]);
					}
				}
			}
		}
		// <pe-value> is a special case, since its not in the XForms namespace
		elements = currentDocument.getElementsByTagName("pe-value");
		for (i = 0, l = elements.length; i < l; i++) {
			this.attachDecoration(elements[i], true, true);
		}
		if (!doc) {
			this.callDocumentReadyHandlers();
		}
	},
	
	onAllBindingsAttached: function(obj) {
		obj.parentNode.removeChild(obj);
		this.callDocumentReadyHandlers();
	},

	suspend: function() {
		++this.suspended;
	},

	resume: function() {
		var element;
		var isInDocument = function(element) {
			var parent = element.parentNode;
			while (parent) {
				if (parent === document) {
					return true;
				}
				parent = parent.parentNode;
			}
			return false;
		};
		if (!--this.suspended) {
			while (this.inSuspension[0]) {
				element = this.inSuspension.pop();
				//A new element may have been added, then removed from the document
				//	during the suspension.  Check if it still exists before initialising.
				if (isInDocument(element)) {
					this._callConstructionFunctions(element, true, true);
				}
			}
		}
	}
	
};


YAHOO.util.Event.onDOMReady(function() {
	
	DECORATOR.applyDecorationRules();
	window.status = "ready";
	
});


