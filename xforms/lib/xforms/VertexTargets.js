/*
 * Copyright (c) 2008-2009 Backplane Ltd.
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

/*global ProxyNode, UX, FormsProcessor, DOM_ELEMENT_NODE, DOM_TEXT_NODE, DOM_ATTRIBUTE_NODE, DOM_CDATA_SECTION_NODE*/

/*
 * [ISSUE] Things have got a little untidy, in that
 * in the various context functions (getBoundNode,
 * getEvaluationContext and getEvaluationContextFromParent)
 * we sometimes return a DOM node and sometimes return
 * a proxy node. This means that if we actually want
 * the proxy node, we have to do a bit of analysis on
 * the node returned, and potentially create a proxy
 * node if one doesn't exist. This could all do with
 * a big old sort out.
 */

function getProxyNode(oNode)
{
  if (oNode === null || oNode === undefined) {
    throw "getProxyNode, E_INVALIDARG";
  }
  
	var pnRet = null;
	if (oNode) {
		// The node could be either a DOM node, or a proxy node.
		//	 If it's a proxy node, then no more action is required. 
		if (oNode.m_oNode) {
			pnRet = oNode;
		}
		else {
			// If oNode is a DOM node, it may already have a proxy node...
			if (oNode.m_proxy) {
				pnRet = oNode.m_proxy;
			}
			else {
  			//Otherwise, create one. 
				pnRet = new ProxyNode(oNode);
				oNode.m_proxy = pnRet;
			}
		}
	}
	return pnRet;
}


function getElementValueOrContent(oContext, oElement) {
    var sExprValue = oElement.getAttribute("value");
    var sRet = "";
    
    if (sExprValue === undefined || sExprValue === null || sExprValue === "") {
      sRet = UX.isXHTML ? oElement.textContent : oElement.innerHTML;  
    } else {
      sRet = getStringValue(oContext.model.EvaluateXPath(sExprValue, oContext));
    }
    
    return sRet;
}

/**
	Gets the first node from an XPathResult that contains a nodeset. 
	Use the appropriate methods on XPathResult for accessing other result types.
				
	@param {XPathResult} oRes An XPathResult object that is expected to contain a nodeset.
	@returns The first node in the nodeset contained by oRes, if oRes is not a node-set, then this function returns null.
	
*/
function getFirstNode(oRes) {
	var oRet = null;
  var nodeSet = null;
	if(oRes && oRes.type ===  "node-set") {
    nodeSet = oRes.nodeSetValue();
    if(nodeSet.length) {
		  oRet = nodeSet[0];
		}
	}
	return oRet;
}



/**
	Gets the first text child from a node, if the node has no text children, and is capable of having them,
	  then one is created, inserted, and returned. 
	
				
	@param {Node} oNode The node whose first text child to return.
	@returns The first child of node that is a text node.
	
*/
function getFirstTextNode(oNode) {
	var oRet = null;

	if (oNode) {
    //if oNode is a text node, or text-like node (e.g. attribute), return it  
		if ((oNode.nodeType == DOM_TEXT_NODE) || (oNode.nodeType == DOM_ATTRIBUTE_NODE)) {
			oRet = oNode;
		}
		else if (oNode.nodeType == DOM_ELEMENT_NODE) {
  		
  		// Otherwise, if the node is an element then inspect the first child, to see if that is text. 

			oRet = oNode.firstChild;

      //If the first child is either absent, or not text, create a new text node, and insert it. 
			if (!oRet || ((oRet.nodeType != DOM_TEXT_NODE) && (oRet.nodeType != DOM_CDATA_SECTION_NODE))) {
				var newNode = oNode.ownerDocument.createTextNode("");
	
				/*
				 * If there were no existing nodes then add the new
				 * text node directly...
				 */
	
				if (!oRet) {
					oNode.appendChild(newNode);
				}
				else {
    			/*
    			 * ...otherwise place it before the non-text node that
    			 * we just located.
    			 */
					oNode.insertBefore(newNode, oRet);
				}
	
				/*
				 * It's the new text node that we want to return.
				 */
	
				oRet = newNode;
			}
		}
	}
	return oRet;
}

function getStringValue(oRes)
{
	var sRet = "";
	var oNode = null;

	if (oRes)
	{
		switch (oRes.type)
		{
			case "node-set":
				oNode = getFirstNode(oRes);
				if (oNode)
				{
					/*
					 * If we already have the text node then just
					 * return it.
					 */

					if ((oNode.nodeType == DOM_TEXT_NODE) || (oNode.nodeType == DOM_ATTRIBUTE_NODE)) {
						sRet = oNode.nodeValue;
					}
					else if (oNode.nodeType == DOM_ELEMENT_NODE) {
  					/*
  					 * Otherwise, if the node is an element then we want
  					 * the first text node, but we'll create one if there
  					 * isn't one.
  					 */
  					oNode = oNode.firstChild;
						if (oNode && oNode.nodeType == DOM_TEXT_NODE)
							sRet = oNode.nodeValue;
					}
				}
				break;

			case "string":
				sRet = oRes.stringValue();
				oNode = null;
				break;

			case "boolean":
				sRet = oRes.booleanValue();
				break;

			case "number":
				sRet = oRes.numberValue();
				break;

			default:
				debugger;
				break;
		}
	}

	return sRet;
}

function ProxyExpression(oContext, sXPath, oModel)
{
	this.m_context = oContext;
	this.m_xpath = sXPath;
	this.m_model = oModel;
	this.datatype = "";
	return;
}

ProxyExpression.prototype.getType = function()
{
	return this.datatype;
};

ProxyExpression.prototype.getNodeset = function()
{
	var sRet = null;
	var oModel = this.m_model;

	if (oModel)
	{
		/*
		 * [ISSUE] This should all be rolled into the one function
		 * in the same way as DOM 3 XPath allows us to specify the
		 * return type.
		 */

		oRet = oModel.EvaluateXPath(this.m_xpath, this.m_context);
	}

	return oRet;
};

ProxyExpression.prototype.getValue = function()
{
	var sRet = "";
	var oRes = this.getNodeset();

	if (oRes)
	{
		switch (oRes.type)
		{
			case "number":
				sRet = oRes.numberValue();
				break;

			case "string":
				sRet = oRes.stringValue();
				break;

			case "node-set":
				var oNode = getFirstTextNode(
					oRes.nodeSetValue()[0]
				);

				if (oNode)
					sRet = oNode.nodeValue;
				break;
			case "boolean":
				sRet = oRet.booleanValue();
				break;
			
			default:
				/* please add any other types that are missing! */
				debugger;
				break;
		}
	}
	return sRet;
};

/*
 * A ProxyNode is...surprisingly, a proxy for a DOM node, onto
 * which we attach all sorts of 'extra' properties.
 */

function ProxyNode(oNode)
{
	this.m_oNode = oNode;
	this.m_refcount = 0;
	this.calculate = null;

	// If the value is not defined, then it will be determined by
	// its ancestors. But an explicitly set value of 'true' or
	// 'false' will override any setting from higher up. Hence
	// the initialisation to 'undefined'.
	//
	this.readonly = { 
	  value: undefined, 
	  getValue: function () {
	    return FormsProcessor.inheritTrue("readonly", oNode);
	  }
	};
	
	// set up a default required MIP, which is replaced if there is an actual required MIP expression
	this.required = { 
		getValue:  function () {
			return false;
		}
 	};
  
	this.enabled = {
	  value: true,
	  getValue: function () {
	    return FormsProcessor.inheritFalse("enabled", oNode);
	  }
	};
	
	this.outOfRange = {
	  getValue: function () {
	    return false;
	  }
	};
	
	this.valid = { 
      oPN: this,
	  getValue: function () {
	    if (this.oPN && this.oPN.constraint) {
            if (!this.oPN.constraint.getValue()) {
                return false;
            }
        }
        
        if (this.oPN && this.oPN.required) {
	    	if (this.oPN.required.getValue() && !this.oPN.getValue()) {
	    		return false;
	    	}
	    }

        if (this.oPN && this.oPN.validate) {
            if (!this.oPN.validate()) {
                return false;
            }
        }

        return true;
      }
	};
	
	// Get the type form the node
	// This is meaningful only for element nodes 
	this.datatype = (oNode.nodeType === DOM_ELEMENT_NODE) ? oNode.getAttribute("xsi:type") || "" : "";    
}



ProxyNode.prototype.getMIP = function(sMIPName)
{
	var mipRet = this[sMIPName];

	if (!mipRet)
	{
		mipRet = null;
		debugger; /* asking for a MIP that doesn't exist */
	}

	return mipRet;
};

ProxyNode.prototype.getMIPState = function(sMIPName)
{
	var oMIP = this.getMIP(sMIPName);
	var bRet = false;

	if (oMIP)
		bRet = oMIP.getValue();

	return bRet;
};

ProxyNode.prototype.getNode = function()
{
	return this.m_oNode;
};

ProxyNode.prototype.getType = function()
{
	return this.datatype;
};

ProxyNode.prototype.getValue = function()
{
	var sRet = "";
	var oNode = this.getNode();

	if (oNode)
	{
		oNode = getFirstTextNode(oNode);

		if (oNode)
			sRet = oNode.nodeValue;
	}

	return sRet;
};


ProxyNode.prototype.removeChild = function(node, caller) {
	if (this.m_oNode.nodeType === DOM_ELEMENT_NODE) {
		if (!this.readonly.getValue()) {
			this.m_oNode.removeChild(node);
			return true;
		}
	} else {
			UX.dispatchEvent(caller, "xforms-binding-exception", true, false);
	}
	return false;
}

ProxyNode.prototype.appendChild = function(node, caller) {

	if (this.m_oNode.nodeType === DOM_ELEMENT_NODE) {
		if (!this.readonly.getValue()) {
			return this.m_oNode.appendChild(node);
		}
	} else {
			UX.dispatchEvent(caller, "xforms-binding-exception", true, false);
	}
	return null;
	
}

ProxyNode.prototype.setValue = function(sVal, oModel)
{
	var oRet = null;

	if (!this.readonly.getValue())
	{
		var oNode = this.getNode();
	
		if (oNode)
		{
			oNode = getFirstTextNode(oNode);
	
			if (oNode)
			{
				oNode.nodeValue = (typeof(sVal) == "object")
					?  sVal.stringValue():""+sVal;
			}
		}

		/*
		 * If the proxy has a corresponding vertex
		 * then it means our node has been used in
		 * a calculation somewhere. We therefore need
		 * to add the vertex to the change list,
		 * 
		 * The need for a recalculate must be signalled
		 * regardless, as a value has changed.  
		 * 
		 */

		if (oModel)
		{
			if (this.m_vertex)
			{
				var oVertex = this.m_vertex;

				/*
				 * [ISSUE] These two could go probably go
				 * into one function.
				 */

				oModel.changeList.addChange(oVertex);
			}
			
      oModel.flagRecalculate();
			oModel.flagRefresh();
		}
		
	}
	return oRet;
};

ProxyNode.prototype.validate = function() {
    var arrSegments, prefix, dataType, dataTypeNS;

    if (!this.datatype) {
        return true;
    }

    arrSegments = this.datatype.split(":");
    prefix = arrSegments.length === 1 ? "" : arrSegments[0];
    dataType = arrSegments.length === 1 ? arrSegments[0] : arrSegments[1];
    dataTypeNS = prefix ? NamespaceManager.getNamespaceURIForPrefix(prefix) : "";
    return Validator.validateValue(dataTypeNS, dataType, this.getValue());
};

function SingleNodeExpression(oTarget,sXPath, oContext,oModel)
{
	this.m_sXPathExpr = sXPath;
	this.m_oContext = oContext;
	this.m_oModel = oModel;
	this.node = null;

	this.identifier = function()
	{
		return "snb["+sXPath+"]";
	}
}

SingleNodeExpression.prototype.update = function()
{
	var r = this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);

	if (r != null)
	{	
		this.node = new ProxyNode(r.value[0]);
		return r.value[0];
	}
	return null;
};

SingleNodeExpression.prototype.determineDependentExpressions = function()
{
	/*
	 * The dependencies are worked out in the XPath expression
	 * evaluator.
	 */

	g_bSaveDependencies = true;
	this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);
	g_bSaveDependencies = false;

	return;
};

function NodesetExpression(oTarget, sXPath, oContext, oModel)
{
	this.m_sXPathExpr = sXPath;
	this.m_oContext = oContext;
	this.m_oModel = oModel;
	var m_nodeset = null;

	this.dependentExpressions = new Array();

	this.getNode = function(i)
	{
		return ProxyNode(m_nodeset[i]);
	}

	this.AddExpressionWhichTakesThisAsContext = function(sXPath)
	{
		this.dependentExpressions.push(new ComputedXPathExpression(sXPath,this,this.m_oModel));
	}

	this.identifier = function()
	{
		return "nsetb["+sXPath+"]";
	}
}

NodesetExpression.prototype.update = function()
{
	var r = this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);

	if (r != null)
	{	
		this.node = new ProxyNode(r.value);
		return r.value;
	}
	return null;
};

NodesetExpression.prototype.determineDependentExpressions = function()
{
	/*
	 * The dependencies are worked out in the XPath expression
	 * evaluator.
	 */

	g_bSaveDependencies = true;
	this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);
	g_bSaveDependencies = false;

	return;
};

function ComputedXPathExpression(oProxy, sXPath, oContext, oModel)
{
	this.m_oProxy = oProxy;
	this.m_sXPathExpr = sXPath;
	this.m_oContext = oContext;
	this.m_oModel = oModel;
	this.value = null;
	this.dependentExpressions = new Array();
	
	this.identifier = function()
	{
		return "comp["+sXPath+"]";
	}
}

ComputedXPathExpression.prototype.update = function()
{
	var oRet = "";
	var oRes = this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);

	if (oRes)
	{
		oRet = oRes.stringValue();
		this.m_oProxy.setValue(oRet, null);
	}

	this.value = oRet;
	return oRet;
};

/*
 * This breaks computed expression into further expressions on which
 * this one depends.
 */

ComputedXPathExpression.prototype.addDependentExpressions = function(oVertex, oDepEngine, oChangeList)
{
	var oRes = this.determineDependentExpressions();

	var oNode = null;
	var oPN = null;

	/*
	 * If there are any dependents then each of them needs to have
	 * a vertex added.
	 */

	if (this.dependentExpressions.length)
	{
		for (var i = 0; i < this.dependentExpressions.length; i++)
		{
			var oDependentNode = this.dependentExpressions[i];

			/*
			 * Get the proxy node if there is one, or create
			 * a new one.
			 */

			oPN = oDependentNode.m_proxy;

			if (!oPN)
			{
				oPN = new ProxyNode(oDependentNode);
				oDependentNode.m_proxy = oPN;
			}

			/*
			 * Now see if the node has an associated vertex...
			 */

			var oSubVertex;

			if (oPN.m_vertex)
				oSubVertex = oPN.m_vertex;

			/*
			 * ...otherwise, a sub-expression is created with its
			 * own vertex.
			 */

			else
			{
				var oSubExpr = new SubExpression(oDependentNode);

				oSubVertex = oDepEngine.createVertex(oSubExpr);
				oPN.m_vertex = oSubVertex;
				oChangeList.addChange(oSubVertex);
			}

			/*
			 * Make the target vertex dependent on the new
			 * sub-expression.
			 */

			oSubVertex.addDependent(oVertex);
		}
	}
};

ComputedXPathExpression.prototype.determineDependentExpressions = function()
{
	var oRet = null;

	/*
	 * The dependencies are worked out in the XPath expression
	 * evaluator, and stored in the array pointed to by g_arrSavedDependencies.
	 */

	g_bSaveDependencies = true;
	g_arrSavedDependencies = this.dependentExpressions;
	oRet = this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);
	g_bSaveDependencies = false;
	return oRet;
};

/*
 * [ISSUE] This is almost exactly the same as ComputedXPathExpression,
 * but we don't call setValue() in update--so we may be able to merge
 * these two classes. (At the very least we should do the inheritance
 * the other way round, and call a base class update() method, before
 * calling ProxyNode::setValue().
 */


function MIPExpression(oProxy, sXPath, oContext, oModel)
{
	MIPExpression.superclass.constructor.call(this, oProxy, sXPath, oContext, oModel);
}


YAHOO.extend(MIPExpression, ComputedXPathExpression);

MIPExpression.prototype.getValue =function(){
	  return this.value;
}

MIPExpression.prototype.update = function()
{
	var bRet = false;
	var oRes = this.m_oModel.EvaluateXPath(this.m_sXPathExpr, this.m_oContext);

	if (oRes)
		bRet = oRes.booleanValue();

	this.value = bRet;
	return bRet;
};

function SubExpression(oProxy)
{
	this.m_oProxy = oProxy;
	this.value = null;
	this.identifier = function()
	{
		return "sub";
	}
}

/*
 * The update method need do nothing since we're only interested in
 * the dependencies.
 */

SubExpression.prototype.update = function()
{
	var oRet = null;

	this.value = oRet;
	return oRet;
};
