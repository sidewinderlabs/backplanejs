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
//= require <dom/dom2events>
//
/*global FormsProcessor, document, UX, setTimeout*/
var EventTarget = null;



function dispatchXformsHint(element, event) {
	var oEvt, savedHintOffCounter;
	oEvt = element.ownerDocument.createEvent("UIEvents");
	savedHintOffCounter = FormsProcessor.hintOffCounter;
	setTimeout(function() {
		if (savedHintOffCounter === FormsProcessor.hintOffCounter) {
			oEvt.initUIEvent("xforms-hint", true, true, null, 1);
			FormsProcessor.dispatchEvent(element, oEvt);
		}
	}, 200);

	//oEvt.initUIEvent("xforms-hint", true, true, null, 1);
	//There is no need to run this event in line, and doing so may cause a stack overflow,
	//  if it invokes other actions.
	//oEvt._actionDepth = -1;
	//FormsProcessor.dispatchEvent(element,oEvt);
	//spawn(function(){element.dispatchEvent(oEvt)});
	event.stopPropagation();
	event.preventDefault();
}



function dispatchXformsHintOff(element, event) {
	var oEvt = document.createEvent("UIEvents");
	FormsProcessor.hintOffCounter++;

	oEvt.initUIEvent("xforms-hint-off", true, true, null, 1);
	// There is no need to run this event in line, and doing so may cause a stack overflow,
	// if it invokes other actions.
	// oEvt._actionDepth = -1;
	FormsProcessor.dispatchEvent(element, oEvt);
	//spawn(function(){element.dispatchEvent(oEvt)});
	event.stopPropagation();
	event.preventDefault();
}

function mapclick2domactivate(element, event) {
	var oEvt = element.ownerDocument.createEvent("UIEvents");
	oEvt.initUIEvent("DOMActivate", true, true, null, 1);

	// HACK: WebKit issues its own DOMActivate that we need to ignore.
	//       This property enables us to just NOP for that event.
	oEvt.mappedFromClick = true;

	FormsProcessor.dispatchEvent(element, oEvt);
	event.stopPropagation();
	event.preventDefault();
}

function mapdblclick2domactivate(element, event) {
	var oEvt = element.ownerDocument.createEvent("UIEvents");
	oEvt.initUIEvent("DOMActivate", true, true, null, 2);
	// There is no need to run this event in line, and doing so may cause a stack overflow,
	// if it invokes other actions.
	// oEvt._actionDepth = -1;
	FormsProcessor.dispatchEvent(element, oEvt);
	event.stopPropagation();
	event.preventDefault();
}



function StyleHoverishly(element) {
	UX.addClassName(element, "pc-hover");
}

function StyleUnhoverishly(element) {
	UX.removeClassName(element, "pc-hover");
}

function StyleFocussedly(element) {
	UX.addClassName(element, "pc-focus");
}

function StyleUnfocussedly(element) {
	UX.removeClassName(element, "pc-focus");
}



function findEventListenerIdx(oArray, oListener) {
	var len = oArray.length;
	var i;

	for (i = 0; i < len; i++) {
		if (oArray[i] === oListener) {
			break;
		}
	}

	return ((len === i) ? -1 : i);
}

//There is no need for this in firefox.
if (UX.isIE) {

	function EventTargetProxy(element) {
		this.element = element;
		this.arrListener = this.element.arrListener || {};
	}

	EventTarget = EventTargetProxy;

	/*
     * P R I V A T E
     * =============
     */
	var g_iEventsInProgress = 0;
	var g_pendingEvents = [];

	var flushEventQueue = function() {
		var oPendingEvent = g_pendingEvents.pop();
		while (oPendingEvent) {
			oPendingEvent.target._dispatchEvent(oPendingEvent.evt);
			oPendingEvent = g_pendingEvents.pop();
		}
	};

	(function() {
		var PHASE_CAPTURE = 0;
		var PHASE_BUBBLE = 1;
		var PHASE_DEFAULT = 2;

		var _addEventListener = function(sType, oListener, bPhase) {
			var iPhase = PHASE_BUBBLE;

			if (typeof(sType) !== "string" || typeof(bPhase) !== "boolean" || !oListener) {
				this.element.document.logger.log("addEventListener: invalid arguments");
				return;
			}

			if (bPhase) {
				iPhase = PHASE_CAPTURE;
			}

			// If this is the first listener of this type then create an empty list
			this.arrListener[sType] = this.arrListener[sType] || [];
			this.arrListener[sType][iPhase] = this.arrListener[sType][iPhase] || [];

			// Check whether listener already in array
			if (findEventListenerIdx(this.arrListener[sType][iPhase], oListener) < 0) {
				this.arrListener[sType][iPhase].push(oListener);
			}
		}; //_addEventListener
		var _removeEventListener = function(sType, oListener, bPhase) {
			var oList = null;
			var idx = 0;
			var iPhase = PHASE_BUBBLE;

			if (typeof(sType) !== "string" || typeof(bPhase) !== "boolean" || !oListener || !this.arrListener[sType]) {
				this.element.document.logger.log("removeEventListener: invalid arguments");
				return;
			}

			if (bPhase) {
				iPhase = PHASE_CAPTURE;
			}

			oList = this.arrListener[sType][iPhase];

			// First see if we have a list of listeners for this type
			if (oList) {
				// Find event listener
				idx = findEventListenerIdx(oList, oListener);

				if (idx !== -1) {
					// Event listener found, remove the one listener at the index
					this.element.document.logger.log("Removed listener for " + sType + ", phase " + iPhase, "evnt");
					oList.splice(idx, 1);
				}
			} // if ( some listeners exist for this type and phase )
		}; //_removeEventListener
		var __notifyListeners = function(thisArg, oEvt) {

			/*
			 * First get the list of listeners for this type
			 */
			var arr = thisArg.arrListener[oEvt.type];

			if (arr) {
				/*
				 * Next, narrow it down to just those listeners
				 * for the correct phase
				 */
				var iPhase;

				switch (oEvt.eventPhase) {
				case oEvt.AT_TARGET:
					iPhase = PHASE_BUBBLE;
					break;

				case oEvt.BUBBLING_PHASE:
					iPhase = PHASE_BUBBLE;
					break;

				case oEvt.CAPTURING_PHASE:
					iPhase = PHASE_CAPTURE;
					break;

				case oEvt.DEFAULT_PHASE:
					iPhase = PHASE_DEFAULT;
					break;

				default:
					throw "[CEventTarget._notifyListeners] Invalid phase: " + oEvt.eventPhase;
				} // switch ( on the event phase )
				/*
				 * For each phase there will be one or more groups
				 */
				arr = arr[iPhase];

				if (arr && arr.length) {
					//theApp.message("	 Notifying " + arr.length + " groups");
					//for (var iGroup = 0; i < arr.length; i++)
					//{
					//	arr = arr[iGroup];
					//	if (arr && arr.length)
					//	{
					/*
					 * If we have a list of listeners then invoke their
					 * handlers
					 */
					thisArg.element.document.logger.log(oEvt.type + ": Notifying " + arr.length + " handlers", "evnt");

					for (var i = 0; i < arr.length; i++) {
						// flush any events that have been added prior to this loop
						// either in the previous iteration, or before the first iteration.
						flushEventQueue();

						var oListener = arr[i];
						var bInvoke = true;

						/*
						 * If @ev:target is present then the listener is only
						 * invoked if event target has the same ID.
						 */
						if (oListener["ev:target"]) {
							if (oEvt.target.id != oListener["ev:target"]) {
								bInvoke = false;
							}
						}

						if (typeof(oListener.handleEvent) == "undefined") {
							//prevents ghost listeners being invoked.
							bInvoke = false;
							//remove ghost listener from the list.
							//(enable later, too pressing to test now)
							//arr.splice(i,1);
							//debugger;
						}

						if (bInvoke) {
							oListener.handleEvent(oEvt);
						}

						/*
						 * If @ev:preventDefault is set then the default
						 * handler is to be cancelled.
						 */
						var sDefaultAction = thisArg.element["ev:defaultAction"];
						var bPreventDefault;

						switch (sDefaultAction) {
						case "cancel":
							bPreventDefault = true;
							break;

						case "perform":
							bPreventDefault = false;
							break;

						default:
							bPreventDefault = false;
							break;
						}

						if (bPreventDefault) {
							oEvt.preventDefault();
						}

						/*
						 * If @ev:propagate is set then we need to
						 * stop propagation.
						 */
						var sPropagate = thisArg.element["ev:propagate"];
						var bStopPropagation;

						switch (sPropagate) {
						case "stop":
							bPreventDefault = true;
							break;

						case "continue":
							bPreventDefault = false;
							break;

						default:
							bPreventDefault = false;
							break;
						}

						if (bStopPropagation) {
							oEvt.stopPropagation();
						}

						/*
						 * Stop propagation doesn't stop a group,
						 * but "stop immediate" does
						 */
						if (oEvt._stopImmediatePropagation) {
							break;
						}
					} //for ( each listener in this group )
					//flush any events that were added to the queue by the last iteration.
					flushEventQueue();

					/*
					 * Stop propagation let's the current group complete
					 * before stopping all other listeners
					 */

					//}//for ( each group in this phase )
				} // if ( there are groups for this phase )
			} // if ( there are listeners for this event )
		}; //_notifyListeners()
		var getTargetList = function(oEvt) {
			var bRet = [];
			var oNode = oEvt.target.parentElement;

			while (oNode) {
				var sTypeOfAddEventListener = typeof oNode.addEventListener;
				if (sTypeOfAddEventListener == "function" || sTypeOfAddEventListener == "unknown") {
					bRet.push(oNode);
				}
				oNode = oNode.parentElement;
			}
			return bRet;
		};

		var capture = function(oEvt, arrTargetList) {
			/*
			 * CAPTURE PHASE
			 * In the capture phase we target ancestors in order
			 * from the root to our target.
			 *
			 * After notifying each listener we check oEvt._stopPropogation
			 * to see if the process should continue, although for
			 * each target we carry out all listeners, uninterrupted.
			 *
			 * Note that capturing does *not* happen on the target of the
			 * event.
			 */
			oEvt.eventPhase = oEvt.CAPTURING_PHASE;
			var i, oNode;

			for (i = arrTargetList.length - 1; i >= 0; i--) {
				oNode = arrTargetList[i];
				oNode.currentTarget = oNode;
				__notifyListeners(oNode, oEvt);

				if (oEvt._stopPropagation) {
					break;
				}
			} // for ( each ancestor )
		};

		var bubble = function(thisArg, oEvt, arrTargetList) {
			/*
			 * BUBBLE PHASE
			 * In the bubble phase we target ancestors in reverse order,
			 * i.e., from the target up to the root. Begin with the
			 * 'current' target.
			 */
			var i, oNode;
			if (!oEvt._stopPropagation) {
				oEvt.eventPhase = oEvt.AT_TARGET;
				oEvt.currentTarget = thisArg.element;
				__notifyListeners(thisArg, oEvt);
			}

			if (!oEvt._stopPropagation) {
				if (oEvt.bubbles) {
					oEvt.eventPhase = oEvt.BUBBLING_PHASE;

					for (i = 0; i < arrTargetList.length; i++) {
						oNode = arrTargetList[i];
						oEvt.currentTarget = oNode;
						__notifyListeners(oNode, oEvt);

						if (oEvt._stopPropagation) {
							break;
						}
					} // for ( each ancestor )
				} // if ( the event is a bubbling event )
			} // if ( propogation has not been stopped )
		};

		var notifydefault = function(thisArg, oEvt) {
			/*
			 * Finally, perform the default handlers if not cancelled
			 */
			if (!oEvt._cancelled) {
				oEvt.eventPhase = oEvt.DEFAULT_PHASE;
				oEvt.currentTarget = thisArg.element;

				__notifyListeners(thisArg, oEvt);
			}
		};



		function _dispatchEvent(oEvt) {
			if (g_iEventsInProgress > 1) {
				return __dispatchEvent(this, oEvt);
			} else {
				return __dispatchEvent(this, oEvt);
			}
		}



		function __dispatchEvent(thisArg, oEvt) {
			++g_iEventsInProgress;
			try {
				var sType = oEvt.type;

				/*
				 * The 'target' is always the same, although the 'currentTarget' will
				 * change as bubbling and capture take place.
				 */

				oEvt.target = thisArg.element;
				document.logger.log("Dispatching: " + sType + " to " + oEvt.target.tagName + ":" + oEvt.target.uniqueID, "evnt");

				/*
				 * Increase the action depth, since we don't
				 * want to update the models until we exit
				 * the top-level action handler.
				 */

				if (oEvt._actionDepth === undefined) {
					oEvt._actionDepth = 0;
				}

				if (oEvt._actionDepth != -1) {
					oEvt._actionDepth++;
				}

				/*
				 * First build a list of the node's ancestors. Since the
				 * list of event targets that is used in the bubble and capture
				 * phases is set at the beginning of the event, we can use
				 * the same list twice
				 */

				var arrTargetList = getTargetList(oEvt);
				capture(oEvt, arrTargetList);
				//atTarget(oEvt);
				bubble(thisArg, oEvt, arrTargetList);

				if (oEvt._stopPropagation) {
					document.logger.log("*** Propagation stopped ***", "evnt");
				}

				if (oEvt._cancelled) {
					document.logger.log("*** Cancelled ***", "evnt");
				}

				document.logger.log("End of dispatchEvent: " + sType, "evnt");
				notifydefault(thisArg, oEvt);

			} catch(e) {
				//debugger;
			} finally {
				--g_iEventsInProgress;
			}
			/*
			 * Let the caller know if the default handlers were
			 * cancelled
			 */

			return !oEvt._cancelled;
		} //dispatchEvent
		/*
		 * There are essentially 4 phases:
		 * 1. capturing
		 * 2. at target
		 * 3. bubbling
		 * 4. processing defaults
		 *
		 * However, from the point of view of storing the listeners
		 * we can keep the target and bubbling listeners in the
		 * same place.
		 */
		EventTargetProxy.prototype.addEventListener = _addEventListener;
		EventTargetProxy.prototype.removeEventListener = _removeEventListener;
		EventTargetProxy.prototype.dispatchEvent = _dispatchEvent;
	} ());
} else {

	EventTarget = function(element) {
		this.element = element;
		this.element.addEventListener("click", function(evt) {
			mapclick2domactivate(element, evt);
		},
		false);
		this.element.addEventListener("mouseover", function(evt) {
			StyleHoverishly(element);
		},
		false);
		this.element.addEventListener("mouseout", function(evt) {
			StyleUnhoverishly(element);
		},
		false);

		// Hint is turned on with a mouseover, and off with a mouseout or a click.
		//
		this.element.addEventListener("mouseover", function(evt) {
			dispatchXformsHint(element, evt);
		},
		false);
		this.element.addEventListener("mouseout", function(evt) {
			dispatchXformsHintOff(element, evt);
		},
		false);
		this.element.addEventListener("click", function(evt) {
			dispatchXformsHintOff(element, evt);
		},
		false);
		this.element.addEventListener("keyup", function(evt) {
			dispatchXformsHintOff(element, evt);
		},
		false);

		this.element.addEventListener("focus", function(evt) {
			StyleFocussedly(element);
			if (UX.isFF) {
				UX.dispatchEvent(element, "DOMFocusIn", true, false, true);
			}
		},
		true);
		this.element.addEventListener("blur", function(evt) {
			StyleUnfocussedly(element);
			if (UX.isFF) {
				UX.dispatchEvent(element, "DOMFocusOut", true, false, true);
			}
		},
		true);
		this.element.addEventListener("keydown", function(evt) {
			if (typeof this.onKeyDown === "function") {
				this.onKeyDown(evt);
			}
		},
		false);
	};
}

(function() {

	var methods = {};
	var uid = 0;

	UX.Element = function(element) {
		if (element.ux_extended)  return methods[element.ux_extended];
		element.ux_extended = ++uid;
		var extended = new UX.Element.Methods(element);
		methods[uid] = extended;
		return extended;
	};

	UX.Element.Methods = new UX.Class({

		initialize: function(element) {
			this.element = element;
		},

		addListener: function(type, fn, capture) {
			type = type.replace(/^on/, '');
			if (UX.isIE) {
				this.element.attachEvent('on' + type, fn);
			} else {
				this.element.addEventListener(type, fn, !!capture);
			}
			return this;
		},

		addEvent: function(type, fn, capture) {
			if (typeof capture != 'boolean') {
				capture = false;
				if (type == 'focus' || type == 'blur') {
					if (UX.isIE) {
						type = (type == 'focus') ? 'focusin' : 'focusout';
					} else {
						capture = true;
					}
				}
			}
			var element = this.element;
			var eventFn = function(event) {
				fn.apply(element, [new UX.Element.Event(event)]);
			};
			return this.addListener(type, eventFn, capture);
		},

		addEvents: function(events) {
			for(var type in events) {
				this.addEvent(type, events[type]);
			}
			return this;
		},

		addClass: function(cls) {
			UX.addClassName(this.element, cls);
			return this;
		},

		removeClass: function(cls) {
			UX.removeClassName(this.element, cls);
			return this;
		},

		hasChild: function(child) {
			var parent = child.parentNode;
			while (parent) {
				if (parent === this.element) return true;
				parent = parent.parentNode;
			}
			return false;
		}
	
});

//based on mootools Brower.Event.js
UX.Element.Event = function(event) {
	if (!event) event = window.event || {};
	this.event = event;
	
	var target = event.target || event.srcElement;
	while (target && target.nodeType == 3) target = target.parentNode;
	this.target = target;
	
	if (event.shiftKey) this.shift = true;
	if (event.metaKey) this.meta = true;
	if (event.ctrlKey) this.control = true;
	if (event.altKey) this.alt = true;
	
	this.wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
	
	var code = event.which || event.keyCode;
	this.code = code;
	if (code) {
		var key = UX.Element.Event.Key[code];
		if (key) {
			this.key = key;
		} else if (event.type == 'keydown' && code - 111 > 0 && code - 111 < 13) {
			this.key = 'f' + code - 111;
		} else {
			this.key = String.fromCharCode(code).toLowerCase();
		}
	}
	
	this.rightClick = (event.which == 3) || (event.button == 2);
	
	var type = event.type;
	if (/over|out/.test(type)){
		related = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
		var testRelated = function(){
			while (related && related.nodeType == 3) related = related.parentNode;
			return true;
		};
		var hasRelated = testRelated();
		related = (hasRelated) ? related : null;
		this.relatedTarget = related;
	}
	
	// Used to determine whether stopPropagation has been called
	this._cancelBubble = false;
	// Used to determine whether preventDefault has been called
	this._returnValue = true;
	
	// Set to true if both stopPropagation and preventDefault have been called
	this.stopped = false;
	
	this.stopPropagation = function() {
		if (this.event.stopPropagation) {
			this.event.stopPropagation();
		} else {
			this.event.cancelBubble = true;	
		}
		
		this._cancelBubble = true;
		// If preventDefault has already been called, flip this.stopped to true
		if (this._returnValue === false) {
			this.stopped = true;
		}
		
		return this;
	};

	this.preventDefault = function(){
		if (this.event.preventDefault) {
			this.event.preventDefault();
		} else {
			this.event.returnValue = false;
		}
		
		this._returnValue = false;
		// If preventDefault has already been called, flip this.stopped to true
		if (this._cancelBubble === true) {
			this.stopped = true;
		}
		
		return this;
	};

	this.stop = function(){
		this.stopped = true;
		return this.stopPropagation().preventDefault();
	};
};

UX.Element.Event.Key = {
	13: 'enter', 
	38: 'up', 
	40: 'down', 
	37: 'left', 
	39: 'right', 
	27: 'esc', 
	32: 'space', 
	8: 'backspace', 
	9: 'tab', 
	46: 'delete'
};

})();

//events common for all xforms elements

YAHOO.util.Event.onDOMReady(function() {

	UX.Element(document).addEvent('click', function(event) {
		var element = event.target;
		while (element) {
			if (event.stopped) break;
			var behaviour = DECORATOR.getBehaviour(element);
			if (!behaviour) {
				element = element.parentNode;
				continue;
			}
			var oEvt = document.createEvent("UIEvents");
			oEvt.initUIEvent("DOMActivate", true, true, null, 1);
			// HACK: WebKit issues its own DOMActivate that we need to ignore. 
			//This property enables us to just NOP for that event.
			oEvt.mappedFromClick = true;
			FormsProcessor.dispatchEvent(element, oEvt);
			event.stopPropagation();
			event.preventDefault();
			dispatchXformsHintOff(element, event);
			element = element.parentNode;
		}
	})
	.addEvent('mouseover', function(event) {
		var target = event.target;
		if (!DECORATOR.getObject(target)) return;
		UX.Element(target).addClass("pc-hover");
		dispatchXformsHint(target, event);
	})
	.addEvent('mouseout', function(event) {
		var target = event.target;
		if (!DECORATOR.getObject(target)) return;
		UX.Element(target).removeClass("pc-hover");
		dispatchXformsHintOff(target, event);
	})
	.addEvent('keyup', function(event) {
		var target = event.target;
		if (!DECORATOR.getObject(target)) return;
		dispatchXformsHintOff(target, event);
	})
	.addEvent('keydown', function(event) {
		var element = event.target;
		while (element) {
			var behaviour = DECORATOR.getBehaviour(element);
			if (behaviour) {
				UX.Element(element).addClass('pc-focus');
				UX.dispatchEvent(element, "DOMFocusIn", true, false, true);
				if (behaviour.onKeyDown) {
					behaviour.onKeyDown(event);
				}
				if (event.stopped) break;
				FormsProcessor.onKeyDown(event);
			}
			element = element.parentNode;
		}
	})
	.addEvent('focus', function(event) {
		var element = event.target;
		while (element) {
			if (DECORATOR.getObject(element)) {
				UX.Element(element).addClass('pc-focus');
				UX.dispatchEvent(element, "DOMFocusIn", true, false, true);
			}
			element = element.parentNode;
		}
	})
	.addEvent('blur', function(event) {
		var element = event.target;
		while (element) {
			if (DECORATOR.getObject(element)) {
				UX.Element(element).addClass('pc-focus');
				UX.dispatchEvent(element, "DOMFocusOut", true, false, true);
			}
			element = element.parentNode;
		}
	});

});
