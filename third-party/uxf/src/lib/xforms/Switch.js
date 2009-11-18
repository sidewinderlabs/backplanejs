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

/*members _case, childNodes, deselect, element, getAttribute, 
    getElementById, length, nodeType, oCurrentCase, onDocumentReady, 
    ownerDocument, prototype, select, toggle, toggleDefault
*/

/**
  class: Switch
    corresponds to the xforms switch element
*/
function Switch(elmnt) {
	this.element = elmnt;
	this.oCurrentCase = null;
}

Switch.prototype.isSwitch = true;

Switch.prototype.onContentReady = function () {
	FormsProcessor.listenForXFormsFocus(this, this);
};

Switch.prototype.giveFocus = function () {
	return this.oCurrentCase.giveFocus();
};

/**
  function: toggleDefault
  Selects the default case according to the definition here: http://www.w3.org/TR/xforms11/#ui-case

  Called by the xforms processor on document ready.
*/
Switch.prototype.toggleDefault = function () {
	//Prepare to loop through the child nodes of the switch - 
	//	this list may include text nodes, and, if poorly authored, non-case elements.
	var caseColl, caseInHand, candidateDefaultCase, bCaseSelectedBySelectedAttribute, i;
	caseColl = this.element.childNodes;
	caseInHand = null;
	candidateDefaultCase = null;
	bCaseSelectedBySelectedAttribute = false;
	
	for (i = 0 ;i < caseColl.length;++i) {
		if (caseColl[i].select && caseColl[i].deselect) {
			caseInHand = caseColl[i];
      if (!bCaseSelectedBySelectedAttribute && caseColl[i].getAttribute("selected") === "true") {
				//This case is the first to have @selected="true", which trumps simple document-order
				if (candidateDefaultCase !== null) {
					candidateDefaultCase.deselect();
				}
				candidateDefaultCase = caseInHand;
				bCaseSelectedBySelectedAttribute = true;
			} else if (candidateDefaultCase === null) {
				//This is the first case element in the nodelist, store it as a candidate default.
				candidateDefaultCase = caseInHand;
			} else {
				//This is neither the first  case, nor the first case encountered with @selected=true.  
				//therefore, deselect it.
				caseInHand.deselect();
			}
		}
	}
	if (candidateDefaultCase !== null) {
		candidateDefaultCase.select();
		this.oCurrentCase = candidateDefaultCase;
	}
};

/**
  function: toggle
  Toggles the child case with the given id.
  
  sCaseID - string corresponding to a child case
*/
Switch.prototype.toggle = function (sCaseID) {
	var i, oCase;
	for (i = 0; i < this.element.childNodes.length; ++i) {
		if (UX.id(this.element.childNodes[i]) === sCaseID) {
			oCase = this.element.childNodes[i];
			break;
		}
	}

	if (oCase) {
		if (this.oCurrentCase) {
			this.oCurrentCase.deselect();
		}
		this.oCurrentCase = oCase;
		oCase.select();
	}
};

Switch.prototype.getSelectedCase = function () {
	return this.oCurrentCase;
};

Switch.prototype.onDocumentReady = Switch.prototype.toggleDefault;
