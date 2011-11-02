/*
 * Copyright  2009 Backplane Ltd.
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

//= require mip-handler
//= require mif-eventtarget
//= require context
//= require control

var NavigableControl = new UX.Class({
	
	Mixins: [MIPHandler, MIPEventTarget, Context, Control],
	
	toString: function() {
		return 'xf:navigable-control';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	isNavigableControl: true,

	onContentReady: function() {
		this.setNavIndex();
		this.setAccessKey();

		FormsProcessor.addToNavigationList(this);
	},

	setNavIndex: function() {
		this.navIndex = parseInt(this.element.getAttribute('navindex') || '0', 10);
	},

	setAccessKey: function() {
		this.accessKey = this.element.getAttribute('accesskey');
	},

	onKeyDown: function(event) {
		if (UX.isHTMLTabKeyEvent(event)) {
			if (UX.isShiftKeyPressed(event)) {
				this.navigateToPreviousControl();
			} else {
				this.navigateToNextControl();
			}
			return UX.cancelHTMLEvent(event);
		}

		return true;
	},

	navigateToNextControl: function() {
		UX.dispatchEvent(this.element, 'xforms-next', false, true, false);

		FormsProcessor.navigateToNextControl(this);
	},

	navigateToPreviousControl: function() {
		UX.dispatchEvent(this.element, 'xforms-previous', false, true, false);

		FormsProcessor.navigateToPreviousControl(this);
	}
	
});
