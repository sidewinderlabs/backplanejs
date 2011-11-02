/*
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

var XFormsBooleanValue = new UX.Class({
	
	Mixins: [PeValue],
	
	toString: function() {
		return 'xf:boolean-value';
	},
	
	initialize: function(element) {
		this.element = element;
		this.currValue = 'false';
		this.m_bFirstSetValue = true;
	},

	onDocumentReady : function() {
		if (this.element.ownerDocument.media == "print") return;
		var input = document.createElement("input");
		var eventName = "click";
		input.type = "checkbox";

		UX.addClassName(input, "ux-input-checkbox");
		UX.addClassName(this.element, "ux-boolean-value");

		var self = this;
		if (typeof input.addEventListener === 'function') {
			input.addEventListener(eventName, function(e) {
				self.booleanValueChanged(e);
			},
			false);
		} else {
			input.attachEvent("on" + eventName, function(e) {
				self.booleanValueChanged(e);
			});
		}
		this.element.appendChild(input);
		this.m_value = input;
	},

	setValue : function(sValue) {
		var bRet = false;
		if (this.m_value.value != sValue) {
			this.m_value.value = sValue;
			this.currValue = sValue;
			if (sValue === 'true' || sValue === '1') {
				this.m_value.checked = 'checked';
			} else {
				this.m_value.checked = '';
			}
			bRet = true;
		} else if (this.m_bFirstSetValue) {
			bRet = true;
			this.m_bFirstSetValue = false;
		}
		return bRet;
	},

	isTypeAllowed : function(sType) {
		// Data Binding Restrictions: Binds to any xsd:boolean.
		var arrSegments, prefix, localPart, namespace;
		arrSegments = sType.split(":");
		prefix = arrSegments.length === 2 ? arrSegments[0] : "";
		localPart = arrSegments.length === 2 ? arrSegments[1] : "";
		namespace = NamespaceManager.getNamespaceURIForPrefix(prefix);

		return ((namespace === "http://www.w3.org/2001/XMLSchema" || namespace === "http://www.w3.org/2002/xforms") && localPart === "boolean" && !DECORATOR.getBehaviour(this.element.parentNode).isBoundToComplexContent());
	},
	
	booleanValueChanged: function(evt) {
		var oEvt = this.element.ownerDocument.createEvent("MutationEvents");
		if (oEvt.initMutationEvent === undefined) {
			oEvt.initMutationEvent = oEvt.initEvent;
		}
		oEvt.initMutationEvent("control-value-changed", true, true, null, this.currValue, this.m_value.checked ? 'true' : 'false', null, null);
		var self = this;
		spawn(function() {
			FormsProcessor.dispatchEvent(self.element, oEvt);
		});
		evt.cancelBubble = true;
	}
	
});
