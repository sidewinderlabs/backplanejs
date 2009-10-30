/*
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

/*
 *  XF4HProcessor
 */
XF4HProcessor = {    
    /**
     @description namespacceURI for XF4H
     @type String
     */
    nsURI : "http://www.w3.org/TR/xf4h",
    
    /**
    @description default prefix for XF4H
    @type String
    */
    defaultPrefix : "x4h:",
        
    /**
    Get the attribute value for an XF4H's attribute.
    Since XF4H can be part of a HTML document without any namespace declaration,
    We need to try to get the attribute with the "x4h:" prefix if failed to retrieve the
    attribute vale via getAttributeNS     
    @param {Object} Element to get attribute from   
    @param {String} Attribute name
    @returns String, Attribute Value 
    @throws 
    */    
    getAttribute : function(oElement, sAttributeName) { 
        // First try to get the name with XF4H namespaceURI
        var sAttrValue = 
            NamespaceManager.getAttributeNS(oElement, this.nsURI, sAttributeName);
        
        if (!sAttrValue) {
            // if no namespaceURI.. in HTML just use prefix x4h: + attributeName         
            sAttrValue = oElement.getAttribute(this.defaultPrefix + sAttributeName);
        }    
       
        return sAttrValue;
    },

    /**
    Process XF4H element, create reference node and node value in an instance
    and create bind for the control.
    @param {Object} Model node of the evaluation context
    @param {Object} Context node of the evaluation context
    @param {Object} Control's DOM Node 
    @param {String} Name attribute of the control
    @returns Object Reference node of the binded control   
    @throws
    */    
    processElement : function(oModel, oContextNode, oElement, sName) {
        var sValue, oValueNode, oParent;
        var oRefNode = null;
        
        var oEvalResult = oModel.EvaluateXPath(sName, 
             {
                 node: oContextNode,
                 model: oModel,
                 resolverElement: oElement
             }
        );
        if (oEvalResult) {
            oRefNode = getFirstNode(oEvalResult);
        }
        var oInstDoc = _getDefaultInstanceDocument(oModel);        

        if (!oRefNode && oInstDoc) {
            oRefNode = oInstDoc.createElement(sName);
            sValue = this.getAttribute(oElement, "value");
                
            if (sValue && sValue.length !== 0) {
                oValueNode = oInstDoc.createTextNode(sValue);
                if (oValueNode) {
                    oRefNode.appendChild(oValueNode);
                }
            } 
            oParent = oContextNode ? oContextNode : oInstDoc.documentElement;
            oParent.appendChild(oRefNode);
        }
        
        if (!oElement["bindCreated"]) {
            this._createBind(oModel, oElement, oRefNode);
            oElement["bindCreated"] = true;
        }
        
        return oRefNode;
    },
    
    /**
    Create corresponding bind from XF4H control's constraint attributes
    (datatype, calculate, constraint, relevant, readonly, required)    
    @param {Object} Model node of the evaluation context
    @param {Object} Context node of the evaluation context
    @param {Object} Control's DOM Node 
    @returns n/a 
    @throws n/a
    */    
    _createBind : function(oModel, oElement, oRefNode) {
        var sDatatype, sCalculate, sConstraint;        
        var sRelevant, sReadonly, sRequired, sNodeset;
        var oBind = null;
        var oContextBind = null;
        
        if (!oModel || !oElement || !oRefNode) {       
            return;
        }
        
        sDatatype   = this.getAttribute(oElement, "datatype");         
        sCalculate  = this.getAttribute(oElement, "calculate");
        sConstraint = this.getAttribute(oElement, "constraint");
        sRelevant   = this.getAttribute(oElement, "relevant");
        sReadonly   = this.getAttribute(oElement, "readonly");
        sRequired   = this.getAttribute(oElement, "required");
        
        if (!sDatatype && !sCalculate && !sConstraint && 
            !sRelevant && !sReadonly && !sRequired) {
            return;
        }
        
        oBind = UX.createElementNS(oElement,
                "http://www.w3.org/2002/xforms", "bind");        

        sNodeset = this._getNodeset(oRefNode, 
                oRefNode.ownerDocument.documentElement);

        if (!oBind || !sNodeset) {
            return;
        }        
        oBind.setAttribute("nodeset", sNodeset);
        oContextBind = UX.createElementNS(oElement,
                "http://www.w3.org/2002/xforms", "bind");
        oContextBind.setAttribute("context", "..");
        oBind.appendChild(oContextBind);
        
        if (sDatatype) {
            // TODO: check for vaild data type
            // Need to recreate? special control such as date.
            var sType = "xsd:" +  sDatatype;
            oContextBind.setAttribute("type", sType);
        }

        if (sCalculate) {
            // TODO: resolve context
            oContextBind.setAttribute("calculate", sCalculate);
        }

        if (sConstraint) {
            // TODO: resolve context
            oBind.setAttribute("constraint", sConstraint);
        }

        if (sRelevant) {
            // TODO: resolve context
            oContextBind.setAttribute("relevant", sRelevant);
        }

        if (sReadonly) {
            oContextBind.setAttribute("readonly", 
                    ((sReadonly != "false") ? "true" : "false"));
        }

        if (sRequired) {
            oContextBind.setAttribute("required", 
                    ((sRequired !== "false") ? "true()" : "false()"));
        }
        oModel.appendChild(oBind);
        
        if (!UX.hasDecorationSupport) {
            // Force a rebuild for browser doesn't has decoration support
            oModel.rebuild();
        }
     },

    /**
    Determine the XPath expression of the nodeset by traversing the instance,
    this method is called recusively. 
    @param {Object} prefix The prefix used to select the given URI
    @param {Object} uri  The URI to which the prefix is to be bound
    @returns String, XPath expression of current refernce 
    @throws 
    */
    _getNodeset : function(oElem, oDocRoot) {       
        var sParentRef = null;
        
        if (!oElem || oElem === oDocRoot) {
            return null;
        } else {
            sParentRef = this._getNodeset(oElem.parentNode, oDocRoot);
            
            if (sParentRef) {
                sParentRef += "/";          
            } else {
                sParentRef = "";
            }                   
            return  sParentRef + oElem.nodeName;
        }
    }
};
