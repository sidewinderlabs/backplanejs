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

/*global document, UX, CommonSelect, spawn, FormsProcessor, NamespaceManager, event, DropBox*/

var XFormsSelect1 = new UX.Class({
	
	Mixins: [CommonSelect, ElementWithChoices, XFormsCommonSelect, FiniteControl],
	
	toString: function() {
		return 'xf:select1';
	},
	
	initialize: function(element) {
		this.element = element;
		this.currentDisplayValue = "";
		this.element.addEventListener("fp-select", this, false);
		this.element.addEventListener("xforms-select", this, false);
		this.element.addEventListener("xforms-deselect", this, false);
		this.element.addEventListener("xforms-value-changed", this, false);
		this.element.addEventListener("data-value-changed", this, false);
		this.m_currentItem = null;

		var keypressHandler = {
			handleEvent: function(o) {
				switch (o.keyCode) {
				case 38:
					//up
					element.selectPreviousItem();
					break;
				case 40:
					//down
					element.selectNextItem();
				}
			}
		};

		var wheelHandler = {
			handleEvent: function(o) {
				switch (o.type) {
					case "focus":
						this.trapMouseWheel();
						break;
					case "blur":
						this.untrapMouseWheel();
						break;
					case "mousewheel":
					case "DOMMouseScroll":
						this.handleScroll(o);
				}
			},

			trapMouseWheel: function() {
				if (UX.isFF) {
					document.addEventListener("DOMMouseScroll", this, true);
				} else if (UX.isIE) {
					document.attachEvent("onmousewheel", wheelHandler.handleScroll);
				} else {
					document.addEventListener("mousewheel", this, true);
				}

			},
			untrapMouseWheel: function() {
				if (UX.isFF) {
					document.removeEventListener("DOMMouseScroll", this, true);
				} else if (UX.isIE) {
					document.detachEvent("onmousewheel", wheelHandler.handleScroll);
				} else {
					document.removeEventListener("mousewheel", this, true);
				}
			},

			handleScroll: function(o) {
				if (element.lastChild.style.visibility == "visible") {
					return true;
				}
				var wheelDelta = o.wheelDelta;
				if (typeof wheelDelta === "undefined") {
					wheelDelta = o.detail;
				}

				//Firefox mousewheel movement is reported in the
				//  opposite direction to everyone else
				if (UX.isFF) {
					wheelDelta *= -1;
				}

				var behaviour = DECORATOR.getBehaviour(element);
				if (wheelDelta > 0) {
					behaviour.selectPreviousItem();
				} else {
					behaviour.selectNextItem();
				}

				if (o.preventDefault) {
					o.preventDefault();
				}
				return false;

			}
		};

		if (UX.isIE) {
			this.element.attachEvent("onkeyup", keypressHandler.handleEvent);
			this.element.attachEvent("onfocusin", wheelHandler.trapMouseWheel);
			this.element.attachEvent("onfocusout", wheelHandler.untrapMouseWheel);

		} else {
			this.element.addEventListener("keyup", keypressHandler, false);
			this.element.addEventListener("focus", wheelHandler, true);
			this.element.addEventListener("blur", wheelHandler, true);
		}
	},

	handleEvent: function(oEvt) {
		switch (oEvt.type) {
			case "fp-select":
				this.m_currentItem = DECORATOR.getBehaviour(oEvt.target);
				this.onValueSelected(this.m_currentItem.getValue());
				break;
			case "xforms-select":
			case "xforms-deselect":
				oEvt.stopPropagation();
				break;
			case "xforms-value-changed":
				//This needn't be run inline, and causes stack overflow in IE if it is.
				var self = this;
				spawn(function() {
					self.itemChanged(oEvt);
				});
				break;
			case "data-value-changed":
				this.onSelectionChanged(oEvt.newValue);
				oEvt.stopPropagation();
			break;
		}
	},

	getFirstItem: function() {
		return DECORATOR.getBehaviour(UX.getFirstNodeByName(this.m_choices, "item", "http://www.w3.org/2002/xforms"));
	},

	selectFirstItem: function() {
		var firstItem = this.getFirstItem();
		if (firstItem !== null) {
			firstItem.onUserSelect();
		}
	},

	selectPreviousItem: function() {
		var previousItem;
		if (this.m_currentItem === null) {
			this.selectFirstItem();
		} else {
			previousItem = DECORATOR.getBehaviour(UX.getPreviousNodeByName(this.m_currentItem, "item", "http://www.w3.org/2002/xforms", this.m_choices));
			if (previousItem !== null) {
				previousItem.onUserSelect();
			}
		}
	},

	selectNextItem: function() {
		var nextItem;
		if (this.m_currentItem === null) {
			this.selectFirstItem();
		} else {
			nextItem = DECORATOR.getBehaviour(UX.getNextNodeByName(this.m_currentItem, "item", "http://www.w3.org/2002/xforms", this.m_choices));
			if (nextItem !== null) {
				nextItem.onUserSelect();
			}
		}
	},

	onValueSelected: function(value) {
		this.hideChoices();
		if (this.currentlySelectedNode !== value) {
			if (this.currentlySelectedNode) {
				this.m_proxy.removeChild(this.currentlySelectedNode);
				this.currentlySelectedNode = null;
			}
			if (value && typeof value === "object") {
				var clone = value.cloneNode(true);
				this.currentlySelectedNode = this.m_proxy.appendChild(value);
				if (this.currentlySelectedNode) {
					var oEvt = this.element.ownerDocument.createEvent("MutationEvents");
					oEvt.initMutationEvent("data-value-changed", false, true, null, "", "", "", 1);
					FormsProcessor.dispatchEvent(this.element, oEvt);
					if (this.useDropBox()) {
						this.m_value.refreshDisplayValue();
					}
					this.m_model.flagRebuild();
					doUpdate();
				}
			} else {
				var oEvt1 = document.createEvent("MutationEvents");
				oEvt1.initMutationEvent("control-value-changed", false, true, null, "", value, "", 1);
				FormsProcessor.dispatchEvent(this.m_value, oEvt1);
			}
		}
	},

	itemChanged: function(oEvt) {
		if (oEvt.target !== this.element) {
			var localName = NamespaceManager.getLowerCaseLocalName(oEvt.target);
			if (localName === "value") {
				this.itemValueChanged(oEvt.target.parentNode, oEvt.prevValue, oEvt.newValue);
			}
		}
	},

	onContentReady: function() {
		//Set a default appearance of minimal.  This is not mandated,
		//  but a minimal style is typically expected from a select1
		var appearance = this.element.getAttribute("appearance") || "minimal";
		UX.Element(this.element).addClass("appearance-" + appearance);
	},

	getDisplayValue: function(value) {
		if (this.containsCopyElements()) {
			value = this.m_proxy.m_oNode.firstChild;
			while (value && value.nodeType === DOM_TEXT_NODE) {
				value = value.nextSibling;
			}
			this.currentlySelectedNode = value;
		}
		return this.getSingleDisplayValue(value);
	},

	onItemAdded: function(item, key) {
		//The new item is the same as the current value,
		//    which could not be displayed when it was set.
		//  Since it can now be set, set it.
		if (!this.isInRange() && key === this.currentDisplayValue && this.m_value.setValue) {
			this.m_value.setValue(key);
		}
	},

	onItemRemoved: function(item, key) {
		//The removed item is the same as the current value,
		//  which may no longer be displayable.
		if (this.isInRange() && key === this.currentDisplayValue && this.m_value.setValue) {
			this.m_value.setValue(key);
		}
	},

	useDropBox: function() {
		return (this.element.getAttribute("appearance") === null || this.element.getAttribute("appearance") === "minimal");
	},

	onSelectionChanged: function(s) {
		if (this.containsCopyElements()) {
			this.m_undisplayedValues = [];
			for (i = 0; i < this.m_proxy.m_oNode.childNodes.length; ++i) {
				if (this.m_proxy.m_oNode.childNodes[i].nodeType !== 3 /*DOM_TEXT_NODE*/) {
					this.m_undisplayedValues.push(this.m_proxy.m_oNode.childNodes[i]);
				}
			}
		}

		var oEvt1 = this.element.ownerDocument.createEvent("MutationEvents");
		oEvt1.initMutationEvent("selection-changed", false, false, null, "", s, "", 1);
		FormsProcessor.dispatchEvent(this.element, oEvt1);
		return;
	}
	
});

var XFormsSelect1Value = XFormsCommonSelectValue;
