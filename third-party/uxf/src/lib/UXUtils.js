/*
 * Copyright (c) 2008-9 Backplane Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global Element, FormsProcessor, HTMLElement, NamespaceManager, UX, YAHOO, _getEvaluationContext , getFirstNode , spawn , xpathDomEval */
/**
 @fileoverview
 For browsers such as Firefox, that do not support IE's rather handy bonus functions
 insertAdjacentHTML, and insertAdjacentElement.
 */

/**
 XML Parsing in Firefox does not support getElementById by default (except on XHTML and XUL elements_
 To work around this problem, the xpath evaluation is done to returnh the element with the specified id.
 */
if (UX.isXHTML) {
	/* override the getElementById on the document object */
	document.nativeGetElementById = document.getElementById;
	document.getElementById = function(sID) {
		/* try to get the element by the default getElementById */
		var oElement = document.nativeGetElementById(sID);
		/* if it doesn't work, try to find by different route */
		if (oElement === null) {
			var oRes = xpathDomEval('//*[@id="' + sID + '"]', document.documentElement);
			oElement = (oRes && oRes.nodeSetValue() && oRes.nodeSetValue()[0]) ? oRes.nodeSetValue()[0] : null;
		}
		return oElement;
	};
} (function() {
	/**
	 Inserts an element into the DOM at a given location.	This is an addon applied to Elements
	 in the target environment.	Nodes must be of compatible types in the target DOM, i.e.
	 this will not be able to insert an XML Element into an HTML tree unless the underlying
	 DOMs allow it.	To mix incompatible DOMs, serialise the inserted node, and use insertAdjacentHTML
	 @param {String} where One of beforeBegin, afterBegin, beforeEnd, or afterEnd
	 @param {Node} parsedNode a node to insert into this element
	 @addon
	 */
	function insertAdjacentElement(where, parsedNode) {
		switch (where) {
		case 'beforeBegin':
			this.parentNode.insertBefore(parsedNode, this);
			break;
		case 'afterBegin':
			this.insertBefore(parsedNode, this.firstChild);
			break;
		case 'beforeEnd':
			this.appendChild(parsedNode);
			break;
		case 'afterEnd':
			if (this.nextSibling) {
				this.parentNode.insertBefore(parsedNode, this.nextSibling);
			} else {
				this.parentNode.appendChild(parsedNode);
			}
			break;
		}
	}

	/**
	 Inserts some markup into the DOM at a given location.	 This is an addon applied to Elements
	 in the target environment.
	 @param {String} where One of beforeBegin, afterBegin, beforeEnd, or afterEnd
	 @param {String} htmlStr markup to insert into this element
	 @addon
	 */
	function insertAdjacentHTML(where, htmlStr) {
		var r = this.ownerDocument.createRange();
		r.setStartBefore(this);
		var parsedHTML = r.createContextualFragment(htmlStr);
		this.insertAdjacentElement(where, parsedHTML);
	}

	/**
	 Inserts some text into the DOM at a given location, ignoring markup.
	 This is an addon applied to Elements in the target environment.
	 If parseable (or poorly-formed) markup is present in txtStr it will
	 be escaped and inserted into the target element as text.
	 @param {String} where One of beforeBegin, afterBegin, beforeEnd, or afterEnd
	 @param {String} txtStr text to insert into this element
	 @addon
	 */
	function insertAdjacentText(where, txtStr) {
		var parsedText = document.createTextNode(txtStr);
		this.insertAdjacentElement(where, parsedText);
	}

	/**
	 Checks whether o is a descendent of the current element
	 @param {Node} o The candidate descendent node to investigate
	 @returns true if o is within "this", otherwise false.
	 */
	function contains(o) {

		var parent = o;
		var retval = false;
		while (parent) {
			if (parent === this) {
				retval = true;
				break;
			} else {
				parent = parent.parentNode;
			}
		}
		return retval;
	}

	//Add the functions to the HTMLElement prototype, if absent
	if (typeof HTMLElement != "undefined") {
		HTMLElement.prototype.insertAdjacentElement = HTMLElement.prototype.insertAdjacentElement || insertAdjacentElement;
		HTMLElement.prototype.insertAdjacentText = HTMLElement.prototype.insertAdjacentText || insertAdjacentText;
		HTMLElement.prototype.insertAdjacentHTML = HTMLElement.prototype.insertAdjacentHTML || insertAdjacentHTML;
		HTMLElement.prototype.contains = HTMLElement.prototype.contains || contains;
	}

	//Add the functions to the Element prototype, if absent
	if (typeof Element != "undefined" && !Element.prototype.insertAdjacentElement) {
		Element.prototype.insertAdjacentElement = Element.prototype.insertAdjacentElement || insertAdjacentElement;
		Element.prototype.insertAdjacentText = Element.prototype.insertAdjacentText || insertAdjacentText;
		Element.prototype.insertAdjacentHTML = Element.prototype.insertAdjacentHTML || insertAdjacentHTML;
		Element.prototype.contains = Element.prototype.contains || contains;
	}

})();

(function() {

	var rspace = /\s+/;
	var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

	var addClassNameNative = function(element, classString) {
		try {
			element.classList.add(classString);
		} catch(e) {
			// Most often NS_ERROR_DOM_INVALID_CHARACTER_ERR is thrown when
			// there is a space in the class string. First we try trimming the string,
			// and then we try to split it, in the event that the user tried to pass
			// a string-separated list of classnames
			if (e.code != e.INVALID_CHARACTER_ERR) throw e;
			var className = classString.replace(rtrim, '');
			try {
				element.classList.add(className);
			} catch(e) {
				if (e.code != e.INVALID_CHARACTER_ERR) throw e;
				var splits = className.split(rspace);
				if (splits.length > 1) {
					UX.addClassNames(element, splits);
				}
			}
		}
	};

	var addClassAttribute = function(element, classString) {
		var setClass = element.getAttribute('class');
		if (!setClass) {
			element.setAttribute('class', classString);
			element.className = classString;
		} else {
			var className = " " + setClass + " ";
			var classNames = (classString || "").split(rspace);
			for (var c = 0, cl = classNames.length; c < cl; c++) {
				if (className.indexOf(" " + classNames[c] + " ") < 0) {
					setClass += " " + classNames[c];
				}
			}
			var newClassName = (setClass || "").replace(rtrim, "");
			element.setAttribute('class', newClassName);
			element.className = newClassName;
		}
	};

	UX.addClassName = function(element, classString) {
		if (!element) return;
		if (element.nodeType !== 1) return;
		if (!classString || typeof classString !== 'string') return;

		if (!UX.isXHTML && !element.className) {
			element.className = classString;
			return;
		}

		// Use the native classList object if available    
		if (element.classList && typeof(element.classList) == 'object') {
			addClassNameNative(element, classString);
			return;
		} else if (UX.isXHTML && element.namespaceURI != "http://www.w3.org/1999/xhtml") {
			addClassAttribute(element, classString);
		} else {
			// Fallback to a string-based addClassName (taken from jQuery's addClass() function)
			var className = " " + element.className + " ",
				setClass = element.className;
			if (className.indexOf(' ' + classString + ' ') != -1) return;
			var classNames = (classString || "").split(rspace);
			for (var c = 0, cl = classNames.length; c < cl; c++) {
				if (className.indexOf(" " + classNames[c] + " ") < 0) {
					setClass += " " + classNames[c];
				}
			}
			element.className = (setClass || "").replace(rtrim, "");
		}
	};
	UX.addClassNames = function(oElement, classNames) {
		if (!oElement || oElement.nodeType !== 1) return;
		if (classNames && typeof(classNames) == 'object' && classNames.length > 0) {
			if (!oElement.className) {
				oElement.className = classNames.join(' ');
				return;
			} else {
				if (typeof(oElement.classList) == 'object') {
					for (var i = 0, l = classNames.length; i < l; i++) {
						UX.addClassName(oElement, classNames[i]);
					}
					return;
				}
			}
		}
	};
	/**
	 
	 * Utility to remove a class attribute.
	 */

	UX.removeClassName = function(oElement, classString) {
		if (!oElement) return;
		if (oElement.nodeType !== 1) return;
		if (!oElement.className) return;
		if(!classString) return;
		if (typeof(oElement.classList) == 'object') {
			oElement.classList.remove(classString);
			return;
		}
		// Fallback to the string-based class removal if the native classList object isn't available
		oElement.className = oElement.className.replace(
		new RegExp("(^|\\s+)" + classString + "(\\s+|$)"), ' ');
	};

	UX.hasClassName = function(element, className) {
		if (!element || element.nodeType !== 1 || !element.className) return false;
		if (typeof element.classList === 'object') {
			// The Element.prototype.classList methods can throw exceptions for a number of reasons,
			// so if it fails we fallback to the non-native (string-based) classname implementation
			try {
				return element.classList.contains(className);
			} catch(e) {}
		}
		var elementClassName = ' ' + element.className + ' ';
		return (elementClassName.indexOf(' ' + className + ' ') != -1);
	};

	/**
	 * Utility to replace a className attribute.
	 */
	UX.replaceClassName = function(element, oldClassString, newClassString) {
		UX.removeClassName(element, oldClassString);
		UX.addClassName(element, newClassString);
	};
	
})();

/**
 Utility to add a className property for Firefox (XML), this alone doesn't affect how classNames are interpreted.
 */
if (typeof Element != "undefined" && !Element.prototype.className) {
	Element.prototype.className = "";
}

/**
 Utility to add a style to elements.
 With the XML Parser in Firefox, the style property is not supported, instead styles are set with the stylesheet
 objects. This utility centralizes setting the style on an Element to one location.
 */
UX.addStyle = function(oElement, styleName, value) {
	var stylesheet, selector;
	if (oElement.style) {
		oElement.style[styleName] = value;
	} else if (UX.isXHTML) {
		// At this point, you are not IE or Firefox with HTML parsing
		// There is not a .style property for the XML Parser on Firefox
		// Instead, the style will have to be added using the CSS DOM model
		// get the computed style and see if it is already set to the value
		if (document.defaultView.getComputedStyle(oElement, null)[styleName] !== value) {
			stylesheet = oElement.ownerDocument.styleSheets[0];
			// make sure prefix has namespace declared in stylesheet, use identifier based selector where available
			try {
				stylesheet.insertRule("@namespace " + oElement.prefix + " url(http://www.w3.org/2002/xforms);", 0);
				selector = UX.id(oElement) ? ('[id="' + UX.id(oElement) + '"]') : "";
				stylesheet.insertRule(oElement.prefix + "|" + oElement.localName + selector + " {" + styleName + ":" + value + ";}", (stylesheet.cssRules.length === 0) ? 1 : stylesheet.cssRules.length);
			} catch(e) {
				document.logger.log("INFO: Couldn't set style " + styleName + " to " + value);
			}
		}
	}
};
/**
 Utility to get a style for an element.
 With the XML Parser in Firefox, the style property is not supported, instead styles are set with the stylesheet
 objects. This utility centralizes getting the style on an Element to one location.
 */
UX.getStyle = function(oElement, styleName) {
	var style = null;
	var match = null;
	var result = null;
	if (oElement.style) {
		return oElement.style[styleName];
	} else if (UX.isXHTML) {
		// At this point, you are not IE or Firefox with HTML parsing
		// There is not a .style property for the XML Parser on Firefox
		// Instead, the computed style can be returned
		// get the computed style and see if it is already set to the value
		// *** Exception, although ANY STYLE ATTRIBUTE will be ignored by the
		// browser in XHTML mode, there may be reasons to use the style attribute.
		//
		style = oElement.getAttribute("style");
		if (style) {
			match = new RegExp("(?:(?:^|;)\\s*" + styleName + "\\s*:\\s*)(\\w+)(?:\\s*;|$)");
			result = match.exec(style);
			if (result && result[1]) {
				return result[1];
			}
		}
		return document.defaultView.getComputedStyle(oElement, null)[styleName];
	}
};
/**
 Utility to get a property for an element.
 If an element has a special property attribute, that value will be used.	If an element has a child element
 with that tagname, then that value will be used.	The child element value has precedence over the attribute
 value.	If that child element has a value attribute on it, then that value will be used.	That attribute value
 has precedence over the child element's inline text.
 */
UX.getPropertyValue = function(self, type) {
	var aChildNode = NamespaceManager.getElementsByTagNameNS(self.element, "http://www.w3.org/2002/xforms", type)[0];
	return (aChildNode) ? UX.getElementValueOrContent(Context.prototype.getEvaluationContext.apply(self), aChildNode) : self.element.getAttribute(type);
};
/**
 *	Utility method to create a event and dispatch it on the target
 */
UX.dispatchEvent = function(oTarget, sEventName, bBubble, bCancel, bSpawn) {
	var oEvent = document.createEvent("Events");
	oEvent.initEvent(sEventName, bBubble, bCancel);

	if (bSpawn) {
		spawn(function() {
			FormsProcessor.dispatchEvent(oTarget, oEvent);
		});
	} else {
		FormsProcessor.dispatchEvent(oTarget, oEvent);
	}
};

/**
 * Utility method to create an element in a namespace
 */

UX.createElementNS = function(oNode, sNamespaceURI, sQualifiedName) {
	var oElement = null;
	var sPrefix = null;
	var oDocument = oNode ? oNode.ownerDocument : document;
	var oPrefixes = null;

	if (UX.isXHTML) {
		oElement = oDocument.createElementNS(sNamespaceURI, sQualifiedName);
	} else {
		oPrefixes = NamespaceManager.getOutputPrefixesFromURI(sNamespaceURI);

		if (oPrefixes && oPrefixes.length > 0) {
			sPrefix = oPrefixes[0];
		} else if (sNamespaceURI === "http://www.w3.org/2002/xforms") {
			// If xforms's namespace is not defined in document header
			// assume prefix to be xf (This is needed for the html forms-a)
			sPrefix = "xf";
		}
		oElement = oDocument.createElement(sPrefix + ":" + sQualifiedName);
	}
	return oElement;
};

UX.focusFirstEligibleChild = function(childNodes) {
	for (var i = 0, l = childNodes.length; i < l; i++) {
		if (this.focusTree(childNodes.item(i))) {
			return true;
		}
	}
	return false;
};

UX.focusTree = function(node) {
	var behaviour = DECORATOR.getBehaviour(node);
	if (behaviour && behaviour.giveFocus) {
		return behaviour.giveFocus();
	}
	return this.focusFirstEligibleChild(node.childNodes);
};

// Reference to the global object.
UX.global = this;

UX.isArrayLike = function(o) {
	return (typeof(o.push) === 'function' && typeof(o.shift) === 'function' && typeof(o.length) === 'number');
};

UX.type = function(o) {
	return (o && UX.isArrayLike(o)) ? 'array' : typeof(o);
};

/*
	Extended DOM Navigation.
*/
(function() {

	var forwards = function(o) {
		return o.nextSibling;
	},

	backwards = function(o) {
		return o.previousSibling;
	},

	getEndNodeByName = function(searchWithin, name, namespace, direction) {
		var newCandidateNode = null,
			candidateNode;

		if (direction === forwards) {
			candidateNode = searchWithin.firstChild;
		} else {
			candidateNode = searchWithin.lastChild;
		}

		while (candidateNode && !NamespaceManager.compareFullName(candidateNode, name, namespace)) {
			if (candidateNode.hasChildNodes()) {
				newCandidateNode = getEndNodeByName(candidateNode, name, namespace, direction);
				if (newCandidateNode) {
					candidateNode = newCandidateNode;
					break;
				}
			}

			candidateNode = direction(candidateNode);
		}
		return candidateNode;
	},

	getNearestAncestralSibling = function(referenceNode, directionFunction, commonAncestor) {
		var candidateAncestralSibling = null,
			candidateAncestor = referenceNode.parentNode;
		while (!candidateAncestralSibling && candidateAncestor && candidateAncestor !== commonAncestor) {
			candidateAncestralSibling = directionFunction(candidateAncestor);
			candidateAncestor = candidateAncestor.parentNode;
		}
		return candidateAncestralSibling;
	},

	getNearestNodeByName = function(referenceNode, name, namespace, searchWithin, directionFunction) {
		var newCandidateNode = null,
			candidateNode = directionFunction(referenceNode);

		//No siblings, the next node might be an aunt or cousin.
		if (!candidateNode) {
			candidateNode = getNearestAncestralSibling(referenceNode, directionFunction, searchWithin);
		}

		while (candidateNode && !NamespaceManager.compareFullName(candidateNode, name, namespace)) {
			if (candidateNode.hasChildNodes) {
				newCandidateNode = getEndNodeByName(candidateNode, name, namespace, directionFunction);

				if (newCandidateNode) {
					candidateNode = newCandidateNode;
					break;
				}
			}
			newCandidateNode = directionFunction(candidateNode);
			if (newCandidateNode) {
				candidateNode = newCandidateNode;
			} else {
				candidateNode = getNearestAncestralSibling(candidateNode, directionFunction, searchWithin);
			}
		}
		return candidateNode;
	};

	UX.getNextNodeByName = function(referenceNode, name, namespace, constrainingAncestor) {
		return getNearestNodeByName(referenceNode, name, namespace, constrainingAncestor, forwards);
	};

	UX.getPreviousNodeByName = function(referenceNode, name, namespace, constrainingAncestor) {
		return getNearestNodeByName(referenceNode, name, namespace, constrainingAncestor, backwards);
	};

	UX.getFirstNodeByName = function(searchWithin, name, namespace) {
		return getEndNodeByName(searchWithin, name, namespace, forwards);
	};
} ());

UX.isNodeReadonly = function(oNode) {
	var proxy = UX.getProxyNode(oNode, true);
	return (proxy && proxy.readonly && proxy.readonly.getValue());
};

//an imperfect implementation of an isEquivalentNode function, which would check namespaces and node types
//	(a text node containing "<x />" is equivalent to an empty "x" element, according to this function).
//	If it is required to do anything more, it will need to be improved.
UX.isEquivalentNode = function(lhs, rhs) {
	return xmlText(lhs) === xmlText(rhs);
};

UX.isArray = function(v) {
	return (v && typeof v === "object" && typeof v.length === "number" && typeof v.splice === "function" && !v.propertyIsEnumerable("length"));
};

/**
 *	Utility method to construct an object that inherits (prototypically) from a given object.
 */
UX.beget = function(o) {
	function Constructor() {}
	Constructor.prototype = o;
	return new Constructor();
};

/**
 *	Utility method to retrieve the @id of a given element.
 */
UX.id = function(oElement) {
	return (UX.isXHTML ? (oElement && typeof oElement.getAttribute === 'function' ? oElement.getAttribute("id") : undefined) : (oElement ? oElement.id : undefined));
};

// Method to set a variable to true, false or undefined, based on an xsd:boolean input.
//
// The default value is optional.
//
UX.JsBooleanFromXsdBoolean = function(fromValue, defaultValue) {
	var toValue = {
		"true": true,
		"1": true,
		"false": false,
		"0": false
	} [fromValue];

	return (toValue !== undefined) ? toValue : ((defaultValue !== undefined) ? UX.JsBooleanFromXsdBoolean(defaultValue) : undefined);
};

UX.cancelHTMLEvent = function(evt) {
	evt.cancelBubble = true;
	evt.returnValue = false;

	if (typeof evt.preventDefault === 'function') {
		evt.preventDefault();
	}

	if (typeof evt.stopPropagation === 'function') {
		evt.stopPropagation();
	}

	return false;
};

UX.isHTMLTabKeyEvent = function(keyEvent) {
	return UX.isTabKeyCode(UX.getHTMLKeyEventCode(keyEvent));
};

UX.isShiftKeyPressed = function(keyEvent) {
	return keyEvent.shiftKey || keyEvent.shiftLeft;
};

UX.isControlKeyPressed = function(keyEvent) {
	return keyEvent.ctrlKey || keyEvent.ctrlLeft;
};

UX.isAltKeyPressed = function(keyEvent) {
	return keyEvent.altKey || keyEvent.altLeft;
};

UX.isMetaKeyPressed = function(keyEvent) {
	return keyEvent.metaKey;
};

UX.getHTMLEvent = function(eventArgument) {
	return eventArgument || window.event;
};

UX.getHTMLKeyEventCode = function(keyEvent) {
	return keyEvent.keyCode || keyEvent.which || keyEvent.charCode;
};

UX.isTabKeyCode = function(keyCode) {
	return UX.getTabKeyCode() === keyCode;
};

UX.getTabKeyCode = function() {
	return 9;
};

UX.Class = function(params) {

	var klass = function() {
		var value = this.initialize ? this.initialize.apply(this, arguments) : this;
		return value;
	};

	var add = {
		"initialize": 1,
		"onDocumentReady": 1,
		"onContentReady": 1
	};

	function extend(p, v) {
		if (add.hasOwnProperty(p)) {
			if (!klass.prototype[p]) {
				klass.prototype[p] = function() {
					var stack = arguments.callee.stack;
					for (var j = 0, m = stack.length; j < m; j++) {
						stack[j].apply(this, arguments);
					}
				};
				klass.prototype[p].stack = [];
			}
			if(!v.stack) {
				klass.prototype[p].stack.push(v);
			} else {
				for(var i = 0, l = v.stack.length; i < l; i++) {
					klass.prototype[p].stack.push(v.stack[i]);
				}
			}
		} else {
			klass.prototype[p] = v;
		}
	};

	var i, l, p;

	if (params.Mixins) {
		for (i = 0, l = params.Mixins.length; i < l; i++) {
			for (p in params.Mixins[i].prototype) {
				extend(p, params.Mixins[i].prototype[p]);
			}
		}
	}

	for (p in params) {
		extend(p, params[p]);
	}

	return klass;

};


UX.extend = function(src, dst) {
	for(var p in dst) {
		src[p] = dst[p];
	}
	return src;
};


UX.cloneDocument = function(doc, deep) {
	if(deep == undefined) deep = true;
	if(UX.isIE || UX.isFF) {
		return doc.cloneNode(deep);
	} else {
		var cloneDoc = document.DOMImplementation.createDocument('', '', null);
		if(deep) {
			cloneDoc.appendChild(doc.importNode(doc.documentElement, true));
		}
		return cloneDoc;
	}
};

UX.cloneNode = function(node, deep) {
	if(deep == undefined) deep = true;
	if(node.nodeType == 9) {
		return UX.cloneDocument(node, deep);
	} else {
		return node.cloneNode(deep);
	}
};

(function() {
	
	var UID = 0;

	UX.getNodeUID = function(node) {//returns xml node uid
		var uid;
		if(!UX.isIE) {
			uid = node.ux_uid;
			if(uid) return uid;
			node.ux_uid = ++UID;
			return UID;
		}
		//for ie we can't add ux_uid property directly to node, 
		//so we store uid in ux_uid attribute for elements
		// in ux_uid-doc attribute of documentElement for doc 
		// and in ux_uid-attrName of ownerElement for attribute nodes
		if(node.nodeType == 1) {//element
			uid = node.getAttribute('ux_uid');
			if(uid) return uid;
			node.setAttribute('ux_uid', ++UID);
			return UID;
		} else if(node.nodeType == 2) {//attr
			var ownerElement = !UX.isIE ? node.ownerElement : node.selectSingleNode('..');
			uid = ownerElement.getAttribute('ux_uid-' + node.nodeName);
			if(uid) return uid;
			ownerElement.setAttribute('ux_uid-' + node.nodeName, ++UID);
			return UID;
		} else if(node.nodeType == 9) {//doc
			uid = node.documentElement.getAttribute('ux_uid-doc');
			if(uid) return uid;
			node.documentElement.setAttribute('ux_uid-doc', ++UID);
			return UID;
		} else if(node.nodeType == 3) {//text node
			var parent = node.parentNode;
			var index = 0;
			var previous = node.previousSibling;
			while(previous) {
				++index;
				previous = previous.previousSibling;
			}
			uid = parent.getAttribute('ux_uid_' + index);
			if(uid) return uid;
			parent.setAttribute('ux_uid_' + index, ++UID);
			return UID;
		}
	};
	
})();

UX.getElementsById = function(node, id, founded) {
	founded = founded || [];
	
	var nodeId;

	var children = node.childNodes;	
	for(var i = 0, l = children.length; i < l; i++) {
		var child = children[i];
		if(child.nodeType != 1) continue;//if not element continue
		nodeId = child.getAttribute('id');
		if (!nodeId) {
			nodeId = child.getAttribute('xml:id');
			if (!nodeId && child.getAttribute('xsi:type') === 'xsd:ID') {
				nodeId = child.firstChild.nodeValue.trim();
			}
		}
		if (nodeId === id) {
			founded.push(child);
		}
		if(child.hasChildNodes()) arguments.callee(child, id, founded);
	}
	return founded;
};
