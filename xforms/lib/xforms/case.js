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

function XFormsCase(elmnt) {
	this._case = new Case(elmnt);
}

XFormsCase.prototype.isCase = true;

XFormsCase.prototype.getSwitch = function() {
	return this._case.element.parentNode;
};

XFormsCase.prototype.deselect = function() {
	var element = this._case.element;
	this._case.deselect();
	spawn(function () {
		UX.dispatchEvent(element, "xforms-deselect", true, false, true);
		FormsProcessor.refreshDescendentsForRelevance(element.childNodes);
	});
};

XFormsCase.prototype.select = function() {
	var element = this._case.element;
	this._case.select();
	spawn(function () {
		UX.dispatchEvent(element, "xforms-select", true, false, true);
		FormsProcessor.refreshDescendentsForRelevance(element.childNodes);
	});
};

XFormsCase.prototype.toggle = function() {
	var oSwitch = this.getSwitch();
	if (oSwitch && UX.id(this)) {
		oSwitch.toggle(UX.id(this));
	}
};
