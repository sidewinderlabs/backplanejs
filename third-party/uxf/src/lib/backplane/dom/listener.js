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

/*global UX, DECORATOR, EventTarget, NamespaceManager */
/*
 * The key to the whole thing is @ev:event, so there's
 * no point in proceeding if we don't have that.
 */
var Listener = new UX.Class({
	
	toString: function() {
		return 'xf:listener';
	},

	initialize: function(element) {
		this.element = element;
	},

	onDocumentReady: function() {
		var element = this.element;
		
		var sEvent = NamespaceManager.getAttributeNS(element, "http://www.w3.org/2001/xml-events", "event");
		if (!sEvent) return;
		
		var sObserverRef = NamespaceManager.getAttributeNS(element, "http://www.w3.org/2001/xml-events", "observer");
		var sPhase = NamespaceManager.getAttributeNS(element, "http://www.w3.org/2001/xml-events", "phase");
		var bUseCapture = sPhase === "capture";
		var oObserver = null;

		// [TODO] What if the element doesn't exist yet?
		if (sObserverRef) {
			oObserver = element.ownerDocument.getElementById(sObserverRef);
		} else {
			oObserver = element.parentNode;
		}

		try {
			if (oObserver && sEvent) {
				var self = this;
				var thisAsListener = this;

				if (UX.isIE) {
					if (!oObserver.addEventListener) {
						UX.extend(oObserver, new EventTarget(oObserver));
					}
				} else {
					// Firefox EventTarget::addEventListener will not take an 
					// element as a listener even if it exposes a handleEvent 
					// method. 
					// In order to work around this, a proxy function is required.
					thisAsListener = function(evt) {
						if (UX.isWebKit && evt.type === 'DOMActivate' && !evt.mappedFromClick) {
							// HACK: WebKit issues its own DOMActivate that we need to ignore.
							//       This condition ensures that we just NOP for that event.
							return;
						}
						self.handleEvent(evt);
					};
				}

				oObserver.addEventListener(sEvent, thisAsListener, bUseCapture);
			}
		} catch(e) {
			console.log("Error adding listener.");
		}
	},
	
	detach: function() {
		/* [TODO] Detach the registered listener.*/
	}

});

Listener.prototype.attachListeners = Listener.prototype.onDocumentReady;
