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
            var oRes = xpathDomEval( '//*[@id="'+sID+'"]' , document.documentElement);
            oElement  = (oRes && oRes.nodeSetValue() && oRes.nodeSetValue()[0]) ? oRes.nodeSetValue()[0] : null;          
        }
        return oElement;	   
    };
}
(
  function(){
/**
	Inserts an element into the DOM at a given location.  This is an addon applied to Elements
		in the target environment.  Nodes must be of compatible types in the target DOM, i.e.
		this will not be able to insert an XML Element into an HTML tree unless the underlying
		DOMs allow it.  To mix incompatible DOMs, serialise the inserted node, and use insertAdjacentHTML
	@param {String} where One of beforeBegin, afterBegin, beforeEnd, or afterEnd
	@param {Node} parsedNode a node to insert into this element
	@addon
*/
	function insertAdjacentElement(where,parsedNode)
	{
		switch (where)
		{
			case 'beforeBegin':
				this.parentNode.insertBefore(parsedNode,this);
				break;
			case 'afterBegin':
				this.insertBefore(parsedNode,this.firstChild);
				break;
			case 'beforeEnd':
				this.appendChild(parsedNode);
				break;
			case 'afterEnd':
				if (this.nextSibling) 
				{
					this.parentNode.insertBefore(parsedNode,this.nextSibling);
				}
				else
				{
					this.parentNode.appendChild(parsedNode);
				}
				break;
		}
	}

/**
	Inserts some markup into the DOM at a given location.  This is an addon applied to Elements
		in the target environment. 
	@param {String} where One of beforeBegin, afterBegin, beforeEnd, or afterEnd
	@param {String} htmlStr markup to insert into this element
	@addon
*/
	function insertAdjacentHTML(where,htmlStr)
	{
		var r = this.ownerDocument.createRange();
		r.setStartBefore(this);
		var parsedHTML = r.createContextualFragment(htmlStr);
		this.insertAdjacentElement(where,parsedHTML);
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
	function insertAdjacentText(where,txtStr)
	{
		var parsedText = document.createTextNode(txtStr);
		this.insertAdjacentElement(where,parsedText);
	}
	
 /**
    Checks whether o is a descendent of the current element
    @param {Node} o The candidate descendent node to investigate
    @returns true if o is within "this", otherwise false.
  */
    function contains(o) {
      
      var parent = o;
      var retval = false;
      while(parent) {
        if(parent === this) {
          retval = true;
          break;
        }
        else {
          parent = parent.parentNode;
        }
      }
      return retval;
    }
    
  //Add the functions to the HTMLElement prototype, if absent
  if(typeof HTMLElement!="undefined") {
    HTMLElement.prototype.insertAdjacentElement = HTMLElement.prototype.insertAdjacentElement || insertAdjacentElement;
    HTMLElement.prototype.insertAdjacentText = HTMLElement.prototype.insertAdjacentText || insertAdjacentText;
    HTMLElement.prototype.insertAdjacentHTML = HTMLElement.prototype.insertAdjacentHTML || insertAdjacentHTML;
    HTMLElement.prototype.contains = HTMLElement.prototype.contains || contains;
  }
  
  
  //Add the functions to the Element prototype, if absent
  if(typeof Element!="undefined" && !Element.prototype.insertAdjacentElement)
  {
    Element.prototype.insertAdjacentElement = Element.prototype.insertAdjacentElement || insertAdjacentElement;
    Element.prototype.insertAdjacentText = Element.prototype.insertAdjacentText || insertAdjacentText;
    Element.prototype.insertAdjacentHTML = Element.prototype.insertAdjacentHTML || insertAdjacentHTML;
    Element.prototype.contains = Element.prototype.contains || contains;
  } 
 }
)();
/**
	Utility to append to the class attribute. 
	With the XML Parser in Firefox, the className property is not supported, instead the class attribute is used.
	This utility centralizes the Yahoo addClass to one location to accumulate the classes,
	which is what happens in IE and Firefox (HTML), and for Firefox( XML) the class is added as
	an attribute to the element.
*/
    UX.addClassName = function(oElement, classString) {	   
		YAHOO.util.Dom.addClass(oElement, classString);    
	};

/**
	Utility to remove a class attribute. 
	With the XML Parser in Firefox, the className property is not supported, instead the class attribute is used.
	This utility centralizes the Yahoo removeClass to one location to removes a class,
	which is what happens in IE and Firefox (HTML), and for Firefox( XML) the class is removed from the class
	attribute of the element.
*/
   UX.removeClassName = function (oElement, classString) {
        YAHOO.util.Dom.removeClass(oElement, classString);
	};

/**
	Utility to replace a className attribute. 
	With the XML Parser in Firefox, the className property is not supported, instead the class attribute is used.
	This utility centralizes the Yahoo replaceClass to one location to removes a class,
	which is what happens in IE and Firefox (HTML), and for Firefox( XML) the class is removed from the class
	attribute of the element.
*/
   UX.replaceClassName = function (oElement, oldClassString, newClassString) {
        YAHOO.util.Dom.replaceClass(oElement, oldClassString, newClassString);
	};


/**
	Utility to add a className property for Firefox (XML), this alone doesn't affect how classNames are interpreted.  
  */ 
if (typeof Element!="undefined" && !Element.prototype.className) {   
      Element.prototype.className = "";         
}

/**
	Utility to add a style to elements.   
	With the XML Parser in Firefox, the style property is not supported, instead styles are set with the stylesheet
	objects. This utility centralizes setting the style on an Element to one location.
*/
    UX.addStyle = function(oElement, styleName, value) {
       var stylesheet, selector;
       if (oElement.style)	{
	      oElement.style[styleName] = value;
	   } else {
	      // At this point, you are not IE or Firefox with HTML parsing
	      // There is not a .style property for the XML Parser on Firefox
	      // Instead, the style will have to be added using the CSS DOM model
	      if (UX.isXHTML) {
	         // get the computed style and see if it is already set to the value
	         if (document.defaultView.getComputedStyle(oElement, null)[styleName] !== value) {
  	  	  	    stylesheet = oElement.ownerDocument.styleSheets[0];
	  		    // make sure prefix has namespace declared in stylesheet, use identifier based selector where available
				 try {
	  				 stylesheet.insertRule("@namespace " + oElement.prefix + " url(http://www.w3.org/2002/xforms);", 0);
	  				 selector = UX.id(oElement) ? ('[id="' + UX.id(oElement) + '"]') : "";
	  				 stylesheet.insertRule(oElement.prefix + "|" + oElement.localName + selector + " {" + styleName + ":" + value + ";}", (stylesheet.cssRules.length === 0)? 1:stylesheet.cssRules.length);
				 } catch (e) {
					 document.logger.log("INFO: Couldn't set style " + styleName + " to " + value);
				 }
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
                match =  new RegExp("(?:(?:^|;)\\s*" + styleName + "\\s*:\\s*)(\\w+)(?:\\s*;|$)");
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
    If an element has a special property attribute, that value will be used.  If an element has a child element
    with that tagname, then that value will be used.  The child element value has precedence over the attribute
    value.  If that child element has a value attribute on it, then that value will be used.  That attribute value
    has precedence over the child element's inline text.
*/
    UX.getPropertyValue = function(pThis, type) {
        var aChildNode = NamespaceManager.getElementsByTagNameNS(pThis.element,"http://www.w3.org/2002/xforms",type)[0];
       
        return (aChildNode) ? getElementValueOrContent(_getEvaluationContext(pThis), aChildNode) : pThis.element.getAttribute(type);
	};
/**
 *  Utility method to create a event and dispatch it on the target
 */
    UX.dispatchEvent = function(oTarget, sEventName, bBubble, bCancel, bSpawn) {
       var oEvent = document.createEvent("Events");
       oEvent.initEvent(sEventName, bBubble, bCancel);   
        
       if (bSpawn) {
          spawn( function() { FormsProcessor.dispatchEvent(oTarget, oEvent); } );
       } else {
          FormsProcessor.dispatchEvent(oTarget, oEvent);
       }
    };

    /**
     * Utility method to create an element in a namespace
     */    

    UX.createElementNS = function(oNode, sNamespaceURI , sQualifiedName) {
        var oElement = null;
        var sPrefix  = null;
        var oDocument = oNode  ? oNode.ownerDocument : document;
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

	UX.focusFirstEligibleChild = function (childNodes) {
		var i;

		for (i = 0; i < childNodes.length; ++i) {
			if (this.focusTree(childNodes.item(i))) {
				return true;
			}
		}

		return false;
	};

	UX.focusTree = function (node) {
		if (typeof node.giveFocus === "function") {
			return node.giveFocus();
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
(
  function(){
  
    var forwards = function(o){
      return o.nextSibling;
    },
  
    backwards = function(o){
      return o.previousSibling;
    },
      
    getEndNodeByName = function(searchWithin, name, namespace,direction) {
      var newCandidateNode = null,
      candidateNode;
      
      if(direction === forwards) {
        candidateNode = searchWithin.firstChild;
      } else {
        candidateNode = searchWithin.lastChild;
      }
      
      while(candidateNode && !NamespaceManager.compareFullName(candidateNode,name,namespace)) {
        if(candidateNode.hasChildNodes) {
          newCandidateNode = getEndNodeByName(candidateNode, name, namespace, direction);
          if(newCandidateNode) {
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
      while(!candidateAncestralSibling && candidateAncestor && candidateAncestor !== commonAncestor) {
        candidateAncestralSibling = directionFunction(candidateAncestor);
        candidateAncestor = candidateAncestor.parentNode;
      }
      return candidateAncestralSibling;
    },
  
    getNearestNodeByName = function(referenceNode, name, namespace, searchWithin, directionFunction) {
      var newCandidateNode = null,
      candidateNode = directionFunction(referenceNode);
      
      //No siblings, the next node might be an aunt or cousin.
      if(!candidateNode) {
        candidateNode = getNearestAncestralSibling(referenceNode,directionFunction,searchWithin);
      }
      
      while(candidateNode && !NamespaceManager.compareFullName(candidateNode,name,namespace)) {
        if(candidateNode.hasChildNodes) {
           newCandidateNode = getEndNodeByName(candidateNode,name,namespace,directionFunction);
          
          if(newCandidateNode) {
            candidateNode = newCandidateNode;
            break;
          }
        }
        newCandidateNode = directionFunction(candidateNode);
        if(newCandidateNode) {
          candidateNode = newCandidateNode;
        } else {
          candidateNode = getNearestAncestralSibling(candidateNode,directionFunction,searchWithin);
        }
      }
      return candidateNode;
    };
    
    UX.getNextNodeByName = function(referenceNode, name,namespace,constrainingAncestor) {
      return getNearestNodeByName(referenceNode, name,namespace,constrainingAncestor,forwards);
    };
    
    UX.getPreviousNodeByName = function(referenceNode, name,namespace, constrainingAncestor) {
      return getNearestNodeByName(referenceNode, name,namespace,constrainingAncestor,backwards);
    };
    
    UX.getFirstNodeByName = function(searchWithin, name,namespace) {
      return getEndNodeByName(searchWithin, name, namespace,forwards);
    };
  }()
);    

UX.isNodeReadonly = function(oNode) {
  return (oNode && oNode.m_proxy && oNode.m_proxy.readonly && oNode.m_proxy.readonly.getValue());
};

//an imperfect implementation of an isEquivalentNode function, which would check namespaces and node types 
//	(a text node containing "<x />" is equivalent to an empty "x" element, according to this function).
//	If it is required to do anything more, it will need to be improved.
UX.isEquivalentNode = function(lhs, rhs) {
	return xmlText(lhs) === xmlText(rhs);
};

UX.isArray = function (v) {
    return (v && typeof v === "object" &&
    	typeof v.length === "number" &&
    	typeof v.splice === "function" &&
    	!v.propertyIsEnumerable("length"));
};




/**
 *  Utility method to construct an object that inherits (prototypically) from a given object. 
 */
UX.beget = function(o) {
	function Constructor(){};
	Constructor.prototype = o;
	return new Constructor();
}

/**
 *  Utility method to retrieve the @id of a given element.
 */
UX.id = function(oElement) {
	return (UX.isXHTML
		? (oElement && typeof oElement.getAttribute === 'function' ? oElement.getAttribute("id") : undefined)
		: (oElement ? oElement.id : undefined));
}


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
	}[fromValue];

	return (toValue !== undefined)
		? toValue
		: (
			(defaultValue !== undefined)
				? UX.JsBooleanFromXsdBoolean(defaultValue)
				: undefined
		);
};

UX.cancelHTMLEvent = function (evt) {
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

UX.isHTMLTabKeyEvent = function (keyEvent) {
	return UX.isTabKeyCode(UX.getHTMLKeyEventCode(keyEvent));
};

UX.isShiftKeyPressed = function (keyEvent) {
	return keyEvent.shiftKey || keyEvent.shiftLeft;
};

UX.isControlKeyPressed = function (keyEvent) {
	return keyEvent.ctrlKey || keyEvent.ctrlLeft;
};

UX.isAltKeyPressed = function (keyEvent) {
	return keyEvent.altKey || keyEvent.altLeft;
};

UX.isMetaKeyPressed = function (keyEvent) {
	return keyEvent.metaKey;
};

UX.getHTMLEvent = function (eventArgument) {
	return eventArgument || window.event;
};

UX.getHTMLKeyEventCode = function (keyEvent) {
	return keyEvent.keyCode || keyEvent.which || keyEvent.charCode;
};

UX.isTabKeyCode = function (keyCode) {
	return UX.getTabKeyCode() === keyCode;
};

UX.getTabKeyCode = function () {
	return 9;
};
