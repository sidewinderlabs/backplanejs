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

YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
	
	name: "Test container",

	setUp: function() {
		this.container = this.createElement("div", document.body);
		this.containerObject = new Container(this.container);
		this.containerObject.m_proxy = {};

		this.containee = this.createElement("div", this.container);
	},

	tearDown: function() {
		this.destroyElement(this.containee, "containee", this.container);
		this.destroyElement(this.container, "container", document.body);
		delete this.containerObject;
	},

	testGiveFocusXFormsControl: function() {
		this.containerObject.m_proxy.enabled = {
			getValue: function() {
				return true;
			}
		};

		this.containeeObject = this.decorateAsControl(this.containee);

		this.container.blur();
		YAHOO.util.Assert.isFalse(this.containee === document.activeElement || this.containee.contains(document.activeElement));
		this.containerObject.giveFocus();
		YAHOO.util.Assert.isTrue(this.containee === document.activeElement || this.containee.contains(document.activeElement));

		this.destroyElement(this.containeeObject.m_value, "containee.m_value", this.containee);
	},

	testGiveFocusXFormsSubContainer: function() {
		this.containerObject.m_proxy.enabled = {
			getValue: function() {
				return true;
			}
		};

		this.containeeObject.descendant = this.createElement("div", this.containee);
		this.containeeDescendantObject = this.decorateAsControl(this.containeeObject.descendant);

		this.container.blur();
		YAHOO.util.Assert.isFalse(this.containeeObject.descendant === document.activeElement || this.containeeObject.descendant.contains(document.activeElement));
		this.containerObject.giveFocus();
		YAHOO.util.Assert.isTrue(this.containeeObject.descendant === document.activeElement || this.containeeObject.descendant.contains(document.activeElement));

		this.destroyElement(this.containeeDescendantObject.m_value, "containee.descendant.m_value", this.containeeObjectDescendant);
		this.destroyElement(this.containeeObject.descendant, "containee.descendant", this.containee);
	},

	testGiveFocusNonXFormsSubContainer: function() {
		this.containerObject.m_proxy.enabled = {
			getValue: function() {
				return true;
			}
		};

		this.containeeObject.descendant = this.createElement("div", this.containee);
		this.containeeDescendantObject = this.decorateAsControl(this.containeeObject.descendant);

		this.container.blur();
		YAHOO.util.Assert.isFalse(this.containeeObject.descendant === document.activeElement || this.containeeObject.descendant.contains(document.activeElement));
		this.containerObject.giveFocus();
		YAHOO.util.Assert.isTrue(this.containeeObject.descendant === document.activeElement || this.containeeObject.descendant.contains(document.activeElement));

		this.destroyElement(this.containeeDescendantObject.m_value, "containee.descendant.m_value", this.containeeObject.descendant);
		this.destroyElement(this.containeeObject.descendant, "containee.descendant", this.containee);
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
		var object = new Control(element);
		DECORATOR.addBehaviour(element, object);
		object.m_proxy = {};
		object.m_proxy.enabled = {
			getValue: function() {
				return true;
			}
		};
		object.m_value = this.createElement("input", element);
		return object;
	}
}));
