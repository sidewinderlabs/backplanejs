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

function SrcMixin(element) {
	this.element = element;
	this.m_oDOM = null;
	this.m_sValue = null;
};

SrcMixin.prototype.load = function(labelURL){

	 if ( labelURL ) {
         //
         // We map our @src to an XLink.
         //    
        this.element.setAttribute("xlink:actuate", "onRequest");
        this.element.setAttribute("xlink:show", "embed");
        this.element.setAttribute("xlink:href", labelURL);
        
        //Prevent XLink resolving the base URL.
        //
        //this.element.setAttribute("base", " ");
        this.element.attachSingleBehaviour(XLinkElement);
        
        //
        // When the document has been loaded by our XLink handler
        // we parse it and then fire a 'document load' event.
        //    
        this.element.addEventListener(
        "xlink-traversed", {
            context: this,
            handleEvent: function (evtParam) {
               ///Since it is done traversing we can set the label element
        		this.context.textContent = this.context.innerHTML;
            }
        },
        false);
        
        //
        // If the XLink handler for src or resource fails, then 
        // we dispatch xforms-link-exception
        //
        this.element.addEventListener(
        "xlink-traversal-failure", {
            context: this,
            handleEvent: function (evtParam) {
                var dispatcher = this.context;
                spawn(function () {
                    dispatcher.dispatchException("xforms-link-exception", evtParam.context);
                });
            }
        },
        false);
        
        /*
        * [ISSUE] Need to decide how to actuate, since
        * onLoad is too late.
        */
        
        this.element.Actuate();
    }
}

SrcMixin.prototype.parseInstance = function(){};

SrcMixin.prototype.finishLoad = function(){
	return false;
};

