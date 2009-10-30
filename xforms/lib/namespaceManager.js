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
 
var NamespaceManager  = function(){
	var m_selectionNamespaces = {};
	var m_outputNamespaces = {};
	var m_outputNamespaceURIs = {};
	/**
		returns the lists of namespaces to an uninitialised state.
	*/
	function clean() { 
		m_selectionNamespaces = {};
		m_outputNamespaces = {};
	}
	
	/**
		Binds a namespace prefix to a URI for selection purposes.
		@param {String} prefix The prefix used to select the given URI
		@param {String} uri  The URI to which the prefix is to be bound
		@returns true, if the prefix is successfully bound to the URI, or false, if it is already bound to the same URI. 
		@throws String if the prefix is already bound to a different URI
  	*/
	function addSelectionNamespace (prefix, uri) {
		var retVal;
		if(m_selectionNamespaces[prefix]) {
			retVal = false;
			if(m_selectionNamespaces[prefix] !== uri) {
				throw "selection namespace prefix '"+prefix +"' being added to URI '"+uri+"' is already bound to URI '"+ m_selectionNamespaces[prefix] + "'";
			}
		}
		else {
			m_selectionNamespaces[prefix] = uri;
			retVal = true;
		}
		return retVal;
	}

	/**
		Binds a namespace URI to a prefix  for output purposes.
		@param {String} prefix The prefix to be output for the given URI
		@param {String} uri  The URI for prefix
  	*/
	function addOutputNamespace(prefix,uri)	{
		if (m_outputNamespaces[uri] === undefined) {
			m_outputNamespaces[uri] = [];
		}
		m_outputNamespaces[uri].push(prefix);
		m_outputNamespaceURIs[prefix] = uri;
		return true;
	}

	/**
		populates the list of output namespaces if the document has a namespaces property
	*/
	function readOutputNamespacesFromNamespaceAwareDocument (oDocument) {  
	    oDocument = oDocument || document;
		var nsList = oDocument.namespaces;
		for(var i = 0; i < nsList.length; ++i) {
			this.addOutputNamespace(nsList[i].name, nsList[i].urn); 		
		}
	}
	
	/**
		populates the list of output namespaces by treating  xml namespace declarations on the documentElement
		as attributes
	*/
	function readOutputNamespacesFromDocumentElementAtrributeList(oDocument) {
    	oDocument = oDocument || document;
		var attrMap = oDocument.documentElement.attributes;
		var l = attrMap.length;
		for(var i = 0;i < l;++i) {
			var thisAttr = attrMap[i];
			//see if this is an xml namespace declaration.
			if(thisAttr.nodeName.indexOf('xmlns:') ===0) {
				var prefix = thisAttr.nodeName.slice(6).toLowerCase();
				this.addOutputNamespace(prefix,thisAttr.nodeValue);
			}
		}
	}

	/**
		Retrieves the list of output prefixes that represent the given namespace.
		@param {String} uri  The URI to look up.
		@returns {Array} An array of prefixes that represent the given URI in the current output context.
  	*/
	function getOutputPrefixesFromURI(uri) {
		return m_outputNamespaces[uri];
	}
	
	/**
		Removes all instances of namespace-aware CSS selectors for the given prefix from a selector,
			replacing them with appropriate CSS1 selectors, based on the current output context.
		@param {String} selector, the selector to translate
		@param {String} The prefix to eradicate
		@returns {String} selector, with prefix eradicated.
	*/
	function translateCSSSelectorForPrefix(selector,prefix) {
		//lookup the URI based on the prefix 
		var selectionURI = m_selectionNamespaces[prefix];
		if(selectionURI === undefined) {
			throw "Unknown Prefix: '" + prefix + "' in CSS selector '" + selector+ "'";
		}
		else {
			var sMatchThisPrefix =  prefix + "\\|";
			var matchGivenPrefix =  new RegExp(sMatchThisPrefix,"g");
			var outputprefixes = m_outputNamespaces[selectionURI];

			if(!outputprefixes || outputprefixes.length === 0) {
			  throw ("No output prefixes found for selection namespace prefix '" + prefix + "'");
			}
			else {
  			var alternativesForThisURI = [];
  			for(var i = 0;i < outputprefixes.length;++i) {
  				var css1NamespacePrefix = outputprefixes[i] + "\\:";
  				alternativesForThisURI.push(selector.replace(matchGivenPrefix, css1NamespacePrefix)); 
  			}
  		}
		}
		return alternativesForThisURI.join(", ");
	}
	
	/**
		Translates a given namespace-aware CSS selector, into an "escaped colon" style selector.
		@param {String} a namespace-aware CSS selector - e.g. x|banana
		@returns String the selector parameter, translated into an "escaped colon" style selector
	*/
	function translateCSSSelector (selector) {
		//match ( token + |  ) anotherToken.
		var newSelector = selector;
		var matchNamespacePrefix = /(\w+)\|\w+/;
		var result = matchNamespacePrefix.exec(newSelector);
		
		while(result)  {
			var l = result.length;
			if(l > 1) {
				newSelector = translateCSSSelectorForPrefix(newSelector, result[1]);
			}
			result = matchNamespacePrefix.exec(newSelector);
		}
		return newSelector;
	}
		/**
		Searches searchNode for descendents
		that have a tagName that matches elementName, and
		that are in the namespace namespaceURI
		@param searchNode {Node} topmost node (document or element) to look in to find the desired nodes.
		@param namespaceURI {String} namespace URI to match
		@param elementName {String}  element name to match
		@returns an array of nodes that match the given criteria
	*/	
	function getElementsByTagNameNS(searchNode,namespaceURI,elementName) {
		return searchNode.getElementsByTagNameNS(namespaceURI,elementName);		
	}
	
	
	/**
		Searches searchNode for descendents
		that have a tagName that matches elementName, and
		that are in the namespace namespaceURI
		@param searchNode {Node} topmost node (document or element) to look in to find the desired nodes.
		@param namespaceURI {String} namespace URI to match
		@param elementName {String}  element name to match
		@returns an array of nodes that match the given criteria
	*/	
	function getElementsByTagNameNS_Aware(searchNode,namespaceURI,elementName) {
		var retVal = [];
		//A namespace aware document understands that the bit to the left of the colon is not part of the name.
		var allTagNameMatches = searchNode.getElementsByTagName(elementName);
		var i;

		for ( i = 0 ;i < allTagNameMatches.length;++i) {
			if(allTagNameMatches[i].scopeName !== "HTML") {
				//lookup the prefix.
				if("" !== allTagNameMatches[i].tagUrn === namespaceURI) {
					retVal.push(allTagNameMatches[i]);
				}
				else if(m_outputNamespaceURIs[allTagNameMatches[i].scopeName] === namespaceURI) {
					retVal.push(allTagNameMatches[i]);
				}
			}
			else if(namespaceURI === "") {
				retVal.push(allTagNameMatches[i]);
			}
		}
		return retVal;
	}
	/**
		Searches searchNode for descendents
		that have a tagName that matches elementName, and
		that are in the namespace namespaceURI
		@param searchNode {Node} topmost node (document or element) to look in to find the desired nodes.
		@param namespaceURI {String} namespace URI to match
		@param elementName {String}  element name to match
		@returns an array of nodes that match the given criteria
	*/
	function getElementsByTagNameNS_Unaware(searchNode,namespaceURI,elementName) {
		var retVal = [];
		var i = 0;
		var j = 0;
		if (namespaceURI === "") {
			 	//normalise the collection object returned by most processors, to an array.
		 		var elementsWithNoPrefix = searchNode.getElementsByTagName(elementName);
		 		for(i = 0 ; i < elementsWithNoPrefix.length ; ++i)  {
					retVal.push(elementsWithNoPrefix[i]);
				}
		 }
		else {
			innerGetElementsByTagNameNS_Unaware_YUI(searchNode,namespaceURI, elementName,retVal);
		}
		return retVal;
	}

	//simple and fast, but does not respect document order.
	function innerGetElementsByTagNameNS_Unaware(searchNode, namespaceURI, elementName,elements) {
	 	//make up namespacePrefix + elementName combinations to search with.
		var i;
		var j;
	 	var prefixes = this.getOutputPrefixesFromURI(namespaceURI);
	 	if(prefixes) {
		 	for( i = 0; i < prefixes.length; ++i) {
		 		var elementsWithThisPrefix = searchNode.getElementsByTagName(prefixes[i] + ":" + elementName);
		 		for(j = 0 ; j < elementsWithThisPrefix.length ; ++j)  {
					elements.push(elementsWithThisPrefix[j]);
				}
		 	}
		 }
		return;
	}
	
	//slower, but does respect document order.
	function innerGetElementsByTagNameNS_Unaware_YUI(searchNode, namespaceURI, elementName,elements) {
		var  fnCheckNamespace = function (el)
		{
			var retVal = false;
			//tagname and nodename tend to be capitalised, annoyingly
			var sQName = el.tagName.toLowerCase();
			var ixColon = sQName.indexOf(':');
			var sTagName = sQName.slice(ixColon+1);
			if(sTagName === elementName) {
				var sPrefix = sQName.slice(0,ixColon);
				if(m_outputNamespaceURIs[sPrefix] === namespaceURI) {
					retVal = true;
					elements.push(el);
				}
			}
			return retVal;
			
		};
		YAHOO.util.Dom.getElementsBy(fnCheckNamespace,null, searchNode);
		return;
	}
  /**
    Some parsers believe that ":" is just a character in a simple node name, rather than a separator between the local name, 
    and a prefix corresponding to a node's namespace.  Using this function to get the local name will return the proper local name. 
  */
	function getLowerCaseLocalName(node) {
  	var sNodeName = node.nodeName;
  	return sNodeName.slice(sNodeName.indexOf(":")+1,sNodeName.length).toLowerCase();
	}

  /**
    Compares a node's name against a localname and namespaceURI
    @param node {Node} The node whose name is in question
    @param localName {String} A non-namespace-qualified local name, to match against the name of node
    @param nsURI {String} The namespace URI in which node must reside, in order to match.
    @returns true iff the local name and namespace uri of node, match those parameters given, false otehrwise.
   */
   
  function compareFullName(node, localName, nsURI) {
    var retval = false;
    var sNodeFullName = node.nodeName.toLowerCase();
    var arrSegments = sNodeFullName.split(":");
    var nodeLocalName = arrSegments.length === 1?arrSegments[0]:arrSegments[1];
    if(nodeLocalName === localName) {
      var nodePrefix = arrSegments.length === 1? node.scopeName :arrSegments[0];
      if((!nodePrefix || nodePrefix === "HTML")&& !nsURI) {
        //prefix is empty, null, or undefined, and so is nsURI
        retval = true;
      }
      else if(m_outputNamespaceURIs[nodePrefix] === nsURI) {
        //otherwise, look up prefix, and match to uri.
        retval = true;
      }
    }
    return retval;
  }

  /**
  Retrieve an attribute reside in an specific namespace.
  @param node {Node} The node to retrieve attribute from
  @param nsURI {String} The namespace URI in which the attribute reside
  @param attributeName {String} the name of attribute 
  @returns 
 */

  function getAttributeNS(node, nsURI, attributeName) {
      var retval = null;
      var prefixes = null;
      var prefix = null;
      
      if (UX.isXHTML) {
          retval = node.getAttributeNS(nsURI, attributeName);
      } else {
          prefixes = this.getOutputPrefixesFromURI(nsURI);
          if (prefixes) {
              prefix = prefixes[0];
              retval = node.getAttribute(prefix + ":" + attributeName);
          }          
      }
      return retval;
  }
  
  function getNamespaceURI(node) {
    var nsURI = node.namespaceURI,
        arrSegments,
        nodePrefix;
    // Look up URI the tedious way if not available or known to be buggy
    if (!nsURI || (UX.isWebKit && !UX.isXHTML)) {
        arrSegments = node.nodeName.toLowerCase().split(":");
        nodePrefix = arrSegments.length === 1? node.scopeName :arrSegments[0];
        if (nodePrefix) {
            nsURI = m_outputNamespaceURIs[nodePrefix];
        }
    }
    return nsURI;
  }

  function getNamespaceURIForPrefix(nodePrefix) {
      return (nodePrefix) ? m_outputNamespaceURIs[nodePrefix] : "";
  }

	var itself = function () {};
	itself.translateCSSSelector = translateCSSSelector;
	itself.getOutputPrefixesFromURI = getOutputPrefixesFromURI;
    itself.getAttributeNS = getAttributeNS;
	itself.addSelectionNamespace = addSelectionNamespace;
	itself.addOutputNamespace = addOutputNamespace;
    itself.getLowerCaseLocalName = getLowerCaseLocalName;
    itself.compareFullName = compareFullName;
    itself.getNamespaceURI = getNamespaceURI;
	itself.clean = clean;
	if(document.namespaces) {
		itself.readOutputNamespacesFromDocument = readOutputNamespacesFromNamespaceAwareDocument;
	}
	else {
		itself.readOutputNamespacesFromDocument = readOutputNamespacesFromDocumentElementAtrributeList;
	}
	itself.readOutputNamespacesFromInstance = readOutputNamespacesFromDocumentElementAtrributeList;
	if (UX.isXHTML){
	    itself.getElementsByTagNameNS = getElementsByTagNameNS;
	} else if(document.namespaces) {
		itself.getElementsByTagNameNS = getElementsByTagNameNS_Aware;
	} else {
		itself.getElementsByTagNameNS = getElementsByTagNameNS_Unaware;
	}
    itself.getNamespaceURIForPrefix = getNamespaceURIForPrefix;
	return itself;
}();
