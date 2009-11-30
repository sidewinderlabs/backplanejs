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

function AnimateImplScriptaculous()
{
}
if(typeof(gAnimateFactory) != 'undefined')
	gAnimateFactory.AddLibrary("script.aculo.us",AnimateImplScriptaculous);


AnimateImplScriptaculous.prototype.animateColour = function(elTarget, oAttrs, nDuration, bReset, fnOnComplete)
{
	for(var attr in oAttrs)
	{
		var oScriptaculousParams = new Object();
		switch(attr)
		{
			case "background-color":
			case "backgroundColor":
				oScriptaculousParams.targetstyle = "backgroundColor";
			break;
			case "color":
				oScriptaculousParams.targetstyle = "color";
			break;
		}
		if(oAttrs[attr].from)
		{
			oScriptaculousParams.endcolor = oAttrs[attr].from;
		}
		else
		{
		//	getApparentBackgroundColour(elmnt)
			var s = Element.getStyle(elTarget,"background-color");
			if(s == "transparent")
			{
				var el = elTarget.parentNode;
				while(el && s == "transparent")
				{
					var s = Element.getStyle(el,"background-color");
					el = el.parentNode;
				}
				
				oScriptaculousParams.endcolor = NormaliseColour(s);
			}
		}
		
		if(oAttrs[attr].to)
			oScriptaculousParams.startcolor = oAttrs[attr].to;

		if(nDuration)
			oScriptaculousParams.duration = nDuration;

		if(fnOnComplete)
		{
			oScriptaculousParams.afterFinish = function(o){
					var oOldHandler = fnOnComplete.obj.oHandler;
					fnOnComplete.obj.oHandler = fnOnComplete.fn;
					fnOnComplete.obj.oHandler();
					fnOnComplete.obj.oHandler = oOldHandler;
				};
		}
		
		new Effect.CycleColour(elTarget,oScriptaculousParams);
		break;
	}
}

AnimateImplScriptaculous.prototype.animate = function(elTarget, oAttrs, nDuration, bReset, fnOnComplete)
{
	this.animateParams = new Array(elTarget,oAttrs,nDuration,bReset,fnOnComplete);
	for(var attr in oAttrs)
	{
		switch(attr)
		{
			case "height":
			case "width":
			{
				this.Scale(elTarget,attr,oAttrs[attr],nDuration,bReset,fnOnComplete);
				break;
			}
			case "left":
			case "top":
			{
				this.Move(elTarget,attr,oAttrs[attr],nDuration,bReset,fnOnComplete);
			}
		}
	}
}

AnimateImplScriptaculous.prototype.Move = function(elTarget,dimension, oParams, nDuration, bReset, fnOnComplete)
{
	var objScriptaculousParams = {duration:nDuration,restoreAfterFinish:bReset,mode:"abosolute"};
	if( oParams.to)
	{
		if(dimension == "left")
		{
			objScriptaculousParams.x = oParams.to;
		}
		else if(dimension == "top")
		{
			objScriptaculousParams.y = oParams.to;
		}
	}
	new Effect.Move(elTarget,objScriptaculousParams);
}

AnimateImplScriptaculous.prototype.Scale = function(elTarget,dimension, oParams, nDuration, bReset, fnOnComplete)
{
	//Scriptaculous can reset after the animation.  This should happen if:
	//	The calling application has requested reset. (bReset == true)
	//	OR
	//	This is going to repeat.
	//		which will happen if:
	//		it is infinitely repeating (nRepeat == -1)
	//		OR
	//		There are more than one repetitions left in the list. (nRepeat > 1)
	//
	//	This differs from the YUI method - YUI cannot reset after end of animation by itself,
	//		so when the attempt repeat method in AnimateImplYUI is called with 0, it resets the animation.
	
	var objScriptaculousParams = {duration:nDuration,restoreAfterFinish:bReset};
	
	if(fnOnComplete)
	{
		objScriptaculousParams.afterFinish = function(o){
				fnOnComplete.obj.oHandler = fnOnComplete.fn;
				fnOnComplete.obj.oHandler();
			};
	}

	if(dimension == "height")
	{
		objScriptaculousParams.scaleX = false;
		objScriptaculousParams.scaleY = true;
	}
	else if(dimension == "width")
	{
		objScriptaculousParams.scaleY = false;	
		objScriptaculousParams.scaleX = true;
	}
	
	
	if(oParams.by)
	{
		//If 'by' has been specified, this maps sensibly to the behaviour of scriptaculous
		new Effect.Scale(elTarget,oParams.by,objScriptaculousParams)
	}
	else
	{
		//If 'to' and optionally 'from' have been specified, scriptaculous Scale percent is 100%
		//	and the scaleFrom must be defined.

		var dims = Element.getDimensions(elTarget);
		var dim;
		if(objScriptaculousParams.scaleY)
		{
			dim = dims.height;
			objScriptaculousParams.scaleMode = {originalHeight:oParams.to};
		}
		else if(objScriptaculousParams.scaleX)
		{
			dim = dims.width;
			objScriptaculousParams.scaleMode = {originalWidth:oParams.to};
		}

		if(oParams.from)
		{
			objScriptaculousParams.scaleFrom = oParams.from;
		}
		else
		{
			objScriptaculousParams.scaleFrom = CalculatePercentageOf(oParams.to,dim);
			oParams.from = objScriptaculousParams.scaleFrom;
		}

		new Effect.Scale( elTarget, 100,objScriptaculousParams);
	}
}

AnimateImplScriptaculous.prototype.setStyle = function(elTarget,sAttr,sVal)
{
	var cssHash = new Object();
	cssHash[sAttr] = sVal;
	return Element.setStyle(elTarget,cssHash);
}


/**
	Normalises a string representing a colour.
	Currently only supports normalising 3 digits up to 6.
	@param {String} s Colour to normalise
	@returns a string in the form #001122, being a 6 digit representation of the colour represented by s
	@returns s if input format is rgb(1,2,3).
	@returns "E_NOTIMPL" if it could not parse s.
	//TODO: normalise standard human readable colour names.
	//TODO: decide on normalisation format - either rgb(255,255,255) or #ffffff
*/
function NormaliseColour(s)
{
	var sReturn;
	if(s.indexOf("#") == 0)
	{
		if(s.length == 7)
		{
			sReturn = s;
		}
		else if(s.length == 4)
		{
			sReturn = "#" + s.charAt(1) +s.charAt(1) +s.charAt(2) +s.charAt(2) +s.charAt(3) +s.charAt(3);
		}
	}
	else if(s.indexOf("rgb(") == 0)
	{
		var arr = s.substring(4,s.length-1).split(',');
		sReturn = "#" + Number(arr[0]).toColorPart()+ Number(arr[1]).toColorPart()+ Number(arr[2]).toColorPart();
	}
	else
	{
		return "E_NOTIMPL";
	}	
	return sReturn;
}

//calculates b as a percentage of a
function CalculatePercentageOf(a,b)
{
	return (100*(b/a))
}



//A replacement for Effect.Highlight that can also work on foreground colour.
Effect.CycleColour = Class.create();
Object.extend(Object.extend(Effect.CycleColour.prototype, Effect.Base.prototype), {
  initialize: function(element) {
    this.element = $(element);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || {});
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if(Element.getStyle(this.element, 'display')=='none') { this.cancel(); return; }

    this.oldStyle = {
      backgroundImage: Element.getStyle(this.element, 'background-image') };
    

	if(this.options.targetstyle)
	{
		//Switch off background image for duration of effect.
		if(this.options.targetstyle == "backgroundColor")
			Element.setStyle(this.element, {backgroundImage: 'none'});
			
		if(!this.options.endcolor)
			this.options.endcolor = Element.getStyle(this.element, this.options.targetstyle).parseColor('#ffffff');
		if(!this.options.restorecolor)
			this.options.restorecolor = Element.getStyle(this.element, this.options.targetstyle);
	}
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
	var o = new Object();
	o[this.options.targetstyle] = $R(0,2).inject('#',function(m,v,i){
      return m+(Math.round(this._base[i]+(this._delta[i]*position)).toColorPart()); }.bind(this));
    Element.setStyle(this.element,o);
  },
  finish: function() {
	var o = new Object();
	o[this.options.targetstyle] =  this.options.restorecolor
    Element.setStyle(this.element, Object.extend(this.oldStyle,o));
  }
});
