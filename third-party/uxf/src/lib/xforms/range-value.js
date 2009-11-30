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

/*global spawn, FormsProcessor, YAHOO*/

var rangecount = 0;

function RangeValue(elmnt) {
	this.element = elmnt;
	this.currValue = "";
	this.m_bFirstSetValue = true;
	var rangeElement = elmnt.parentNode;
	this.start = Number(rangeElement.getAttribute("start")) || 0;
	//  This is not specified behaviour, but we have traditionally used 0-10 as default, 
	//  so I keep that behaviour for backwards compatability.  
	//  In the case of 8.1.7.a, which sets start to 1000, I thought it wise to have an end that was higher than the start.
	this.end = Number(rangeElement.getAttribute("end")) || (this.start + 10);
	this.step = Number(rangeElement.getAttribute("step")) || 1;
}


function rangeValueChanged(pThis, sNewValue) {
	var oEvt = pThis.element.ownerDocument.createEvent("MutationEvents");
	if (oEvt.initMutationEvent === undefined) {
		oEvt.initMutationEvent = oEvt.initEvent;
	}
		
	oEvt.initMutationEvent("control-value-changed", true, true, null, pThis.currValue, sNewValue, null, null);

	spawn(function () {
			FormsProcessor.dispatchEvent(pThis.element, oEvt);
	  });
}

RangeValue.prototype.onDocumentReady = function () {
	if (this.element.ownerDocument.media !== "print")	{
		this.element.innerHTML = "<div id='slider-bg" + rangecount + "' class='slider-bg'><div class='slider-thumb' id='slider-thumb" + rangecount + "'> </div></div>";
		this.tickCount = this.end - this.start;
		this.trackWidth = 200;
		this.tickWidthInPixels = this.trackWidth / this.tickCount; 
		this.m_value = YAHOO.widget.Slider.getHorizSlider("slider-bg" + rangecount, "slider-thumb" + rangecount, 0, this.trackWidth);
		rangecount++;
		
		var pThis = this;
		this.m_value.subscribe(
			(this.element.parentNode.getAttribute("incremental") === "true")
			? "change"
			: "slideEnd",
			function () {
				rangeValueChanged(
					pThis,
					pThis.quantizeValue(pThis.dataValueFromSliderPosition(pThis.m_value.getValue()))
				);
			}
		);
	}
};

RangeValue.prototype.setValue = function (sValue) {
	var bRet = false, nValue = Number(sValue), valueAsSliderPosition = this.sliderPositionFromDataValue(nValue);
	if (this.m_value.getValue() !== valueAsSliderPosition) {
		this.m_value.setValue(valueAsSliderPosition, true, true, true);
		this.currValue = sValue;
		bRet = true;
	} else if (this.m_bFirstSetValue)	{
		bRet = true;
		this.m_bFirstSetValue = false;
	}
	
	if (nValue > this.end || nValue < this.start || this.quantizeValue(nValue) !== nValue) {
	  this.element.parentNode.onOutOfRange();
	} else {
	  this.element.parentNode.onInRange();
	}
	return bRet;
};

RangeValue.prototype.getStepGranularity = function () {
  var retVal, sVal;
  sVal = String(this.step);
  sVal = sVal.slice(sVal.indexOf("."));
  if (sVal.charAt(0) === ".") {
    retVal = sVal.length - 1;      
  } else {
    retVal = 0;
  }
  return retVal;
};

RangeValue.prototype.quantizeValue = function (value) {

  var quantizedValue, mod, offsetValue, stepGranularityModifier;
  //round value to same number of decimal places as step.
  //This helps remove rounding issues at the edges
  stepGranularityModifier = Math.pow(10, this.getStepGranularity());

  // value, coming in, will have infinite granularity (as infinite as the relationship between pixel and units allows).
  //  This quantizes the value coming in to be no more precise than the step.  
  //  Without this, the first branch below is highly unlikely to be entered for an end value, which, for a 0-11 range will be 10.99999998
  value = Math.round(value * stepGranularityModifier) / stepGranularityModifier;
  
  //Edge values shouldn't be quantized to the step width.
  if (value === this.end || quantizedValue === this.start) {
    quantizedValue = value;
  } else {
    
    // offsetValue is used to ensure that the mod is calculated with reference to the start, and not zero.
    // calculating with reference to zero will give incorrect results if start is not dvisible by step,
    // e.g. start=3, step=2, should give steps at 5,7,9, rather than 4,6,8. 
    offsetValue = value - this.start;
    mod = offsetValue % this.step;
    
    //round down to the nearest step
    quantizedValue = value - mod;
    if (mod > (this.step / 2)) {
      //if it should have been rounded up, add the value of step to do so.
      quantizedValue += this.step;
    }
    //round the quantized value into line with the step, to prevent rounding errors from mod,
    //  Quantization must occur going out of this function, as well as coming in, as a rounding error
    //  may have occurred using or calculating the modulo, above.
    quantizedValue = Math.round(quantizedValue * stepGranularityModifier) / stepGranularityModifier;
  }
  return quantizedValue;
  
};

RangeValue.prototype.dataValueFromSliderPosition = function (sliderPos) {
  return this.start + (sliderPos / this.tickWidthInPixels);
};

RangeValue.prototype.sliderPositionFromDataValue = function (value) {
  return (value - this.start) * this.tickWidthInPixels;
};

RangeValue.prototype.isTypeAllowed = function (sType) {
  // Data Binding Restrictions: Binds only the following list of datatypes
  // or datatypes derived by restriction from those in the list: xsd:duration,
  // xsd:date, xsd:time, xsd:dateTime, xsd:gYearMonth, xsd:gYear, xsd:gMonthDay,
  // xsd:gDay, xsd:gMonth, xsd:float, xsd:double, and xsd:decimal.
  var arrSegments, prefix, localPart, namespace;

  arrSegments = sType.split(":");
  prefix = arrSegments.length === 2 ? arrSegments[0] : "";
  localPart = arrSegments.length === 2 ? arrSegments[1] : "";
  namespace = NamespaceManager.getNamespaceURIForPrefix(prefix);

  return ((namespace === "http://www.w3.org/2001/XMLSchema" || namespace === "http://www.w3.org/2002/xforms") &&
          (localPart === "dayTimeDuration" || localPart === "yearMonthDuration" ||
           localPart === "date" || localPart === "time" ||
           localPart === "dateTime" || localPart === "gYearMonth" ||
           localPart === "gYear" || localPart === "gMonthDay" ||
           localPart === "gDay" || localPart === "gMonth" ||
           localPart === "float" || localPart === "double" ||
           localPart === "decimal"));
};
