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
var Switch = new UX.Class({
	
	Mixins: [MIPHandler, MIPEventTarget, Context, OptionalBinding],
	
	toString: function() {
		return 'xf:switch';
	},
	
	initialize: function(element) {
		this.element = element;
		this.oCurrentCase = null;
	},

	isSwitch: true,

	onContentReady: function() {
		FormsProcessor.listenForXFormsFocus(this, this);
	},

	giveFocus: function() {
		return this.oCurrentCase.giveFocus();
	},

	/**
	 function: toggleDefault
	 Selects the default case according to the definition here: http://www.w3.org/TR/xforms11/#ui-case
 
	 Called by the xforms processor on document ready.
	 */
	toggleDefault: function() {
		//Prepare to loop through the child nodes of the switch - 
		//	this list may include text nodes, and, if poorly authored, non-case elements.
		var caseColl = this.element.childNodes;
		var caseInHand = null;
		var candidateDefaultCase = null;
		var bCaseSelectedBySelectedAttribute = false;

		for (var i = 0, l = caseColl.length; i < l; i++) {
			var element = caseColl[i];
			var Case = DECORATOR.getBehaviour(caseColl[i]);
			if (Case && Case.select && Case.deselect) {
				if (!bCaseSelectedBySelectedAttribute && element.getAttribute("selected") === "true") {
					//This case is the first to have @selected="true", which trumps simple document-order
					if (candidateDefaultCase !== null) {
						candidateDefaultCase.deselect();
					}
					candidateDefaultCase = Case;
					bCaseSelectedBySelectedAttribute = true;
				} else if (candidateDefaultCase === null) {
					//This is the first case element in the nodelist, store it as a candidate default.
					candidateDefaultCase = Case;
				} else {
					//This is neither the first  case, nor the first case encountered with @selected=true.  
					//therefore, deselect it.
					Case.deselect();
				}
			}
		}
		if (candidateDefaultCase !== null) {
			candidateDefaultCase.select();
			this.oCurrentCase = candidateDefaultCase;
		}
	},

	/**
	 function: toggle
	 Toggles the child case with the given id.
 
	 sCaseID - string corresponding to a child case
	 */
	toggle: function(sCaseID) {
		var i, oCase;
		for (i = 0; i < this.element.childNodes.length; ++i) {
			if (UX.id(this.element.childNodes[i]) === sCaseID) {
				oCase = DECORATOR.getBehaviour(this.element.childNodes[i]);
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
	},

	getSelectedCase: function() {
		return this.oCurrentCase;
	},

	onDocumentReady: function(){
		this.toggleDefault();
	}
	
});
