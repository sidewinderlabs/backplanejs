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

function MIPHandler(element) {
	this.element = element;
	this.dirtyState = new DirtyState();
	this.m_MIPSCurrentlyShowing = {};
}

MIPHandler.prototype.addcontroltomodel = function () {
	var oModel;
	if (!this.m_bAddedToModel) {
		oModel = getModelFor(this);

		if (oModel) {
			setInitialState(this);
			oModel.addControl(this);
		} else if((this.element.getAttribute("ref") || this.element.getAttribute("nodeset"))) {
			throw("Could not resolve model for MIPHandler");
		}
	} else { // shouldn't be called twice
		throw("Second attempt to add MIPHandler to model as a control.");
	}
};

MIPHandler.prototype.rewire = function () {
	var result = false,
		ctxBoundNode = this.getBoundNode(1);

	this.m_model = ctxBoundNode.model;

	if (ctxBoundNode.node) {
		this.m_proxy = getProxyNode(ctxBoundNode.node);
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
};

MIPHandler.prototype.xrewire = function () {

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
		oPN = getProxyNode(ctxBoundNode.node);

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
};

(function () {
	var isDirtyMIP = function (self, sMIPName) {
		var state = self.getMIPState(sMIPName);
		return self.m_MIPSCurrentlyShowing[sMIPName] === undefined || (state.isSet && self.m_MIPSCurrentlyShowing[sMIPName] !== state.value);
	},

	setDirtyState = function (self, mip) {
		if (isDirtyMIP(self, mip)) {
			self.dirtyState.setDirty(mip);
		}
	},

	setDirtyStates = function (self) {
		setDirtyState(self, "enabled");
		setDirtyState(self, "readonly");
		setDirtyState(self, "required");
		setDirtyState(self, "valid");
	},

	updateMIPs = function (self) {
	 	setDirtyStates(self);
	 	setState(self, "enabled", "enabled", "disabled");
		setState(self, "readonly", "read-only", "read-write");
		setState(self, "required", "required", "optional");
		setState(self, "valid", "valid", "invalid");
	},

	getMIPState = function (self, mip) {
		var retval = {
			isSet: false
		},
			proxyNode;

			proxyNode = FormsProcessor.getProxyNode(self.element);
			if (proxyNode) {
				retval.value = proxyNode.getMIPState(mip);
				retval.isSet = true;
		} else  if (mip === "enabled") {
			retval.value = self.isEnabled();
			retval.isSet = true;
		}

		return retval;
	},

	inheritEnabled = function (self) {
		var parent = self.element.parentNode;
		while (parent) {
			if (parent.isGroup || parent.isSwitch) {
				if (isEnabled(parent) === false) {
					return false;
				}
			} else if (parent.isCase) {
				if (parent.getSwitch() && typeof parent.getSwitch().getSelectedCase === "function" && parent !== parent.getSwitch().getSelectedCase()) {
					return false;
				}
			}

			parent = parent.parentNode;
		}

		return true;
	},

	isEnabled = function (self) {
		var proxyNode, contextNode;

		if (!inheritEnabled(self)) {
			return false;
		}

		if (self.element.isWired === false) {
			// Note that this tests explicitly against false because we don't want
			// the undefined case to enter this condition (the isWired property is
			// set by Container but not by Control, for instance).
			return true;
		}

		proxyNode = FormsProcessor.getProxyNode(self.element);
		if (proxyNode) {
			return proxyNode.enabled.getValue();
		}
		contextNode = FormsProcessor.getContextNode(self.element);
		if (contextNode && contextNode.m_proxy && contextNode.m_proxy.enabled) {
			return contextNode.m_proxy.enabled.getValue();
		}
		return self.mustBeBound() ? false : true;
	};

	MIPHandler.prototype.updateMIPs = function() {
		updateMIPs(this);
	};

	//public exposition of otherwise private functions, to
	//	facilitate testing.
	MIPHandler.prototype.isDirtyMIP = function (mip) {
		return isDirtyMIP(this, mip);
	};

	MIPHandler.prototype.setDirtyState = function (mip) {
		setDirtyState(this, mip);
	};

	MIPHandler.prototype.setDirtyStates = function () {
		setDirtyStates(this);
	};

	MIPHandler.prototype.refresh = function () {
		document.logger.log("Refreshing: " + this.element.tagName + ":" + this.element.uniqueID, "control");

		updateMIPs(this);

		if (this.dirtyState.isDirty()) {
			this.broadcastMIPs();
			this.dirtyState.setClean();
		}
	};

	MIPHandler.prototype.getMIPState = function (mip) {
		return getMIPState(this, mip);
	};

	MIPHandler.prototype.inheritEnabled = function () {
		return inheritEnabled(this);
	};

	MIPHandler.prototype.isEnabled = function () {
		return isEnabled(this);
	};
}());

MIPHandler.prototype.broadcastMIPs = function() {};

MIPHandler.prototype.onDocumentReady = function () {
	this.addcontroltomodel();
};

MIPHandler.prototype.mustBeBound = function () {
	return true;
};
