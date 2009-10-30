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
function Listener(elmnt) {
  this.element = elmnt;
}

// attachListeners();

Listener.prototype.attachListeners = function () {
  var oElement, sEvent, sObserverRef, sPhase, bUseCapture, oObserver, thisAsListener, oTarget;
  
  oElement = this.element;
  sEvent = NamespaceManager.getAttributeNS(oElement, 
          "http://www.w3.org/2001/xml-events", "event");
  sObserverRef = NamespaceManager.getAttributeNS(oElement, 
          "http://www.w3.org/2001/xml-events", "observer");
  sPhase = NamespaceManager.getAttributeNS(oElement, 
          "http://www.w3.org/2001/xml-events", "phase");
  bUseCapture = (sPhase === "capture") ? true : false;
  oObserver = null;
  
  if (!sEvent) {
    return;
  }
  
  // [TODO] What if the element doesn't exist yet?
  if (sObserverRef) {
    oObserver = oElement.ownerDocument.getElementById(sObserverRef);
  } else {
    oObserver = oElement.parentNode;        
  }
  
  try {
    if (oObserver && sEvent) {
      thisAsListener = this;

      if (UX.isIE) {
        if (!oObserver.addEventListener) {
          // Extend element from EventTarget if it does not
          // has addEventListener method.
          oTarget = new EventTarget(oObserver);
          DECORATOR.extend(oObserver, oTarget, false);
        }
      } else {
        // Firefox EventTarget::addEventListener will not take an 
        // element as a listener even if it exposes a handleEvent 
        // method. 
        // In order to work around this, a proxy function is required.
        thisAsListener = function (evt) {
          if (UX.isWebKit && evt.type === 'DOMActivate' && !evt.mappedFromClick) {
            // HACK: WebKit issues its own DOMActivate that we need to ignore.
            //       This condition ensures that we just NOP for that event.
            return;
          }
          oElement.handleEvent(evt);
        };
      }
          
      oObserver.addEventListener(sEvent, thisAsListener, bUseCapture);
    }
  } catch (e) {
    debugger;
  }
}; // attach()

Listener.prototype.detach = function () {
    /*
     * [TODO] Detach the registered listener.
     */
};

Listener.prototype.onDocumentReady = Listener.prototype.attachListeners;
