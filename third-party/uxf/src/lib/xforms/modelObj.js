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


var Model = new UX.Class({
	
	toString: function() {
		return 'xf:model';
	},

	initialize: function(element){
		this.element = element;
		this.m_bNeedRebuild = false;
		this.m_bNeedRecalculate = false;
		this.m_bNeedRevalidate = false;
		this.m_bNeedRewire = false;
		this.m_bNeedRefresh = false;
		this.m_bReady = false;
		this.elementState = 1;
		this.elementLoaded = false;
		this.m_arrProxyNodes = {};
		this.controls = [];
		this.xformselement = "model";
		this.externalInstances = [];
		this.m_NodesInsertedSinceLastRewire = [];
	},

	onDocumentReady: function() {
		var self = this;
		this.setElementLoaded();
		this._testForReady();

		FormsProcessor.addDefaultEventListenerFor(this.element, "xforms-reset", this, "reset");

		FormsProcessor.addDefaultEventListenerFor(this.element, "xforms-rebuild", this, "_rebuild");
		FormsProcessor.addDefaultEventListenerFor(this.element, "xforms-recalculate", this, "_recalculate");
		FormsProcessor.addDefaultEventListenerFor(this.element, "xforms-revalidate", this, "_revalidate");
		FormsProcessor.addDefaultEventListenerFor(this.element, "xforms-refresh", this, "_refresh");

		if (window.addEventListener) {
			window.addEventListener("beforeunload", {
				handleEvent: function(evt) {
					self.modelDestruct();
				}
			},
			false);
		} else {
			window.attachEvent("onbeforeunload", function() {
				self.modelDestruct();
			});
		}
		this.checkFunctionsAttribute();
	},

	checkFunctionsAttribute: function() {
		var i, evt, functionString = this.element.getAttribute("functions"),
			requiredFunctions = functionString ? functionString.split(" ") : [];
		for (i = 0; i < requiredFunctions.length; ++i) {
			if (typeof window[requiredFunctions[i]] !== "function") {
				evt = document.createEvent("Events");
				evt.initEvent("xforms-compute-exception", true, false);
				evt.context = {
					"error-message": "function '" + requiredFunctions[i] + "' specified in model/@functions is not a function."
				};
				this.dispatchEvent(evt);
			}
		}
	},

	onContentReady: function() {
		return _model_contentReady(this);
	},

	modelConstruct: function() {
		return _modelConstruct(this);
	},

	modelConstructDone: function() {
		this.constructingUI = true;
		this.initialisationLock = 1;
		this.rewire();
		this.constructingUI = false;
		this._refresh();
		this.resumeXFormsReady();
		this.m_bReady = true;
	},

	stopXFormsReady: function() {
		++this.initialisationLock;
	},

	resumeXFormsReady: function() {
		if (!--this.initialisationLock && !this.m_bXFormsReadyFired) {
			this.fireXFormsReady();
		}
	},

	modelDestruct: function() {
		UX.dispatchEvent(this.element, "xforms-model-destruct", false, false, false);
	},

	fireXFormsReady: function() {
		this.m_bXFormsReadyFired = true;
		UX.dispatchEvent(this.element, "xforms-ready", false, false, true);
	},

	replaceInstanceDocument: function(sID, oDom) {
		return _replaceInstanceDocument(this, sID, oDom);
	},

	getInstanceDocument: function(sID) {
		var oRet = null;
		var oInstance = null;

		if (sID && sID !== "") {
			oInstance = DECORATOR.getBehaviour(document.getElementById(sID));
			if (oInstance && oInstance.element.parentNode !== this.element) {
				throw "instance '" + sID + "' is not part of model '" + this.element.getAttribute('id') + "'";
			} else {
				for (var i = 0, l = this.externalInstances.length; i < l; i++) {
					if (this.externalInstances[i].element.getAttribute('id') === sID) {
						oInstance = this.externalInstances[i];
						isExternal = true;
						break;
					}
				}
			}

		} else {
			oInstance = DECORATOR.getBehaviour(NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "instance")[0]);
			if (!oInstance) {
				oInstance = this.externalInstances[0];
				isExternal = true;
			}
		}

		if (!oInstance) {
			throw "No instance found with an ID of '" + sID + "'";
		} else {
			oRet = oInstance.m_oDOM;
		}

		return oRet;
	},


	getEvaluationContext: function() {
		var context = {
			model: this,
			node: null,
			resolverElement: this.element
		};
		var firstInstance = null;
		var instances = this.instances();
		if (instances && instances.length > 0) {
			firstInstance = instances[0];
			var type = typeof(firstInstance.getDocument);

			if (type === "function") {
				var dom = firstInstance.getDocument();
				if (dom) {
					context.node = dom;
					context.node = getFirstNode(this.EvaluateXPath("/*", context));
				}
			}
		}

		return context;
	},

	getBoundNode: function() {
		return this.getEvaluationContext();
	},

	/*
	 * The setValue method allows us to set any node, via an XPath expression. A
	 * convenient shorthand in XForms is that setting a value on an element has the
	 * effect of setting the first text node.
	 */
	setValue: function(oContext, sXPath, sExprValue) {
		var node = getFirstNode(this.EvaluateXPath(sXPath, oContext));
		if(!node) return;
		/*
         * Evaluate the value part. [TODO] It would be easier if we did what we
         * do in fP where we evaluate an expression and also say what 'type' we
         * want from DOM 3 XPath.
         */
		var sValue = getStringValue(this.EvaluateXPath(sExprValue, {
			node: node,
			model: oContext.model,
			resolverElement: oContext.resolverElement
		}));

		/*
         * If there is no proxy node then create one. [Q] Should we now store
         * this? No reason why not, but it will only ever have default values.
         */

		var proxy = UX.getProxyNode(node);

		proxy.setValue(sValue, this);

		/*
         * [ISSUE] This doesn't feel right, but we either have to do this or set
         * the recalculate flag regardless of the vertices, to force things to
         * 'drop through'. This feels the lesser, for now.
         */
		this.flagRefresh();
	},

	/*
	 * The getValue method allows us to retrieve any node, via an XPath expression.
	 * A convenient shorthand in XForms is that requesting the value of an element
	 * has the effect of getting the first text node.
	 */
	getValue: function(sXPath) {
		var oRet = this.EvaluateXPath(sXPath, this.getEvaluationContext());
		return oRet;
	},

	/*
	 * Evaluates an XPath expression, returning a
	 */
	EvaluateXPath: function(xpath, context) {
		if (!context) {// If no context is given, get the default for the model
			context = this.getEvaluationContext();
		} else if (!context.node) {// If only a context node is given, turn it into a context object
			context = {
				node: context
			};
		}
		// If the context object doesn't contain a model or resolver element, add them
		context.model = context.model || this;
		context.resolverElement = context.resolverElement || this.element;
		try {
			var result = xpathDomEval(xpath, context);
		} catch(e) {
			if (context.resolverElement && !FormsProcessor.halted) {
				FormsProcessor.halted = true;
				UX.dispatchEvent(context.resolverElement, "xforms-binding-exception", true, false);
			}
		}
		return result;
	},

	addControl: function(oTarget) {
		/*
	     * Add the control to the list of controls attached to this model.
	     */

		var controls = this.controls;
		var i = controls.length;
		for (i; i--;) {
			if (oTarget === controls[i]) {
				break;
			}
		}
		if (i == -1) {
			controls.push(oTarget);
		}

		if (!this.m_bReady) return;
		if (oTarget && typeof oTarget.element == "object") {
			oTarget.rewire();
			oTarget.refresh();
		}

	},

	/*
	 * Creates a connection between a DOM node and a proxy node.
	 */
	addBindingTemp: function(oContext, sXPath) {
		return _addBindingTemp(this, oContext, sXPath);
	},

	/*
	 * Creates a connection between a form control and a proxy node.
	 */
	addControlBinding: function(oTarget) {
		/*
	     * Register for the change event from the control.
	     */
		oTarget.element.addEventListener("target-value-changed", {
			model: this,
			handleEvent: function(event) {
				var oPN = DECORATOR.getBehaviour(event.target).m_proxy;
				if (oPN) {
					oPN.setValue(event.newValue, this.model);
				}
			}
		},
		false);
		return;
	},

	/*
	 * Creates a connection between a form control and a DOM node, via a proxy node.
	 */
	addControlExpression: function(oTarget, oContext, sXPath) {
		return _addControlExpression(this, oTarget, oContext, sXPath);
	},

	/*
	 * Adds a binding between a DOM node and a vertex.
	 */
	AddSingleNodeBinding: function(oTarget, oContext, sXPath) {
		if (!oContext) {
			oContext = this.getEvaluationContext();
		}
		var oSNE = new SingleNodeExpression(oTarget, sXPath, oContext, this, true);

		return oSNE;
	},

	AddNodesetBinding: function(oTarget, oContext, sXPath) {
		if (!oContext) {
			oContext = this.getEvaluationContext();
		}

		var oNE = new NodesetExpression(oTarget, sXPath, oContext, this, false);
		return oNE;
	},

	/**
	 * Informs the model that a rebuild will be required at next update.
	 */
	flagRebuild: function() {
		this.m_bNeedRebuild = true;
	},

	/**
	 * Informs the model that a recalculate will be required at next update.
	 */
	flagRecalculate: function() {
		this.m_bNeedRecalculate = true;
	},

	/**
	 * Informs the model that a revalidate will be required at next update.
	 */
	flagRevalidate: function() {
		this.m_bNeedRevalidate = true;
	},

	/**
	 * Informs the model that a refresh will be required at next update.
	 */
	flagRefresh: function() {
		this.m_bNeedRefresh = true;
	},

	rebuildPending: function() {
		return this.m_bNeedRebuild;
	},

	recalculatePending: function() {
		return this.m_bNeedRecalculate;
	},

	revalidatePending: function() {
		return this.m_bNeedRevalidate;
	},

	refreshPending: function() {
		return this.m_bNeedRefresh;
	},

	rebuild: function() {
		if (this.m_bNeedRebuild) {
			this.m_bNeedRebuild = false;
			UX.dispatchEvent(this.element, "xforms-rebuild", true, true);
		}
	},

	_rebuild: function() {
		document.logger.log("Start _rebuild: " + this.element.id, "xforms");
		/*
	     * Clear the dependency graph and the change list.
	     */
		this.m_oDE.clear();
		this.changeList.clear();

		if (!FormsProcessor.halted) {
			/*
		     * Clear the dependency graph and the change list.
		     */
			this.m_oDE.clear();
			this.changeList.clear();

			/*
		     * Process the bind statements.
		     */
			var oContext = this.getEvaluationContext();
			processBinds(this, this.element, oContext);
			this.m_bNeedRecalculate = true;
			this.m_bNeedRebuild = false;

		}
		document.logger.log("End _rebuild: " + this.element.id, "xforms");
	},

	recalculate: function() {
		if (this.m_bNeedRecalculate) {
			this.m_bNeedRecalculate = false;
			UX.dispatchEvent(this.element, "xforms-recalculate", true, true);
		}
	},

	_recalculate: function() {
		document.logger.log("Start _recalculate: " + this.element.id, "xforms");
		if (!FormsProcessor.halted) {
			this.m_oDE.recalculate(this.changeList);

			/* these could go into one function */
			this.changeList.clear();
			this.m_bNeedRecalculate = false;
			this.m_bNeedRevalidate = true;
		}
		document.logger.log("End _recalculate: " + this.element.id, "xforms");
	},

	revalidate: function() {
		if (this.m_bNeedRevalidate) {
			this.m_bNeedRevalidate = false;
			UX.dispatchEvent(this.element, "xforms-revalidate", true, true);
		}
	},

	_revalidate: function() {
		document.logger.log("Start _revalidate: " + this.element.id, "xforms");
		if (!FormsProcessor.halted) {

			this.applyChildBindConstraints(this);

			this.m_bNeedRevalidate = false;
			this.m_bNeedRewire = true;
		}
		document.logger.log("End _revalidate: " + this.element.id, "xforms");
	},

/*
	 * We give all of the controls the opportunity to update themselves.
	 */
	rewire: function() {
		document.logger.log("Start rewire: " + this.element.id, "xforms");
		var i, control;

		document.logger.log("About to unwire " + this.controls.length + " controls", "xforms");
		for (i = 0; i < this.controls.length; ++i) {
			control = this.controls[i];
			if (control.m_bAlreadyRewired && !this.rebuilding) continue;
			control.unwire();
		}

		document.logger.log("About to rewire " + this.controls.length + " controls", "xforms");
		for (i = 0; i < this.controls.length; ++i) {
			control = this.controls[i];
			if (control.m_bAlreadyRewired && !this.rebuilding) continue;
			control.rewire();
			control.m_bAlreadyRewired = true;
		}

		this.m_bNeedRewire = false;
		this.m_bNeedRefresh = true;
		this.flagRefresh();
		this.m_NodesInsertedSinceLastRewire = [];
		document.logger.log("End rewire: " + this.element.id, "xforms");
		return;
	},

	refresh: function() {
		if (!FormsProcessor.halted && this.m_bNeedRefresh) {
			this.m_bNeedRefresh = false;
			UX.dispatchEvent(this.element, "xforms-refresh", true, true);
		}
	},

	_refresh: function() {
		document.logger.log("Start _refresh: " + this.element.id, "xforms");
		for (var i = 0; i < this.controls.length; ++i) {
			var control = this.controls[i];
			if (control.m_bAlreadyRefreshed && !this.rebuilding) continue;
			control.refresh();
			control.m_bAlreadyRefreshed = true;
		}
		this.m_bNeedRefresh = false;
		document.logger.log("End _refresh: " + this.element.id, "xforms");
		return;
	},

	deferredUpdate: function() {
		return _deferredUpdate(this);
	},

	addInstance: function(theInstance) {
		this.externalInstances.push(theInstance);
		return this;
	},

	storeInsertedNodes: function(nodes) {
		for (var i = 0, l = nodes.length; i < l; i++) {
			this.m_NodesInsertedSinceLastRewire.unshift(nodes[i]);
		}
	},

	indexOfNewNode: function(nodes) {
		for (var i = 0, l = nodes.length; i < l; i++) {
			for (var j = 0, m = this.m_NodesInsertedSinceLastRewire.length; j < m; j++) {
				if (nodes[i] === this.m_NodesInsertedSinceLastRewire[j]) {
					return i;
				}
			}
		}
		return -1;
	},

	removeInstance: function(theInstance) {
		var i;
		var l = this.externalInstances.length;

		for (i = l; i >= 0; --i) {
			if (this.externalInstances[i] == theInstance) {
				this.externalInstances.splice(i, 1);
			}
		}
		return this;
	},

	/**
	 * @returns the list of instances governed by this model.
	 */
	instances: function() {
		var internalInstances = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "instance");
		var retVal = [];
		for (var i = 0, l = internalInstances.length; i < l; i++) {
			retVal.push(DECORATOR.getBehaviour(internalInstances[i]));
		}
		return retVal.concat(this.externalInstances);
	},

	/**
	 * resets all instance data to its original state.
	 */
	reset: function() {
		document.logger.log("Start reset: " + this.element.id, "xforms");
		if (!FormsProcessor.halted) {
			var instances = this.instances();
			for (var i = 0, l = instances.length; i < l; i++) {
				instances[i].reset();
			}
			this.flagRebuild();
			_deferredUpdate(this);
		}
		document.logger.log("End reset: " + this.element.id, "xforms");
	},

/*
	 * P R I V A T E =============
	 */
	createMIP: function(oVertex, sMIPName, sExpr, oPN, oContext) {
		return _createMIP(this, oVertex, sMIPName, sExpr, oPN, oContext);
	},

	_testForReady: function() {
		testForReady(this);
	},

	setElementLoaded: function() {
		this.elementLoaded = true;
		return;
	},

	applyChildBindConstraints: function(parent) {
		if(parent.element) parent = parent.element;
		for (i = 0, l = parent.childNodes.length; i < l; i++) {
			if (NamespaceManager.compareFullName(parent.childNodes[i], "bind", "http://www.w3.org/2002/xforms")) {
				this.applyBindConstraint(parent.childNodes[i]);
				this.applyChildBindConstraints(parent.childNodes[i]);
			}
		}
	},

	applyBindConstraint: function(bind) {
		if (bind.m_proxy) {
			if (bind.m_proxy.constraint) {
				bind.m_proxy.constraint.update();
			}
			if (bind.m_proxy.required && typeof bind.m_proxy.required.update === "function") {
				bind.m_proxy.required.update();
			}
		}
	}

});
