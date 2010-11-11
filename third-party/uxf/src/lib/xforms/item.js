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

/*global Repeat, DOM_TEXT_NODE, spawn, UX, NamespaceManager, FormsProcessor*/

var Value = new UX.Class({
	
	Mixins: [MIPHandler, Context, Control, OptionalBinding],
	
	toString: function() {
		return 'xf:value';
	},
	
	initialize: function(element) {
		this.element = element;
		UX.addStyle(this.element, "display", "none");
	},

	onContentReady: function() {
		var ownerSelect;
		if (DECORATOR.getBehaviour(this.element.parentNode).getOwnerSelect) {
			ownerSelect = DECORATOR.getBehaviour(this.element.parentNode).getOwnerSelect();
			if (ownerSelect) {
				DECORATOR.getBehaviour(ownerSelect).addItem(DECORATOR.getBehaviour(this.element.parentNode), this.getValue());
			}
		}
	},

	setValue: function(s) {
		var ownerSelect;
		if (DECORATOR.getBehaviour(this.element.parentNode).getOwnerSelect) {
			ownerSelect = DECORATOR.getBehaviour(this.element.parentNode).getOwnerSelect();
			if (this.m_sValue !== s) {
				if (ownerSelect) {
					// When the value of an xf:value element changes, this must be reflected
					//  in the select or select1 to which it is bound.
					var select = DECORATOR.getBehaviour(ownerSelect);
					select.removeItem(DECORATOR.getBehaviour(this.element.parentNode), this.m_sValue);
					this.m_sValue = s;
					select.addItem(DECORATOR.getBehaviour(this.element.parentNode), s);
					select.refreshDisplayValue();
				}
			}
		} else {
			this.m_sValue = s;
		}
	},

	getValue: function() {
		if (this.m_sValue === undefined) {
			if (this.element.firstChild && DOM_TEXT_NODE === this.element.firstChild.nodeType) {
				this.m_sValue = this.element.firstChild.nodeValue;
			} else {
				this.m_sValue = "";
			}
		}

		return this.m_sValue;
	}
	
});



var Itemset = new UX.Class({
	
	Mixins: [Context, Repeat],
	
	toString: function() {
		return 'xf:itemset';
	},
	
	initialize: function(element) {
		this.element = element;
		this.bindingContainerName = "item";
	}
	
});

//Itemset.prototype = new Repeat();



var Item = new UX.Class({
	
	Mixins: [Context],
	
	toString: function() {
		return 'xf:item';
	},
	
	initialize: function(element) {
		this.m_value = null;
		this.m_copy = null;
		this.m_bSelected = false;
		this.m_bReady = false;
		this.m_ownerSelect = null;
		this.element = element;
	},

	getOwnerSelect: function() {
		if (!this.m_ownerSelect) {
			var el = this.element.parentNode;
			//seek through ancestors until the select is found.
			while (el) {
				var s = NamespaceManager.getLowerCaseLocalName(el);
				if (s.indexOf("select") === 0) {
					this.m_ownerSelect = el;
					break;
				}
				el = el.parentNode;
			}
		}
		return this.m_ownerSelect;
	},

	getLabel: function() {
		var s;
		if (this.m_label) {
			if (DECORATOR.getBehaviour(this.m_label).getValue) {
				s = DECORATOR.getBehaviour(this.m_label).getValue();
			} else {
				s = this.m_label.innerHTML;
			}
		} else {
			s = DECORATOR.getBehaviour(this.m_value).getValue();
		}
		return s;
	},

	findValueElement: function() {
		var coll = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "value");
		for (var i = 0, l = coll.length; i < l; i++) {
			if (coll[i].parentNode === this.element) {
				this.m_value = coll[i];
				break;
			}
		}
		if (!this.m_value) {
			coll = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "copy");
			for (i = 0, l = coll.length; i < l; i++) {
				if (coll[i].parentNode === this.element) {
					this.m_copy = coll[i];
					break;
				}
			}
		}
	},

	findLabelElement: function() {
		var coll = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "label");
		for (var i = 0, l = coll.length; i < l; i++) {
			if (coll[i].parentNode === this.element) {
				this.m_label = coll[i];
				break;
			}
		}
	},

	onContentReady: function() {
		this.findValueElement();
		this.findLabelElement();
		this.addVisualRepresentation();

		var ownerSelect = this.getOwnerSelect();
		if (ownerSelect) {
			var self = this;
			ownerSelect.addEventListener("selection-changed", {
				handleEvent: function(e) {
					self.handleEvent(e);
				}
			},
			false);

			this.element.addEventListener("DOMActivate", {
				handleEvent: function(evt) {
					DECORATOR.getBehaviour(evt.currentTarget).toggleSelectionStatus();
					evt.stopPropagation();
				}
			},
			false);
		}
		if (!this.m_bReady) {
			//appear as though deselected.
			this.m_bSelected = false;
			UX.Element(this.element).addClass("pc-deselected");
		}
	},

	addVisualRepresentation: function() {

	},

	handleEvent: function(oEvt) {

		if (oEvt.type === "selection-changed" && oEvt.target === this.getOwnerSelect()) {
			if (oEvt.target.m_undisplayedValues) {
				oEvt.target.m_undisplayedValues = this.array_tryDataselect(oEvt.target.m_undisplayedValues);
			} else {
				this.string_tryDataselect(oEvt.newValue);
			}
		}
	},

	getValue: function() {
		var value;
		if (this.m_value && DECORATOR.getBehaviour(this.m_value).getValue) {
			return DECORATOR.getBehaviour(this.m_value).getValue();
		} else if (this.m_copy && DECORATOR.getBehaviour(this.m_copy).getValue) {
			if (this.valueInInstance) {
				value = DECORATOR.getBehaviour(this.m_copy).getValue();
				if (UX.isEquivalentNode(this.valueInInstance, value)) {
					return this.valueInInstance;
				}
			} else {
				return DECORATOR.getBehaviour(this.m_copy).getValue();
			}
		} else {
			return "";
		}
	},

	string_tryDataselect: function(s) {
		if (s !== "" && s === this.getValue()) {
			this.onDataSelect();
			return true;
		} else {
			this.onDataDeselect();
			return false;
		}
	},

	array_tryDataselect: function(arr) {
		//given an array, search for this value,
		//	if present,
		var s, i;
		s = this.getValue();
		if (s !== "") {
			for (i = 0; i < arr.length; ++i) {
				if (s && (s === arr[i] || (typeof s === "object" && UX.isEquivalentNode(s, arr[i])))) {
					this.valueInInstance = arr[i];
					this.onDataSelect();
					arr.splice(i, 1);
					return arr;
				}
			}
		}
		this.onDataDeselect();
		return arr;
	},

	toggleSelectionStatus: function() {
		//switch the selected status first, not last,
		//	else the status may switch fall out-of-phase due to data
		//	oriented status changes;
		var bSelected = !this.m_bSelected;
		if (bSelected) {
			this.onUserSelect();
		} else {
			this.onUserDeselect();
		}
	},

	onUserSelect: function() {
		var oEvt = this.element.ownerDocument.createEvent("Events");
		oEvt.initEvent("fp-select", true, true);
		var element = this.element;
		spawn(function() {
			FormsProcessor.dispatchEvent(element, oEvt);
		});
	},

	onUserDeselect: function() {
		var oEvt = this.element.ownerDocument.createEvent("Events");
		oEvt.initEvent("fp-deselect", true, true);
		var element = this.element;
		spawn(function() {
			FormsProcessor.dispatchEvent(element, oEvt);
		});
	},

	onDataSelect: function() {
		var oEvt;
		if (!this.m_bSelected || !this.m_bReady) {
			this.m_bSelected = true;
			UX.removeClassName(this.element, "pc-deselected");
			UX.addClassName(this.element, "pc-selected");
			oEvt = this.element.ownerDocument.createEvent("Events");
			oEvt.initEvent("xforms-select", true, true);
			FormsProcessor.dispatchEvent(this.element, oEvt);
			this.m_bReady = true;
		}
	},

	onDataDeselect: function() {
		var oEvt;
		if (this.m_bSelected) {
			this.m_bSelected = false;
			UX.removeClassName(this.element, "pc-selected");
			UX.addClassName(this.element, "pc-deselected");
			oEvt = this.element.ownerDocument.createEvent("Events");
			oEvt.initEvent("xforms-deselect", true, true);
			FormsProcessor.dispatchEvent(this.element, oEvt);
			this.m_bReady = true;
		}
	}
	
});
