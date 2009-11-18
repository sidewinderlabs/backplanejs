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

function XFormsBooleanValue(elmnt) {
	this.element = elmnt;
	this.currValue = 'false';
	this.m_bFirstSetValue = true;
}

function booleanValueChanged(pThis) {
	var oEvt = pThis.element.ownerDocument.createEvent("MutationEvents");
	if(oEvt.initMutationEvent === undefined) {
		oEvt.initMutationEvent = oEvt.initEvent;
	}
	oEvt.initMutationEvent("control-value-changed", true, true,
		null, pThis.currValue, pThis.m_value.checked ? 'true' : 'false', null, null);

	spawn(function() {
		FormsProcessor.dispatchEvent(pThis.element, oEvt);
	});

}

XFormsBooleanValue.prototype.onDocumentReady = function() {

	if (this.element.ownerDocument.media != "print") {
		var oInput = document.createElement("input");
		var eventName = "click";
		oInput.type = "checkbox";

		UX.addStyle(oInput, "backgroundColor", "transparent");
		UX.addStyle(oInput, "padding", "0");
		UX.addStyle(oInput, "margin", "0");
		UX.addClassName(oInput, "ux-input-checkbox");
		UX.addClassName(this.element, "ux-boolean-value");

		var pThis = this;
		if(typeof oInput.addEventListener === 'function') {
			oInput.addEventListener(eventName, function(e) { booleanValueChanged(pThis); }, false);
		} else {
			oInput.attachEvent("on" + eventName, function(e) { booleanValueChanged(pThis); });
		}

		this.element.appendChild(oInput);
		this.m_value = oInput;
	}

};

XFormsBooleanValue.prototype.setValue = function(sValue) {
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
	} else if(this.m_bFirstSetValue) {
		bRet = true;
		this.m_bFirstSetValue = false;
	}
	return bRet;
};

XFormsBooleanValue.prototype.isTypeAllowed = function(sType) {
	// Data Binding Restrictions: Binds to any xsd:boolean.
	var arrSegments, prefix, localPart, namespace;
	arrSegments = sType.split(":");
	prefix = arrSegments.length === 2 ? arrSegments[0] : "";
	localPart = arrSegments.length === 2 ? arrSegments[1] : "";
	namespace = NamespaceManager.getNamespaceURIForPrefix(prefix);

	return ((namespace === "http://www.w3.org/2001/XMLSchema" || namespace === "http://www.w3.org/2002/xforms") &&
			localPart === "boolean" && !this.parentNode.isBoundToComplexContent());
};
