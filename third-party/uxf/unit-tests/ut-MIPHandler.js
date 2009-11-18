
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
	var suiteMIPHandler;

	var returnFalse = function () { 
		return false;
	};

	var returnTrue = function () { 
		return true;
	};

	YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
		name: "Testing the MIPHandler object",

		setUp: function(){
			this.testDiv = this.createElement("div", document.body);
			DECORATOR.extend(this.testDiv, new MIPHandler(this.testDiv), false);
		},

		tearDown: function(){
			this.destroyElement(this.testDiv, "testDiv", document.body);
			FormsProcessor.halted = false;
		},

		testUpdateMIPs : function () {
			this.testDiv.updateMIPs();
			YAHOO.util.Assert.areSame("disabled", this.testDiv.className);
		},

		testIsDirtyMIP : function () {
			this.testDiv.m_proxy = { m_oNode: {}, getMIPState: function () { return true; } };
			this.testDiv.m_MIPSCurrentlyShowing.readonly = false;
			YAHOO.util.Assert.areSame(true, this.testDiv.isDirtyMIP("readonly"));
		},

		testIsNotDirtyMIP : function () {
			this.testDiv.m_proxy = { m_oNode: {}, getMIPState: function () { return true; } };
			this.testDiv.m_MIPSCurrentlyShowing.readonly = true;
			YAHOO.util.Assert.areSame(false, this.testDiv.isDirtyMIP("readonly"));
		},

		testSetDirtyStatesNoChange : function () {
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
			this.testDiv.dirtyState.setClean();
			this.testDiv.setDirtyStates();
			YAHOO.util.Assert.areSame(false, this.testDiv.dirtyState.isDirty("readonly"));
			YAHOO.util.Assert.areSame(false, this.testDiv.dirtyState.isDirty("required"));
			YAHOO.util.Assert.areSame(false, this.testDiv.dirtyState.isDirty("valid"));
			YAHOO.util.Assert.areSame(false, this.testDiv.dirtyState.isDirty("enabled"));
		},

		testSetDirtyStatesAllChange : function () {
			this.testDiv.m_proxy = {
				m_oNode: {},
				readonly: {getValue: returnFalse },
				required: {getValue: returnFalse },
				valid: {getValue: returnTrue },
				enabled: {getValue: returnTrue },
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
			this.testDiv.dirtyState.setClean();

			this.testDiv.m_proxy = {
				m_oNode: {},
				readonly: { getValue: returnTrue },
				required: { getValue: returnTrue },
				valid: { getValue: returnFalse },
				enabled: { getValue: returnFalse },
				getMIPState: function (s) {
					switch(s) {
						case "readonly" :
							return true;
						case "required":
							return true;
						case "valid":
							return false;
						case "enabled":
							return false;
					}
				}
			};
			this.testDiv.setDirtyStates();
			YAHOO.util.Assert.areSame(true, this.testDiv.dirtyState.isDirty("readonly"));
			YAHOO.util.Assert.areSame(true, this.testDiv.dirtyState.isDirty("required"));
			YAHOO.util.Assert.areSame(true, this.testDiv.dirtyState.isDirty("valid"));
			YAHOO.util.Assert.areSame(true, this.testDiv.dirtyState.isDirty("enabled"));
		},

		testSetDirtyStatesSomeChange : function () {
			this.testDiv.m_proxy = {
				m_oNode: {},
				readonly: { getValue: returnFalse },
				required: { getValue: returnFalse },
				valid: { getValue: returnTrue },
				enabled: { getValue: returnTrue },
				getMIPState: function (s) {
					switch(s) {
						case "readonly":
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
			this.testDiv.dirtyState.setClean();

			this.testDiv.m_proxy = {
				m_oNode: {},
				readonly: { getValue: returnTrue },
				required: { getValue: returnFalse },
				valid: { getValue: returnFalse },
				enabled: { getValue: returnTrue },
				getMIPState: function (s) {
					switch(s) {
						case "readonly":
							return true;
						case "required":
							return false;
						case "valid":
							return false;
						case "enabled":
							return true;
					}
				}
			};

			this.testDiv.setDirtyStates();
			YAHOO.util.Assert.areSame(true, this.testDiv.dirtyState.isDirty("readonly"),"readonly");
			YAHOO.util.Assert.areSame(false, this.testDiv.dirtyState.isDirty("required"), "required");
			YAHOO.util.Assert.areSame(true, this.testDiv.dirtyState.isDirty("valid"), "valid");
			YAHOO.util.Assert.areSame(false, this.testDiv.dirtyState.isDirty("enabled"), "enabled");
		},

		testBroadcastMIPs: function () {
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
			YAHOO.util.Assert.areSame("", this.testDiv.eventsReceived);
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
			YAHOO.util.Assert.areSame("", this.testDiv.eventsReceived, "events");
		},

		testRewire: function () {
			var node = { getAttribute: function() { return null; } }, oProxy = getProxyNode(node);
			this.testDiv.getBoundNode = function(){
				return { model: {}, node: node };
			};
			this.testDiv.rewire();
			YAHOO.util.Assert.areSame(oProxy, this.testDiv.m_proxy);
		},

		testMustBeBound: function () {
			YAHOO.util.Assert.isFunction(this.testDiv.mustBeBound);
			YAHOO.util.Assert.isTrue(this.testDiv.mustBeBound());
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
