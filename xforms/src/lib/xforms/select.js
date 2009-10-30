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
 
function XFormsSelect(elmnt) {	
  this.element = elmnt;
  this.multiselect = true;
  this.element.addEventListener("fp-select", this, false);
  this.element.addEventListener("fp-deselect", this, false);
  this.element.addEventListener("xforms-select", this, false);
  this.element.addEventListener("xforms-deselect", this, false);
  this.element.addEventListener("data-value-changed", this, false);
  this.m_values = [];
}

XFormsSelect.prototype = new CommonSelect();

XFormsSelect.prototype.useDropBox = function () {
  return this.element.getAttribute("appearance") === "minimal";
};


XFormsSelect.prototype.onValueSelected = function (item) {
	var value = (typeof item === "string") ? item : item.getValue();
	var oEvt;
	if (value && typeof value === "object") {
		clone = value.cloneNode(true);
		item.valueInInstance = this.element.m_proxy.appendChild(value, this);
		if (item.valueInInstance) {
			this.element.m_model.flagRebuild();
			doUpdate();
		}
	} else {
		this.m_values.push(value);
		oEvt = this.element.ownerDocument.createEvent("MutationEvents");
		oEvt.initMutationEvent("control-value-changed", false, true, null, "", this.m_values.join(" "), "", 1);
		FormsProcessor.dispatchEvent(this.element.m_value, oEvt);
	}
};

XFormsSelect.prototype.onValueDeselected = function (item) {
	var oEvt, value = item.getValue();
	if (value && typeof value === "object") {
		if (this.element.m_proxy.removeChild(value, this)) {
		  	this.element.m_model.flagRebuild();
		  	doUpdate();
			oEvt = this.element.ownerDocument.createEvent("MutationEvents");
			oEvt.initMutationEvent("data-value-changed", false, true, null, "", "", "", 1);
			FormsProcessor.dispatchEvent(this.element, oEvt);
		}
	} else {
		for (i = 0;i < this.m_values.length;++i) {
			if (value === this.m_values[i]) {
				this.m_values.splice(i, 1);
				oEvt = this.element.ownerDocument.createEvent("MutationEvents");
				oEvt.initMutationEvent("control-value-changed", false, true, null, "", this.m_values.join(" "), "", 1);
				FormsProcessor.dispatchEvent(this.element.m_value, oEvt);
				break;
			}
		}
	}
};

XFormsSelect.prototype.handleEvent = function (oEvt) {
	var oEvt, s, i;
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
};

XFormsSelect.prototype.onSelectionChanged = function (s) {
	var i, oEvt1 = this.element.ownerDocument.createEvent("MutationEvents");
	//In a DOM Events compliant environment, only strings are allowed to be values in the mutation event
	//  and it is readonly.  Therefore, it can't be used to transmit the change in array values.
	this.element.m_undisplayedValues = s.trim().split(" ");
	if (this.element.containsCopyElements()) {
		for (i = 0; i < this.element.m_proxy.m_oNode.childNodes.length ;++i) {
			if (this.element.m_proxy.m_oNode.childNodes[i].nodeType !== DOM_TEXT_NODE) {
				this.element.m_undisplayedValues.push(this.element.m_proxy.m_oNode.childNodes[i]);
			}
		}
	}
	
	oEvt1.initMutationEvent("selection-changed", false, false, null, "", s, "", 1);
	FormsProcessor.dispatchEvent(this.element, oEvt1);
  // If there are values left over, then this control is out of range.
	if (this.element.m_undisplayedValues.length) {
	  this.element.onOutOfRange();
	} else { 
	  this.element.onInRange();
	}
	return;
};


XFormsSelect.prototype.onContentReady = function () {
	// First set the default values for the attributes.
	//
	var
		el = this.element,
		selection = el.getAttribute("selection"),
		appearance = el.getAttribute("appearance")
		;

	if (!selection) {
		selection = "closed";
		el.setAttribute("selection", selection);
	}

	if (!appearance) {
		appearance = (selection === "closed" ? "compact" : "minimal");
		el.setAttribute("appearance", appearance);
	}

	// Now set the class names to reflect the attribute settings.
	//
	UX.addClassName(this, "selection-" + selection);
	UX.addClassName(this, "appearance-" + appearance);
};

XFormsSelect.prototype.getDisplayValue = function (sValue) {
	var i, l,  arrDisplayValues = [], arrValues;
	arrValues = sValue? sValue.trim().split(" "): [];
	l = arrValues.length;
	for (i = 0 ; i < l ;++i) {
		arrDisplayValues.push(this.getSingleDisplayValue(arrValues[i]));
	}
	return arrDisplayValues.join(" ");
};

XFormsSelectValue = XFormsCommonSelectValue;
