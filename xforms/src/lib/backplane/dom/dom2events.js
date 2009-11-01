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

/*global document*/
/*
 * If there is no document.createEvent function then add one.
 */

if (!document.createEvent)
{

	/*
	* [TODO] Create some kind of object with a lookup
	* so that it's easy to add other event types.
	*/

	document.createEvent = function(eventType)
	{
		var oRet = null;

		switch (eventType)
		{
			case "Events":
				oRet = new Event();
				break;

			case "MutationEvents":
				oRet = new MutationEvent();
				break;

			case "UIEvents":
				oRet = new UIEvent();
				break;

			default:
				throw "NOT_SUPPORTED_ERR";
		}
		return oRet;
	};


	/*
	* E V E N T
	* =========
	*/

	var Event = function (){
	    var that = {};

	    that.CAPTURING_PHASE = 0;
  		that.AT_TARGET = 1;
  		that.BUBBLING_PHASE = 2;
  		that.DEFAULT_PHASE = 3;

	    that.initEvent = function(eventTypeArg, canBubbleArg, cancellableArg){

			that.type = eventTypeArg;
			that.target = null;
			that.currentTarget = null;
			that.eventPhase = null;
			that.bubbles = canBubbleArg;
			that.cancelable = cancellableArg;
			that.timeStamp = new Date();

			that._cancelled = false;
			that._stopPropagation = false;
			that._stopImmediatePropagation = false;
		  return;
		};

		that.stopPropagation = function() {
			that._stopPropagation = true;
		return;
	};

		that.stopImmediatePropagation = function(){
			that._stopImmediatePropagation = true;
			that.stopPropagation();
		return;
	};

		that.preventDefault = function()	{
			if (that.cancelable)
				that._cancelled = true;
		return;
	};


	   return that;
	}

	

	

	/*
	* U I E V E N T
	* =============
	*/

	var UIEvent = function (){
	    var that = Event();

		    that.initUIEvent = function(
		eventTypeArg,
		canBubbleArg,
		cancellableArg,
		viewArg,
				detailArg) {
				that.initEvent(eventTypeArg, canBubbleArg, cancellableArg);

				that.view = viewArg;
				that.detail = detailArg;
	}

		return that;
	}

	/*
	* M U T A T I O N E V E N T
	* =========================
	*/

	var MutationEvent = function()
	{
    var that = Event();
    that.MODIFICATION = 1;
		that.ADDITION = 2;
		that.REMOVAL = 3;

		that.initMutationEvent = function(
  		eventTypeArg,
  		canBubbleArg,
  		cancellableArg,
  		relatedNodeArg,
  		prevValueArg,
  		newValueArg,
  		attrNameArg,
  		attrChangeArg) {

     		that.initEvent(eventTypeArg, canBubbleArg, cancellableArg);
    
    		that.relatedNode = relatedNodeArg;
    		that.prevValue = prevValueArg;
    		that.newValue = newValueArg;
    		that.attrName = attrNameArg;
    		that.attrChange = attrChangeArg;
    	}
	    return that;
	};

}
