
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
	var suiteOptionalBinding;

	var returnFalse = function () { 
		return false;
	};

	var returnTrue = function () { 
		return true;
	};

	YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
		name: "Testing the OptionalBinding object",

		setUp: function(){
			this.ob = this.createElement("div", document.body);
			DECORATOR.extend(this.ob, new MIPHandler(this.ob), false);
			DECORATOR.extend(this.ob, new OptionalBinding(this.ob), false);
		},

		tearDown: function(){
			document.body.removeChild(this.ob);
			this.ob = null;
		},

		testMustBeBound: function () {
			YAHOO.util.Assert.isFunction(this.ob.mustBeBound);
			YAHOO.util.Assert.isFalse(this.ob.mustBeBound());
		},

		testUpdateMIPs : function () {
			this.ob.updateMIPs();
			YAHOO.util.Assert.areSame("enabled", this.ob.className);
		},

		createElement: function (name, parent) {
			var element = document.createElement(name);

			if (parent) {
				parent.appendChild(element);
			}

			return element;
		}
	}));
}());
