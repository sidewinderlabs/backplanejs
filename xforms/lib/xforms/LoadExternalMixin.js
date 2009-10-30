/*
 * Copyright (c) 2008-9 Backplane Ltd.
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

function LoadExternalMixin(){
};

LoadExternalMixin.prototype.onContentReady = function () {
    if (!this.m_oDOM) {       
        // @src takes precedence over inline data and @resource;
        // inline data takes precedence over @resource
        //
        if (this.getAttribute("src")) { 
            this.load(this.getAttribute("src"));
        } else {
            // is there inline data?
            //
            this.parseInstance();
            
            if (!this.finishLoad()) {
                // if there wasn't a src attribute, nor an inline instance
                // then let's try a resource attribute
                //
                if (this.getAttribute("resource")) {
                    this.load(this.getAttribute("resource"));
                }      
            }   
        }      
    }
};

LoadExternalMixin.prototype.dispatchException = function (exceptionName, exceptionContext) {
    // indicate a problem with the instance state and
    // throw an exception;   
    //
    var evt = document.createEvent("Events");
    evt.initEvent(exceptionName, true, false);
    evt.context = exceptionContext;
    this.element["elementState"] = -1;
    FormsProcessor.dispatchEvent(
        (typeof this.element.parentNode.modelConstruct === "function") ? this.element.parentNode : this.element, 
        evt
    );
};
