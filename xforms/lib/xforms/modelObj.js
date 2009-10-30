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

function Model(elmnt) {
    this.element = elmnt;
    this.m_bNeedRebuild = false;
    this.m_bNeedRecalculate = false;
    this.m_bNeedRevalidate = false;
    this.m_bNeedRewire = false;
    this.m_bNeedRefresh = false;
    this.m_bReady = false;
    this.elementState = 1;
    this.elementLoaded = false;
    this.m_arrProxyNodes = {};
    this.m_arControls = [];
    this.xformselement = "model";
    this.externalInstances = [];
    this.m_NodesInsertedSinceLastRewire = [];
}


Model.prototype.onDocumentReady = function() {
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
            handleEvent : function (evt) {
                self.modelDestruct();
            }
        }, false);
    } else {
        window.attachEvent("onbeforeunload", function () { self.modelDestruct(); });
    }
    this.checkFunctionsAttribute();
};

Model.prototype.checkFunctionsAttribute = function () {
	var i, evt,
		functionString = this.element.getAttribute("functions"),
		requiredFunctions = functionString ? functionString.split(" ") : [];
	for (i = 0; i < requiredFunctions.length; ++i) {
		if (typeof window[requiredFunctions[i]] !== "function") {
			evt = document.createEvent("Events");
			evt.initEvent("xforms-compute-exception", true, false);
			evt.context = {
				"error-message": "function '" + requiredFunctions[i] + "' specified in model/@functions is not a function."
			}
			this.dispatchEvent(evt);
		}
	}
}

Model.prototype.onContentReady = function() {
    return _model_contentReady(this);
};


Model.prototype.modelConstruct = function() {
    return _modelConstruct(this);
};


Model.prototype.modelConstructDone = function() {
    this.constructingUI = true;
    this.initialisationLock = 1;
    this.rewire();
    this.constructingUI = false;
    window.status = "refreshing";
    //  As with the other re... activities (see _modelConstruct), during model construction, 
    //  the work is supposed to be done, without the event being dispatched.
    this._refresh();
    this.resumeXFormsReady();
    this.m_bReady = true;
};

Model.prototype.stopXFormsReady = function () {
	++this.initialisationLock;
}

Model.prototype.resumeXFormsReady = function () {
	if (!--this.initialisationLock && !this.m_bXFormsReadyFired) {
		this.fireXFormsReady();
	}
}

Model.prototype.modelDestruct = function() {
    UX.dispatchEvent(this.element, "xforms-model-destruct", false, false, false);
};

Model.prototype.fireXFormsReady = function() {
  this.m_bXFormsReadyFired = true;
  UX.dispatchEvent(this.element, "xforms-ready", false, false, true);
};


Model.prototype.replaceInstanceDocument = function(sID, oDom) {
    return _replaceInstanceDocument(this, sID, oDom);
};


Model.prototype.getInstanceDocument = function(sID) {
    var oRet = null;
    var oInstance = null;
    var i, l;

    if (sID && sID !== "") {
        oInstance = document.getElementById(sID);
        // it may be an external instance.
        if (oInstance && oInstance.parentNode !== this.element) {
            throw "instance '" + sID + "' is not part of model '"
                    + this.element.getAttribute('id') + "'";
        } else {
            l = this.externalInstances.length;
            for (i = 0; i < l; ++i) {
                if (this.externalInstances[i].element.getAttribute('id') === sID) {
                    oInstance = this.externalInstances[i];
                    isExternal = true;
                    break;
                }
            }
        }

    } else {
        oInstance = NamespaceManager.getElementsByTagNameNS(this.element,
                "http://www.w3.org/2002/xforms", "instance")[0];
        // There may be no real instances, only external ones.
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
};


Model.prototype.getEvaluationContext = function() {
    var oRet = {
        model :this.element,
        node :null,
        resolverElement : this.element
    };
    var oFirstInstance = null;
    var oDom = null;
    var instances = this.instances();
    var sType = null;

    if (instances && instances.length > 0) {
        oFirstInstance = instances[0];        
        
        // We need to check and make sure that the instance
        // has it's behaviour attached, in a Form-a scenario on IE 
        // (might happen in lazy-authoring too)
        // the instance is created dynamically but DOES NOT has the Instance object 
        // properly installed on the DOM element which cause an exception
        // we will need a future fix to resolve the problem which an
        // element is created but behavior not installed for platform does not
        // properly support CSS selector (ex. IE, Webkit).
        sType = typeof(oFirstInstance.getDocument);
        
        if (sType === "function") {        
            oDom = oFirstInstance.getDocument();        
            if (oDom) {
                oRet.node = oDom;
                oRet.node = getFirstNode(this.EvaluateXPath("/*", oRet));
            }
        }
    }
    
    return oRet;
};


Model.prototype.getBoundNode = function() {
    return this.getEvaluationContext();
};

/*
 * The setValue method allows us to set any node, via an XPath expression. A
 * convenient shorthand in XForms is that setting a value on an element has the
 * effect of setting the first text node.
 */
Model.prototype.setValue = function(oContext, sXPath, sExprValue) {
    // this.element.ownerDocument.xformslog.log("Setting '" + sXPath + "' to '"
    // + sValue + "'", "mdl");
    var oNode = getFirstNode(this.EvaluateXPath(sXPath, oContext));

    if (oNode) {
        /*
         * Evaluate the value part. [TODO] It would be easier if we did what we
         * do in fP where we evaluate an expression and also say what 'type' we
         * want from DOM 3 XPath.
         */
        var sValue = getStringValue(this.EvaluateXPath(sExprValue, 
                                                       {
                                                          node: oNode,
                                                          model: oContext.model,
                                                          resolverElement: oContext.resolverElement
                                                       }
                                                      )
                     );

        /*
         * If there is no proxy node then create one. [Q] Should we now store
         * this? No reason why not, but it will only ever have default values.
         */

        var oPN = oNode.m_proxy;

        if (!oPN) {
            oPN = new ProxyNode(oNode);
            oNode.m_proxy = oPN;
        }

        oPN.setValue(sValue, this);

        /*
         * [ISSUE] This doesn't feel right, but we either have to do this or set
         * the recalculate flag regardless of the vertices, to force things to
         * 'drop through'. This feels the lesser, for now.
         */
        this.flagRefresh();
    }
    return;
};


/*
 * The getValue method allows us to retrieve any node, via an XPath expression.
 * A convenient shorthand in XForms is that requesting the value of an element
 * has the effect of getting the first text node.
 */
Model.prototype.getValue = function(sXPath) {
    // this.element.ownerDocument.xformslog.log("Getting '" + sXPath + "'",
    // "mdl");
    var oRet = this.EvaluateXPath(sXPath, this.getEvaluationContext());
    return oRet;
};


/*
 * Evaluates an XPath expression, returning a
 */
Model.prototype.EvaluateXPath = function(sXPath, oContext) {
    return _EvaluateXPath(this, sXPath, oContext);
};


Model.prototype.addControl = function(oTarget) {
    /*
     * Add the control to the list of controls attached to this model.
     */
    this.m_arControls.push(oTarget);

    // var sTemp = oTarget.element.innerHTML;

    // running these inline causes stack overflow, and "taking too long to
    // respond" error messages to appear.
    // oTarget.rewire();
    // oTarget.refresh()

    var oTargetSaved = oTarget;
    if (this.m_bReady) {
        spawn( function() {
            try {
                if (oTargetSaved && typeof oTargetSaved.element == "object") {
                    oTargetSaved.rewire();
                    oTargetSaved.refresh();
                }
            } catch (e) {
                // debugger;
            }
        });
    }
    return;
};


/*
 * Creates a connection between a DOM node and a proxy node.
 */
Model.prototype.addBindingTemp = function(oContext, sXPath) {
    return _addBindingTemp(this, oContext, sXPath);
};


/*
 * Creates a connection between a form control and a proxy node.
 */
Model.prototype.addControlBinding = function(oTarget) {
    /*
     * Register for the change event from the control.
     */

    oTarget.addEventListener("target-value-changed", {
        model :this,
        handleEvent : function(evt) {
            var oPN = evt.target.m_proxy;

            if (oPN) {
                oPN.setValue(evt.newValue, this.model);
            }
        }
    }, false);
    return;
};


/*
 * Creates a connection between a form control and a DOM node, via a proxy node.
 */
Model.prototype.addControlExpression = function(oTarget, oContext, sXPath) {
    return _addControlExpression(this, oTarget, oContext, sXPath);
};


/*
 * Adds a binding between a DOM node and a vertex.
 */
Model.prototype.AddSingleNodeBinding = function(oTarget, oContext, sXPath) {
    if (!oContext) {
        oContext = this.getEvaluationContext();
    }
    var oSNE = new SingleNodeExpression(oTarget, sXPath, oContext, this, true);

    return oSNE;
};


Model.prototype.AddNodesetBinding = function(oTarget, oContext, sXPath) {
    if (!oContext) {
        oContext = this.getEvaluationContext();
    }

    var oNE = new NodesetExpression(oTarget, sXPath, oContext, this, false);
    return oNE;
};


/**
 * Informs the model that a rebuild will be required at next update.
 */
Model.prototype.flagRebuild = function() {
    this.m_bNeedRebuild = true;
};


/**
 * Informs the model that a recalculate will be required at next update.
 */
Model.prototype.flagRecalculate = function() {
    this.m_bNeedRecalculate = true;
};


/**
 * Informs the model that a revalidate will be required at next update.
 */
Model.prototype.flagRevalidate = function() {
    this.m_bNeedRevalidate = true;
};


/**
 * Informs the model that a refresh will be required at next update.
 */
Model.prototype.flagRefresh = function() {
    this.m_bNeedRefresh = true;
};


Model.prototype.rebuildPending = function() {
    return this.m_bNeedRebuild;
};


Model.prototype.recalculatePending = function() {
    return this.m_bNeedRecalculate;
};


Model.prototype.revalidatePending = function() {
    return this.m_bNeedRevalidate;
};


Model.prototype.refreshPending = function() {
    return this.m_bNeedRefresh;
};


Model.prototype.rebuild = function() {
	if (this.m_bNeedRebuild) {
		this.m_bNeedRebuild = false;
		UX.dispatchEvent(this.element, "xforms-rebuild", true, true);
	}
};

Model.prototype._rebuild = function() {
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
};


Model.prototype.recalculate = function() {
	if (this.m_bNeedRecalculate) {
		this.m_bNeedRecalculate = false;
		UX.dispatchEvent(this.element,"xforms-recalculate", true, true);
	}
}

Model.prototype._recalculate = function() {
    if (!FormsProcessor.halted) {
	    this.m_oDE.recalculate(this.changeList);
	
	    /* these could go into one function */
	    this.changeList.clear();
	    this.m_bNeedRecalculate = false;
	    this.m_bNeedRevalidate = true;
	}
};

Model.prototype.revalidate = function() {
	if (this.m_bNeedRevalidate) {
		this.m_bNeedRevalidate = false;
		UX.dispatchEvent(this.element, "xforms-revalidate", true, true);
	}
}

Model.prototype._revalidate = function() {
    if (!FormsProcessor.halted) {

	    this.applyChildBindConstraints(this);

	    this.m_bNeedRevalidate = false;
	    this.m_bNeedRewire = true;
	}
};


/*
 * We give all of the controls the opportunity to update themselves.
 */
Model.prototype.rewire = function() {
    var i, fc;
    for (i = 0; i < this.m_arControls.length; ++i) {
        fc = this.m_arControls[i];

        if (fc && typeof fc.element == "object") {
            fc.unwire();
        } else {
            this.m_arControls.splice(i);
        }
    }

    for (i = 0; i < this.m_arControls.length; ++i) {
        fc = this.m_arControls[i];

        if (fc && typeof fc.element == "object") {
            fc.rewire();
        } else {
            this.m_arControls.splice(i);
        }
    }

    this.m_bNeedRewire = false;
    this.m_bNeedRefresh = true;
    this.flagRefresh();
    this.m_NodesInsertedSinceLastRewire = [];
    return;
};


Model.prototype.refresh = function() {

  if (!FormsProcessor.halted && this.m_bNeedRefresh) {
		this.m_bNeedRefresh = false;
		UX.dispatchEvent(this.element, "xforms-refresh",true , true);
  }
};


Model.prototype._refresh = function() {
    for ( var i = 0; i < this.m_arControls.length; ++i) {
        var fc = this.m_arControls[i];

        if (fc && typeof fc.element == "object") {
            fc.refresh();
        } else {
            this.m_arControls.splice(i);
        }
    }
    this.m_bNeedRefresh = false;
    window.status = "";
    return;
};


Model.prototype.deferredUpdate = function() {
    return _deferredUpdate(this);
};


Model.prototype.addInstance = function(theInstance) {
    this.externalInstances.push(theInstance);
    return this;
};


Model.prototype.storeInsertedNodes = function (nodes) {
	var i;
	for (i = 0; i < nodes.length; ++i) {
		this.m_NodesInsertedSinceLastRewire.unshift(nodes[i]);
	}
}

Model.prototype.indexOfNewNode = function (nodes) {
	var i, j;
	for (i = 0; i < nodes.length; ++i) {
		for (j = 0; j < this.m_NodesInsertedSinceLastRewire.length; ++j) {
			if (nodes[i] === this.m_NodesInsertedSinceLastRewire[j]) {
				return i;
			}
		}
	}
	return -1;
};

Model.prototype.removeInstance = function(theInstance) {
    var i;
    var l = this.externalInstances.length;

    for (i = l; i >= 0; --i) {
        if (this.externalInstances[i] == theInstance) {
            this.externalInstances.splice(i, 1);
            // don't break, in case the instance had been added multiple times.
        }
    }
    return this;
};


/**
 * @returns the list of instances governed by this model.
 */
Model.prototype.instances = function() {
    var internalInstances = NamespaceManager.getElementsByTagNameNS(
            this.element, "http://www.w3.org/2002/xforms", "instance");
    var i;
    var l = internalInstances.length;
    var retVal = [];
    for (i = 0; i < l; ++i) {
        retVal.push(internalInstances[i]);
    }
    return retVal.concat(this.externalInstances);
};


/**
 * resets all instance data to its original state.
 */
Model.prototype.reset = function() {
    if (!FormsProcessor.halted) {
	    var instances = this.instances();
	    var l = instances.length;
	    var i;
	    for (i = 0; i < l; ++i) {
	        instances[i].reset();
	    }
	    this.flagRebuild();
	    _deferredUpdate(this);
	}
};


/*
 * P R I V A T E =============
 */
Model.prototype.createMIP = function(oVertex, sMIPName, sExpr, oPN, oContext) {
    return _createMIP(this, oVertex, sMIPName, sExpr, oPN, oContext);
};


Model.prototype._testForReady = function() {
    testForReady(this);
};


Model.prototype.setElementLoaded = function() {
    this.elementLoaded = true;
    return;
};

Model.prototype.applyChildBindConstraints = function(parent) {
	var i;
	for (i = 0; i < parent.childNodes.length; ++i) {
		if (NamespaceManager.compareFullName(parent.childNodes[i], "bind", "http://www.w3.org/2002/xforms")) {
			this.applyBindConstraint(parent.childNodes[i]);
			this.applyChildBindConstraints(parent.childNodes[i]);
		}
	}
};

Model.prototype.applyBindConstraint = function(bind) {
	if (bind.m_proxy) {
		if (bind.m_proxy.constraint) {
			bind.m_proxy.constraint.update();
		}
		if (bind.m_proxy.required && typeof bind.m_proxy.required.update === "function") {
			bind.m_proxy.required.update();
		}
	}
};
