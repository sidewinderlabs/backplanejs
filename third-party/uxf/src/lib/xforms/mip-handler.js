/*
 * Copyright (c) 2009 Backplane Ltd.
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


var MIPHandler = new UX.Class({
	
	toString: function() {
		return 'xf:mip-handler';
	},
	
	initialize: function(element) {
		this.element = element;
		this.dirtyState = new DirtyState();
		this.m_MIPSCurrentlyShowing = {};
	},

	addControlToModel: function() {
		var model = getModelFor(this);
		if (model) {
			setInitialState(this);
			model.addControl(this);
		} else if ((this.element.getAttribute("ref") || this.element.getAttribute("nodeset"))) {
			throw ("Could not resolve model for MIPHandler");
		}
	},

	rewire: function() {
		var result = false,
			ctxBoundNode = this.getBoundNode(1);

		this.m_model = ctxBoundNode.model;

		if (ctxBoundNode.node) {
			this.m_proxy = UX.getProxyNode(ctxBoundNode.node);
			result = true;
		}

		if (this.isWired === false) {
			// Note that this tests explicitly against false because we don't want
			// the undefined case to enter this condition (the isWired property is
			// set by Container but not by Control, for instance).
			this.isWired = true;
		}
		this.xrewire();
		return result;
	},
	
	xrewire: function() {

		var bRet, ctxBoundNode, oPN, sValueExpr, ctx;

		document.logger.log("Rewiring: " + this.element.tagName + ":" + this.element.uniqueID, "control");
		bRet = false;

		// Get the node this control is bound to (if any), but force the bindings to
		// be reevaluated by clearing any proxy node.
		//
		// [TODO] This might need to be some kind of 'unwire', since we also need to
		// null any cached nodelist.

		if (this.m_proxy) {
			this.m_proxy = null;
		}

		ctxBoundNode = this.getBoundNode();
		oPN = null;

		// [ISSUE] In theory even if the model attribute had changed by now, this
		// would still work. This means that the addControl*() methods could perhaps
		// be some kind of global thing.
		if (ctxBoundNode.model) {
			this.m_model = ctxBoundNode.model;
		}

		// If we have a @value then the 'bound node' will actually be a context
		// node.
		//
		// [TODO] Call getEvaluationContext, instead of using the 'bound node'
		// function, which should really return 'null' if there is no bound node.
		sValueExpr = this.element.getAttribute("value");

		if (sValueExpr) {
			ctx = ctxBoundNode;
			if (!ctxBoundNode.model && !ctxBoundNode.node) {
				ctx = this.getEvaluationContext();
				if (ctx.model) {
					this.m_model = ctx.model;
				}
			}

			bRet = true;
			// Run a check that we haven't already added the control to the model
			if (this.m_proxy && this.m_proxy.m_ctrlProxyTarg && this.m_proxy.m_ctrlProxyTarg.targetControl == this) {
				return bRet;
			}
			oPN = ctx.model.addControlExpression(this, ctx, sValueExpr);
		} else if (ctxBoundNode.node) {
			ctx = ctxBoundNode;
			// If we have a node then we should bind our control to it.
			oPN = UX.getProxyNode(ctxBoundNode.node);

			// Allow the model to register for any changes.
			ctxBoundNode.model.addControlBinding(this);
			bRet = true;
		}

		// Make sure our control knows where its associated proxy is.
		if (oPN) {
			this.m_proxy = oPN;
			var oModel = ctx.model;
			var oContext = ctx;

			// Run a check again to make sure we don't create a duplicate vertexTarget
			if (this.m_proxy.m_ctrlProxyTarg && this.m_proxy.m_ctrlProxyTarg.targetControl == this) {
				return bRet;
			}

			// Create a vertex and associated vertexTarget for the control
			var oPNVTarg = new ControlProxyNodeVertex(this, oContext, oModel, this.m_proxy);
			var oPNV = oModel.m_oDE.createVertex(oPNVTarg);

			this.m_proxy.m_ctrlProxyTarg = oPNVTarg;
			this.m_proxy.m_ctrlVertex = oPNV;

			if (!this.m_proxy.m_vertex) {
				this.m_proxy.m_vertex = oPNV;
			} else if (this.m_proxy.m_vertex.vertexTarget) {
				// If a vertex target already exists, the control is its dependent
				this.m_proxy.m_vertex.addDependent(oPNV);
			}

			// Register computed xpath expressions (for instance in xf:output @value)
			// with the dependency engine
			if (this.m_proxy && this.m_proxy.m_xpath) {
				var sExpr = this.m_proxy.m_xpath;
				var oCPE = new ComputedXPathExpression(oPN, sExpr, oContext, oModel);
				var oCalcVertex = oModel.m_oDE.createVertex(oCPE);
				oCalcVertex.addDependent(oPNV);
				oCPE.addDependentExpressions(oCalcVertex, oModel.m_oDE, oModel.changeList);
			}
			// Add all other dependencies for the control
			oPNVTarg.addDependentProxyNodes();
		}

		return bRet;
	},
	
	setState: function(mip, on, off) {
		//ONLY PERFORM THIS TIME-CONSUMING OPERATION IF IT IS NEEDED!!!!!
		//	We have already established, in formsPlayer, that the switching in-and-out of classNames
		//	 is one of the more time-consuming actions in IE.  So doing it (6 * 4) times  ( == calls in this function * calls to this function)
		//	 on every single control on every single refresh is hardly sensible when we are trying to  produce a more performant version of the AJAX form.  
		//To Reiterate - If we want more performant software, then we must optimise out pointless calls such as this.
		if ( !this.dirtyState || !this.dirtyState.isDirty(mip) ) return this;
		var state = this.getMIPState(mip);
		if (!state || !state.isSet) return this;
		this.m_MIPSCurrentlyShowing[mip] = state.value;
		if (state.value) {
			UX.Element(this.element).removeClass(off).addClass(on);
		} else {
			UX.Element(this.element).removeClass(on).addClass(off);
		}
		return this;
	},

	updateMIPs: function() {
		this.setDirtyStates();
		this.setState("enabled", "enabled", "disabled")
		.setState("readonly", "read-only", "read-write")
		.setState("required", "required", "optional")
		.setState("valid", "valid", "invalid");
	},

	//public exposition of otherwise private functions, to
	//	facilitate testing.
	isDirtyMIP: function(mip) {
		var state = this.getMIPState(mip);
		return this.m_MIPSCurrentlyShowing[mip] === undefined || (state.isSet && this.m_MIPSCurrentlyShowing[mip] !== state.value);
	},

	setDirtyStates: function() {
		this.setDirtyState("enabled").setDirtyState("readonly").setDirtyState("required").setDirtyState("valid");
	},
	
	setDirtyState: function(mip) {
		if (this.isDirtyMIP(mip)) {
			this.dirtyState.setDirty(mip);
		}
		return this;
	},

	refresh: function() {
		document.logger.log("Refreshing: " + this.element.tagName + ":" + this.element.uniqueID, "control");

		this.updateMIPs();

		if (this.dirtyState.isDirty()) {
			this.broadcastMIPs();
			this.dirtyState.setClean();
		}
	},

	getMIPState: function(mip) {
		var state = {
			isSet: false
		};
		var proxyNode = FormsProcessor.getProxyNode(this);
		if (proxyNode) {
			state.value = proxyNode.getMIPState(mip);
			state.isSet = true;
		} else if(mip === "enabled") {
			state.value = this.isEnabled();
			state.isSet = true;
		}
		return state;
	},

	inheritEnabled: function() {
		var parentNode = this.element.parentNode;
		while (parentNode) {
			var parent = DECORATOR.getBehaviour(parentNode);
			if(!parent) {
				parentNode = parentNode.parentNode;
				continue;
			}
			if (parent.isGroup || parent.isSwitch) {
				if (parent.isEnabled() === false) {
					return false;
				}
			} else if (parent.isCase) {
				if (parent.getSwitch() && typeof parent.getSwitch().getSelectedCase === "function" && parent !== parent.getSwitch().getSelectedCase()) {
					return false;
				}
			}
			parentNode = parentNode.parentNode;
		}
		return true;
	},

	isEnabled: function() {
		if (!this.inheritEnabled()) {
			return false;
		}

		if (this.element.isWired === false) {
			return true;
		}

		var proxyNode = FormsProcessor.getProxyNode(this);
		if (proxyNode) {
			return proxyNode.enabled.getValue();
		}
		
		var contextNode = FormsProcessor.getContextNode(this);
		if(contextNode) {
			proxyNode = UX.getProxyNode(contextNode);
			if (proxyNode.enabled) {
				return proxyNode.enabled.getValue();
			}
		}
		return this.mustBeBound() ? false : true;
	},

	broadcastMIPs: function() {
		
	},

	onDocumentReady: function() {
		this.addControlToModel();
	},

	mustBeBound: function() {
		return true;
	}
	
});
