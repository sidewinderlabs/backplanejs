// Copyright (c) 2008-2009 Backplane Ltd.
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

(function(){
	var suiteMIPEventTarget;

	var returnFalse = function () { 
		return false;
	};

	var returnTrue = function () { 
		return true;
	};

	YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
		name: "Testing the MIPEventTarget object",

		setUp: function(){
			this.testDiv = this.createElement("div", document.body);
			DECORATOR.extend(this.testDiv, new MIPHandler(this.testDiv), false);
			DECORATOR.extend(this.testDiv, new MIPEventTarget(this.testDiv), false);
		},

		tearDown: function(){
			this.destroyElement(this.testDiv, "testDiv", document.body);
			FormsProcessor.halted = false;
		},

		testBrooacastMIPs: function () {
			this.testDiv.m_proxy = {
				m_oNode: {},
				readonly: { getValue: returnFalse },
				required: { getValue: returnFalse },
				valid: { getValue: returnTrue },
				enabled: { getValue: returnTrue },
				getMIPState: function (s) {
					switch(s) {
						case "readonly" :
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
							return true;
					}
				}
			};

			this.testDiv.updateMIPs();
			this.testDiv.eventsReceived = "";
			this.testDiv.dispatchEvent = function (e) {
				this.eventsReceived += e.type;
			};

			this.testDiv.broadcastMIPs();
			YAHOO.util.Assert.areSame("xforms-validxforms-optionalxforms-readwritexforms-enabled", this.testDiv.eventsReceived);
		},

		testRefresh: function () {
			this.testDiv.m_proxy = {
				m_oNode: {},
				readonly: { getValue: returnFalse },
				required: { getValue: returnFalse },
				valid: { getValue: returnTrue },
				enabled: { getValue: returnTrue },
				getMIPState: function (s) {
					switch(s) {
						case "readonly" :
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
							return true;
					}
				}
			};

			this.testDiv.eventsReceived = "";
			this.testDiv.dispatchEvent = function (e) {
				this.eventsReceived += e.type;
			};

			this.testDiv.refresh();
			YAHOO.util.Assert.areSame( "enabled read-write optional valid", this.testDiv.className, "class");
			YAHOO.util.Assert.areSame("xforms-validxforms-optionalxforms-readwritexforms-enabled", this.testDiv.eventsReceived, "events");
		},

		createElement: function (name, parent) {
			var element = document.createElement(name);

			if (parent) {
				parent.appendChild(element);
			}

			return element;
		},

		destroyElement: function (element, propertyName, parent) {
			if (parent) {
				parent.removeChild(element);
			}

			delete this[propertyName];
		}
	}));
}());
