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

var suiteControl = new YAHOO.tool.TestSuite({
	name : "Test Control module"
});

suiteControl.add(
	new YAHOO.tool.TestCase({
		name: "Test control base class",

		setUp: function() {
			this.control = new Control({});
			this.control.m_value = this.createElement("input", document.body);
			this.control.m_proxy = {};
		},

		tearDown: function() {
			this.destroyElement(this.control.m_value, "control.m_value", document.body);
			delete this.control;
		},

		testGiveFocus: function() {
			this.control.m_proxy.enabled = { getValue: function () { return true; } };
			this.control.m_value.blur();
			YAHOO.util.Assert.isFalse(this.control.m_value === document.activeElement || this.control.m_value.contains(document.activeElement));
			this.control.giveFocus();
			YAHOO.util.Assert.isTrue(this.control.m_value === document.activeElement || this.control.m_value.contains(document.activeElement));
		},

		testGiveFocusDisabled: function() {
			this.control.m_proxy.enabled = { getValue: function () { return false; } };
			this.control.m_value.blur();
			YAHOO.util.Assert.isFalse(this.control.m_value === document.activeElement || this.control.m_value.contains(document.activeElement));
			this.control.giveFocus();
			YAHOO.util.Assert.isFalse(this.control.m_value === document.activeElement || this.control.m_value.contains(document.activeElement));
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
