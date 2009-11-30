// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity SMIL module adds SMIL support to the Ubiquity library.
//
// Copyright (C) 2008 Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function SmilSet(elmnt)
{
	this.element = elmnt;
	this.m_nRepeatCount = 1; /* not sure what the default is..."indefinite" I think */
	this.m_nRestart = "always";
	this.m_oAnim = null;
	this.m_currentValue;
	this.m_currentValueUnit;
	this.m_sAttribute;
	this.m_sFill;
	this.m_animateLibrary = new Animate();

}

/*
 * The default behaviour for SMIL is to return the element
 * back to its initial values on completion.
 */
 
SmilSet.prototype.endElement = function()
{
	var bRestore = true;

	/*
	 * Set the value we have just animated back to its
	 * initial value.
	 */

	if (this.element.m_sFill)
	{

		switch (this.element.m_sFill)
		{
			case "freeze":
			case "hold":
				bRestore = false;
				break;

			default:
				break;
		}
	}

	/*
	 * Indicate that the animation is no longer 'in progress'
	 * so in some modes it can now be started again.
	 */

	this.element.m_bInprogress = false;

	/*
	 * If we have a count then decrement it.
	 */

	if (this.m_nRepeatCount > 0)
		this.m_nRepeatCount--;

	/*
	 * If we are not yet zero then run again. Note
	 * that this will include that value "-1" which
	 * we use to indicate "indefinite".
	 */

	if (this.m_nRepeatCount)
	{
		this.element.restoreValue();
		this.element.beginElement();
	}
	else if (bRestore)
		this.element.restoreValue();
} 

SmilSet.prototype.restoreValue = function()
{
	YAHOO.util.Dom.setStyle(this.element, this.m_sAttribute, this.m_currentValue);
}

SmilSet.prototype.beginElement = function()
{
	this.m_currentValue	= this.element.getAttribute(this.m_sAttribute);
}

SmilSet.prototype.handleEvent = function(evt)
{
	var sAttr = this.element.getAttribute("attributeName");
	var sTargetElement = this.element.getAttribute("targetElement");
	var sRepeatCount = this.element.getAttribute("repeatCount");
	var sFill = this.element.getAttribute("fill");
	var sTo = this.element.getAttribute("to");
	var nDuration = this.element.getAttribute("dur");
	var nBegin = this.element.getAttribute("begin");

	/*
	 * The repeat count is used to indicate how many
	 * times to run the animation.
	 */

	if (sRepeatCount)
	{
		if (sRepeatCount == "indefinite")
			this.m_nRepeatCount = -1;
		else
			this.m_nRepeatCount = sRepeatCount;
	}

	if (sFill)
		this.element.m_sFill = sFill;

	if (sTo && sTo != undefined && sTo != "")
		attrAnimation = {to: sTo};
	else
	{
		if (sBy && sBy != undefined && sBy != "")
			attrAnimation = {by: sBy};
	}

	/*
	 * Now establish the attribute to be animated.
	 */

	if (sAttr)
	{
		var oAnim;

		if (nDuration==null)
			nDuration = 1;

		/*
		 * Get the element to animate. If none is specified then
		 * use the source of the event.
		 */

		var elTarget;

		if (sTargetElement)
			elTarget = document.getElementById(sTargetElement);
		else
			elTarget = evt.currentTarget;

		/*
		 * Use the appropriate animation object.
		 *
		 * [ISSUE] There is actually an <animateColor> element
		 * in SMIL.
		 */

		if (elTarget)
		{
			this.m_sAttribute = sAttr;
			this.element.beginElement();
			document.logger.log("Setting: " + sAttr + " to " + sTo + ":" + elTarget.id, "evnt");
			try
			{
				this.m_animateLibrary.setStyle(elTarget, sAttr, sTo);
			}
			catch(e)
			{
				debugger;
			}
			var pThis = this;
			function endThisElement()
			{
				pThis.endElement();
			}
			setTimeout(endThisElement,nDuration * 1000);

		}
	}
}

/*SmilSet.prototype.ctor = function()
{
	alert(this.element.banana);
}*/
