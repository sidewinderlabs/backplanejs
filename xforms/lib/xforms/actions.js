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
 
/*global ActionExecutor, document, spawn, FormsProcessor, UX, setTimeout*/
//[TODO]  (issue 10) Now that loading performance is not a concern, break actions.js into one class per file
/**
	Used in conjunction with Conditional Invocation
*/
function ConditionalInvocationListener(obj, funcName) {
	return { realListener: obj,
	  handleEvent: function (evt) {
	    return obj[funcName](evt);
	  }
	};
}

/**
	Event handlers are mandated to be invoked by their "handleEvent" member function, 
	however, XForms provides the possibility for events to be conditionally invoked, 
	or looped. XForms Actions, therefore, implement the "performAction" method, and  
	use DeferToConditionalInvocationProcessor as handleEvent
	
	@param {Event} evt An object reprenting the event that is occuring.
*/
function DeferToConditionalInvocationProcessor(evt) {
	ActionExecutor.invokeListener(ConditionalInvocationListener(this, "performAction"), evt);
}


function Recalculate(elmnt)
{
	this.element = elmnt;
}


Recalculate.prototype.handleEvent = DeferToConditionalInvocationProcessor;

Recalculate.prototype.performAction = function (evt)
{
	var sModelID = this.element.getAttribute("model"),
	oModel = this.element.ownerDocument.getElementById(sModelID);
	oModel.recalculate();
};

function Dispatch(elmnt) {
  this.element = elmnt;
}

Dispatch.prototype.handleEvent = DeferToConditionalInvocationProcessor;

Dispatch.prototype.performAction = function (evt) {
  var sTargetID, oTarget, sName, oEvt, delay_time;
  sTargetID = UX.getPropertyValue(this, "targetid") || UX.getPropertyValue(this, "target");

  if (sTargetID) {
    oTarget = FormsProcessor.getElementById(sTargetID, this.element);

    if (oTarget) {
      sName = UX.getPropertyValue(this, "name");

      if (sName) {
        oEvt = this.element.ownerDocument.createEvent("Events");

        oEvt.initEvent(
            sName,
            UX.JsBooleanFromXsdBoolean(
                UX.getPropertyValue(this, "bubbles"),
                "false"
            ),
            false
        );

        // Copy through the current event depth.

        oEvt._actionDepth = evt._actionDepth;

        delay_time = UX.getPropertyValue(this, "delay");
        if (!delay_time || isNaN(parseInt(delay_time, 10)) || delay_time < 0) {
          delay_time = 0;
        }
        setTimeout(function () { 
          FormsProcessor.dispatchEvent(oTarget, oEvt); 
        }, delay_time);

        // I'm assuming that there is no point in copying the
        // 'new' depth, since it should be the same as the
        // old one...but that might not be true, hence the
        // debugger statement (now changed to throw).

        if (evt._actionDepth !== oEvt._actionDepth) {
          throw "Unexpected Discord between action depths.";
        }
      }
    }
  }
};

function Send(elmnt)
{
	this.element = elmnt;
}

Send.prototype.handleEvent = DeferToConditionalInvocationProcessor;

Send.prototype.performAction = function (evt)
{	
  var sID, oSubmission, oEvt;
	sID = this.element.getAttribute("submission");
	if (sID)
	{
		evt.target.ownerDocument.logger.log("Sending to '" + sID + "'", "submission");

		oSubmission = document.getElementById(sID);

		if (oSubmission)
		{
			oEvt = this.ownerDocument.createEvent("Events");

			oEvt.initEvent("xforms-submit", false, false, null, null);

			/*
				* Copy through the current event depth.
				*/

			oEvt._actionDepth = evt._actionDepth;
			spawn(function () {
			  FormsProcessor.dispatchEvent(oSubmission, oEvt);
			});

			/*
				* I'm assuming that there is no point in copying the
				* 'new' depth, since it should be the same as the
				* old one...but that might not be true, hence the
				* debugger statement (now changed to throw).
				*/

			if (evt._actionDepth !== oEvt._actionDepth) {
				throw "Unexpected Discord between action depths.";
			}
		}
		else {
			throw "There is no submission element with an ID of '" + sID + "'";
		}
	}
	else {
		throw "A submission ID is required.";
	}
};

function Load(elmnt) {
	this.element = elmnt;
}

Load.prototype.handleEvent = DeferToConditionalInvocationProcessor;

Load.prototype.performAction = function (evt) {
	var boundNode = this.element.getBoundNode(1),
	    resource = UX.getPropertyValue(this.element, "resource"),
	    textNode, sTarget, sId;

	if ((boundNode.node && resource) || (!boundNode.node && !resource)) {
		return;
	}

	if (boundNode.node) {
		textNode = getFirstTextNode(boundNode.node);
		if (textNode) {
			resource = textNode.nodeValue;
		} else {
			resource = boundNode.node.nodeValue;
		}
	}

	this.element.setAttribute("xlink:href", resource);

	if (!this.element.Actuate) {
		this.element.setAttribute("xlink:show", this.element.getAttribute("show") || "replace");
		
		sTarget = this.element.getAttribute("target");

		if (sTarget === undefined || sTarget === "") {
			sId = evt.target.id;

			if (sId !== "") {
				this.element.setAttribute("target", sId);
			}
		}
		this.element.attachSingleBehaviour(XLinkElement);
		this.element.handleEvent = DeferToConditionalInvocationProcessor;
	}

	if (this.element.Actuate) {
		this.element.Actuate();
	}
};

function Message(elmnt) {
  this.element = elmnt;
  
  this.element.addEventListener("ub-activate", this, false);
}

Message.prototype.handleEvent = DeferToConditionalInvocationProcessor;

Message.prototype.performAction = function (evt) {
  var sLevel = this.element.getAttribute("level");

	FormsProcessor.refreshDescendents(this.element.childNodes);

	switch (sLevel) {
		case "modeless":
			document.notify.messageWindow(this, false);
			break;

		case "ephemeral":
			document.notify.ephemeral(this.element, evt.activate);
			break;

		case "modal":
			document.notify.messageWindow(this, true);
			break;

		default:
			document.notify.messageWindow(this, true);
			break;
	}
};
