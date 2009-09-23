/*
 * Copyright  2009 Backplane Ltd.
 *
 * Ubiquity provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 *
 * The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
 * library.
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

/*
 * The Hint mixin registers for the XForms hint event, and then activates
 * whichever object it is attached to.
 *
 * Accompanying CSS classes are in hint.css.
 */

function HintMixin( element ) {
	// Save a pointer to the element.
	//
	this.element = element;
	
	// The context for our hint message is the parent element.
	//
	var context = element.parentNode;
	
	// It's difficult to see how we might not find a context, but it doesn't
	// hurt to check.
	//
	if ( !context ) {
		throw "No context found for hint";
	}

	// Hint is usually used with Message, so set @level to ephemeral.
	//
	element.setAttribute("level", "ephemeral");

	// The positioning of the hint is relative to its container so
	// indicate that it's a hint container, so that the CSS styles
	// in hint.css can kick in.
	//
	UX.addClassName(context, "xf-hint-container");

	// Register for the hint event. The action is simply to 'activate'
	// whatever object has acquired the hint aspect.
	//
	if(typeof context.addEventListener === "function") {
	    context.addEventListener(
		    "xforms-hint",
		    {
			    handleEvent: function( evt ) {
				    var forwardEvt = document.createEvent("Events");
    				
				    forwardEvt.initEvent("ub-activate", false, false);
				    forwardEvt.activate = true;
				    FormsProcessor.dispatchEvent(element, forwardEvt);
				    return;
			    }
		    },
		    false
	    );
	    context.addEventListener(
		    "xforms-hint-off",
		    {
			    handleEvent: function( evt ) {
				    var forwardEvt = document.createEvent("Events");
    				
				    forwardEvt.initEvent("ub-activate", false, false);
				    forwardEvt.activate = false;
				    FormsProcessor.dispatchEvent(element, forwardEvt);
				    return;
			    }
		    },
		    false
	    );
    }
};
