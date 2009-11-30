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

function SmilAnimate(elmnt) {
	this.element = elmnt;
	this.m_nRepeatCount = 1; /* not sure what the default is..."indefinite" I think */
	this.m_nRestart = "always";
	this.m_oAnim = null;
	this.m_currentValue;
	this.m_currentValueUnit;
	this.m_sAttribute;
	this.m_animateLibrary = new Animate();
}

/*
 * The default behaviour for SMIL is to return the element
 * back to its initial values on completion.
 */
 
SmilAnimate.prototype.endElement = function() {
  return;
} 

SmilAnimate.prototype.restoreValue = function() {
	this.m_oAnim.setAttribute(
		this.m_sAttribute,
		this.m_currentValue,
		this.m_currentValueUnit
	);
	return;
}

SmilAnimate.prototype.beginElement = function() {
  return;
}

SmilAnimate.prototype.handleEvent = function(evt) {
	var sAttr = this.element.getAttribute("attributeName");
	var sTargetElement = this.element.getAttribute("targetElement");
	var sRepeatCount = this.element.getAttribute("repeatCount");
	var sRestart = this.element.getAttribute("restart");
	var sFill = this.element.getAttribute("fill");
	var sFrom = this.element.getAttribute("from");
	var sTo = this.element.getAttribute("to");
	var sBy = this.element.getAttribute("by");
	var nDuration = this.element.getAttribute("dur");
	var attrAnimation = { };

	/*
	 * The repeat count is used to indicate how many
	 * times to run the animation.
	 */

	var nRepeatCount = 1;
	
	if (sRepeatCount) {
		if (sRepeatCount == "indefinite") {
			nRepeatCount = -1;
    }
		else {
			nRepeatCount = Number(sRepeatCount);
	  }
	}

	if (sFill) {
		this.element.m_sFill = sFill;
  }

	if (sTo && sTo != undefined && sTo != "") {
		attrAnimation["to"] = sTo;
	}
	else {
		if (sBy && sBy != undefined && sBy != "") {
			attrAnimation["by"] = sBy;
	  }
	}

	if (sFrom && sFrom != undefined && sFrom != "") {
		attrAnimation["from"] = sFrom;
	}

	/*
	 * Now establish the attribute to be animated.
	 */

	if (sAttr) {
		var oAttrs = { };

		if (!nDuration) {
			nDuration = 1;
		}

		/*
		 * Set the property that points to the attributes.
		 */

		oAttrs[sAttr] = attrAnimation;

		/*
		 * Get the element to animate. If none is specified then
		 * use the source of the event.
		 */

		var elTarget;

		if (sTargetElement) {
			elTarget = document.getElementById(sTargetElement);
		}
		else {
			elTarget = evt.currentTarget;
		}


		var bReset = true;
		if (this.element.m_sFill) {
			switch (this.element.m_sFill) {
				case "freeze":
				case "hold":
					bReset = false;
					break;

				default:
					break;
			}
		}

		/*
		 * Use the appropriate animation object.
		 *
		 * [ISSUE] There is actually an <animateColor> element
		 * in SMIL.
		 */

		if (elTarget) {
			switch (sAttr) {
				case "border":
				case "backgroundColor":
				case "color":
					this.m_animateLibrary.animateColour(
					  elTarget,
					  oAttrs,
					  nDuration,
					  nRepeatCount,
					  bReset,
					  {
					    obj: this,
					    fn: this.endElement
					  }
					);
					break;

				default:
        	attrAnimation["unit"] = "px";
					this.m_animateLibrary.animate(elTarget, oAttrs, nDuration, nRepeatCount, bReset,null);
					break;
			}
		}
	}
}
