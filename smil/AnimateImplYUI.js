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

function AnimateImplYUI(oImpl)
{
	this.m_oAnim = null;
}

if(typeof(gAnimateFactory) != 'undefined')
	gAnimateFactory.AddLibrary("YUI",AnimateImplYUI);

AnimateImplYUI.prototype.animateColour = function(elTarget, oAttrs, nDuration, bReset, fnOnComplete)
{
	this.m_oAnim = new YAHOO.util.ColorAnim(elTarget, oAttrs, nDuration);


	if(bReset)
		this.m_oAnim.onComplete.subscribe(this.restoreValue, this, true);
	if(fnOnComplete)
		this.m_oAnim.onComplete.subscribe(fnOnComplete.fn, fnOnComplete.obj, true);

		
	for(var sAttr in oAttrs)
	{
		this.m_sAttribute = sAttr;
		break;
	}
	this.begin();

	return this.m_oAnim ;
}

AnimateImplYUI.prototype.animate = function(elTarget, oAttrs, nDuration, bReset, fnOnComplete)
{
	this.m_oAnim  = new YAHOO.util.Anim(elTarget, oAttrs, nDuration);
	/*
	* Register for the completion of the animation.
	*
	* [ISSUE] Whilst most situations allow this.element, this
	* one doesn't.
	*/
	this.m_bReset = bReset;

	if(bReset)
		this.m_oAnim.onComplete.subscribe(this.restoreValue, this, true);
		
	if(fnOnComplete)
		this.m_oAnim.onComplete.subscribe(fnOnComplete.fn, fnOnComplete.obj, true);
		
	for(var sAttr in oAttrs)
	{
		this.m_sAttribute = sAttr;
		break;
	}
	this.begin();
	return this.m_oAnim ;
}

AnimateImplYUI.prototype.restoreValue = function()
{
	this.m_oAnim.setAttribute(
		this.m_sAttribute,
		this.m_currentValue,
		this.m_currentValueUnit
	);
}

AnimateImplYUI.prototype.begin = function()
{
	if (!this.m_oAnim.isAnimated())
	{
		/*
		 * Store the current value and unit of what we are
		 * animating.
		 */

		this.m_currentValue = this.m_oAnim.getAttribute(this.m_sAttribute);

		/*
		 * [ISSUE] This should work...can't see why not.
		 */

		try
		{
			this.m_currentValueUnit = this.m_oAnim.getDefaultUnit(this.m_sAttribute);
		}
		catch(e)
		{
			this.m_currentValueUnit = "px";
		}

		this.m_oAnim.animate();
	}
}

AnimateImplYUI.prototype.setStyle = function(elTarget,sAttr,sVal)
{
	return YAHOO.util.Dom.setStyle(elTarget, sAttr, sVal);
}