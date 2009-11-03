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
function Submit(elmnt) {
    this.element = elmnt;
    this.element.addEventListener("DOMActivate", this, false);
}

Submit.prototype.handleEvent = DeferToConditionalInvocationProcessor;

Submit.prototype.performAction = function(oEvt) {
    var control = this;
    var oSubmission = null;
    var oDocument = control.element.ownerDocument;
    if (oEvt.type === "DOMActivate") {
        if (UX.isWebKit && !oEvt.mappedFromClick) {
            // HACK: WebKit issues its own DOMActivate that we need to ignore.
            //       This condition ensures that we just NOP for that event.
            return;
        }

        var sID = control.element.getAttribute("submission");

        if (sID) {
            oSubmission = oDocument.getElementById(sID);
            if (!oSubmission || !NamespaceManager.compareFullName(oSubmission,"submission","http://www.w3.org/2002/xforms")) {
              UX.dispatchEvent(this.element, "xforms-binding-exception",  true, false, false);
            }
        } else {
            // if there is not a declared submssion id, get the first submission
            // element of the default model
            var oModel = getModelFor(oDocument);
            
            if (oModel) {
                // halt on the first submission in model
                var nsChildNodes = oModel.element.childNodes;
                for ( var i = 0; i < nsChildNodes.length; i++) {
                    if (NamespaceManager.compareFullName(nsChildNodes[i],
                            "submission", "http://www.w3.org/2002/xforms")) {
                        oSubmission = nsChildNodes[i];
                        break;
                    }
                }
            }
            
            if (!oSubmission) {
              throw "There is no submission element associated with the default model.";
            }
        } 
        
        if (oSubmission) {
            var oSubmitEvt = oDocument.createEvent("Events");
            oSubmitEvt.initEvent("xforms-submit", true, true, null, null);
            spawn( function() {
                FormsProcessor.dispatchEvent(oSubmission, oSubmitEvt)
            });
        }
    }
};
