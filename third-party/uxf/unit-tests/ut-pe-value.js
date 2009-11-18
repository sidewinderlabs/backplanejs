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

var suitePeValue = new YAHOO.tool.TestSuite({
	name : "Test pe-value module"
});

suitePeValue.add(
	new YAHOO.tool.TestCase({
		name: "Test value pseudo-element",

		setUp: function() {
			this.peValue = this.createElement("div", document.body);
			DECORATOR.extend(this.peValue, new PeValue(this.peValue), false);

			this.peValue.m_value = this.createElement("input", this.peValue);
		},

		tearDown: function() {
			this.destroyElement(this.peValue.m_value, "peValue.m_value", this.peValue);
			this.destroyElement(this.peValue, "peValue", document.body);
		},

		testGiveFocus: function() {
			this.peValue.m_value.blur();
			YAHOO.util.Assert.isFalse(this.peValue.m_value === document.activeElement || this.peValue.m_value.contains(document.activeElement));
			this.peValue.giveFocus();
			YAHOO.util.Assert.isTrue(this.peValue.m_value === document.activeElement || this.peValue.m_value.contains(document.activeElement));
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
		}
	}));
