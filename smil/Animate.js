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

/**
	A factory used to create animation library objects
*/
function AnimateFactory()
{
	this.m_Libraries = { };
}
/**
	Add a library to the factory.
	@param {String} string An identifier used to retrieve this library.
	@param {Object} pointer A pointer to a function used to create the library object, this will be called as x = new pointer();
*/
AnimateFactory.prototype.AddLibrary = function(string,pointer)
{
	this.m_Libraries[string] = pointer;
};
/**
	Retrieve a library to the factory.
	@param {String} string An identifier used to retrieve the library.  This will be the same string used in AddLibrary.
*/
AnimateFactory.prototype.GetLibrary = function(string)
{
	return new this.m_Libraries[string]();
};

var gAnimateFactory = new AnimateFactory();



function Animate()
{
	this._impl = gAnimateFactory.GetLibrary(gLibrary["animate"]);
};

/**
Animates a colour attribute.
@param {Object} elTarget The element on which this animation is to be executed.
@param {Object} oAttrs  An attrs collection of properties.
@param {Number} nDuration The duration of each iteration of the animation.
@param {Number} nRepeat The number of times this animation is to be executed.  Must be a positive integer
@param {Boolean} bReset Wether or not to reset elTarget to its initial state at the end of animation.
@param {Object} fnOnComplete an object consisting of a function (fn) to call at the end of animation, and an object in whose scope to call it (obj), obj will be the object corresponding to "this" in the function.
*/
Animate.prototype.animateColour =  function (elTarget, oAttrs, nDuration,nRepeat, bReset,fnOnComplete)
{
	this.m_oAttrs = oAttrs;
	this.m_oControlInfo = {target:elTarget,attrs:oAttrs,dur:nDuration,iterations:nRepeat,reset:bReset,isFinalRepetition:(nRepeat==1),isFirstRepetition:true};
	this.animation = this._impl.animateColour;
	//this._impl.animateColour(elTarget, oAttrs, nDuration, nRepeat, bReset, fnOnComplete);
	this.runAnimation();
};

/**
Animates an attribute.
@param {Object} elTarget The element on which this animation is to be executed.
@param {Object} oAttrs  An attrs collection of properties.
@param {Number} nDuration The duration of each iteration of the animation.
@param {Number} nRepeat The number of times this animation is to be executed.  Must be a positive integer
@param {Boolean} bReset Wether or not to reset elTarget to its initial state at the end of animation.
@param {Object} fnOnComplete an object consisting of a function (fn) to call at the end of animation, and an object in whose scope to call it (obj), obj will be the object corresponding to "this" in the function.
*/
Animate.prototype.animate = function (elTarget, oAttrs, nDuration,nRepeat, bReset,fnOnComplete)
{
	this.m_oAttrs = oAttrs;
	this.m_oControlInfo = {target:elTarget,attrs:oAttrs,dur:nDuration,iterations:nRepeat,reset:bReset,isFinalRepetition:(nRepeat==1),isFirstRepetition:true};
	this.animation = this._impl.animate;
	this.runAnimation();
};

/**
@private
Called by the appropriate animate function after setting up the environment
*/
Animate.prototype.runAnimation = function()
{
	var bReset = (this.m_oControlInfo.reset || !this.m_oControlInfo.isFinalRepetition);
	this._impl.animation = this.animation;
	this._impl.animation(this.m_oControlInfo.target, this.m_oControlInfo.attrs, this.m_oControlInfo.dur, bReset,{fn:this.repeat,obj:this});
};

/**
@private
Called to repeat the animation if required.
*/
Animate.prototype.repeat = function()
{
	if(this.m_oControlInfo.iterations > 0) {
		--this.m_oControlInfo.iterations;
	}

	if(this.m_oControlInfo.iterations)
	{
		this.m_oControlInfo.isFirstRepetition = false;
		this.m_oControlInfo.isFinalRepetition = (this.m_oControlInfo.iterations==1);
		this.runAnimation();
	}
};

Animate.prototype.setStyle = function(elTarget,sAttr,sVal)
{
	return this._impl.setStyle(elTarget,sAttr,sVal);
};
