// Copyright © 2009 Backplane Ltd.
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
	var suiteNavigableControlList;
	
	var returnTrue = function () { return true; };
	var returnFalse = function () { return false; };

	YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
		name: "Testing the NavigableControlList object",

		setUp: function(){
			this.ncl = new NavigableControlList();
		},

		tearDown: function(){
			delete this.ncl;
		},

		testConstruction: function () {
			YAHOO.util.Assert.isNotUndefined(this.ncl);
			YAHOO.util.Assert.isObject(this.ncl);
			YAHOO.util.Assert.isNotNull(this.ncl);
			YAHOO.util.Assert.isFunction(this.ncl.addControl);
			YAHOO.util.Assert.isFunction(this.ncl.getFirstControl);
			YAHOO.util.Assert.isFunction(this.ncl.getLastControl);
			YAHOO.util.Assert.isFunction(this.ncl.getNextControl);
			YAHOO.util.Assert.isFunction(this.ncl.getPreviousControl);
		},

		testGetFirstControl: function () {
			var control0 = { isNavigableControl: true, navIndex: 0, isEnabled: returnTrue },
			    control1a = { isNavigableControl: true, navIndex: 1, isEnabled: returnFalse },
			    control1b = { isNavigableControl: true, navIndex: 1, isEnabled: returnTrue },
			    control2a = { isNavigableControl: true, navIndex: 2, isEnabled: returnTrue },
			    control2b = { isNavigableControl: true, navIndex: 2, isEnabled: returnTrue };

			YAHOO.util.Assert.isNull(this.ncl.getFirstControl());

			this.ncl.addControl(control2a);
			YAHOO.util.Assert.areSame(control2a, this.ncl.getFirstControl());

			this.ncl.addControl(control2b);
			YAHOO.util.Assert.areSame(control2a, this.ncl.getFirstControl());

			this.ncl.addControl(control1a);
			YAHOO.util.Assert.areSame(control2a, this.ncl.getFirstControl());

			this.ncl.addControl(control1b);
			YAHOO.util.Assert.areSame(control1b, this.ncl.getFirstControl());

			this.ncl.addControl(control0);
			YAHOO.util.Assert.areSame(control1b, this.ncl.getFirstControl());
		},

		testGetLastControl: function () {
			var control0 = { isNavigableControl: true, navIndex: 0, isEnabled: returnTrue },
			    control1 = { isNavigableControl: true, navIndex: 1, isEnabled: returnTrue },
			    control2 = { isNavigableControl: true, navIndex: 2, isEnabled: returnTrue },
			    control3a = { isNavigableControl: true, navIndex: 3, isEnabled: returnTrue },
			    control3b = { isNavigableControl: true, navIndex: 3, isEnabled: returnTrue },
			    control3c = { isNavigableControl: true, navIndex: 3, isEnabled: returnFalse },
			    control4 = { isNavigableControl: true, navIndex: 4, isEnabled: returnTrue };

			YAHOO.util.Assert.isNull(this.ncl.getLastControl());

			this.ncl.addControl(control2);
			YAHOO.util.Assert.areSame(control2, this.ncl.getLastControl());

			this.ncl.addControl(control1);
			YAHOO.util.Assert.areSame(control2, this.ncl.getLastControl());

			this.ncl.addControl(control3a);
			YAHOO.util.Assert.areSame(control3a, this.ncl.getLastControl());

			this.ncl.addControl(control3b);
			YAHOO.util.Assert.areSame(control3b, this.ncl.getLastControl());

			this.ncl.addControl(control3c);
			YAHOO.util.Assert.areSame(control3b, this.ncl.getLastControl());

			this.ncl.addControl(control0);
			YAHOO.util.Assert.areSame(control0, this.ncl.getLastControl());

			this.ncl.addControl(control4);
			YAHOO.util.Assert.areSame(control0, this.ncl.getLastControl());
		},

		testGetNextControl: function () {
			var control0 = { isNavigableControl: true, navIndex: 0, isEnabled: returnTrue },
			    control1 = { isNavigableControl: true, navIndex: 1, isEnabled: returnTrue },
			    control2 = { isNavigableControl: true, navIndex: 2, isEnabled: returnTrue },
			    control3a = { isNavigableControl: true, navIndex: 3, isEnabled: returnTrue },
			    control3b = { isNavigableControl: true, navIndex: 3, isEnabled: returnTrue },
			    control3c = { isNavigableControl: true, navIndex: 3, isEnabled: returnFalse },
			    control4 = { isNavigableControl: true, navIndex: 4, isEnabled: returnTrue };

			YAHOO.util.Assert.isNull(this.ncl.getNextControl());

			this.ncl.addControl(control0);
			this.ncl.addControl(control1);
			this.ncl.addControl(control4);
			this.ncl.addControl(control3a);
			this.ncl.addControl(control3b);
			this.ncl.addControl(control3c);
			this.ncl.addControl(control2);

			YAHOO.util.Assert.areSame(control2, this.ncl.getNextControl(control1));
			YAHOO.util.Assert.areSame(control3a, this.ncl.getNextControl(control2));
			YAHOO.util.Assert.areSame(control3b, this.ncl.getNextControl(control3a));
			YAHOO.util.Assert.areSame(control4, this.ncl.getNextControl(control3b));
			YAHOO.util.Assert.areSame(control0, this.ncl.getNextControl(control4));
			YAHOO.util.Assert.isNull(this.ncl.getNextControl(control0));
		},

		testGetPreviousControl: function () {
			var control0 = { isNavigableControl: true, navIndex: 0, isEnabled: returnTrue },
			    control1 = { isNavigableControl: true, navIndex: 1, isEnabled: returnTrue },
			    control2 = { isNavigableControl: true, navIndex: 2, isEnabled: returnTrue },
			    control3a = { isNavigableControl: true, navIndex: 3, isEnabled: returnTrue },
			    control3b = { isNavigableControl: true, navIndex: 3, isEnabled: returnTrue },
			    control3c = { isNavigableControl: true, navIndex: 3, isEnabled: returnFalse },
			    control4 = { isNavigableControl: true, navIndex: 4, isEnabled: returnTrue };

			YAHOO.util.Assert.isNull(this.ncl.getPreviousControl());

			this.ncl.addControl(control0);
			this.ncl.addControl(control1);
			this.ncl.addControl(control4);
			this.ncl.addControl(control3a);
			this.ncl.addControl(control3b);
			this.ncl.addControl(control3c);
			this.ncl.addControl(control2);

			YAHOO.util.Assert.isNull(this.ncl.getPreviousControl(control1));
			YAHOO.util.Assert.areSame(control1, this.ncl.getPreviousControl(control2));
			YAHOO.util.Assert.areSame(control2, this.ncl.getPreviousControl(control3a));
			YAHOO.util.Assert.areSame(control3a, this.ncl.getPreviousControl(control3b));
			YAHOO.util.Assert.areSame(control3b, this.ncl.getPreviousControl(control4));
			YAHOO.util.Assert.areSame(control4, this.ncl.getPreviousControl(control0));
		},

		testGetControlByAccessKey: function () {
			var control1 = { isNavigableControl: true, accessKey: '1', navIndex: 0 },
			    control2 = { isNavigableControl: true, accessKey: 'B', navIndex: 0 };

			YAHOO.util.Assert.isNull(this.ncl.getControlByAccessKey(control1.accessKey.charCodeAt(0)));
			YAHOO.util.Assert.isNull(this.ncl.getControlByAccessKey(control2.accessKey.charCodeAt(0)));

			this.ncl.addControl(control1);
			YAHOO.util.Assert.areSame(control1, this.ncl.getControlByAccessKey(control1.accessKey.charCodeAt(0)));
			YAHOO.util.Assert.isNull(this.ncl.getControlByAccessKey(control2.accessKey.charCodeAt(0)));

			this.ncl.addControl(control2);
			YAHOO.util.Assert.areSame(control1, this.ncl.getControlByAccessKey(control1.accessKey.charCodeAt(0)));
			YAHOO.util.Assert.areSame(control2, this.ncl.getControlByAccessKey(control2.accessKey.charCodeAt(0)));
		}
	}));
}());
