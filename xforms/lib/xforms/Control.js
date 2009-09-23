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
 
 /*global event, document, DOM_TEXT_NODE, NamespaceManager, getProxyNode,
   UX, window, getModelFor, setInitialState, spawn, FormsProcessor,
   setState
   */



function Control(elmnt) {
  this.element = elmnt;
  this.m_MIPSCurrentlyShowing = {};
  this.addedTVCListener = false;
  this.dirtyState = new DirtyState();
}

Control.prototype.giveFocus = function () {
	if (this.m_proxy.enabled.getValue()) {
		if (typeof this.m_value.giveFocus === "function") {
			this.m_value.giveFocus();
		} else {
			this.m_value.focus();
		}

		return true;
	}

	return false;
};

Control.prototype.RetrieveValuePseudoElement = function () {
  var coll, len, i;
  if (!this.m_value) {
    coll = this.element.getElementsByTagName("pe-value");
    len = coll.length;
    for (i = 0; i < len; ++i) {
      if (coll[i].parentNode === this.element) {
        this.m_value = coll[i];
        break;
      }
    }
  }
  return this.m_value;
};

Control.prototype.AddValuePseudoElement = function () {
  var childNodes, i, labelChild, referenceNode, insertionPoint;
  try {
    if (document.media !== "print") {
      // if (this.element.getElementByTagName("pe-value"))
      // debugger;
      this.RetrieveValuePseudoElement();
      // document.logger.log("Attaching: " + this.element.tagName + ":" +
      // this.element.uniqueID, "info");
      if (!this.m_value) {
        childNodes = this.element.childNodes;
        
        if (childNodes) {
          for (i = 0; i < childNodes.length; ++i) {
            if (DOM_TEXT_NODE === childNodes[i].nodeType) {
              this.m_sValue = childNodes[i].nodeValue;
              childNodes[i].parentNode.removeChild(childNodes[i]);
              break;
            }
          }
        }
        // Prepare to insert a value pseudoelement after the label
        labelChild = null;
        
        for (i = 0; i < childNodes.length; ++i) {
          if (NamespaceManager.compareFullName(childNodes[i], "label", "http://www.w3.org/2002/xforms")) {
            labelChild = childNodes[i];
            break;
          }
        }
        referenceNode = null;
        insertionPoint = "";

        // Counterintuitively, insertAdjacentHTML works in Firefox, and
        // createElement in IE.
        // If createElement is used in firefox, the xbl does not bind.
        // If innerHTML is used in IE, it does not interpret <pe-value
        // /> as an element, and inserts "".

        // Should remove document.all test and rework order to
        // if(UX.isFF) ... else
        if (document.all || UX.isWebKit) {
          this.m_value = document.createElement("pe-value");
          // insertBefore will be used to insert the new node, so the
          // referenceNode will be the one after the node we have
          // already decided to be reference.
          // In the absence of a label, the value element should be
          // added as the first child
          // If there are no children, this will be null,
          // insertBefore(newNode, null) is identical to appendChild
          referenceNode = (labelChild) ? 
            labelChild.nextSibling:
            this.element.firstChild;
          this.element.insertBefore(this.m_value, referenceNode);
        } else {
          // ReferenceNode for insertAdjacentHTML must exist, but the
          // insertion point varies,
          // insert after a label, or at the beginning of the parent.
          if (labelChild) {
            referenceNode = labelChild;
            insertionPoint = "afterEnd";
          } else {
            referenceNode = this.element;
            insertionPoint = "afterBegin";
          }
          referenceNode.insertAdjacentHTML(insertionPoint, "<pe-value></pe-value>");
          this.m_value = (labelChild) ? 
            labelChild.nextSibling:
            this.element.firstChild;
        }
        window.status = "";
      }
      this.m_bAddedToModel = false;
      this.addInputEventFilter();
    }
  } catch (e) {
    // debugger;
    // alert(e.description);
  }
};


Control.prototype.addInputEventFilter = function () {
  var pThis, filterKeyPress, filterMouseAction;
  if (this.m_value) {
    pThis = this;
    
    filterKeyPress = function (e) {
      // If there is a proxy and it is a ProxyNode, not a ProxyExpression, then 
      // its readonly value may be true
      if (pThis.m_proxy && pThis.m_proxy.readonly && pThis.m_proxy.readonly.getValue()) {
        //only ignore alphanumeric, delete, backspace, and enter.
        if (e.keyCode !== 9 && //Tab
            !(e.keyCode >= 112 && e.keyCode <= 123) && //Function Keys
            !(e.keyCode >= 33 && e.keyCode <= 36) // page up, page down, home, end
          ) {
          
          if (e.preventDefault) {
            e.preventDefault();
          }

          if (e.stopPropagation) {
            e.stopPropagation();
          }
          
          e.cancelBubble = true;
          
          return false;
        }
      }
      return true;
    };

    filterMouseAction = function (e) {
      // If there is a proxy and it is a ProxyNode, not a ProxyExpression, then 
      // its readonly value may be true
      if (pThis.m_proxy && pThis.m_proxy.readonly && pThis.m_proxy.readonly.getValue()) {

        if (e.preventDefault) {
          e.preventDefault();
        }
        
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        e.cancelBubble = true;
        //left button down normally causes focus.
        //  Don't propagate it, or allow its default action to occur
        //  as this may result in changes (e.g. in range)
        //  instead, simply cause focus to occur.
        if (e.button === 0 && e.type === "mousedown") {
          e.target.focus();
        }
        return false;
      }
      return true;
    };

    if (this.m_value.addEventListener) {
      this.m_value.addEventListener("keydown", filterKeyPress, true);
      this.m_value.addEventListener("mousedown", filterMouseAction, true);
      this.m_value.addEventListener("mousemove", filterMouseAction, true);
      this.m_value.addEventListener("mouseup", filterMouseAction, true);
      this.m_value.addEventListener("onclick", filterMouseAction, true);      
    } else if (this.m_value.attachEvent) {
      this.m_value.attachEvent("onkeydown", filterKeyPress);
      this.m_value.attachEvent("onmousedown", filterMouseAction);
      this.m_value.attachEvent("onmousemove", filterMouseAction);
      this.m_value.attachEvent("onmouseup", filterMouseAction);
      this.m_value.attachEvent("onclick", filterMouseAction);
    }
  }
};

/*
 * Let the model know that we exist.
 */
Control.prototype.addcontroltomodel = function () {
  if (!this.m_bAddedToModel) {
    var oModel = getModelFor(this);

    if (oModel) {
      setInitialState(this);
      oModel.addControl(this);
    }
  } else {
    throw ("Controls should only be added to the model once each.");
  }
};

Control.prototype.rewire = function () {
  // [ISSUE] Would rather define this using mark-up.
  this.AddTVCListener();

  // [ISSUE] This is essentially registering for the rewire and refresh
  // events.
  return this.xrewire();
};

Control.prototype.AddTVCListener = function () {
  // Any implementation of pe-value must provide an event that tells us the
  // data has changed.

  if (!this.addedTVCListener) {
    if (!this.m_value) {
      this.AddValuePseudoElement();
    }

    if (this.m_value.addEventListener) {
      this.m_value.addEventListener("control-value-changed", {
        control : this,
        handleEvent : function (evt) {
          var oEvt = document.createEvent("MutationEvents");
          oEvt.initMutationEvent("target-value-changed", true, true, null, evt.prevValue, evt.newValue, null, null);
          FormsProcessor.dispatchEvent(this.control, oEvt);
        }
      }, false);
      this.addedTVCListener = true;
    }
  }
};

Control.prototype.getValue = function () {
  if (this.m_value.getValue) {
    return this.m_value.getValue();
  } else {
    return this.m_sValue;
  }
};

/*
 * Setting the value on a control actually sets it on the pe-value child.
 */
Control.prototype.setValue = function (sValue) {
  var oldVal, oEvt, pThis, oEvt2;
  oldVal = this.m_sValue;
  this.m_sValue = sValue;
  if (oldVal !== sValue) {
    this.dirtyState.setDirty("value");
  }

  try {
    if (this.m_value && this.m_value.setValue !== undefined) {
      if (this.m_value.setValue(sValue)) {

        // If the value has changed then notify any listeners that the
        // value represented by the control has changed.
        oEvt = document.createEvent("MutationEvents");

        oEvt.initMutationEvent("data-value-changed", false, false,
                null, "", sValue, "", null);
        // FormsProcessor.dispatchEvent(this.element,oEvt);
        oEvt._actionDepth = -1;
        pThis = this;
        spawn(function () {
          FormsProcessor.dispatchEvent(pThis.element, oEvt);
        });
      }
    }

    if (this.dirtyState.isDirty("value")) {
      // value changes, even if there is no pseudoelement.
      oEvt2 = document.createEvent("MutationEvents");
      oEvt2.initMutationEvent("xforms-value-changed", true, false, null,
              oldVal, sValue, "", null);
      FormsProcessor.dispatchEvent(this.element, oEvt2);
    }
  } catch (e) {
    document.logger.log("Control '" + this.element.tagName + "' has no setValue() method.", "control");
  }
  return;
};

Control.prototype.setType = function (sType) {
  var pevalue;

  if (sType !== this.m_type) {
    UX.removeClassName(this.element, this.m_type);

    // [ISSUE] Need to mung the name.
    this.m_type = sType;
    UX.addClassName(this.element, this.m_type);

    // Enforce databinding restrictions.
    pevalue = this.RetrieveValuePseudoElement();
    if (pevalue && typeof pevalue.isTypeAllowed === "function") {
        if (!pevalue.isTypeAllowed(this.m_type)) {
            UX.dispatchEvent(this.m_model, "xforms-binding-exception", true, false, false);
        }
    }
  }
  return;
};

/*
 * [ISSUE] This has evolved a little, and needs a good tidy up. The basic
 * behaviour is to find a proxy node and then connect the control to it. Whether
 * the proxy comes from a @ref or a @bind makes no difference.
 */
Control.prototype.xrewire = function () {
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

  ctxBoundNode = this.getBoundNode(1);
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
    oPN = ctx.model.addControlExpression(this, ctx, sValueExpr);
    bRet = true;
  } else if (ctxBoundNode.node) {
    // If we have a node then we should bind our control to it.
    oPN = getProxyNode(ctxBoundNode.node);

    // Allow the model to register for any changes.
    ctxBoundNode.model.addControlBinding(this);
    bRet = true;
  }

  // Make sure our control knows where its associated proxy is.

  if (oPN) {
    this.m_proxy = oPN;
  } 

  // [TEMP] This cannot be permanently removed until we can tell the
  // difference between:
  // 
  // (a) controls that *should* be bound but aren't, because there is no node;
  // (b) controls that have no binding attributes, such as labels.
  return bRet;
};

Control.prototype.refresh = function () {
  document.logger.log("Refreshing: " + this.element.tagName + ":" + this.element.uniqueID, "control");

  var oProxy = this.element.m_proxy;

  this.updateMIPs();

  if (oProxy) {
    // Get the type of the node and pass the information to the control in
    // case it needs to change its behaviour or appearance.
    this.element.setType(oProxy.getType());

    // Get node value and pass that to the control, too.
    this.element.setValue(oProxy.getValue());
  }

  if (this.dirtyState.isDirty()) {
    this.broadcastMIPs();
    this.dirtyState.setClean();
  }
};

Control.prototype.getValue = function () {
  if (this.m_value.getValue) {
    return this.m_value.getValue();
  } else {
    return this.m_sValue;
  }
};

Control.prototype.onDocumentReady = function () {
  this.addcontroltomodel();

  // Add default handler for xforms-binding-exception
  var oControl = this;
  FormsProcessor.addDefaultEventListener(oControl,
    "xforms-binding-exception", {
      handleEvent : function (evt) {
        // Fatal error: xforms-binding-exception
        // throw error 
        throw "Fatal Error: XForms Binding Exception on " + oControl.element.nodeName + "!";
      }
    }, 
    false
  );
};

Control.prototype.onContentReady = function () {
	this.AddValuePseudoElement();
	FormsProcessor.listenForXFormsFocus(this, this);
};


Control.prototype.isBoundToComplexContent = function () {
    // An element node that has element children is complex content and some
    // controls (eg. input) cannot bind to nodes with complex content.
    var i, boundNode, childNodes;

    boundNode = this.getBoundNode(1).node;
    if (boundNode) {
        childNodes = boundNode.childNodes;
        
        if (childNodes) {
            for (i = 0; i < childNodes.length; i++) {
                if (DOM_ELEMENT_NODE === childNodes[i].nodeType) {
                    return true;
                }
            }
        }
    }
    return false;
};

