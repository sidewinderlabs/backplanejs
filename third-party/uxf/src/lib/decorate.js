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

	rules: {},

	handlersToCallOnLoad: [],

	inSuspension: [],

	suspended: 0,

	elements: {},

	uid: 0,

	objects: {},

	getElement: function(uid){
		return this.elements[uid];
	},

	getObject: function(element){
		return this.objects[element.ux_uid || element];
	},
	
	getBehaviour: function(element){
		if(!element) return null;
		var object = this.objects[element.ux_uid || element];
		if(!object) return null;
		return object.behaviour;
	},

	/**
	 Extends the functionality of the destination object with the members of source
	 @param {Object} destination object to be extended
	 @param {Object} source source of new members for destination.
	 */
	extend: function (dst, src, executeNow) {
		for (var p in src) {
			switch (p) {
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

		if (executeNow) {
			var props = ["ctor", "onContentReady", "onDocumentReady"];
			for(var i = 0; i < 3; i++){
				if(props[i] == "onDocumentReady" && !g_bDocumentLoaded) continue;
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

		var behaviourRule = "\nbehavior: " + "url(" + g_sBehaviourDirectory + "decorate.htc);";

		for (var i = 0; i < defs.length; ++i) {
			var rule = "";
			if (defs[i].objects != undefined) {
				rule += this._generateMozBindingStyle(defs[i].objects) + behaviourRule;
			}
			rule += (defs[i].cssText || "");

			defs[i].selector = defs[i].selector.replace(/>/g, '');
			var alternateSelectors = defs[i].selector.split(",");
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
		if (!UX.hasDecorationSupport && element.ux_uid) return false;//quit if already manually decorated

		if (element.getAttribute("tabindex") == 0) {
			element.tabIndex = 1;
		}

		var behaviour = this._getBehaviour(element);
		if(!behaviour) return false;
		this.addBehaviour(element, new behaviour(element));

		if (this.suspended) {
			this.inSuspension.push(element);
			return false;
		}
		this._callConstructionFunctions(element, handleContentReady, handleDocumentReady);
		return true;
	},
	
	addBehaviour: function(element, behaviour) {
		element.ux_uid = ++this.uid;
		this.elements[this.uid] = element;
		this.objects[this.uid] = {};
		this.objects[this.uid].behaviour = behaviour;
	},

	_getBehaviour: function(element) {
		/*if (sBehaviours && sBehaviours.indexOf('?') !== -1) {
			sBehaviours = sBehaviours.substring(sBehaviours.indexOf('?') + 1, sBehaviours.lastIndexOf('#'));
			arrBehaviours = sBehaviours.split("&");
		}*/

		var nsURI = NamespaceManager.getNamespaceURI(element);
		var localName = NamespaceManager.getLowerCaseLocalName(element);

		var rules;
		if (this.rules[nsURI]) {
			rules = this.rules[nsURI][localName];
		}
		if (localName == "pe-value") {// <pe-value> is a special case, since its not in the XForms namespace
			rules = this.rules["http://www.w3.org/2002/xforms"][localName];
		}

		var behaviour;
		for(var i = 0; i < rules.length; i++) {
			if (!rules[i].match || rules[i].match(element)) {
				behaviour = rules[i]["apply"]();
			}
		}
		return behaviour;
	},

	_getCustomCSSProperty: UX.isIE ?  function(element, property) {//ie
		var value = element.currentStyle[property];
		if(value != undefined) return value;
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
		if (handleContentReady) {
			if(this.getBehaviour(element).onContentReady) this.getBehaviour(element).onContentReady();
		}
		if (handleDocumentReady) {
			this._registerForOnloadOrCallNow(this.getObject(element).behaviour);
		}
	},

	/**
	 Called by implementations that do not natively support a documentReady event.
	 If the document has already loaded, handlers passed into this function
	 will execute immediately, otherwise, they will be appended to the list of
	 handlers waiting to be called on load.
	 */
	_registerForOnloadOrCallNow: function(behaviour) {
		if (g_bDocumentLoaded) {
			if(behaviour.onDocumentReady) behaviour.onDocumentReady();
		} else {
			this.handlersToCallOnLoad.push(behaviour);
		}
	},

	decorate: function(element) {
		if (element.ux_uid) return;
		var s = this._getCustomCSSProperty(element, "-binding-ignore");
		if (s == undefined || s == "false") {
			if(UX.isIE) {
				UX.extend(element, new EventTarget(element));
			}
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
		var behaviour = DECORATOR.handlersToCallOnLoad.pop();
		while (behaviour) {
			if(behaviour.onDocumentReady) behaviour.onDocumentReady();
			behaviour = DECORATOR.handlersToCallOnLoad.pop();
		}
		g_bDocumentLoaded = true;
	},

	addRules: function(rules) {
		if (rules.namespaceURI && rules.rules) {
			this._addDecorationRulesForNamespace(rules.namespaceURI, rules.rules);
		} else if (rules.rules) {
			this._addDecorationRulesForNamespace("*", rules.rules);
		}
	},

	_addDecorationRulesForNamespace: function(namespaceURI, rules) {
		if (this.rules[namespaceURI]) {
			for (var key in rules) {
				if (this.rules[namespaceURI][key]) {
					this.rules[namespaceURI][key] = this.rules[namespaceURI][key].concat(rules[key]);
				} else {
					this.rules[namespaceURI][key] = rules[key];
				}
			}
		} else {
			this.rules[namespaceURI] = rules;
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
	applyRules: function(doc) {
		var currentDocument = doc || document, i, l;
		if (UX.hasDecorationSupport) return;

		for (var nsURI in this.rules) {
			if (nsURI == "*") {
				continue;
			}
			var nsRules = this.rules[nsURI];
			var elements;
			for (var name in nsRules) {
				if (name === "*" || name === "pe-value") {
					continue;
				}
				elements = NamespaceManager.getElementsByTagNameNS(currentDocument, nsURI, name);
				for (i = 0, l = elements.length; i < l; i++) {
					DECORATOR.attachDecoration(elements[i], true, true);
					// depth-first decoration for container form controls
					if (nsURI == "http://www.w3.org/2002/xforms" && (name == "repeat" || name == "case" || name == "header")) {
						DECORATOR.applyRules(elements[i]);
					}
				}
			}
		}
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
				if (isInDocument(element)) {
					this._callConstructionFunctions(element, true, true);
				}
			}
		}
	}

};


YAHOO.util.Event.onDOMReady(function() {
	
	DECORATOR.applyRules();
	window.status = "ready";
	
});
