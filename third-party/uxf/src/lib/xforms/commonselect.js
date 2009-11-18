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
 
function XFormsCommonSelect(element) {
	this.element = element;
}


XFormsCommonSelect.prototype.giveFocus = function () {
	if (this.useDropBox()  && this.m_proxy.enabled.getValue()) {
		if (this.m_value && this.m_value !== document.activeElement && !this.m_value.contains(document.activeElement))	{
			if (typeof this.m_value.giveFocus === "function") {
				this.m_value.giveFocus();
			} else {
				this.m_value.focus();
			}
		}

		return true;
	}

	return false;
};

XFormsCommonSelect.prototype.isOpen = function () {
  return this.getAttribute("selection") === "open";
};

XFormsCommonSelect.prototype.refreshDisplayValue = function () {
  if (this.m_value.refreshDisplayValue) {
    this.m_value.refreshDisplayValue();
   }
};

XFormsCommonSelect.prototype.containsCopyElements = function () {
  return NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "copy").length > 0;
};


function XFormsCommonSelectValue(elmnt) {
	this.element = elmnt;
  this.currValue = "";
  this.m_bFirstSetValue = true;
}


XFormsCommonSelectValue.prototype.onDocumentReady = function () {
	if (this.element.ownerDocument.media !== "print") {
		var sElementToCreate = "input",
		oInput = document.createElement(sElementToCreate),
		pSelect = this.parentNode,
		pThis = this;
		
		if (oInput.addEventListener) {
				oInput.addEventListener("change", function (e) {
					pThis.trySetManuallyEnteredValue(oInput.value);
				}, false);
			
				oInput.addEventListener("click", function () {
					pSelect.showChoices();
				}, false);
			
			if (!this.parentNode.isOpen()) {
			//ignore the typing of any alphanumeric characters, other than tab, 
			//  which should cause focus to move. 
				oInput.addEventListener("keypress", function (e) {
					if (e.keyCode !== 9) {
						e.preventDefault();
					}
				}, true);
			}
		}
		else {
			oInput.attachEvent("onchange", function (e) {
				pThis.trySetManuallyEnteredValue(oInput.value);
			});
			
			oInput.attachEvent("onclick", function () {
				pSelect.showChoices();
			});
		
			if (!this.parentNode.isOpen()) {
				//ignore the typing of any alphanumeric characters, other than tab, 
				//  which should cause focus to move. 
				oInput.attachEvent("onkeypress", function (e) {
					if (e.keyCode !== 9) {
						return false;
					}
						return true;
				});
			}
		}
	
		UX.addStyle(oInput, "backgroundColor", "transparent");
		UX.addStyle(oInput, "padding", "0");
		UX.addStyle(oInput, "margin", "0");
		UX.addStyle(oInput, "border", "0");
		
		this.element.appendChild(oInput);   
		this.m_value = oInput;
	}
};

XFormsCommonSelectValue.prototype.giveFocus = function () {
	if(this.m_value) {
		this.m_value.focus();
	} else {
		this.focus();
	}
}

XFormsCommonSelectValue.prototype.trySetManuallyEnteredValue = function (value) {
  if (this.parentNode.isOpen() || this.parentNode.getDisplayValue(value) !== null) {    
    //if the value entered is legitimate, let it in.
    this.parentNode.onValueSelected(value);
  }
  else {
    //otherwise, replace it with the current value.
    this.setDisplayValue(this.currValue, true);
  }
};


XFormsCommonSelectValue.prototype.setValue = function (sValue) {
  if (this.m_sValue !== sValue || this.parentNode.containsCopyElements()) {
		this.m_sValue = sValue;
    this.refreshDisplayValue();
    return true;
  }
  return false;
};

XFormsCommonSelectValue.prototype.refreshDisplayValue = function () {
  var sDisplayValue = this.parentNode.getDisplayValue(this.m_sValue);

  //Open selections don't go out of range, just display the value as given
  if (sDisplayValue === null && this.parentNode.isOpen()) {
    sDisplayValue = this.m_sValue;
  }
  
  return this.setDisplayValue(sDisplayValue);

};

XFormsCommonSelectValue.prototype.setDisplayValue = function (sDisplayValue, bForceRedisplay) {
	var bRet = false;
 
  if (sDisplayValue === null) {
    this.parentNode.onOutOfRange();
    sDisplayValue = "";
  } else {
    this.parentNode.onInRange();
  }
  
  if (this.parentNode.useDropBox()) { 
  	if (bForceRedisplay || this.currValue !== sDisplayValue) {
  	  this.m_value.value = sDisplayValue;
  		this.currValue = sDisplayValue;
  		bRet = true;
  	}	else if (this.m_bFirstSetValue)	{
  		bRet = true;
  		this.m_bFirstSetValue = false;
  	}
  } else {
    bRet = true;
  }
	return bRet;
};


XFormsSelectValue = XFormsCommonSelectValue;
XFormsSelect1Value = XFormsCommonSelectValue;


function ElementWithChoices(){

}

ElementWithChoices.prototype.onDocumentReady = function () {
	this.createChoicesPseudoElement();
};

ElementWithChoices.prototype.createChoicesPseudoElement = function () {
  var oPeChoices, nl, n, s, i;
  if (!this.m_choices) {
		oPeChoices = this.element.ownerDocument.createElement("div");
		UX.addClassName(oPeChoices, "pe-choices");

		nl = this.childNodes;
		for (i = 0;i < nl.length; ++i) {
			n = nl[i];
			s = NamespaceManager.getLowerCaseLocalName(n);
			switch (s) {
			case "item":
			case "itemset":
			case "choices":
				//shift to pc-choices.
				oPeChoices.appendChild(n);
				--i;
				break;
			default:
			//leave in situ
			}
		}
		
		if (this.useDropBox()) {
		  this.choicesBox = new DropBox(this.element, this.element.m_value, oPeChoices);
		} else {
		  this.element.appendChild(oPeChoices);
		}
		
    this.m_choices = oPeChoices;
  }
};

ElementWithChoices.prototype.showChoices = function () {
  if (this.choicesBox) {
    this.choicesBox.show();
  }
};

ElementWithChoices.prototype.hideChoices = function () {
  if (this.choicesBox) {
    this.choicesBox.hide();
  }
};
