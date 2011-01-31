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

/*global event, document, DOM_TEXT_NODE, NamespaceManager, UX.getProxyNode,
   UX, window, getModelFor, setInitialState, spawn, FormsProcessor,
   setState
   */

var Control = new UX.Class({
	
	toString: function() {
		return 'xf:control';
	},
	
	initialize: function(element) {
		this.element = element;
		this.m_MIPSCurrentlyShowing = {};
		this.addedTVCListener = false;
		this.dirtyState = new DirtyState();
	},

	giveFocus: function() {
		if (this.m_proxy && this.m_proxy.enabled && this.m_proxy.enabled.getValue()) {
			if (DECORATOR.getBehaviour(this.m_value) && DECORATOR.getBehaviour(this.m_value).giveFocus) {
				DECORATOR.getBehaviour(this.m_value).giveFocus();
			} else {
				this.m_value.focus();
			}

			return true;
		}

		return false;
	},

	retrieveValuePseudoElement: function() {
		if(this.m_value) return this.m_value;
		var elements = this.element.getElementsByTagName("pe-value");
		for (var i = 0, l = elements.length; i < l; i++) {
			if (elements[i].parentNode === this.element) {
				this.m_value = elements[i];
				break;
			}
		}
		return this.m_value;
	},

	addValuePseudoElement: function() {
		var i, l;
		if (document.media == "print") return;

		this.retrieveValuePseudoElement();
		if (this.m_value) return;
		var childNodes = this.element.childNodes;
		if (childNodes) {
			for (i = 0, l = childNodes.length; i < l; i++) {
				if (DOM_TEXT_NODE === childNodes[i].nodeType) {
					this.m_sValue = childNodes[i].nodeValue;
					childNodes[i].parentNode.removeChild(childNodes[i]);
					break;
				}
			}
		}
		// Prepare to insert a value pseudoelement after the label
		var labelChild = null;

		for (i = 0, l = childNodes.length; i < l; i++) {
			if (NamespaceManager.compareFullName(childNodes[i], "label", "http://www.w3.org/2002/xforms")) {
				labelChild = childNodes[i];
				break;
			}
		}
		var referenceNode = null;
		var insertionPoint = "";

		// Counterintuitively, insertAdjacentHTML works in Firefox, and
		// createElement in IE.
		// If createElement is used in firefox, the xbl does not bind.
		// If innerHTML is used in IE, it does not interpret <pe-value
		// /> as an element, and inserts "".
		if (UX.isFF) {
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
			this.m_value = (labelChild) ? labelChild.nextSibling : this.element.firstChild;
		} else {
			this.m_value = document.createElement("pe-value");
			// insertBefore will be used to insert the new node, so the
			// referenceNode will be the one after the node we have
			// already decided to be reference.
			// In the absence of a label, the value element should be
			// added as the first child
			// If there are no children, this will be null,
			// insertBefore(newNode, null) is identical to appendChild
			referenceNode = (labelChild) ? labelChild.nextSibling : this.element.firstChild;
			this.element.insertBefore(this.m_value, referenceNode);
		}
		if(UX.isIE) {
			UX.extend(this.m_value, new EventTarget(this.m_value));
			DECORATOR.attachDecoration(this.m_value, true, true);
		}
		this.addInputEventFilter();
	},

	addInputEventFilter: function() {
		if (!this.m_value) return;
		var self = this;

		var filterKeyPress = function(event) {
				// If there is a proxy and it is a ProxyNode, not a ProxyExpression, then 
			// its readonly value may be true
			if (self.m_proxy && self.m_proxy.readonly && self.m_proxy.readonly.getValue()) {
				//only ignore alphanumeric, delete, backspace, and enter.
				if (event.key != 'tab' &&
				! (event.code >= 112 && event.code <= 123) && //Function Keys
				! (event.keyCode >= 33 && event.keyCode <= 36) // page up, page down, home, end
				) {
					event.stop();
					return false;
				}
			}
			return true;
		};

		filterMouseAction = function(event) {
			// If there is a proxy and it is a ProxyNode, not a ProxyExpression, then 
			// its readonly value may be true
			if (self.m_proxy && self.m_proxy.readonly && self.m_proxy.readonly.getValue()) {
				event.stop();
				//left button down normally causes focus.
				//  Don't propagate it, or allow its default action to occur
				//  as this may result in changes (e.g. in range)
				//  instead, simply cause focus to occur.
				if (!event.rightClick && event.type === "mousedown") {
					event.target.focus();
				}
				return false;
			}
			return true;
		};

		UX.Element(this.m_value).addEvents({
			keydown: filterKeyPress,
			mousedown: filterMouseAction,
			mousemove: filterMouseAction,
			mouseup: filterMouseAction,
			click: filterMouseAction
		});
	},

	/*
	 * Let the model know that we exist.
	 */
	addControlToModel: function() {
		var model = getModelFor(this);
		if (model) {
			setInitialState(this);
			model.addControl(this);
		}
	},

	rewire: function() {
		// [ISSUE] Would rather define this using mark-up.
		this.AddTVCListener();

		// [ISSUE] This is essentially registering for the rewire and refresh
		// events.
		return this.xrewire();
	},

	AddTVCListener: function() {
		// Any implementation of pe-value must provide an event that tells us the
		// data has changed.
		if (this.addedTVCListener) return;
		if (!this.m_value) {
			this.addValuePseudoElement();
		}
		var self = this;
		this.m_value.addEventListener("control-value-changed", {
			control: this,
			handleEvent: function(event) {
				if (self.m_proxy && self.m_proxy.m_vertex) {
					self.m_model.changeList.addChange(self.m_proxy.m_vertex);
					self.m_model.m_bNeedRecalculate = true;
				}
				var oEvt = document.createEvent("MutationEvents");
				oEvt.initMutationEvent("target-value-changed", true, true, null, event.prevValue, event.newValue, null, null);
				FormsProcessor.dispatchEvent(self.element, oEvt);
			}
		}, false);
		this.addedTVCListener = true;
	},

	getValue: function() {
		if (DECORATOR.getBehaviour(this.m_value).getValue) {
			return DECORATOR.getBehaviour(this.m_value).getValue();
		} else {
			return this.m_sValue;
		}
	},

/*
	 * Setting the value on a control actually sets it on the pe-value child.
	 */
	setValue: function(value) {
		var oldValue = this.m_sValue;
		if(oldValue == value) return;
		this.m_sValue = value;
		if (oldValue !== value) {
			this.dirtyState.setDirty("value");
		}

		try {
			if (this.m_value && DECORATOR.getBehaviour(this.m_value).setValue) {
				if (DECORATOR.getBehaviour(this.m_value).setValue(value)) {

					// If the value has changed then notify any listeners that the
					// value represented by the control has changed.
					var oEvt = document.createEvent("MutationEvents");

					oEvt.initMutationEvent("data-value-changed", false, false, null, "", value, "", null);
					// FormsProcessor.dispatchEvent(this.element,oEvt);
					oEvt._actionDepth = -1;
					var self = this;
					spawn(function() {
						FormsProcessor.dispatchEvent(self.element, oEvt);
					});
				}
			}

			if (this.dirtyState.isDirty("value")) {
				// value changes, even if there is no pseudoelement.
				var oEvt2 = document.createEvent("MutationEvents");
				oEvt2.initMutationEvent("xforms-value-changed", true, false, null, oldValue, value, "", null);
				FormsProcessor.dispatchEvent(this.element, oEvt2);
			}
		} catch(e) {
			document.logger.log("Control '" + this.element.tagName + "' has no setValue() method.", "control");
		}
		return;
	},

	setType: function(type) {
		if(this.type == type) return;
		
		UX.removeClassName(this.element, this.type);
		
		this.type = type;
		UX.addClassName(this.element, this.type);

		// Enforce databinding restrictions.
		var pevalue = this.retrieveValuePseudoElement();
		if (pevalue && DECORATOR.getBehaviour(pevalue).isTypeAllowed) {
			if (!DECORATOR.getBehaviour(pevalue).isTypeAllowed(this.type)) {
				UX.dispatchEvent(this.m_model, "xforms-binding-exception", true, false, false);
			}
		}
		
	},

	refresh: function() {
		document.logger.log("Refreshing: " + this.element.tagName + ":" + this.element.uniqueID, "control");

		var proxy = this.m_proxy;

		this.updateMIPs();

		if (proxy) {
			// Get the type of the node and pass the information to the control in
			// case it needs to change its behaviour or appearance.
			this.setType(proxy.getType());
			// Get node value and pass that to the control, too.
			this.setValue(proxy.getValue());
		}

		if (this.dirtyState.isDirty()) {
			this.broadcastMIPs();
			this.dirtyState.setClean();
		}
	},

	getValue: function() {
		if (DECORATOR.getBehaviour(this.m_value).getValue) {
			return DECORATOR.getBehaviour(this.m_value).getValue();
		} else {
			return this.m_sValue;
		}
	},

	onDocumentReady: function() {
		this.addControlToModel();

		// Add default handler for xforms-binding-exception
		var element = this.element;
		FormsProcessor.addDefaultEventListener(this, "xforms-binding-exception", {
			handleEvent: function(evt) {
				throw "Fatal Error: XForms Binding Exception on " + element.nodeName + "!";
			}
		}, false);
	},

	onContentReady: function() {
		this.addValuePseudoElement();
		FormsProcessor.listenForXFormsFocus(this, this);
	},

	isBoundToComplexContent: function() {
		// An element node that has element children is complex content and some
		// controls (eg. input) cannot bind to nodes with complex content.
		var boundNode = this.getBoundNode(1).node;
		if (!boundNode) return false;
		
		var childNodes = boundNode.childNodes;
		for (var i = 0, l = childNodes.length; i < l; i++) {
			if (childNodes[i].nodeType == DOM_ELEMENT_NODE) {
				return true;
			}
		}
		return false;
	}
	
});
