/*
 * Copyright © 2009 Backplane Ltd.
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

function NavigableControl(element) {
	this.element = element;
}

NavigableControl.prototype.isNavigableControl = true;

NavigableControl.prototype.onContentReady = function () {
	this.setNavIndex();
	this.setAccessKey();

	FormsProcessor.addToNavigationList(this);
};

NavigableControl.prototype.setNavIndex = function () {
	this.navIndex = parseInt(this.element.getAttribute('navindex') || '0', 10);
};

NavigableControl.prototype.setAccessKey = function () {
	this.accessKey = this.element.getAttribute('accesskey');
};

NavigableControl.prototype.onKeyDown = function (evt) {
	if (UX.isHTMLTabKeyEvent(evt)) {
		if (UX.isShiftKeyPressed(evt)) {
			this.navigateToPreviousControl();
		} else {
			this.navigateToNextControl();
		}

		return UX.cancelHTMLEvent(evt);
	}

	return true;
};

NavigableControl.prototype.navigateToNextControl = function () {
	UX.dispatchEvent(this.element, 'xforms-next', false, true, false);

	FormsProcessor.navigateToNextControl(this);
};

NavigableControl.prototype.navigateToPreviousControl = function () {
	UX.dispatchEvent(this.element, 'xforms-previous', false, true, false);

	FormsProcessor.navigateToPreviousControl(this);
};
