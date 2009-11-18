// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
//
// Copyright (c) 2009 Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var suiteContainer = new YAHOO.tool.TestSuite({
	name : "Test container module"
});

suiteContainer.add(
	new YAHOO.tool.TestCase({
		name: "Test container",

		setUp: function() {
			this.container = this.createElement("div", document.body);
			DECORATOR.extend(this.container, new Container(this.container), false);
			this.container.m_proxy = {};

			this.containee = this.createElement("div", this.container);
		},

		tearDown: function() {
			this.destroyElement(this.containee, "containee", this.container);
			this.destroyElement(this.container, "container", document.body);
		},

		testGiveFocusXFormsControl: function() {
			this.container.m_proxy.enabled = { getValue: function () { return true; } };

			this.decorateAsControl(this.containee);

			this.container.blur();
			YAHOO.util.Assert.isFalse(this.containee === document.activeElement || this.containee.contains(document.activeElement));
			this.container.giveFocus();
			YAHOO.util.Assert.isTrue(this.containee === document.activeElement || this.containee.contains(document.activeElement));

			this.destroyElement(this.containee.m_value, "containee.m_value", this.containee);
		},

		testGiveFocusXFormsSubContainer: function() {
			this.container.m_proxy.enabled = { getValue: function () { return true; } };

			DECORATOR.extend(this.containee, new Container(this.containee), false);
			this.containee.m_proxy = {};
			this.containee.m_proxy.enabled = { getValue: function () { return true; } };

			this.containee.descendant = this.createElement("div", this.containee);
			this.decorateAsControl(this.containee.descendant);

			this.container.blur();
			YAHOO.util.Assert.isFalse(this.containee.descendant === document.activeElement || this.containee.descendant.contains(document.activeElement));
			this.container.giveFocus();
			YAHOO.util.Assert.isTrue(this.containee.descendant === document.activeElement || this.containee.descendant.contains(document.activeElement));

			this.destroyElement(this.containee.descendant.m_value, "containee.descendant.m_value", this.containee.descendant);
			this.destroyElement(this.containee.descendant, "containee.descendant", this.containee);
		},

		testGiveFocusNonXFormsSubContainer: function() {
			this.container.m_proxy.enabled = { getValue: function () { return true; } };

			this.containee.descendant = this.createElement("div", this.containee);
			this.decorateAsControl(this.containee.descendant);

			this.container.blur();
			YAHOO.util.Assert.isFalse(this.containee.descendant === document.activeElement || this.containee.descendant.contains(document.activeElement));
			this.container.giveFocus();
			YAHOO.util.Assert.isTrue(this.containee.descendant === document.activeElement || this.containee.descendant.contains(document.activeElement));

			this.destroyElement(this.containee.descendant.m_value, "containee.descendant.m_value", this.containee.descendant);
			this.destroyElement(this.containee.descendant, "containee.descendant", this.containee);
		},

		createElement: function(name, parent) {
			var element = document.createElement(name);

			if (parent) {
				parent.appendChild(element);
			}

			return element;
		},

		destroyElement: function(element, propertyName, parent) {
			if (parent) {
				parent.removeChild(element);
			}

			delete this[propertyName];
		},

		decorateAsControl: function(element) {
			DECORATOR.extend(element, new Control(element), false);
			element.m_proxy = {};
			element.m_proxy.enabled = { getValue: function () { return true; } };
			element.m_value = this.createElement("input", element);
		}
	}));
