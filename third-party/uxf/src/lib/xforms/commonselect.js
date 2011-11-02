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

var XFormsCommonSelect = new UX.Class({
	
	toString: function() {
		return 'xf:commonselect';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	giveFocus: function() {
		if (! (this.useDropBox() && this.m_proxy.enabled.getValue()) ) return false;
		
		if (this.m_value && this.m_value !== document.activeElement && !this.m_value.contains(document.activeElement)) {
			if (typeof DECORATOR.getBehaviour(this.m_value).giveFocus === "function") {
				DECORATOR.getBehaviour(this.m_value).giveFocus();
			} else {
				this.m_value.focus();
			}
		}
		return true;
	},

	isOpen: function() {
		return this.element.getAttribute("selection") === "open";
	},

	refreshDisplayValue: function() {
		if (typeof(this.m_value.refreshDisplayValue) == 'function') {
			this.m_value.refreshDisplayValue();
		} else {
			var behaviour = DECORATOR.getBehaviour(this.m_value);
			if (typeof behaviour.refreshDisplayValue == 'function') {
				behaviour.refreshDisplayValue();
			}
		}
	},

	containsCopyElements: function() {
		return NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "copy").length > 0;
	}
	
});

var XFormsCommonSelectValue = new UX.Class({
	
	initialize: function(element) {
		this.element = element;
		this.currValue = "";
		this.m_bFirstSetValue = true;
	},

	onDocumentReady: function() {
		if (this.element.ownerDocument.media == "print") return;
		
		var input = document.createElement('input');
		var select = DECORATOR.getBehaviour(this.element.parentNode);
		var self = this;

		UX.Element(input).addEvent("change", function() {
			self.trySetManuallyEnteredValue(input.value);
		}).addEvent("click", function() {
			select.showChoices();
		});

		if (!DECORATOR.getBehaviour(this.element.parentNode).isOpen()) {
			//ignore the typing of any alphanumeric characters, other than tab,
			//  which should cause focus to move.
			UX.Element(input).addEvent("keypress", function(event) {
				if (event.key != 'tab') event.preventDefault();
			}, true);
		}

		this.element.appendChild(input);
		this.m_value = input;
	},

	giveFocus: function() {
		if (this.m_value) {
			this.m_value.focus();
		} else {
			this.element.focus();
		}
	},

	trySetManuallyEnteredValue: function(value) {
		if (DECORATOR.getBehaviour(this.element.parentNode).isOpen() || DECORATOR.getBehaviour(this.element.parentNode).getDisplayValue(value) !== null) {
			//if the value entered is legitimate, let it in.
			DECORATOR.getBehaviour(this.element.parentNode).onValueSelected(value);
		} else {
			//otherwise, replace it with the current value.
			this.setDisplayValue(this.currValue, true);
		}
	},

	setValue: function(value) {
		if (this.m_sValue !== value || DECORATOR.getBehaviour(this.element.parentNode).containsCopyElements()) {
			this.m_sValue = value;
			this.refreshDisplayValue();
			return true;
		}
		return false;
	},

	refreshDisplayValue: function() {
		var displayValue = DECORATOR.getBehaviour(this.element.parentNode).getDisplayValue(this.m_sValue);
		//Open selections don't go out of range, just display the value as given
		if (displayValue === null && DECORATOR.getBehaviour(this.element.parentNode).isOpen()) {
			displayValue = this.m_sValue;
		}

		return this.setDisplayValue(displayValue);

	},

	setDisplayValue: function(sDisplayValue, bForceRedisplay) {
		var bRet = false;
		if (sDisplayValue === null) {
			DECORATOR.getBehaviour(this.element.parentNode).onOutOfRange();
			sDisplayValue = "";
		} else {
			DECORATOR.getBehaviour(this.element.parentNode).onInRange();
		}

		if (DECORATOR.getBehaviour(this.element.parentNode).useDropBox()) {
			if (bForceRedisplay || this.currValue !== sDisplayValue) {
				this.m_value.value = sDisplayValue;
				this.currValue = sDisplayValue;
				bRet = true;
			} else if (this.m_bFirstSetValue) {
				bRet = true;
				this.m_bFirstSetValue = false;
			}
		} else {
			bRet = true;
		}
		return bRet;
	}

});

var ElementWithChoices = new UX.Class({

	onDocumentReady: function() {
		this.createChoicesPseudoElement();
	},

	createChoicesPseudoElement: function() {
		if(this.m_choices) return;
		var choices = this.element.ownerDocument.createElement("div");
		UX.Element(choices).addClass("pe-choices");
		for (var i = 0; i < this.element.childNodes.length; i++) {
			var child = this.element.childNodes[i];
			var name = NamespaceManager.getLowerCaseLocalName(child);
			switch (name) {
				case "item":
				case "itemset":
				case "choices":
					//shift to pc-choices.
					choices.appendChild(child);
					--i;
					break;
				default:
					//leave in situ
			}
		}
		if (this.useDropBox()) {
			this.choicesBox = new DropBox(this.element, DECORATOR.getBehaviour(this.element).m_value, choices);
		} else {
			this.element.appendChild(choices);
		}
		this.m_choices = choices;
	},

	showChoices: function() {
		if (this.choicesBox) {
			this.choicesBox.show();
		}
	},

	hideChoices: function() {
		if (this.choicesBox) {
			this.choicesBox.hide();
		}
	}
	
});
