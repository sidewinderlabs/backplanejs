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

var Context = new UX.Class({
	
	toString: function() {
		return 'xf:context';
	},
	
	initialize: function(element) {
		this.element = element;
		this.m_context = null;
		this.nodes = null;
		this.m_model = null;
		this.m_proxy = null;
	},

	unwire: function() {
		this.m_context = null;
		this.nodes = null;
		if (this.m_proxy && !this.element.getAttribute('bindingcontainer')) {
			this.m_proxy = null;
		}
		return;
	},

	/*
	 * The object returned contains the context "node", the "model" that contains it,
	 * the "initialContext" node before evaluating the context attribute (or undefined
	 * if there is no context attribute), the "position" of the context node in a nodeset
	 * and the "size" of that nodeset if this is repeated (and undefined otherwise).
	 * Finally, the "resolverElement" is this, the element whose inscope evaluation
	 * context is being determined.
	 */
	getEvaluationContext: function() {
		if (this.m_context) {
			// Make a copy because the caller (e.g. getBoundNode()) may alter the result returned
			return UX.extend({}, this.m_context);
		}

		var context;
		var element = this.element;
		var doc = element.ownerDocument;

		// If there is a model attribute, or the element *is* a model
		// then subject to further checks, the evaluation context
		// may be retrieved from the model itself.
		var modelId = element.getAttribute("model");

		if (modelId) {
			var model = doc.getElementById(modelId);

			if (model && DECORATOR.getBehaviour(model)) {
				// Having fetched a model node which corresponds to the given @model IDREF
				// Find the model to which the parent element is bound.
				var oContextModel = getModelFor(element);

				if (oContextModel === model) {
					// In the case that the parent's model and the model fetched from the @model IDREF
					// are identical, the evaluation context for this node is the context gleaned
					// from its position within the document, to wit, the same context as though it
					// had no model attribute at all.
					context = this.getEvaluationContextFromParent();
				} else {
					// Where the above clause is false, i.e. a disparity exists between the model to which
					// the parent node is bound, and the model to which this node is bound, then this node is
					// not evaluated in the context of the parent node, but is evaluated in the default context for
					// the model whose id matches the IDREF given in this element's model attribute.
					context = DECORATOR.getBehaviour(model).getEvaluationContext();
				}
			} else {
				// Dispatch xforms-binding-exception if model is not resolved
				UX.dispatchEvent(element, "xforms-binding-exception", false, true, true);
			}
		} else {
			//Otherwise use the parent's evaluation context.
			context = Context.prototype.getEvaluationContextFromParent.apply(this);
		}

		// If this has a context attribute, then save the initial context node obtained so far
		// and store the context into the element (in case @context invokes context()),
		// then evaluate the context attribute to determine the new value for node.
		context.initialContext = context.node;
		context.resolverElement = this.element;
		this.m_context = context;
		var sContext = element.getAttribute("context");
		if (sContext) {
			context.node = getFirstNode(context.model.EvaluateXPath(sContext, this.m_context));
			// If the context attribute changes the context node, then the
			// initial context position and size are no longer usable
			if (context.node !== context.initialContext) {
				context.position = undefined;
				context.size = undefined;
			}
		} else {
			// With no context attribute, there is no need for initialContext,
			// and in fact by making this assignment, the consumer of the context
			// object can detect that there was no context attribute.
			context.initialContext = undefined;
		}

		// Store the context in this
		this.m_context = UX.extend({}, context);
		return context;
	},

	/*
	 * If an element doesn't have an evaluation context, then we get it
	 * from the parent.
	 */
	/* This method searches for the nearest ancestor of this that
	 * expresses a binding, and it selects the node that provides
	 * the initial inscope evaluation context for this.
	 * The object returned has the context node, the model
	 * containing it, and possibly a position and size.
	 */
	getEvaluationContextFromParent: function() {
		var context = {
			model: null,
			node: null,
			resolverElement: this.element
		};
		var element = this.element;
		var parentNode = element.parentNode;
		var root = element.ownerDocument.documentElement;
		var boundNode = null;

		// An ordinal attribute is attached to repeated elements to
		// indicate the position in the nodeset of the node for which
		// the repeated element was generated.
		var nOrdinal = Number(element.getAttribute("ordinal"));
		if (!nOrdinal || isNaN(nOrdinal)) {
			nOrdinal = 1;
		} else {
			context.position = nOrdinal;
		}
		
		while (parentNode) {
			var parent = DECORATOR.getBehaviour(parentNode);
			if (parent && parent.getBoundNode) {
				boundNode = parent.getBoundNode(nOrdinal);
				if (boundNode && (boundNode.model || boundNode.node)) {
					if (context.position) {
						context.size = parent.nodes.length;
					}
					context.model = boundNode.model;
					context.node = boundNode.node;
					break;
				}
			}
			// Although recursion would be the more beauteous solution here,
			// invoking it at this point leads inexorably to a stack overflow
			// therefore, the less elegant solution of stepping round to the
			// next iteration of the loop is employed.
			parentNode = parentNode.parentNode;
		}
		

		// If we don't get a context then we must be the
		// highest element, so we use the evaluation context
		// of the first model.
		if (!parentNode || root === parentNode) {
			if (!document.defaultModel) {
				var models = NamespaceManager.getElementsByTagNameNS(root, "http://www.w3.org/2002/xforms", "model");
				if (models && models.length > 0) {
					document.defaultModel = DECORATOR.getBehaviour(models[0]);
				} else {
					// TODO: Streamlined syntax - No model in document, generate a default model
					context.model = null;
					context.node = null;
					return context;
				}
			}
			context = document.defaultModel.getEvaluationContext();
			context.resolverElement = this.element;
		}
		return context;
	},

	/*
	 * Get the node that this element is bound to.
	 */
	getBoundNode: function(nOrdinal) {
		var proxy = this.m_proxy;
		var element = this.element;
		var bindId = element.getAttribute("bind");
		var oRet = {
			model: null,
			node: null,
			resolverElement: this.element
		};
		var i = 0;

		if (!nOrdinal || isNaN(nOrdinal)) {
			nOrdinal = 1;
		}
		/*
	     * If we have a proxy node (and not a proxy expression) then use that.
	     */
		if (proxy && !proxy.m_xpath) {
			if (!this.m_model) {
				this.m_model = this.getEvaluationContext().model;
			}
			return {
				model: this.m_model,
				node: proxy.getNode(),
				resolverElement: this.element
			};
		}

		if (NamespaceManager.getLowerCaseLocalName(element) === "model") {
			return this.getEvaluationContext();
		}

		// Bind has the highest priority - see:
		// http://www.w3.org/TR/2006/REC-xforms-20060314/slice3.html#structure-attrs-single-node
		// http://www.w3.org/TR/2006/REC-xforms-20060314/slice3.html#structure-attrs-nodeset
		if (bindId) {
			if (!this.nodes) {
				var bind = FormsProcessor.getBindObject(bindId, element);
				this.m_model = bind.ownerModel;
				this.nodes = bind.boundNodeSet;
			}
			oRet.model = this.m_model;

			i = nOrdinal - 1;
			if (this.nodes && this.nodes.length > i) {
				oRet.node = this.nodes[i];
			}
			return oRet;
		}

		var ref = element.getAttribute("ref");
		var nodeset = element.getAttribute("nodeset");
		var name = XF4HProcessor.getAttribute(element, "name");

		if ( !(ref || nodeset || name || element.getAttribute("model")) ) return oRet;
		// Get the evaluation context, and save the model value.
		oRet = this.getEvaluationContext();
		// if no model found - this is possible if user reference to a non-existing model
		// not possible after we added the code to create a lazy model by default
		// but we will check for it anyway.
		if(!oRet.model) return oRet;
		
		this.m_model = oRet.model;
		
		if (ref && nOrdinal == 1) {
			var refNode = getFirstNode(this.m_model.EvaluateXPath(ref, oRet));

			if (!refNode && this.m_model.constructingUI) {
				// Lazy authoring,
				// get the default instance
				var instanceDoc = this._getDefaultInstanceDocument(this.m_model);

				if (instanceDoc && instanceDoc.documentElement.getAttribute('isLazilyAuthored')) {
					if (xmlSchemaRules.rules["QName"].validate(ref)) {
						refNode = instanceDoc.createElement(ref);

						if (refNode) {
							instanceDoc.documentElement.appendChild(refNode);
							// Update the evaluation context of the element
							this.m_context = null;
							oRet = this.getEvaluationContext();
						}
						// If we created the node from lazy authoring, we need to verify
						// that it it is actually created properly
						refNode = getFirstNode(this.m_model.EvaluateXPath(ref, oRet));
						// Form controls are considered to be non-relevant if any of the
						// following apply:
						// the Single Node Binding is expressed and resolves to empty nodeset
						// so refNode is null if EvaluateXPath is unresolved.
					} else {
						UX.dispatchEvent(element, "xforms-binding-exception", false, true, true);
					}
				}
			}
			oRet.node = refNode;
		} else if (nodeset) {
			if (!this.nodes) {
				this.nodes = this.m_model.EvaluateXPath(nodeset, oRet).value;
			}
			oRet.node = this.nodes[nOrdinal - 1];
		} else if (name) {
			// Forms-A
			oRet.node = XF4HProcessor.processElement(this.m_model, oRet.node, element, name);
		}
		return oRet;
	},

	_getDefaultInstanceDocument: function(model) {
		var instanceDoc = null;
		var instanceNode = null;
		try {
			// try to get the default instance document,
			// if no default document an exception is throw.
			instanceDoc = model.getInstanceDocument();
			return instanceDoc;
		} catch(e) {}

		var nsURI = "http://www.w3.org/2002/xforms";
		// Create a default instance
		if (UX.isXHTML) {
			var instanceRoot = document.createElementNS("", "instanceData");
			instanceNode = document.createElementNS(nsURI, "instance");
			instanceNode.appendChild(instanceRoot);
		} else {
			var prefix = NamespaceManager.getOutputPrefixesFromURI(nsURI)[0];
			instanceNode = document.createElement(prefix + ":" + "instance");
			instanceNode.innerHTML = "<instanceData xmlns='' ></instanceData>";
		}

		model.element.appendChild(instanceNode);
		if (UX.isIE || !UX.hasDecorationSupport) {
			// Force immediate decoration of instance element for IE and
			// browser that doesn't support decoration
			DECORATOR.attachDecoration(instanceNode, true, true);
		}
		DECORATOR.getBehaviour(instanceNode).m_oDOM.documentElement.setAttribute('isLazilyAuthored', true);
		return model.getInstanceDocument();
	}
	
});
