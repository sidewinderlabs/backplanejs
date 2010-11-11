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

var XFormsCase = new UX.Class({
	
	Extend: [Context, Container],
	
	toString: function() {
		return 'xf:case';
	},
	
	initialize: function(element) {
		this.element = element;
		this._case = new Case(element);
	},

	isCase: true,

	getSwitch: function() {
		return this._case.element.parentNode;
	},

	deselect: function() {
		var element = this._case.element;
		this._case.deselect();
		spawn(function() {
			UX.dispatchEvent(element, "xforms-deselect", true, false, true);
			FormsProcessor.refreshDescendentsForRelevance(element.childNodes);
		});
	},

	select: function() {
		var element = this._case.element;
		this._case.select();
		spawn(function() {
			UX.dispatchEvent(element, "xforms-select", true, false, true);
			FormsProcessor.refreshDescendentsForRelevance(element.childNodes);
		});
	},

	toggle: function() {
		var oSwitch = DECORATOR.getBehaviour(this.getSwitch());
		if (oSwitch && UX.id(this.element)) {
			oSwitch.toggle(UX.id(this.element));
		}
	}
	
});
