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

var XFormsSelect = new UX.Class({
	
	Mixins: [CommonSelect, ElementWithChoices, XFormsCommonSelect, FiniteControl],
	
	toString: function() {
		return 'xf:select';
	},
	
	initialize: function(element) {
		this.element = element;
		this.multiselect = true;
		this.element.addEventListener("fp-select", this, false);
		this.element.addEventListener("fp-deselect", this, false);
		this.element.addEventListener("xforms-select", this, false);
		this.element.addEventListener("xforms-deselect", this, false);
		this.element.addEventListener("data-value-changed", this, false);
		this.m_values = [];
	},

	useDropBox: function() {
		return this.element.getAttribute("appearance") === "minimal";
	},

	onValueSelected: function(item) {
		var value = (typeof item === "string") ? item : item.getValue();
		var oEvt;
		if (value && typeof value === "object") {
			clone = value.cloneNode(true);
			item.valueInInstance = this.m_proxy.appendChild(value);
			if (item.valueInInstance) {
				this.m_model.flagRebuild();
				doUpdate();
			}
		} else {
			this.m_values.push(value);
			oEvt = this.element.ownerDocument.createEvent("MutationEvents");
			oEvt.initMutationEvent("control-value-changed", false, true, null, "", this.m_values.join(" "), "", 1);
			FormsProcessor.dispatchEvent(this.m_value, oEvt);
		}
	},

	onValueDeselected: function(item) {
		var oEvt, value = item.getValue();
		if (value && typeof value === "object") {
			if (this.m_proxy.removeChild(value)) {
				this.m_model.flagRebuild();
				doUpdate();
				oEvt = this.element.ownerDocument.createEvent("MutationEvents");
				oEvt.initMutationEvent("data-value-changed", false, true, null, "", "", "", 1);
				FormsProcessor.dispatchEvent(this.element, oEvt);
			}
		} else {
			for (i = 0; i < this.m_values.length; ++i) {
				if (value === this.m_values[i]) {
					this.m_values.splice(i, 1);
					oEvt = this.element.ownerDocument.createEvent("MutationEvents");
					oEvt.initMutationEvent("control-value-changed", false, true, null, "", this.m_values.join(" "), "", 1);
					FormsProcessor.dispatchEvent(this.m_value, oEvt);
					break;
				}
			}
		}
	},

	handleEvent: function(oEvt) {
		switch (oEvt.type) {
			case "fp-select":
				this.onValueSelected(oEvt.target);
				oEvt.stopPropagation();
				break;

			case "fp-deselect":
				this.onValueDeselected(oEvt.target);
				break;
			case "data-value-changed":
				this.m_values = oEvt.newValue.split(" ");
				this.onSelectionChanged(oEvt.newValue);
				oEvt.stopPropagation();
				break;
			case "xforms-select":
			case "xforms-deselect":
				oEvt.stopPropagation();
				break;
		}
	},

	onSelectionChanged: function(s) {
		var oEvt1 = this.element.ownerDocument.createEvent("MutationEvents");
		//In a DOM Events compliant environment, only strings are allowed to be values in the mutation event
		//  and it is readonly.  Therefore, it can't be used to transmit the change in array values.
		this.m_undisplayedValues = s.trim().split(" ");
		if (this.element.containsCopyElements()) {
			var children = this.m_proxy.m_oNode.childNodes;
			for (var i = 0, l = children.length; i < l; i++) {
				if (children[i].nodeType !== DOM_TEXT_NODE) {
					this.m_undisplayedValues.push(children[i]);
				}
			}
		}

		oEvt1.initMutationEvent("selection-changed", false, false, null, "", s, "", 1);
		FormsProcessor.dispatchEvent(this.element, oEvt1);
		// If there are values left over, then this control is out of range.
		if (this.m_undisplayedValues.length) {
			this.onOutOfRange();
		} else {
			this.onInRange();
		}
		return;
	},

	onContentReady: function() {
		var element = this.element;
		// First set the default values for the attributes.
		var selection = element.getAttribute("selection");
		if (!selection) {
			selection = "closed";
			element.setAttribute("selection", selection);
		}
		
		var appearance = element.getAttribute("appearance");
		if (!appearance) {
			appearance = (selection === "closed" ? "compact" : "minimal");
			element.setAttribute("appearance", appearance);
		}
		
		// Now set the class names to reflect the attribute settings.
		UX.Element(this.element).addClass("selection-" + selection);
		UX.Element(this.element).addClass("appearance-" + appearance);
	},

	getDisplayValue: function(value) {
		var displayValues = [];
		
		var values = value ? value.trim().split(" ") : [];
		
		for (var i = 0, l = values; i < l; i++) {
			displayValues.push(this.getSingleDisplayValue(values[i]));
		}
		
		return displayValues.join(" ");
	}
	
});

var XFormsSelectValue = XFormsCommonSelectValue;
