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
	
	name: "Test xf:setfocus",

	setUp: function() {
		this.setfocus = this.createElement("xf:setfocus", "http://www.w3.org/2002/xforms", document.body);
		this.setfocus.setAttribute("control", "inputTest");
		this.setfocusObject = new SetFocus(this.setfocus);
		DECORATOR.addBehaviour(this.setfocus, this.setfocusObject);

		this.input = this.createElement("xf:input", "http://www.w3.org/2002/xforms", document.body);
		this.inputObject = new Control(this.input);
		DECORATOR.addBehaviour(this.input, this.inputObject);
		
		this.input.id = "inputTest";
		this.inputObject.m_value = this.createElement("input", null, this.input);
		this.inputObject.m_proxy = {};
		this.inputObject.m_proxy.enabled = {
			getValue: function() {
				return true;
			}
		};
	},

	tearDown: function() {
		this.destroyElement(this.inputObject.m_value, "input.m_value", this.input);
		this.destroyElement(this.input, "input", document.body);
		this.destroyElement(this.setfocus, "setfocus", document.body);
		delete this.setfocusObject;
		delete this.inputObject;
	},

	testConstruction: function() {
		YAHOO.util.Assert.isFunction(this.setfocusObject.handleEvent);
		YAHOO.util.Assert.isFunction(this.setfocusObject.performAction);
	},

	testInvocation: function() {
		this.inputObject.m_value.blur();
		YAHOO.util.Assert.isFalse(this.inputObject.m_value === document.activeElement || this.inputObject.m_value.contains(document.activeElement));
		this.setfocusObject.performAction();
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
