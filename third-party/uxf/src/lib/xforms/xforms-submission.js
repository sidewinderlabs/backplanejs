/*
 * Copyright © 2008-2009 Backplane Ltd.
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

/*
 * This class must be extended to suit the comms library
 * being used.
 */
function callback(oMediator, oObserver, oContext) {
    this.m_mediator = oMediator;
    this.m_observer = oObserver;
    this.m_context = oContext;
}

callback.prototype.processResult = function(data, isFailure) {
    this.m_mediator.processResult(data, isFailure, this.m_observer,
            this.m_context);
};

callback.prototype.success = function(o) {
    throw "callback::success() has not been implemented";
};

callback.prototype.failure = function(o) {
    throw "callback::failure() has not been implemented";
};

/*
 * [TODO] Use some kind of addFeature thing.
 */

function submission() {
	this.navigateForReplaceAll = true;
}

document.submission = new submission();

/*
 * The comms library being used must override this.
 */

submission.prototype.request = function(sMethod, sAction, 
                                        sBody, nTimeout, oCallback) {
    throw "submission::request() has not been implemented";
};

submission.prototype.getConnection = function() {
    throw "submission::getConnection() has not been implemented";
};

submission.prototype.setHeader = function(header, value) {
    throw "submission::setHeader() has not been implemented";
};

submission.prototype.init = function() {
    throw "submission::init() has not been implemented";
};

submission.prototype.processResult = function(oResult, isFailure, 
                                              oObserver, oContext) {

    var sData, sReplace, sInstance, oInstance, eventContext, oNewDom, contentType = "", sTarget, oTargetContext, oTarget, newXhtml; 
    
    if (oObserver) {
        // Set context info properties common to both success and failure results.
        eventContext = {
            "resource-uri" : oResult.resourceURI,
            "response-status-code" : oResult.status,
            "response-reason-phrase" : oResult.statusText,
            "response-headers" : this.processResponseHeaders(oResult.responseHeaders)
        };

        if (isFailure) {
            // When the error response specifies an XML media type as defined by [RFC 3023],
            // the response body is parsed into an XML document and the root element of the
            // document is returned. If the parse fails, or if the error response specifies
            // a text media type, then the response body is returned as a string. Otherwise,
            // an empty string is returned. 
            eventContext["error-type"] = "resource-error";
            if (oResult.responseHeaders) {
                contentType = oResult.responseHeaders["Content-Type"];
            }
            if (contentType && this.contentTypeIsXML(contentType)) {
                try {
                    eventContext["response-body"] =  xmlParse(oResult.responseText);
                } catch (e) {
                    eventContext["response-body"] =  oResult.responseText;
                }
            } else {
                eventContext["response-body"] =  oResult.responseText;
            }
            this.dispatchSubmitError(oObserver, eventContext);
        } else {
            sData = oResult.responseText;

            // If the server returned a response body, process it according to the value of the
            // 'replace' attribute. If there is no response body, we still need to dispatch
            // xforms-submit-done with whatever context info we do have.

            if (sData) {
                // We now need to store the returned data. First find out what the
                // @replace value was set to.

                sReplace = oObserver.getAttribute("replace") || "all";

                switch (sReplace) {
                case "all":
                    oObserver.ownerDocument.logger.log("@replace = 'all'", "submission");

                    if (oResult.method === "PUT") {
                        document.location.href = oResult.resourceURI;
                    } else {
                        this.replaceDocumentContent(sData);
                    }
                    break;

                case "instance":
                    oObserver.ownerDocument.logger.log(
                            "@replace = 'instance'", "submission");
                    sInstance = oObserver.getAttribute("instance");

                    if (oResult.responseHeaders) {
                        contentType = oResult.responseHeaders["Content-Type"];
                    }
                    if (contentType && this.contentTypeIsXML(contentType)) {
                        try {
                            oNewDom = xmlParse(sData);
                        } catch (e) {
                            eventContext["error-type"] =  "parse-error";
                            this.dispatchSubmitError(oObserver, eventContext);
                            return;
                        }
                    } else {
                        eventContext["error-type"] =  "resource-error";
                        this.dispatchSubmitError(oObserver, eventContext);
                        return;
                    }

                    // @replace="instance" causes the returned data to overwrite an
                    // instance. If no instance is specified then the instance to
                    // overwrite is the one submitted.
                    //
                    // The replacement target node may be specified by @target. The evaluation context
                    // for @target is the in-scope evaluation context for the submission element, except
                    // the context node is modified to be the document element of the instance identified by
                    // the instance attribute if it is specified.
                    sTarget = oObserver.getAttribute("targetref") || oObserver.getAttribute("target");
                    if (sTarget) {
                        oTarget = this.processTargetAttribute(sTarget, sInstance, oContext, oObserver, eventContext);
                        if (!oTarget) {
                            return;
                        } else {
                            oInstance = sInstance ? oContext.model.getInstanceDocument(sInstance).documentElement : null;
                            if (oTarget === oInstance) {
                                // Replacing entire instance.
                                oContext.model.replaceInstanceDocument(sInstance, oNewDom);
                            } else {
                                // Replacing a node in the instance.
                                oTarget.parentNode.replaceChild(oNewDom.documentElement, oTarget);
                            }
                        }
                    } else {
                        if (sInstance) {
                            oContext.model.replaceInstanceDocument(sInstance, oNewDom);
                        } else if (oObserver.srcInstance) {
                            __replaceInstanceDocument(oContext.model, oObserver.srcInstance, oNewDom);
                        } else {
                            debugger;
                            // don't know where to put it - first instance of first
                            // model?
                        }
                    }
                    break;

                case "text":
                    oObserver.ownerDocument.logger.log(
                            "@replace = 'text'", "submission");

                    // When @replace="text", the response data is encoded as text and replaces the
                    // content of the replacement target node. The default replacement target node is
                    // the document element node of the instance identified by the instance attribute,
                    // which is equal to the default instance of the model if not specified.
                    // 
                    // The replacement target node may be specified by @target. The evaluation context
                    // for @target is the in-scope evaluation context for the submission element, except
                    // the context node is modified to be the document element of the instance identified by
                    // the instance attribute if it is specified.
 
                    sInstance = oObserver.getAttribute("instance");
                    sTarget = oObserver.getAttribute("targetref") || oObserver.getAttribute("target");

                    if (sTarget) {
                        oTarget = this.processTargetAttribute(sTarget, sInstance, oContext, oObserver, eventContext);
                        if (!oTarget) {
                            return;
                        }
                    } else {
                        oTarget = oContext.node;
                    }

                    if (!oTarget || UX.isNodeReadonly(oTarget.parentNode)) {
                        eventContext["error-type"] =  "target-error";
                        this.dispatchSubmitError(oObserver, eventContext);
                        return;
                    } else {
                        oTarget.firstChild.nodeValue = sData;
                        oContext.model.flagRebuild();
                    }
                    break;

                case "none":
                    oObserver.ownerDocument.logger.log(
                            "@replace = 'none'", "submission");
                    break;

                default:
                    oObserver.ownerDocument.logger.log(
                            "Invalid replace value.", "submission");
                    break;
                }
            }
            this.dispatchSubmitDone(oObserver, eventContext);
        }
    }
};

submission.prototype.processResponseHeaders = function(oHeaders) {
  var xmlDoc, headerElt, nameElt, valueElt, name, value, responseHeaders = [ ];

  // Create a <header><name/><value/></header> node for each
  // response header from the server.
  for (name in oHeaders) {
      value = oHeaders[name];

      xmlDoc = new XDocument();
      headerElt = xmlDoc.createElement("header");
      nameElt = xmlDoc.createElement("name");
      nameElt.appendChild(xmlDoc.createTextNode(name));
      headerElt.appendChild(nameElt);
      valueElt = xmlDoc.createElement("value");
      valueElt.appendChild(xmlDoc.createTextNode(value));
      headerElt.appendChild(valueElt);

      responseHeaders.push(headerElt);
  }

  return responseHeaders;
};

submission.prototype.processTargetAttribute = function(sTarget, sInstance, oContext, oObserver, eventContext) {
    var oTarget = null, oTargetContext;

    if (sTarget) {
        oTargetContext = sInstance ? oContext.model.getInstanceDocument(sInstance).documentElement : oContext;
        oTarget = oContext.model.EvaluateXPath(sTarget, oTargetContext).nodeSetValue()[0];
        if (!oTarget || oTarget.nodeType !== DOM_ELEMENT_NODE || UX.isNodeReadonly(oTarget.parentNode)) {
            eventContext["error-type"] = "target-error";
            this.dispatchSubmitError(oObserver, eventContext);
        }
    }
    return oTarget;
};

/*
 * We give the submit function an object that contains all of the parameters.
 * This is also the object to which we want all of our events targetted.
 */
submission.prototype.submit = function(oSubmission) {
	var sResource = null;
	var currentUrl; // URL of the current document
    var oEvt = null;
    var ns = null;
    var instanceId = oSubmission.getAttribute("instance");
    var instance;
    var sMethod = null;
    var sMediatype = oSubmission.getAttribute("mediatype");
    var sEncoding = oSubmission.getAttribute("encoding") || "UTF-8";
    var sSerialization = oSubmission.getAttribute("serialization") ? (oSubmission.getAttribute("serialization") !== "none") : "";
    var bSerialize = (oSubmission.getAttribute("serialization") !== "none");
		var sSeparator = oSubmission.getAttribute("separator") || "&";
		var oBody;
    var oContext;
    var bHasHeaders = false;
    var isSetSoapHeaders = false;
	var sReplace = null;
    var xmlDoc = new XDocument();
    var oSubmissionBody = xmlDoc.createTextNode("");
    var relevancePruning = oSubmission.getAttribute("relevant") ? (oSubmission.getAttribute("relevant") !== "false") : bSerialize;
    var validation = oSubmission.getAttribute("validate") ? (oSubmission.getAttribute("validate") !== "false") : bSerialize;
    var submitDataList = [ ];
    var oForm;
    var cdataSectionElements = oSubmission.getAttribute("cdata-section-elements") ? oSubmission.getAttribute("cdata-section-elements").split(" ") : false;
	var sContentType = null;
    var bOmitXmlDeclaration = UX.JsBooleanFromXsdBoolean(oSubmission.getAttribute("omit-xml-declaration"), "false");
    var sStandalone = UX.JsBooleanFromXsdBoolean(oSubmission.getAttribute("standalone"));
	var schemeHandler;
	var includeNamespacePrefixes = oSubmission.getAttribute("includenamespaceprefixes");

	// Since the absence of the includenamespaceprefixes attribute is important null is a valid value.
	if (includeNamespacePrefixes) {
		includeNamespacePrefixes = includeNamespacePrefixes.split(" ");
	}

    /*
     * XForms 1.0
     * 
     * var sVersion = this.element["version"]; var sIndent =
     * this.element["indent"]; var sMediaType = this.element["mediatype"]; var
     * sEncoding = this.element["encoding"]; var sOmitXmlDeclaration =
     * this.element["omit-xml-declaration"]; var sCdataSectionElements =
     * this.element["cdata-section-elements"]; var sReplace =
     * this.element["replace"]; var sInstance = this.element["instance"]; var
     * sSeparator = this.element["separator"]; var sIncludeNamespacePrefixes =
     * this.element["includenamespaceprefixes"];
     * 
     */

    var nTimeout = oSubmission.getAttribute("timeout");
    if (nTimeout === null) {
        nTimeout = 5000;
    }
    
    // Obtain the indication of the data to submit
    //
    oContext = oSubmission.getBoundNode();
    if (!oContext.model) {
        oContext = oSubmission.getEvaluationContext();
    }
 
    // xforms-submit step 2 test for empty submission data
    //
	if (!oContext.node) {
		this.dispatchSubmitError(oSubmission, { "error-type" : "no-data" });
		return;
	}
		
	// Construct the list proxy nodes for the submit data.
	// Prune non-relevant nodes if submission relevant is true,
	// and issue error if resulting submit data list is empty (step 3)
	//
	if (bSerialize) {
		submitDataList = this.constructSubmitDataList(oContext, relevancePruning);
	}
	if (relevancePruning && submitDataList.length === 0) {
		this.dispatchSubmitError(oSubmission, { "error-type" : "no-data" });
		return;
	}
    
	// Test validity of the submit data in proxy node list
	//
	if (validation && !this.validateSubmitDataList(submitDataList)) {
		this.dispatchSubmitError(oSubmission, { "error-type" : "validation-error" });
		return;
	}
    
    // Evaluate @action, @resource and ./resource for submission URL
	//
	ns = NamespaceManager.getElementsByTagNameNS(oSubmission, "http://www.w3.org/2002/xforms", "resource");
    
	sResource = (ns && ns.length > 0) ? getElementValueOrContent(oContext, ns[0]) : null;
    
    sResource = sResource || oSubmission.getAttribute("resource") || oSubmission.getAttribute("action"); 
    
    // xforms-submit step 6 test for no resource specified
    //
    if (!sResource) {
		this.dispatchSubmitError(oSubmission, { "error-type" : "resource-error" });
		return;
	}

    // Process the instance attribute or use the default for instance replacement
    //	
    if (instanceId) {
        instance = oSubmission.ownerDocument.getElementById(instanceId);
        if (!instance || !NamespaceManager.compareFullName(instance, "instance", "http://www.w3.org/2002/xforms")) {
            UX.dispatchEvent(oSubmission, "xforms-binding-exception",  true, false, false);
            return;
        }
    } else if (oContext.node) {
        oSubmission.srcInstance = oContext.node.ownerDocument.XFormsInstance;
    }
        
    //
    // Evaluate method element
    // Method element takes precedence over method attribute
    //
    ns = NamespaceManager.getElementsByTagNameNS(oSubmission, "http://www.w3.org/2002/xforms", "method");  
      
    sMethod = (ns && ns.length > 0) ? getElementValueOrContent(oContext, ns[0]) : oSubmission.getAttribute("method") || "get";  
    
    
    // ===== M E T H O D =========
    // The XForms method is mapped to the right method for the protocol.
    //
	// Note: @method as it is considered a token not a string.  As such it should be compared in a case-sensitive way.
    switch (sMethod) {
	case "get":
  		sMethod = "GET";
  		sSerialization = "application/x-www-form-urlencoded";
		oBody = this.serializeSubmitDataList(submitDataList, sSerialization, sSeparator, sEncoding, cdataSectionElements, bOmitXmlDeclaration, sStandalone, includeNamespacePrefixes);

		//
		// build SOAP Header information
 		//
 		if (sMediatype && sMediatype.indexOf("application/soap+xml") === 0) {
 			isSetSoapHeaders = this.setSOAPHeaders(oContext.node, sMethod, sMediatype, sEncoding);
 		}
  		break;

	case "form-data-post":
		sMethod = "POST";
		sSerialization = sSerialization || "multipart/form-data";
		oBody = this.serializeSubmitDataList(submitDataList, sSerialization, sSeparator, sEncoding, cdataSectionElements, bOmitXmlDeclaration, sStandalone, includeNamespacePrefixes);
		break;

	case "urlencoded-post":
		sMethod = "POST";
		sSerialization = "application/x-www-form-urlencoded";
		oBody = this.serializeSubmitDataList(submitDataList, sSerialization, sSeparator, sEncoding, cdataSectionElements, bOmitXmlDeclaration, sStandalone, includeNamespacePrefixes);
		break;

	case "post":
		sMethod = "POST";
		sSerialization = "application/xml";
		oBody = this.serializeSubmitDataList(submitDataList, sSerialization, sSeparator, sEncoding, cdataSectionElements, bOmitXmlDeclaration, sStandalone, includeNamespacePrefixes);
        
		//
		// build SOAP Header information
		//
		if (sMediatype && sMediatype.indexOf("application/soap+xml") === 0) {
			isSetSoapHeaders = this.setSOAPHeaders(oContext.node, sMethod, sMediatype, sEncoding); 
		}
		
		break;

	case "put":
		sMethod = "PUT";
		sSerialization = "application/xml";
		oBody = this.serializeSubmitDataList(submitDataList, sSerialization, sSeparator, sEncoding, cdataSectionElements, bOmitXmlDeclaration, sStandalone, includeNamespacePrefixes);
		break;
		
	case "delete":
		sMethod = "DELETE";
		sSerialization = "application/x-www-form-urlencoded";
		oBody = this.serializeSubmitDataList(submitDataList, sSerialization, sSeparator, sEncoding, cdataSectionElements, bOmitXmlDeclaration, sStandalone, includeNamespacePrefixes);
		break;

    default:
        /* the submission method being used needs to be implemented */
        oSubmission.ownerDocument.logger.log("Submission method '" + sMethod + "' is not defined.", "error");
        break;
    }
	
	sContentType = sMediatype || sSerialization;
	///Sets the default contentType for a non-SOAP submissions
	///SOAP submissions have their headers set in the setSOAPHeaders method.
	if(!isSetSoapHeaders){
			this.setHeader("content-type", sContentType);
		}

    // Dispatch xforms-submit-serialize.
    // If the event context submission-body property string is empty, then no
    // operation is performed so that the submission will use the normal
    // serialization data. Otherwise, if the event context submission-body
    // property string is non-empty, then the serialization data for the
    // submission is set to be the content of the submission-body string.
    try {
        this.dispatchSubmitSerialize(oSubmission, { "submission-body": [ oSubmissionBody ] });
    } catch (e) {
        oSubmission.ownerDocument.logger.log(
                "Error: " + e.description, "error");
    }
    
	// If the submission contains headers, or is a SOAP submission there are headers.
	bHasHeaders = isSetSoapHeaders || (NamespaceManager.getElementsByTagNameNS(oSubmission, "http://www.w3.org/2002/xforms", "header").length > 0);
	
	sReplace = oSubmission.getAttribute("replace") || "all";

	if (
		sReplace === 'all' && (
			this.navigateForReplaceAll &&
			(sMethod === "GET" || sMethod === "POST") &&
			!bHasHeaders && (
				sContentType === sSerialization && 
				(sSerialization === "application/x-www-form-urlencoded" || sSerialization === "multipart/form-data")
			)
		)
	) {
		oForm = this.buildFormFromObject(oBody);
		oForm.encoding = sSerialization;
		oForm.action = sResource;
		oForm.method = sMethod.toLowerCase();
		document.body.appendChild(oForm);

		try {
			oForm.submit();
		} catch (e) {
			this.dispatchSubmitError(oSubmission, { "error-type" : "resource-error", "resource-uri" : sResource });
		} finally {
			oForm.parentNode.removeChild(oForm);
		}
	} else {
		// Callback for asynchronous submission
		// [ISSUE] synchronous submissions need to do the request here without a
		// callback

		var oCallback = new callback(this, oSubmission, oContext);
		this.setHeaders(oContext.model, oSubmission);

		try {
			if ((oBody || oBody !== "") && sSerialization === "application/x-www-form-urlencoded") {
				switch (sMethod) {
					case "GET":
					case "DELETE":
						sResource = this.buildGetUrl(sResource, oBody, sSeparator);
						oBody = null;
						break;

					case "POST":
						oBody = this.buildEncodedParameters(oBody, sSeparator);
						break;

					default:
						break;
				}
			}

			// If we have a specific protocol/method handler then use it...
			//
			currentUrl = getBaseUrl();
			sResource = makeAbsoluteURI(currentUrl, sResource);
			schemeHandler = schemeHandlers[spliturl(sResource).scheme];

			if ((UX.isFF || UX.isWebKit) && schemeHandler && schemeHandler[sMethod]) {
				spawn(function() {
					schemeHandler[sMethod](sResource, oBody, nTimeout, oCallback);
				});
			}

			// ...otherwise use the default handler.
			//
			else {
				// At this point we should work out whether we are about to do a cross-domain or
				// cross-protocol request, and if we are, ask the user for permission.
				//
				if (UX.isFF && "file" === spliturl(currentUrl).scheme) {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				}

				return this.request(sMethod, sResource, oBody, nTimeout, oCallback);
			}
		} catch (e) {
			this.dispatchSubmitError(oSubmission, { "error-type" : "resource-error", "resource-uri" : sResource });
		}
	}
};

// Construct an array of ProxyNodes for all data nodes, or all 
// data nodes that are relevant if relevancePruning is true
//
submission.prototype.constructSubmitDataList = function(oContext, relevancePruning) {
	var submitDataList = [ ];
	var stack = [ oContext.node ];
	var proxyNode;  
	
	while (stack.length > 0) {
		proxyNode = getProxyNode(stack.pop());
		if (proxyNode.enabled.value || !relevancePruning) {
			submitDataList.push(proxyNode);
			if (proxyNode.m_oNode.childNodes.length > 0) {
				stack = stack.concat(proxyNode.m_oNode.childNodes.slice(0).reverse());
			}
			if (proxyNode.m_oNode.attributes.length > 0) {
				stack = stack.concat(proxyNode.m_oNode.attributes.slice(0).reverse());
			}			
		}
	} 

    return submitDataList; 
};

submission.prototype.validateSubmitDataList = function(submitDataList) {
	var i;
	for (i = 0; i < submitDataList.length; i++) {
		if (!submitDataList[i].valid.getValue()) {
			return false;
		}
	}
	return true;
};

submission.prototype.serializeSubmitDataList = function(submitDataList, serializationFormat, separator, encoding, cdataSectionElements, omitXmlDeclaration, standalone, includeNamespacePrefixes) {
	var serialization = "";
	var xmlDoc = this.constructSubmitDataListDOM(submitDataList);

	if (xmlDoc) {
		// For XML serialisation just return an XML document.
		//
		if (serializationFormat === "application/xml") {
			encoding = encoding || "UTF-8";
	
			this.setHeader("Content-Type", serializationFormat + "; charset=" + encoding);
			if (!omitXmlDeclaration) {
				xmlDoc.insertBefore(
					xmlDoc.createProcessingInstruction(
						"xml",
						"version=\"1.0\"" +
						" encoding=\"" + encoding + "\"" +
						(
							(standalone !== undefined)
								? (" standalone=\"" + ((standalone) ? "yes" : "no") + "\"")
								: ""
						)
					),
					xmlDoc.firstChild
				);
			}
			return xmlText(xmlDoc, cdataSectionElements, includeNamespacePrefixes);
		}
	
		// For HTML forms-compatible serialisations, create a set of URL encoded name/value pairs.
		//
		if (serializationFormat === "application/x-www-form-urlencoded" || serializationFormat === "multipart/form-data") {
			return this.serializeURLEncoded(xmlDoc);
		}
	}//if ( there is something to serialize )

	return "";
};

submission.prototype.constructSubmitDataListDOM = function(submitDataList) {
	var root;
	var xmlDoc;

	if (!submitDataList.length) {
		return null;
	}

	root = submitDataList[0].m_oNode.cloneNode(false);
	if (root.nodeType === DOM_DOCUMENT_NODE) {
		xmlDoc = root;
	} else if (root.nodeType === DOM_ELEMENT_NODE) {
		xmlDoc = new XDocument();
		xmlDoc.appendChild(root);
	} else {
		throw ("Submission data must be rooted by an element or a document node");
	}
	
	this._constructSubmitDataListDOM(submitDataList, 0, root);
	
	return xmlDoc;
};

submission.prototype._constructSubmitDataListDOM = function(submitDataList, listPos, parentNode) {
	var node, submitListParent;
	
	// The parentNode is in the new DOM being contructed, but we also need
	// to know the parent in the original instance data.
	submitListParent = submitDataList[listPos].m_oNode;
	
	// Now we can advance past the parentNode, i.e. the submitListParent in the submitDataList
	listPos++;
	
	// For element nodes, process the attributes (if any)
	//
	if (parentNode.nodeType === DOM_ELEMENT_NODE) {
		while (listPos < submitDataList.length && submitDataList[listPos].m_oNode.nodeType === DOM_ATTRIBUTE_NODE) {
			parentNode.setAttribute(submitDataList[listPos].m_oNode.nodeName, submitDataList[listPos].m_oNode.nodeValue);
			listPos++;
		}
	}
	
	// For element, document and fragment nodes, process children (if any) 
	//
	if (parentNode.nodeType === DOM_ELEMENT_NODE ||	parentNode.nodeType === DOM_DOCUMENT_NODE) {
		while (listPos < submitDataList.length && submitDataList[listPos].m_oNode.parentNode === submitListParent) {
			node = submitDataList[listPos].m_oNode.cloneNode(false);
			node.removeAttributeList();
			parentNode.appendChild(node);
			if (node.nodeType === DOM_ELEMENT_NODE) {
				listPos = this._constructSubmitDataListDOM(submitDataList, listPos, node);
			} else {
				listPos++;
			}
		}
	}
	
	return listPos;
};

submission.prototype.serializeURLEncoded = function(node) {
	var stack = [ node ];
	var taggedValues = {};
	var i, isLeaf, tag, value, childNode;
	
	while (stack.length > 0) {
		node = stack.pop();
		if (node.nodeType === DOM_ELEMENT_NODE || node.nodeType === DOM_DOCUMENT_NODE || node.nodeType === DOM_DOCUMENT_FRAGMENT_NODE) {
			isLeaf = true;
			value = "";
			for (i = node.childNodes.length - 1; i >= 0; i--) {
				childNode = node.childNodes[i];
				if (childNode.nodeType === DOM_TEXT_NODE || childNode.nodeType === DOM_CDATA_SECTION_NODE) {
					value = childNode.nodeValue + value;
				} else if (childNode.nodeType === DOM_ELEMENT_NODE) {
					isLeaf = false;
					stack.push(childNode);
				}
			}
			if (isLeaf && node.nodeType === DOM_ELEMENT_NODE) {
				tag = node.nodeName;
				if (tag.indexOf(':') != 0) {
					tag = tag.slice(tag.indexOf(':') + 1);
				}
				
				taggedValues[tag] = value;
			}			
		}
	}
	
    return taggedValues;
};

/**
 * Builds an HTML form element from an object.
 */
submission.prototype.buildFormFromObject = function(object) {
	var form = document.createElement("form");
	var field = null;
	var key, value;
	
	for ( key in object ) {
		if ( object.hasOwnProperty(key) && typeof(object[key]) !== "function") {
			field = document.createElement("input");
			field.type = "hidden";
			field.name = key;
			field.value = object[key];
			
			form.appendChild(field);
		}
	}
	
	return form;
};

submission.prototype.setHeaders = function(oModel, oSubmission) {
	var headers = {};
	var header;
	var i, j;
	var elements;
	var nodelist;
	var name;
	var values;
	var value;
	var combine;

	elements = NamespaceManager.getElementsByTagNameNS(oSubmission, "http://www.w3.org/2002/xforms", "header");
	for ( i = 0; i < elements.length; ++i) {
		header = elements[i];

		// Ignore this header if it is not a leaf header.
		if (NamespaceManager.getElementsByTagNameNS(header, "http://www.w3.org/2002/xforms", "header").length > 0) {
			continue;
		}
		
		nodelist = NamespaceManager.getElementsByTagNameNS(header, "http://www.w3.org/2002/xforms", "name");
		if (nodelist.length === 0) {
			document.logger.log("INFO: Ignoring xf:header whose xf:name is empty");
			continue;
		} else {
			name = nodelist[0].getValue();
			
			if (!name || name.trim() === '') {
				document.logger.log("INFO: Ignoring xf:header whose xf:name is empty");
				continue;
			}
		}
		
		combine = header.getAttribute("combine");
		
		values = [];
		nodelist = NamespaceManager.getElementsByTagNameNS(elements[i], "http://www.w3.org/2002/xforms", "value");
		for ( j = 0; j < nodelist.length; ++j) {
			value = nodelist[j].getValue();
			if (value) {
				values.push(value);
			}
		}

		if (headers[name]) {
			if (!combine || combine === "append") {
				headers[name] = headers[name].concat(values);
			} else if (combine === "prepend") {
				while (values.length > 0) {
					headers[name].unshift(values.pop());
				}
			} else if (combine === "replace") {
				headers[name] = values;
			}
		} else {
			headers[name] = values;
		}
	}
	
	for ( name in headers ) {
		this.setHeader(name, headers[name].join(','));
	}
};

submission.prototype.buildEncodedParameters = function(params, separator, queryString) {
	var key, pairs = [ ];

	if (params) {
		for (key in params) {
			if (params.hasOwnProperty(key) && typeof(params[key]) !== "function") {
				pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
			}
		}
	}//if ( there are parameters to add to the action )

	return ((queryString) ? queryString : "") + pairs.join(separator || "&");
};//buildEncodedParameters()

submission.prototype.buildGetUrl = function(action, params, separator) {
	return action + this.buildEncodedParameters(params, separator, "?");
};//buildGetUrl()

submission.prototype.setSOAPHeaders = function(oContextNode, sMethod, sMediatype, sEncoding) {

	var result = false;
	var action = (/action=([^\s\t\r\n\v\f;]+);?/.exec(sMediatype || "") || [])[1];
	var charset = (/charset=([\w-]+);?/.exec(sMediatype || "") || [])[1] || sEncoding || "UTF-8";
	
	var namespaceURI = oContextNode && NamespaceManager.getNamespaceURI(oContextNode);
	if (sMethod === "POST") {
		
		if (namespaceURI === "http://schemas.xmlsoap.org/soap/envelope/") {
			
			if (action) {
				this.setHeader("SOAPAction", action);
			}
			
			this.setHeader("content-type", "text/xml; charset=" + charset);
			result = true;
		}
		else if (namespaceURI === "http://www.w3.org/2003/05/soap-envelope") {
			this.setHeader("content-type", sMediatype);
			result = true;
		}
		
	} else if (sMethod === "GET") {

		if (namespaceURI === "http://www.w3.org/2003/05/soap-envelope") {
			this.setHeader("accept", "application/soap+xml; charset=" + charset);
			result = true;
		}
	}
	
	return result;
};

submission.prototype.replaceDocumentContent = function(data) {
	var xhtmlContainer, htmlElement;

	if (UX.isFF || UX.isWebKit) {
		// For Firefox and WebKit, any XML processing instruction must be stripped out.
		if (data.indexOf("<?", 0) === 0) {
			data = data.substr(data.indexOf("?>") + 2);
		}
	}

	if (UX.isXHTML) {
		xhtmlContainer = document.createElement("div");
		xhtmlContainer.innerHTML = data;
		htmlElement = xhtmlContainer.getElementsByTagName("html")[0];
		if (htmlElement) {
			document.documentElement.innerHTML = htmlElement.innerHTML;
		} else {
			document.documentElement.innerHTML = xhtmlContainer.innerHTML;
		}
	} else {
		document.write(data);
	}
};

submission.prototype.dispatchSubmitSerialize = function (eventTarget, eventContext) {
	this.dispatchSubmissionEvent(eventTarget, 'serialize', eventContext);
};

submission.prototype.dispatchSubmitError = function (eventTarget, eventContext) {
	this.dispatchSubmissionEvent(eventTarget, 'error', eventContext);
};

submission.prototype.dispatchSubmitDone = function (eventTarget, eventContext) {
	this.dispatchSubmissionEvent(eventTarget, 'done', eventContext);
};

submission.prototype.dispatchSubmissionEvent = function (eventTarget, eventSuffix, eventContext) {
	var evt = eventTarget.ownerDocument.createEvent('Events');
	evt.initEvent('xforms-submit-' + eventSuffix, true, false);
	evt.context = eventContext;
	FormsProcessor.dispatchEvent(eventTarget, evt);
};

// Section 11.10 of XForms 1.1 states that, for @replace="instance", the content
// type of the submission response must indicate XML data in accordance with RFC
// 3023. RFC 3023 states that valid content types for a well-formed XML document
// are 'text/xml' and 'application/xml'. Additionally, many documents are served
// with the suffix '+xml' by convention, for example 'application/xhtml+xml' and
// 'image/svg+xml'. These content types aren't covered by normative text in the
// RFC, but there are valid use cases for allowing their use in Ubiquity XForms.
submission.prototype.contentTypeIsXML = function (contentType) {
	var type = contentType.toLowerCase();
	return type === 'text/xml' || type === 'application/xml' || type.indexOf('+xml') === type.length - 4;
};
