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

var suiteSetFocus = new YAHOO.tool.TestSuite({
	name : "Test setfocus module"
});

suiteSetFocus.add(
	new YAHOO.tool.TestCase({
		name: "Test xf:setfocus",

		setUp: function() {
			this.setfocus = this.createElement("xf:setfocus", "http://www.w3.org/2002/xforms", document.body);
			this.setfocus.setAttribute("control", "inputTest");
			DECORATOR.extend(this.setfocus, new EventTarget(this.setfocus), false);
			DECORATOR.extend(this.setfocus, new Context(this.setfocus), false);
			DECORATOR.extend(this.setfocus, new SetFocus(this.setfocus), false);

			this.input = this.createElement("xf:input", "http://www.w3.org/2002/xforms", document.body);
			DECORATOR.extend(this.input, new Control(this.input), false);
			this.input.id = "inputTest";
			this.input.m_value = this.createElement("input", null, this.input);
			this.input.m_proxy = {};
			this.input.m_proxy.enabled = { getValue: function () { return true; } };
		},

		tearDown: function() {
			this.destroyElement(this.input.m_value, "input.m_value", this.input);
			this.destroyElement(this.input, "input", document.body);
			this.destroyElement(this.setfocus, "setfocus", document.body);
		},

		testConstruction: function() {
			YAHOO.util.Assert.isFunction(this.setfocus.handleEvent);
			YAHOO.util.Assert.isFunction(this.setfocus.performAction);
		},

		testInvocation: function() {
			this.input.m_value.blur();
			YAHOO.util.Assert.isFalse(this.input.m_value === document.activeElement || this.input.m_value.contains(document.activeElement));
			this.setfocus.performAction();
			// TODO: This requires a working assertion that I can't figure out.
			//YAHOO.util.Assert.isTrue(this.input.m_value === document.activeElement || this.input.m_value.contains(document.activeElement));
		},

		createElement: function(name, ns, parent) {
			var element;

			if (ns) {
				element = document.createElementNS(ns, name);
			} else {
				element = document.createElement(name);
			}

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
