  
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
 
/*globals document, YAHOO, spawn, FormsProcessor */
/*members Dom, addClass, createEvent, dispatchEvent, initEvent, 
    isInRange, onInRange, onOutOfRange, removeClass, util 
*/

/**
  @constructor
  @class
    Specifies a control that may be requested to  display values that it is incapable of displaying. 
*/
  var FiniteControl = function(elmnt)
  {
    var m_bInRange = true;
    var element = elmnt;
    return {
      /**
        To be called when the appropriate object is incapable of displaying the value given to it.
        dispatches the out-of-range event and styles the object as out-of-range.
      */
      onOutOfRange : function() {
       if(m_bInRange) {
          m_bInRange = false;
          if(element) {
            UX.addClassName(element, "xforms-out-of-range");
            if(element.dispatchEvent) {
              var oEvt = document.createEvent("Events");
              oEvt.initEvent("xforms-out-of-range", false, true);
              FormsProcessor.dispatchEvent(element,oEvt);
            }
          }
        }
      },
      /**
        To be called when the appropriate object is capable of displaying the value given to it.
        dispatches the in-range event and styles the object as in-range.
      */
      onInRange : function() {
       if(!m_bInRange) {
        m_bInRange = true;
          if(element) {
            UX.removeClassName(element, "xforms-out-of-range");
            if(element.dispatchEvent) {
              var oEvt = document.createEvent("Events");
              oEvt.initEvent("xforms-in-range", false, true);
              FormsProcessor.dispatchEvent(element,oEvt);
          }
        }
       }
      },
      /**
        Reports whether the object is in range.
        @returns {Boolean} true if the object is in range, otherwise false.
      */
      isInRange : function() {
        return m_bInRange;
      }
    };
  };
      
