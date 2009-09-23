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

function Value(elmnt) {
	this.element = elmnt;
	UX.addStyle(this.element, "display", "none");
}

Value.prototype.onContentReady = function () {
	var ownerSelect;
	if (typeof this.element.parentNode.getOwnerSelect === "function") {
		ownerSelect = this.element.parentNode.getOwnerSelect();
		if (ownerSelect) {
			ownerSelect.addItem(this.element.parentNode,this.getValue());
		}
	}
};


Value.prototype.setValue = function (s) {
	var ownerSelect;
	if (typeof this.element.parentNode.getOwnerSelect === "function") {
		ownerSelect = this.element.parentNode.getOwnerSelect()
		if (this.m_sValue !== s) {
			if (ownerSelect) {
			  // When the value of an xf:value element changes, this must be reflected
			  //  in the select or select1 to which it is bound. 
				ownerSelect.removeItem(this.element.parentNode,this.m_sValue);
				this.m_sValue = s;
				ownerSelect.addItem(this.element.parentNode,s);
				ownerSelect.refreshDisplayValue();
			}
		}
	}
};

Value.prototype.getValue = function () {
  if (this.m_sValue === undefined) {
    if (this.element.firstChild && DOM_TEXT_NODE === this.element.firstChild.nodeType) {
  	  this.m_sValue = this.element.firstChild.nodeValue;
  	}
  	else {
  	  this.m_sValue = "";
  	}
  }
  
	return this.m_sValue;
};

function Itemset(elmnt) {
	this.element = elmnt;
	this.element.bindingContainerName = "item";
}

Itemset.prototype = new Repeat();

function Item(elmnt) {
	this.m_value = null;
	this.m_copy = null;
	this.m_bSelected = false;
	this.m_bReady = false;		
	this.m_ownerSelect = null;
	this.element = elmnt;
}


Item.prototype.getOwnerSelect = function () {
	var el, s;
	if (!this.m_ownerSelect) {
		el  = this.element.parentNode;
    //seek through ancestors until the select is found.
		while (el) {
      s = NamespaceManager.getLowerCaseLocalName(el);
	    if (s.indexOf("select") === 0) {
				this.m_ownerSelect = el;
				break;
			}
			el = el.parentNode;
    }
	}
	return this.m_ownerSelect;
};

Item.prototype.getLabel = function () {
  var s;
  
  if (this.m_label) {
    if (this.m_label.getValue) {
      s = this.m_label.getValue();
    }
    else {
      s = this.m_label.innerHTML;
    }
  }
  else {
    s = this.m_value.getValue();
  }
  return s;
};



Item.prototype.findValueElement = function () {
	var coll, i;
	coll = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "value");
	for (i = 0; i < coll.length; ++i) {
		if (coll[i].parentNode === this.element) {
			this.m_value = coll[i];
			break;
		}
	}
	if (!this.m_value) {
		coll = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "copy");
		for (i = 0; i < coll.length; ++i) {
			if (coll[i].parentNode === this.element) {
				this.m_copy = coll[i];
				break;
			}
		}
	}
};

Item.prototype.findLabelElement = function () {
	var coll, i;
	coll = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "label");
	for (i = 0; i < coll.length; ++i) {
		if (coll[i].parentNode === this.element) {
			this.m_label = coll[i];
			break;
		}
	}
	
};

Item.prototype.onContentReady = function () {
  var ownerSelect, pThis;
  this.findValueElement();
	this.findLabelElement();
	this.addVisualRepresentation();

	ownerSelect = this.getOwnerSelect();
	if (ownerSelect) {
		pThis = this;
		ownerSelect.addEventListener("selection-changed", {handleEvent: function (e) {
			pThis.handleEvent(e);
		}}, false);
		
		this.addEventListener(
			"DOMActivate", {
				handleEvent: function (evt) {
					evt.currentTarget.toggleSelectionStatus();
					evt.stopPropagation();
				}
			},
			false
		);
	}
	if (!this.m_bReady) {
		//appear as though deselected.
		this.m_bSelected = false;
		UX.addClassName(this.element, "pc-deselected");
	}
};

Item.prototype.addVisualRepresentation = function () {

};

Item.prototype.handleEvent = function (oEvt) {

	if (oEvt.type === "selection-changed" && oEvt.target === this.getOwnerSelect()) {
		if (oEvt.target.m_undisplayedValues) {
			oEvt.target.m_undisplayedValues = this.array_tryDataselect(oEvt.target.m_undisplayedValues);
		}
		else {
			this.string_tryDataselect(oEvt.newValue);
		}
	}
};

Item.prototype.getValue = function () {
	var value;
	if (this.m_value && this.m_value.getValue) {
	  return this.m_value.getValue();
	} else if (this.m_copy && this.m_copy.getValue) {
		if (this.valueInInstance) {
			value = this.m_copy.getValue();
			if (UX.isEquivalentNode(this.valueInInstance,value)) {
				return this.valueInInstance;
			}
		} else {
			return this.m_copy.getValue();
		}
	}	else {
	  return "";
	}
};

Item.prototype.string_tryDataselect = function (s) {
	if (s !== "" && s === this.getValue()) {
		this.onDataSelect();
		return true;
	}	else {
		this.onDataDeselect();
		return false;			
	}
};

Item.prototype.array_tryDataselect = function (arr) {
	//given an array, search for this value,
	//	if present, 
	var s, i;
	s = this.getValue();
	if (s !== "") {
		for (i = 0;i < arr.length;++i) {
			if (s && (s === arr[i] || (typeof s === "object" && UX.isEquivalentNode(s,arr[i])))) {
				this.valueInInstance = arr[i];
				this.onDataSelect();
				arr.splice(i, 1);
				return arr;
			}
		}
	}
	this.onDataDeselect();
	return arr;
};

Item.prototype.toggleSelectionStatus = function () {
	//switch the selected status first, not last,
	//	else the status may switch fall out-of-phase due to data
	//	oriented status changes;
	var bSelected = !this.m_bSelected;
	if (bSelected) {
		this.onUserSelect();
	}	else {
		this.onUserDeselect();
	}
};

Item.prototype.onUserSelect = function () {
  var oEvt, elmnt;
	oEvt = this.element.ownerDocument.createEvent("Events");
	oEvt.initEvent("fp-select", true, true);
	elmnt = this.element;
	spawn(function () {
	  FormsProcessor.dispatchEvent(elmnt, oEvt);
	});
};

Item.prototype.onUserDeselect = function () {
  var oEvt, elmnt;
	oEvt = this.element.ownerDocument.createEvent("Events");
	oEvt.initEvent("fp-deselect", true, true);
	elmnt = this.element;
	spawn(function () {
	  FormsProcessor.dispatchEvent(elmnt, oEvt);
	});
};

Item.prototype.onDataSelect = function () {
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
};

Item.prototype.onDataDeselect = function () {
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
};
 
