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

var Instance = new UX.Class({
	
	Mixins: [LoadExternalMixin],
	
	toString: function() {
		return 'xf:instance';
	},
	
	initialize: function(element) {
		this.element = element;
		this.m_oDOM = null;
		this.element["elementState"] = 1;
		this.model = element.parentNode;
		UX.addStyle(this.element, "display", "none");
	},

	load: function(domURL) {

		if (domURL) {
			//
			// We map our @src to an XLink.
			//
			this.element.setAttribute("xlink:actuate", "onRequest");
			this.element.setAttribute("xlink:show", "embed");
			this.element.setAttribute("xlink:href", domURL);

			UX.extend(this, new XLinkElement(this.element));

			//
			// When the document has been loaded by our XLink handler
			// we parse it and then fire a 'document load' event.
			//
			this.element.addEventListener("xlink-traversed", {
				context: this,
				handleEvent: function(evtParam) {
					//this.context.parseInstance();
					var evt = this.context.element.ownerDocument.createEvent("Events");
					evt.initEvent("instance-load", true, false);
					var oTarget = this.context.element;
					FormsProcessor.dispatchEvent(oTarget, evt);
				}
			},
			false);

			//
			// If the XLink handler for src or resource fails, then
			// we dispatch xforms-link-exception
			//
			this.element.addEventListener("xlink-traversal-failure", {
				context: this,
				handleEvent: function(evtParam) {
					var dispatcher = this.context;
					spawn(function() {
						dispatcher.dispatchException("xforms-link-exception", evtParam.context);
					});
				}
			},
			false);

			/*
	        * [ISSUE] Need to decide how to actuate, since
	        * onLoad is too late.
	        */

			this.Actuate();
		}
	},

	xlinkEmbed: function(s, domURL) {
		this.m_oDOM = new DOMParser().parseFromString(s, "text/xml");
		this.element["elementState"] = 0;
		this.finishLoad(domURL);
		return true;
	},

	parseInstance: function() {
		var sXML = "";
		if (UX.isXHTML) {
			var o = new XMLSerializer();
			var n = this.element.firstChild;
			while (n) {
				sXML += o.serializeToString(n);
				n = n.nextSibling;
			}
		//
		// When the document has been loaded by our XLink handler
		// we parse it and then fire a 'document load' event.
		//
		} else {
			sXML = this.element.innerHTML.replace(/<input>((?:.|\n)*?)(?:\s*<|$)/g, function(full, match) {
					return '<input>' + match + '</input><';
			});
		}

		if (sXML !== "") {
			try {
				this.m_oDOM = new DOMParser().parseFromString(sXML, "text/xml");
			} catch(e) {
				//Catch and do nothing:
				// link-exception is despatched by caller
				// catch here to allow that to happen
			}
			this.element["elementState"] = 0;
		}
		return;
	},

	finishLoad: function(domURL) {
		var ret = false;
		if (this.m_oDOM && this.m_oDOM.documentElement) {
			ret = true;
			if (typeof this.model.flagRebuild === "function") this.model.flagRebuild();
			this.m_oDOM.documentElement.setAttribute('ux_uid_element', this.element.ux_uid);
			this.m_oOriginalDOM = UX.cloneDocument(this.m_oDOM);
			NamespaceManager.readOutputNamespacesFromInstance(this.m_oDOM);
		} else if (!this.element["elementState"]) {
			// if we do not have a valid instance from @src, inline or @resource
			// and the elementState has been set to 0, then throw xforms-link-exception
			//
			ret = true;
			this.dispatchException("xforms-link-exception", {
				"resource-uri": domURL || ("#" + this.element.getAttribute("id"))
			});
		}

		return ret;
	},

	getDocument: function() {
		return this.m_oDOM;
	},

	replaceDocument: function(oDom) {
		this.m_oDOM = oDom;
		if (!this.m_oOriginalDOM) {
			this.m_oOriginalDOM = UX.cloneDocument(this.m_oDOM);
		}
		return;
	},

	reset: function() {
		this.replaceDocument(UX.cloneDocument(this.m_oOriginalDOM));
	},

	// Delete nodes takes a nodelist and deletes the node at a specified
	// position in that list. If no position is specified then the entire
	// list is deleted.
	//
	deleteNodes: function(oContext, nodesetExpr, atExpr) {
		return this.deleteFromNodeset(oContext, this.evalXPath(nodesetExpr, oContext).nodeSetValue(), atExpr);
	},

	deleteFromNodeset: function(oContext, nodeset, atExpr) {
		var at, atContext, i, node, nsDeleted = [],
			evt;

		/**
		 Helper function: deleteNode - deletes a given node as per XForms 1.1 section 10.4 step 4.
		 Returns true if the node is indeed deleted or false if the node cannot be deleted according the XForms 1.1.
		 delete processing rules (and must be ignored).
		 */
		var deleteNode = function(node, deleteLocation) {
			var parentNode;
			if(node.nodeType == 2) {//attr
				parentNode = !UX.isIE ? node.ownerElement : node.selectSingleNode('..');
			} else {
				parentNode = node.parentNode;
			}
			
			if (!parentNode || ((parentNode.nodeType === DOM_DOCUMENT_NODE) && (node.nodeType === DOM_ELEMENT_NODE))) {
				return false;
			}
			if (UX.isNodeReadonly((deleteLocation) ? parentNode : node)) {
				return false;
			}
			
			var proxy = UX.getProxyNode(node, true);
			if(proxy) proxy.m_oNode = null;
			
			if (node.nodeType === DOM_ATTRIBUTE_NODE) {
				parentNode.removeAttribute(node.nodeName);
			} else {
				parentNode.removeChild(node);
			}
			
			return true;
		};
		// If no nodes are found then there is nothing to do.
		//
		if (nodeset.length) {

			// Calculate evaluation context for the at attribute.
			//
			if (atExpr) {
				atContext = UX.beget(oContext);
				atContext.size = nodeset.length;
				atContext.position = 1;
				atContext.node = nodeset[0];
				at = Math.round(this.evalXPath(atExpr, atContext).numberValue());
			}

			// If we have some nodes, and an 'at' value, then delete the
			// specific node:
			//
			if (at !== undefined) {
				// If the 'at' value is too small, then it is 1.
				// If it is in range, it is used.  Otherwise, if it
				// is too big or isNaN, then it is set to the nodeset size
				//
				at = at < 1 ? 1 : (at <= nodeset.length ? at : nodeset.length);

				node = nodeset[at - 1];
				if (deleteNode(node, at)) {
					nsDeleted.push(node);
				}

			} else {
				// If there is no 'at' value, then delete all the nodes in
				// the list:
				//
				for (i = 0; i < nodeset.length; i++) {
					node = nodeset[i];
					if (deleteNode(node)) {
						nsDeleted.push(node);
					}
				} // for each node
			} // if there is an at value ... else ...
		} // if no nodes were found
		// If we have deleted any nodes then dispatch an event.
		//
		if (nsDeleted.length) {
			evt = document.createEvent("Events");
			evt.initEvent("xforms-delete", true, false);
			evt.context = {
				"deleted-nodes": nsDeleted,
				"delete-location": at
			};
			FormsProcessor.dispatchEvent(this, evt);
			return true;
		} else {
			return false;
		}
	},
	
	insertNodes: function(oContext, nodesetExpr, atExpr, position, originExpr) {
		return this.insertNodeset(oContext, ((nodesetExpr) ? this.evalXPath(nodesetExpr, oContext).nodeSetValue() : null), atExpr, position, originExpr);
	},

	insertNodeset: function(oContext, ns, atExpr, position, originExpr) {
		var nsOrigin = (originExpr) ? (typeof originExpr === 'string' ? this.evalXPath(originExpr, oContext).nodeSetValue() : originExpr) : ((ns) ? new Array(ns[ns.length - 1]) : null);
		var at, after, i, insertLocationNode, insertTarget, insertBeforeNode, cloneNode, nsLocationNode = [],
			nsInserted = [],
			evt, atRoot, insertNode;

		// If there's no context node, then insertion is not possible, so we'll just no-op in that case.
		if(!oContext) return false;
		// If, in addition to a context, there is a nodeset, then the insertion will occur within the nodeset
		if (ns && ns.length > 0) {
			if (atExpr) {
					var atContext = UX.beget(oContext);
					atContext.size = ns.length;
					atContext.position = 1;
					at = Math.round(this.evalXPath(atExpr, atContext).numberValue());
			} else {
					at = ns.length;
			}
			at = at < 1 ? 1 : (at <= ns.length ? at : ns.length);

			insertLocationNode = ns[at - 1];
			nsLocationNode.push(insertLocationNode);

			after = (position) ? (position !== 'before') : true;

			if (after) {
				insertBeforeNode = insertLocationNode.nextSibling ? insertLocationNode.nextSibling : null;
			} else {
				insertBeforeNode = insertLocationNode;
			}

			// The insert target from DOM's perspective is the parent of the
			// node calculated so far.
			//
			insertTarget = insertLocationNode.parentNode;

		} // end if (non-empty nodeset)
		// If there is no nodeset but there was a context attribute which indicated a node into
		// which an insertion should occur, and if there are one or more origin nodes, then we
		// can proceed with insertion
		//
		else if (oContext.initialContext && nsOrigin && nsOrigin.length > 0) {
			insertTarget = oContext.node ? oContext.node : oContext;
			nsLocationNode.push(insertTarget);
			insertBeforeNode = (insertTarget.firstChild) ? insertTarget.firstChild : null;
		}

		// otherwise insertTarget intentionally left undefined, thus
		// insertion cannot be substantiated which results in the NO-OP
		if (insertTarget) {
			// Insert target found.
			// Clone nodes to be inserted first and add them to nsInserted array.
			// Conceivably, origin nodes could be removed, if inserting at the root (see below).
			// At the same time determine if the insertion is 'at root' and,
			// if so, is it legal (no more the one element can be inserted).
			// Note, that if it is NOT legal the second and the following
			// element nodes are not inserted (ignored).
			atRoot = false;
			for (i = 0; i < nsOrigin.length; i++) {
				insertNode = true;
				if ((insertTarget.nodeType === DOM_DOCUMENT_NODE) && (nsOrigin[i].nodeType === DOM_ELEMENT_NODE)) {
					if (atRoot) {
						insertNode = false;
					} else {
						atRoot = true;
					}
				}

				// Attribute node can only be inserted
				// 1. in an element node
				// 2. if target location is provided by the context attribute, i.e.
				// NodeSet Binding nodeset is not specified or empty
				if (nsOrigin[i].nodeType === DOM_ATTRIBUTE_NODE) {
					if ((insertTarget.nodeType !== DOM_ELEMENT_NODE) || (ns && ns.length > 0)) {
						insertNode = false;
					}
				}

				if (insertNode) {
					cloneNode = nsOrigin[i].cloneNode(true);
					nsInserted.push(cloneNode);
				}
			}

			// Treat the special case of insertion at the root of the instance here.
			// Namely, before the element could be inserted into document node
			// remove the existing document element.
			if (atRoot) {
				insertLocationNode = insertTarget.firstChild;
				while (insertLocationNode && (insertLocationNode.nodeType !== DOM_ELEMENT_NODE)) {
					insertLocationNode = insertLocationNode.nextSibling;
				}

				if (insertLocationNode) {
					if (insertBeforeNode && insertBeforeNode === insertLocationNode) {
						insertBeforeNode = insertBeforeNode.nextSibling;
					}
					insertTarget.removeChild(insertLocationNode);
				}
			}

			// Finally, the actual insertion.
			// Non-attribute nodes are inserted before a particular child node, or
			// or appended if insertBeforeNode is falsy;
			// an attribute nodes, on the other hand, are simply set.
			for (i = 0; i < nsInserted.length; i++) {
				if (nsInserted[i].nodeType !== DOM_ATTRIBUTE_NODE) {
					insertTarget.insertBefore(nsInserted[i], insertBeforeNode);
				} else {
					insertTarget.setAttributeNode(nsInserted[i]);
				}
			}
		}
		if (!nsInserted.length) return false;
		// If we have inserted any nodes then dispatch an event and return true; otherwise just return false
		evt = document.createEvent("Events");
		evt.initEvent("xforms-insert", true, false);

		evt.context = {
			"inserted-nodes": nsInserted,
			"origin-nodes": nsOrigin,
			"insert-location-node": nsLocationNode,
			"position": (after ? "after" : "before")
		};
		FormsProcessor.dispatchEvent(this, evt);
		return true;
	},
	
	// Evaluate an XPath expression against this instance.
	// If no context is given, the default is the document element of the instance
	// NOTE: This is a default evaluator, but instances that are part of a model
	//       use the model's evaluator instead.
	evalXPath: function(expr, oContext) {
		return xpathDomEval(expr, oContext || {
			node: this.m_oDOM.documentElement
		});
	}
	
});
