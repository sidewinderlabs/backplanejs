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
 
function XFormsSelect1(elmnt)
{
	this.element = elmnt;
	this.currentDisplayValue = "";
	this.element.addEventListener("fp-select", this, false);
	this.element.addEventListener("xforms-select", this, false);
	this.element.addEventListener("xforms-deselect", this, false);
	this.element.addEventListener("xforms-value-changed", this, false);
	this.element.addEventListener("data-value-changed", this, false);
	this.m_currentItem = null;
			
	var keypressHandler = {
	  handleEvent: function (o) {
      switch (o.keyCode) {
      case 38 : //up
        elmnt.selectPreviousItem();
        break;
      case 40 : //down
        elmnt.selectNextItem();
  	  }
	  }
	},
	
	wheelHandler = {
    handleEvent: function (o) {
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
	  
	  trapMouseWheel: function () {
      if (UX.isFF) {
        document.addEventListener("DOMMouseScroll", this, true);
      } else if (UX.isIE) {
        document.attachEvent("onmousewheel", wheelHandler.handleScroll);
      } else {
        document.addEventListener("mousewheel", this, true);  	    
      }
      
    }, 	  
	  untrapMouseWheel: function () {
      if (UX.isFF) {
        document.removeEventListener("DOMMouseScroll", this, true);
      } else if (UX.isIE) {
        document.detachEvent("onmousewheel", wheelHandler.handleScroll);
      } else {
        document.removeEventListener("mousewheel", this, true);  	    
      }
	  },
	  
	  handleScroll: function (o) {
	    var wheelDelta = o.wheelDelta;
	    if (typeof wheelDelta === "undefined") {
	      wheelDelta = o.detail;
	    }
	    
	    //Firefox mousewheel movement is reported in the
	    //  opposite direction to everyone else
	    if (UX.isFF) {
	      wheelDelta *= -1;
	    }
	     
	    if (wheelDelta > 0) {
	      elmnt.selectPreviousItem();
	    } else {
	      elmnt.selectNextItem();
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
}

XFormsSelect1.prototype = new CommonSelect();


XFormsSelect1.prototype.handleEvent = function (oEvt)
{
	switch (oEvt.type)
	{
	case "fp-select":
	  this.element.m_currentItem = oEvt.target;
	  this.onValueSelected(oEvt.target.getValue());
		break;
	case "xforms-select":
	case "xforms-deselect":
		oEvt.stopPropagation();
		break;
	case "xforms-value-changed" :
	//This needn't be run inline, and causes stack overflow in IE if it is.
	  var element = this.element;
    spawn(function () {
      element.itemChanged(oEvt);
    });
    break;
	 case "data-value-changed" :
 		this.onSelectionChanged(oEvt.newValue);
		oEvt.stopPropagation();
		break;
	}			
};
	

XFormsSelect1.prototype.getFirstItem = function () {
  return UX.getFirstNodeByName(this.m_choices, "item", "http://www.w3.org/2002/xforms");
};

XFormsSelect1.prototype.selectFirstItem = function () {
  var firstItem = this.getFirstItem();
  if (firstItem !== null) {
    firstItem.onUserSelect();
  }
};

XFormsSelect1.prototype.selectPreviousItem = function () {
  var previousItem;
  if (this.m_currentItem === null) {
    this.selectFirstItem();
  } else {
    previousItem = UX.getPreviousNodeByName(this.m_currentItem, "item", "http://www.w3.org/2002/xforms", this.m_choices);
    if (previousItem !== null) {
      previousItem.onUserSelect();
    }
  }
};

XFormsSelect1.prototype.selectNextItem = function () {
  var nextItem;
  if (this.m_currentItem === null) {
    this.selectFirstItem();
  } else {
    nextItem = UX.getNextNodeByName(this.m_currentItem, "item", "http://www.w3.org/2002/xforms", this.m_choices);
    if (nextItem !== null) {
      nextItem.onUserSelect();
    }
  }
};

XFormsSelect1.prototype.onValueSelected = function (value) {
	var oEvt1;
  this.element.hideChoices();
  if (this.element.currentlySelectedNode !== value){
  	if (this.element.currentlySelectedNode) {
  		this.element.m_proxy.removeChild(this.element.currentlySelectedNode, this.currentlySelectedNode);
  		this.currentlySelectedNode = null;
  	}
  	
	  if (value && typeof value === "object") {
	  	clone = value.cloneNode(true);
			this.currentlySelectedNode = this.element.m_proxy.appendChild(value, this);
			if (this.currentlySelectedNode) {
				oEvt = this.element.ownerDocument.createEvent("MutationEvents");
				oEvt.initMutationEvent("data-value-changed", false, true, null, "", "", "", 1);
				FormsProcessor.dispatchEvent(this.element, oEvt);
				if (this.useDropBox()) {
					this.element.m_value.refreshDisplayValue();
				}
		  	this.element.m_model.flagRebuild();
		  	doUpdate();
	  	}
	  } else {
	    oEvt1 = document.createEvent("MutationEvents");
		  oEvt1.initMutationEvent("control-value-changed", false, true, null, "", value, "", 1);
		  FormsProcessor.dispatchEvent(this.element.m_value, oEvt1);
		}
	}
	
};

XFormsSelect1.prototype.itemChanged = function (oEvt) {
  if (oEvt.target !== this.element) {
    var sNodeName = NamespaceManager.getLowerCaseLocalName(oEvt.target);
    if (sNodeName === "value") {
      this.itemValueChanged(oEvt.target.parentNode, oEvt.prevValue, oEvt.newValue);
    }
  }
};


XFormsSelect1.prototype.onContentReady = function () {
	var s = this.getAttribute("appearance");
	//Set a default appearance of minimal.  This is not mandated,
	//  but a minimal style is typically expected from a select1
	if (!s) {
		s = "minimal";
	}
	UX.addClassName(this, "appearance-" + s);
};


XFormsSelect1.prototype.getDisplayValue = function (sValue) {
	if (this.containsCopyElements()) {
		sValue = this.m_proxy.m_oNode.firstChild;
		while (sValue && sValue.nodeType === DOM_TEXT_NODE) {
		    sValue = sValue.nextSibling;
		}
		this.currentlySelectedNode = sValue;
	}
  return this.getSingleDisplayValue(sValue);
};
  
XFormsSelect1.prototype.onItemAdded = function (item, key) {
  //The new item is the same as the current value,
  //    which could not be displayed when it was set.
  //  Since it can now be set, set it.
  if (!this.isInRange() && key === this.currentDisplayValue && this.m_value.setValue) {
    this.m_value.setValue(key);
  }
};

XFormsSelect1.prototype.onItemRemoved = function (item, key) {
  //The removed item is the same as the current value,
  //  which may no longer be displayable.
  if (this.isInRange() && key === this.currentDisplayValue && this.m_value.setValue) {
    this.m_value.setValue(key);
  } 
};



XFormsSelect1.prototype.useDropBox = function () {
  return (this.element.getAttribute("appearance") === null || this.element.getAttribute("appearance") === "minimal");
};


XFormsSelect1.prototype.onSelectionChanged = function (s) {
	if (this.element.containsCopyElements()) {
		this.element.m_undisplayedValues = [];
		for (i = 0; i < this.element.m_proxy.m_oNode.childNodes.length ;++i) {
			if (this.element.m_proxy.m_oNode.childNodes[i].nodeType !== 3 /*DOM_TEXT_NODE*/) {
				this.element.m_undisplayedValues.push(this.element.m_proxy.m_oNode.childNodes[i]);
			}
		}
	}

	var oEvt1 = this.element.ownerDocument.createEvent("MutationEvents");
	oEvt1.initMutationEvent("selection-changed", false, false, null, "", s, "", 1);
	FormsProcessor.dispatchEvent(this.element, oEvt1);
	return;
};


XFormsSelect1Value = XFormsCommonSelectValue;
