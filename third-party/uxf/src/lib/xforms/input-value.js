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

function XFormsInputValue(elmnt)
{
	
  	this.element = elmnt;
  	this.currValue = "";
  	this.m_bFirstSetValue = true;
}

function valueChangedIE(pThis,evt)
{
	/*
	 * [ISSUE] Not really suitable to use mutation events.
	 */

	var oEvt = pThis.element.ownerDocument.createEvent("MutationEvents");
	
	oEvt.initMutationEvent("control-value-changed", true, true,
		null, pThis.currValue, evt.srcElement.value, null, null);

	spawn(function(){FormsProcessor.dispatchEvent(pThis.element,oEvt);});

	/*
	 * Cancel bubbling but don't cancel the event itself
	 * otherwise we never get the value actually changed.
	 */

	 evt.cancelBubble = true;

}

function valueChangedFF(pThis,evt)
{
	/*
	 * [ISSUE] Not really suitable to use mutation events.
	 */
	var oEvt = pThis.element.ownerDocument.createEvent("MutationEvents");
	
	oEvt.initMutationEvent("control-value-changed", true, true,
		null, pThis.currValue, evt.target.value, null, null);

	FormsProcessor.dispatchEvent(pThis.element,oEvt);
	/*
	 * Cancel bubbling but don't cancel the event itself
	 * otherwise we never get the value actually changed.
	 */

	 evt.cancelBubble = true;

}

XFormsInputValue.prototype.getOwnerNodeName  = function()
{
	return NamespaceManager.getLowerCaseLocalName(this.element.parentNode);
};

XFormsInputValue.prototype.onDocumentReady = function()
{
	if (this.element.ownerDocument.media != "print")
	{
		var sTagNameLC = this.getOwnerNodeName();
		var sElementToCreate = (sTagNameLC == "textarea")?"textarea":"input"; 
		var oInput = document.createElement(sElementToCreate);
		var eventName = (this.element.parentNode.getAttribute("incremental") === "true")
			? "keyup"
			: "change";

		UX.addStyle(oInput, "backgroundColor", "transparent");
		UX.addStyle(oInput, "padding", "0");
		UX.addStyle(oInput, "margin", "0");
		if (sTagNameLC !== "textarea") {
			UX.addStyle(oInput, "border", "0");
		}

		var pThis = this;
		if(typeof oInput.addEventListener === 'function') {
			oInput.addEventListener(eventName, function(e) { valueChangedFF(pThis, e); }, false);
		} else {
			oInput.attachEvent("on" + eventName, function(e) {valueChangedIE(pThis, e); });
		}

			
		if(sTagNameLC== "secret")
		{
			oInput.type="password";
		}
		else if(sTagNameLC !== "textarea")
		{
			oInput.setAttribute("type","text");
		}
			
		this.element.appendChild(oInput);

			/*
			* [ISSUE] Stick with other method of always
			* 'locating' things just when we need them?
			*/

		this.m_value = oInput;
		//this.m_value.value = "null value";		

	}
};

XFormsInputValue.prototype.setValue = function(sValue)
{
	var bRet = false;
	if (this.m_value.value != sValue)
	{
		this.m_value.value = sValue;
		this.currValue = sValue;
		bRet = true;
	}
	else if(this.m_bFirstSetValue)
	{
		bRet = true;
		this.m_bFirstSetValue = false;
	}
	return bRet;
};

XFormsInputValue.prototype.isTypeAllowed = function(sType) {
    // Data Binding Restrictions: Binds to any simpleContent (except xsd:base64Binary,
    // xsd:hexBinary or any datatype derived from these).
    var arrSegments, prefix, localPart, namespace;

    arrSegments = sType.split(":");
    prefix = arrSegments.length === 2 ? arrSegments[0] : "";
    localPart = arrSegments.length === 2 ? arrSegments[1] : "";
    namespace = NamespaceManager.getNamespaceURIForPrefix(prefix);

    return ((namespace === "http://www.w3.org/2001/XMLSchema" || namespace === "http://www.w3.org/2002/xforms") &&
            localPart !== "base64Binary" && localPart !== "hexBinary" &&
            !this.parentNode.isBoundToComplexContent());
};
