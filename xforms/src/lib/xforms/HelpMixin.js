/*
 * Copyright (c) 2009 Backplane Ltd.
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
 * The Help mixin registers for the XForms help event, and then activates
 * whichever object it is attached to.
 *
 * Accompanying CSS classes are in help.css.
 */

function HelpMixin( el ) {
	// Save a pointer to the element.
	//
	this.element = el;
	
	// The context for our help message is the parent element.
	//
	var context = el.parentNode;
	
	// It's difficult to see how we might not find a context, but it doesn't
	// hurt to check.
	//
	if ( !context ) {
		throw "No context found for help";
	}

	// Help is usually used with Message, so set @level to modeless.
	//
	el.setAttribute("level", "modeless");

	// The positioning of the help is relative to its container so
	// indicate that it's a hint container, so that the CSS styles
	// in help.css can kick in.
	//
	UX.addClassName(context, "xf-help-container");

	// Register for the help event. The action is simply to 'activate'
	// whatever object has acquired the help aspect.
	//
	context.addEventListener(
		"xforms-help",
		{
			handleEvent: function( evt ) {
				var forwardEvt = el.ownerDocument.createEvent("Events");
				
				forwardEvt.initEvent("ub-activate", false, false);
				FormsProcessor.dispatchEvent(el, forwardEvt);
				return;
			}
		},
		false
	);
};
