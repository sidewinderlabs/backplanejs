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
 Manages the potential disparity between namespaces referred to in a library, and their occurrence in a real
 world application.
 see: http://ubiquity-xforms.googlecode.com/svn/branches/0.3/_testsuite/units/NamespaceManager.html
 */

var NamespaceManager = {
	
	selectionNamespaces: {},
	
	outputNamespaces: {},
	
	outputNamespaceURIs: {},
	
	/**
	 returns the lists of namespaces to an uninitialised state.
	 */
	clean: function() {
		this.selectionNamespaces = {};
		this.outputNamespaces = {};
	},
	
	/**
	 Translates a given namespace-aware CSS selector, into an "escaped colon" style selector.
	 @param {String} a namespace-aware CSS selector - e.g. x|banana
	 @returns String the selector parameter, translated into an "escaped colon" style selector
	 */
	translateCSSSelector: function(selector) {
		//match ( token + |  ) anotherToken.
		var matchNamespacePrefix = (/(\w+)\|\w+/);
		var result = matchNamespacePrefix.exec(selector);
		while (result) {
			var l = result.length;
			if (l > 1) {
				selector = this._translateCSSSelectorForPrefix(selector, result[1]);
			}
			result = matchNamespacePrefix.exec(selector);
		}
		return selector;
	},
	
	/**
	 Removes all instances of namespace-aware CSS selectors for the given prefix from a selector,
	 replacing them with appropriate CSS1 selectors, based on the current output context.
	 @param {String} selector, the selector to translate
	 @param {String} The prefix to eradicate
	 @returns {String} selector, with prefix eradicated.
	 */
	_translateCSSSelectorForPrefix: function(selector, prefix) {
		//lookup the URI based on the prefix 
		var selectionURI = this.selectionNamespaces[prefix];
		if (selectionURI === undefined) {
			throw "Unknown Prefix: '" + prefix + "' in CSS selector '" + selector + "'";
		} else {
			var sMatchThisPrefix = prefix + "\\|";
			var matchGivenPrefix = new RegExp(sMatchThisPrefix, "g");
			var outputprefixes = this.outputNamespaces[selectionURI];

			if (!outputprefixes || !outputprefixes.length) {
				throw ("No output prefixes found for selection namespace prefix '" + prefix + "'");
			} else {
				var alternativesForThisURI = [];
				for (var i = 0, l = outputprefixes.length; i < l; i++) {
					alternativesForThisURI.push(selector.replace(matchGivenPrefix, outputprefixes[i] + "\\:"));
				}
			}
		}
		return alternativesForThisURI.join(", ");
	},
	
	/**
	 Retrieves the list of output prefixes that represent the given namespace.
	 @param {String} uri  The URI to look up.
	 @returns {Array} An array of prefixes that represent the given URI in the current output context.
	 */
	getOutputPrefixesFromURI: function(uri) {
		return this.outputNamespaces[uri];
	},
	
	/**
	 Retrieve an attribute reside in an specific namespace.
	 @param node {Node} The node to retrieve attribute from
	 @param nsURI {String} The namespace URI in which the attribute reside
	 @param attributeName {String} the name of attribute 
	 @returns 
	 */

	getAttributeNS: function(node, nsURI, attributeName) {
		if (UX.isXHTML) return node.getAttributeNS(nsURI, attributeName);
		var prefixes = this.getOutputPrefixesFromURI(nsURI);
		if(!prefixes) return null;
		return node.getAttribute(prefixes[0] + ":" + attributeName);
	},
	
	/**
	 Binds a namespace prefix to a URI for selection purposes.
	 @param {String} prefix The prefix used to select the given URI
	 @param {String} uri  The URI to which the prefix is to be bound
	 @returns true, if the prefix is successfully bound to the URI, or false, if it is already bound to the same URI. 
	 @throws String if the prefix is already bound to a different URI
	 */
	addSelectionNamespace: function(prefix, uri) {
		var retVal;
		if (this.selectionNamespaces[prefix]) {
			if (this.selectionNamespaces[prefix] != uri) {
				throw "selection namespace prefix '" + prefix + "' being added to URI '" + uri + "' is already bound to URI '" + this.selectionNamespaces[prefix] + "'";
			}
			return false;
		}
		this.selectionNamespaces[prefix] = uri;
		return true;
	},
	
	/**
	 Binds a namespace URI to a prefix  for output purposes.
	 @param {String} prefix The prefix to be output for the given URI
	 @param {String} uri  The URI for prefix
	 */
	addOutputNamespace: function(prefix, uri) {
		if (!this.outputNamespaces[uri]) {
			this.outputNamespaces[uri] = [];
		}
		this.outputNamespaces[uri].push(prefix);
		this.outputNamespaceURIs[prefix] = uri;
		return true;
	},
	
	/**
	 Some parsers believe that ":" is just a character in a simple node name, rather than a separator between the local name, 
	 and a prefix corresponding to a node's namespace.  Using this function to get the local name will return the proper local name. 
	 */
	getLowerCaseLocalName: function(node) {
		var name = node.nodeName;
		return name.slice(name.indexOf(":") + 1, name.length).toLowerCase();
	},
	
	/**
	 Compares a node's name against a localname and namespaceURI
	 @param node {Node} The node whose name is in question
	 @param localName {String} A non-namespace-qualified local name, to match against the name of node
	 @param nsURI {String} The namespace URI in which node must reside, in order to match.
	 @returns true iff the local name and namespace uri of node, match those parameters given, false otehrwise.
	 */

	compareFullName: function(node, localName, nsURI) {
		var fullName = node.nodeName.toLowerCase();
		var segments = fullName.split(":");
		var nodeLocalName = segments.length == 1 ? segments[0] : segments[1];
		if(nodeLocalName != localName) return false;
		var nodePrefix = segments.length == 1 ? node.scopeName : segments[0];
		if ( ((!nodePrefix || nodePrefix == "HTML") && !nsURI) || (this.outputNamespaceURIs[nodePrefix] == nsURI) ) {
			return true;
		}
	},
	
	getNamespaceURI: function(node) {
		if(UX.isXHTML) return node.namespaceURI;
		var segments = node.nodeName.toLowerCase().split(":");
		return this.outputNamespaceURIs[segments.length === 1 ? node.scopeName : segments[0]];
	},
	
	/**
	 populates the list of output namespaces if the document has a namespaces property
	 */
	readOutputNamespacesFromDocument: function(doc) {
		if(document.namespaces) {
			doc = doc || document;
			var nsList = doc.namespaces;
			for (var i = 0, l = nsList.length; i < l; i++) {
				this.addOutputNamespace(nsList[i].name, nsList[i].urn);
			}
		} else {
			this.readOutputNamespacesFromInstance(doc);
		}
	},
	
	readOutputNamespacesFromInstance: function(doc) {
		doc = doc || document;
		var attrMap = doc.documentElement.attributes;
		for (var i = 0, l = attrMap.length; i < l; i++) {
			var thisAttr = attrMap[i];
			//see if this is an xml namespace declaration.
			if (thisAttr.nodeName.indexOf('xmlns:') === 0) {
				var prefix = thisAttr.nodeName.slice(6).toLowerCase();
				this.addOutputNamespace(prefix, thisAttr.nodeValue);
			}
		}
	},
	/**
	 Searches searchNode for descendents
	 that have a tagName that matches elementName, and
	 that are in the namespace namespaceURI
	 @param searchNode {Node} topmost node (document or element) to look in to find the desired nodes.
	 @param namespaceURI {String} namespace URI to match
	 @param elementName {String}  element name to match
	 @returns an array of nodes that match the given criteria
	 */
	getElementsByTagNameNS: UX.isXHTML ? function(searchNode, namespaceURI, elementName) {
		return searchNode.getElementsByTagNameNS(namespaceURI, elementName);
	} : (document.namespaces ? 	function(searchNode, namespaceURI, elementName) {
		var retVal = [];
		//A namespace aware document understands that the bit to the left of the colon is not part of the name.
		var tags = searchNode.getElementsByTagName(elementName);
		for (var i = 0, l = tags.length; i < l; ++i) {
			if (tags[i].scopeName !== "HTML") {
				//lookup the prefix.
				if ("" != tags[i].tagUrn == namespaceURI) {
					retVal.push(tags[i]);
				} else if (this.outputNamespaceURIs[tags[i].scopeName] == namespaceURI) {
					retVal.push(tags[i]);
				}
			} else if (namespaceURI == "") {
				retVal.push(tags[i]);
			}
		}
		return retVal;
	} : function(searchNode, namespaceURI, elementName) {
		var retVal = [];
		var i, j, l, m;
		if (namespaceURI === "") {
			//normalise the collection object returned by most processors, to an array.
			var elementsWithNoPrefix = searchNode.getElementsByTagName(elementName);
			for (i = 0, l = elementsWithNoPrefix.length; i < l; i++) {
				retVal.push(elementsWithNoPrefix[i]);
			}
		} else {
			//make up namespacePrefix + elementName combinations to search with.
			var prefixes = this.outputNamespaces[namespaceURI];
			if (prefixes) {
				for (i = 0, l = prefixes.length; i < l; i++) {
					var elementsWithThisPrefix = searchNode.getElementsByTagName(prefixes[i] + ":" + elementName);
					for (j = 0, m = elementsWithThisPrefix.length; j < m; j++) {
						retVal.push(elementsWithThisPrefix[j]);
					}
				}
			}
		}
		return retVal;
	}),
	
	getNamespaceURIForPrefix: function(prefix) {
		return (prefix) ? this.outputNamespaceURIs[prefix] : "";
	}
	
};
