/*
 * Copyright (C) 2008 Backplane Ltd.
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

var XFormsInputValue = new UX.Class({
	
	Mixins: [PeValue],
	
	toString: function() {
		return 'xf:input-value';
	},
	
	initialize: function(element) {
		this.element = element;
		this.currValue = "";
		this.m_bFirstSetValue = true;
	},

	getOwnerNodeName: function() {
		return NamespaceManager.getLowerCaseLocalName(this.element.parentNode);
	},

	onDocumentReady: function() {
		if (this.element.ownerDocument.media == "print") return;
		var name = this.getOwnerNodeName();
		var elementType = (name == "textarea") ? "textarea" : "input";
		var input = document.createElement(elementType);
		var eventName = (this.element.parentNode.getAttribute("incremental") === "true") ? "keyup" : "change";

		UX.addStyle(input, "backgroundColor", "transparent");
		UX.addStyle(input, "padding", "0");
		UX.addStyle(input, "margin", "0");
		if (name !== "textarea") {
			UX.addStyle(input, "border", "0");
		}

		var self = this;
		if (input.addEventListener) {
			input.addEventListener(eventName, function(event) {
				self.valueChanged(event);
			},
			false);
		} else {
			input.attachEvent("on" + eventName, function(event) {
				self.valueChanged(event);
			});
		}

		if (name == "secret") {
			input.type = "password";
		} else if (name !== "textarea") {
			input.setAttribute("type", "text");
		}

		this.element.appendChild(input);

		/*
		* [ISSUE] Stick with other method of always
		* 'locating' things just when we need them?
		*/
		this.m_value = input;
		//this.m_value.value = "null value";
	},

	setValue: function(sValue) {
		var bRet = false;
		this.currValue = sValue;
		if (this.m_value.value != sValue) {
			this.m_value.value = sValue;
			bRet = true;
		} else if (this.m_bFirstSetValue) {
			bRet = true;
			this.m_bFirstSetValue = false;
		}
		return bRet;
	},

	isTypeAllowed: function(sType) {
		// Data Binding Restrictions: Binds to any simpleContent (except xsd:base64Binary,
		// xsd:hexBinary or any datatype derived from these).
		var arrSegments, prefix, localPart, namespace;

		arrSegments = sType.split(":");
		prefix = arrSegments.length === 2 ? arrSegments[0] : "";
		localPart = arrSegments.length === 2 ? arrSegments[1] : "";
		namespace = NamespaceManager.getNamespaceURIForPrefix(prefix);

		return ((namespace === "http://www.w3.org/2001/XMLSchema" || namespace === "http://www.w3.org/2002/xforms") && localPart !== "base64Binary" && localPart !== "hexBinary" && !DECORATOR.getBehaviour(this.element.parentNode).isBoundToComplexContent());
	},
	
	valueChanged: function(event) {
		/*
		 * [ISSUE] Not really suitable to use mutation events.
		 */
		var value = UX.isIE ? event.srcElement.value : event.target.value;
		var oEvt = this.element.ownerDocument.createEvent("MutationEvents");
		oEvt.initMutationEvent("control-value-changed", true, true, null, this.currValue, value, null, null);

		var self = this;
		FormsProcessor.dispatchEvent(self.element, oEvt);
		/*
		 * Cancel bubbling but don't cancel the event itself
		 * otherwise we never get the value actually changed.
		 */
		event.cancelBubble = true;
	}

});
