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
(function() {
	var suiteMIPHandler;

	var returnFalse = function() {
		return false;
	};

	var returnTrue = function() {
		return true;
	};

	YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
		name: "Testing the MIPHandler object",

		setUp: function() {
			this.testDiv = this.createElement("div", document.body);
			this.testObject = new MIPHandler(this.testDiv);
			UX.extend(this.testDiv, new EventTarget(this.testDiv));
		},

		tearDown: function() {
			this.destroyElement(this.testDiv, "testDiv", document.body);
			delete this.testObject;
			FormsProcessor.halted = false;
		},

		testUpdateMIPs: function() {
			this.testObject.updateMIPs();
			YAHOO.util.Assert.areSame("disabled", this.testDiv.className);
		},

		testIsDirtyMIP: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				getMIPState: function() {
					return true;
				}
			};
			this.testObject.m_MIPSCurrentlyShowing.readonly = false;
			YAHOO.util.Assert.areSame(true, this.testObject.isDirtyMIP("readonly"));
		},

		testIsNotDirtyMIP: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				getMIPState: function() {
					return true;
				}
			};
			this.testObject.m_MIPSCurrentlyShowing.readonly = true;
			YAHOO.util.Assert.areSame(false, this.testObject.isDirtyMIP("readonly"));
		},

		testSetDirtyStatesNoChange: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnFalse
				},
				required: {
					getValue: returnFalse
				},
				valid: {
					getValue: returnTrue
				},
				enabled: {
					getValue: returnTrue
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
							return true;
					}
					return null;
				}
			};

			this.testObject.updateMIPs();
			this.testObject.dirtyState.setClean();
			this.testObject.setDirtyStates();
			YAHOO.util.Assert.areSame(false, this.testObject.dirtyState.isDirty("readonly"));
			YAHOO.util.Assert.areSame(false, this.testObject.dirtyState.isDirty("required"));
			YAHOO.util.Assert.areSame(false, this.testObject.dirtyState.isDirty("valid"));
			YAHOO.util.Assert.areSame(false, this.testObject.dirtyState.isDirty("enabled"));
		},

		testSetDirtyStatesAllChange: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnFalse
				},
				required: {
					getValue: returnFalse
				},
				valid: {
					getValue: returnTrue
				},
				enabled: {
					getValue: returnTrue
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
							return true;
					}
					return null;
				}
			};

			this.testObject.updateMIPs();
			this.testObject.dirtyState.setClean();

			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnTrue
				},
				required: {
					getValue: returnTrue
				},
				valid: {
					getValue: returnFalse
				},
				enabled: {
					getValue: returnFalse
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return true;
						case "required":
							return true;
						case "valid":
							return false;
						case "enabled":
							return false;
					}
					return null;
				}
			};
			this.testObject.setDirtyStates();
			YAHOO.util.Assert.areSame(true, this.testObject.dirtyState.isDirty("readonly"));
			YAHOO.util.Assert.areSame(true, this.testObject.dirtyState.isDirty("required"));
			YAHOO.util.Assert.areSame(true, this.testObject.dirtyState.isDirty("valid"));
			YAHOO.util.Assert.areSame(true, this.testObject.dirtyState.isDirty("enabled"));
		},

		testSetDirtyStatesSomeChange: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnFalse
				},
				required: {
					getValue: returnFalse
				},
				valid: {
					getValue: returnTrue
				},
				enabled: {
					getValue: returnTrue
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
							return true;
					}
					return null;
				}
			};

			this.testObject.updateMIPs();
			this.testObject.dirtyState.setClean();

			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnTrue
				},
				required: {
					getValue: returnFalse
				},
				valid: {
					getValue: returnFalse
				},
				enabled: {
					getValue: returnTrue
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return true;
						case "required":
							return false;
						case "valid":
							return false;
						case "enabled":
						return true;
					}
					return null;
				}
			};

			this.testObject.setDirtyStates();
			YAHOO.util.Assert.areSame(true, this.testObject.dirtyState.isDirty("readonly"), "readonly");
			YAHOO.util.Assert.areSame(false, this.testObject.dirtyState.isDirty("required"), "required");
			YAHOO.util.Assert.areSame(true, this.testObject.dirtyState.isDirty("valid"), "valid");
			YAHOO.util.Assert.areSame(false, this.testObject.dirtyState.isDirty("enabled"), "enabled");
		},

		testBroadcastMIPs: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnFalse
				},
				required: {
					getValue: returnFalse
				},
				valid: {
					getValue: returnTrue
				},
				enabled: {
					getValue: returnTrue
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
							return true;
					}
					return null;
				}
			};

			this.testObject.updateMIPs();
			this.testObject.eventsReceived = "";
			var testObject = this.testObject;
			this.testDiv.dispatchEvent = function(e) {
				testObject.eventsReceived += e.type;
			};

			this.testObject.broadcastMIPs();
			YAHOO.util.Assert.areSame("", this.testObject.eventsReceived);
		},

		testRefresh: function() {
			this.testObject.m_proxy = {
				m_oNode: {},
				readonly: {
					getValue: returnFalse
				},
				required: {
					getValue: returnFalse
				},
				valid: {
					getValue: returnTrue
				},
				enabled: {
					getValue: returnTrue
				},
				getMIPState: function(s) {
					switch (s) {
						case "readonly":
							return false;
						case "required":
							return false;
						case "valid":
							return true;
						case "enabled":
						return true;
					}
					return null;
				}
			};

			this.testObject.eventsReceived = "";
			var testObject = this.testObject;
			this.testDiv.dispatchEvent = function(e) {
				testObject.eventsReceived += e.type;
			};

			this.testObject.refresh();
			YAHOO.util.Assert.areSame("enabled read-write optional valid", this.testDiv.className, "class");
			YAHOO.util.Assert.areSame("", this.testObject.eventsReceived, "events");
		},

		testRewire: function() {
			var node = {
				attrs: {},
				nodeType: 1,
				setAttribute: function(p, v) {
					this.attrs[p] = v;
				},
				getAttribute: function(p) {
					return this.attrs[p];
				}
			};
			var oProxy = UX.getProxyNode(node);
			var model = new Model(document.createElement('div'));
			UX.extend(model.element, new EventTarget(model.element));
			_model_contentReady(model);
			this.testObject.getBoundNode = function() {
				return {
					model: model,
					node: node
				};
			};
			this.testObject.rewire();
			YAHOO.util.Assert.areSame(oProxy, this.testObject.m_proxy);
		},

		testMustBeBound: function() {
			YAHOO.util.Assert.isFunction(this.testObject.mustBeBound);
			YAHOO.util.Assert.isTrue(this.testObject.mustBeBound());
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
} ());
