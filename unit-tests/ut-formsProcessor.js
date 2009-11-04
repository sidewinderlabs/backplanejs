
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
	var testDiv, suiteGetBindObject, errorReceptacle, createElement, destroyElement;

	errorReceptacle = {
	  err:"",
	  ownerDocument: document,
	  dispatchEvent: function (e) {
			this.err = e.type;
	  }
	};

	
	createElement = function(name, ns, parent) {
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
	};

	destroyElement = function(element, propertyName, parent) {
		if (parent) {
			parent.removeChild(element);
		}
	};
	
	suiteGetBindObject = new YAHOO.tool.TestSuite({
		setUp: function(){
			testDiv = createElement("div", "", document.body);
			testDiv.innerHTML = "<xf:bind xmlns:xf='http://www.w3.org/2002/xforms' id='bind-0'></xf:bind><span id='not-a-bind'></span>";
		},

		tearDown: function(){
			destroyElement(testDiv, "testDiv", document.body);  	
		}

	});

	suiteGetBindObject.add(
		new YAHOO.tool.TestCase({
			setUp: function () {
				errorReceptacle.err = "";
			},
			
			tearDown: function(){
				FormsProcessor.halted = false;
			},
			
		testGetBindSuccessfullyWithNoErrorReceptacle : function () {
			var bindObj;
			bindObj = FormsProcessor.getBindObject("bind-0");
			//YAHOO.util.Assert.areSame(bindObj.id,"bind-0");
			YAHOO.util.Assert.areSame(bindObj.getAttribute("id"),"bind-0");
		},

		testGetBindSuccessfully : function () {
			var bindObj;
			bindObj = FormsProcessor.getBindObject("bind-0", errorReceptacle);
			YAHOO.util.Assert.areSame("bind-0", bindObj.getAttribute("id"));
			YAHOO.util.Assert.areSame("", errorReceptacle.err);
		},

		testGetNoObject : function() {
			var bindObj = FormsProcessor.getBindObject("ThereIsNoObjectWithThisID", errorReceptacle);
			YAHOO.util.Assert.isNull(bindObj);
			YAHOO.util.Assert.areSame("xforms-binding-exception", errorReceptacle.err);
		},

		testGetNoObjectWithNoErrorReceptacle : function() {
			var bindObj = FormsProcessor.getBindObject("ThereIsNoObjectWithThisID");
			YAHOO.util.Assert.isNull(bindObj);
		},

		testGetNotABind : function() {
			var bindObj = FormsProcessor.getBindObject("not-a-bind", errorReceptacle);
			YAHOO.util.Assert.isNull(bindObj);
			YAHOO.util.Assert.areSame("xforms-binding-exception", errorReceptacle.err);
		},

		testGetNotABindWithNoErrorReceptacle : function() {
			var bindObj = FormsProcessor.getBindObject("not-a-bind");
			YAHOO.util.Assert.isNull(bindObj);
		}
		}
	));

	YAHOO.tool.TestRunner.add(suiteGetBindObject);
	
	suiteGetElementById = new YAHOO.tool.TestSuite({
		setUp: function(){
			testDiv = createElement("div",null, document.body);
			testDiv.innerHTML = 
				"<span id='s0' uid='the first s0'>" + 
					"<p id='p0' uid='the only p0'>" + 
						"<b id='b0' uid='the only b0'>" + 
							"<i id='i0' uid='the first i0'>hello</i>" + 
						"</b>"+
					"</p>"+
					"<p id='p1' uid='the only p1'>" + 
						"<b id='b1' uid='the only b1'>" + 
							"<i id='i0' uid='the second i0'>hello</i>" + 
						"</b>"+
					"</p>"+
				"</span>" +
				"<span id='s1'>" + 
					"<p id='p2' uid='the only p2'>" + 
						"<b id='b2' uid='the only b2'>" + 
							"<i id='i1' uid='the first i1'>hello</i>" + 
						"</b>"+
						"<b id='b3' uid='the only b3'>" + 
							"<i id='i1' uid='the second i1'>hello</i>" + 
							"<u id='u0' uid='the only u0'>hello</u>" + 
						"</b>"+
						"<b id='b4' uid='the only b4'>" + 
							"<i id='i1' uid='the third i1'>hello</i>" + 
							"<u id='u1' uid='the only u1'>hello</u>" + 
						"</b>"+
					"</p>"+
				"</span>";
			

			document.getElementById("b2").outerScope = document.getElementById("p2");
			document.getElementById("b3").outerScope = document.getElementById("p2");
			document.getElementById("b4").outerScope = document.getElementById("p2");

			//These functions mimic the complex scope situation caused by structures like repeat.
			document.getElementById("p2").exposes = function(scopedElement) {
				return scopedElement.parentNode.id === "b3";
			};
			
			document.getElementById("p2").getPublicElementById = function(id) {
				return FormsProcessor.getElementByIdWithAncestor(id, document.getElementById("b3"));
			};

		},

		tearDown: function(){
			destroyElement(testDiv, "testDiv", document.body);  	
		}

	});

	suiteGetElementById.add(
		new YAHOO.tool.TestCase({
		name: "testing the getElementById function ",
		
			testGetNoElementById : function () {
 				YAHOO.util.Assert.isNull(FormsProcessor.getElementById("ThereIsNoElementWithThisID"));
			},
			
			testSimpleGetElementById : function () {
				YAHOO.util.Assert.areSame("the first s0",FormsProcessor.getElementById("s0").getAttribute("uid"));
				YAHOO.util.Assert.areSame("the only p0",FormsProcessor.getElementById("p0").getAttribute("uid"));
			},
			testGetUniqueElementByIdWithinSelf : function () {
				YAHOO.util.Assert.areSame("the only b0",FormsProcessor.getElementById("b0",document.getElementById('b0')).getAttribute("uid"));
			},
			testGetUniqueElementByIdWithAncestor : function () {
				YAHOO.util.Assert.areSame("the only b0",FormsProcessor.getElementByIdWithAncestor("b0",document.getElementById('p0')).getAttribute("uid"));
			},
			testGetUniqueElementByIdWithWrongAncestor : function () {
				YAHOO.util.Assert.isNull(FormsProcessor.getElementByIdWithAncestor("b0",document.getElementById('p1')));
			},
			testGetNonUniqueElementByIdWithAncestor : function () {
				YAHOO.util.Assert.areSame("the first i0",FormsProcessor.getElementByIdWithAncestor("i0",document.getElementById('p0')).getAttribute("uid"));
			},
			testGetNonUniqueNonFirstElementByIdWithAncestor : function () {
				YAHOO.util.Assert.areSame("the second i0",FormsProcessor.getElementByIdWithAncestor("i0",document.getElementById('p1')).getAttribute("uid"));
			},
			testGetUniqueElementByIdWithScopeWithNoAncestor : function () {
				YAHOO.util.Assert.areSame("the only u0",FormsProcessor.getElementById("u0").getAttribute("uid"));
			},
			testGetUniqueElementByIdWithScope : function () {
				YAHOO.util.Assert.areSame("the only u0",FormsProcessor.getElementById("u0",document.getElementById('s1')).getAttribute("uid"));
			},
			testGetNonUniqueNonFirstElementByIdWithScope : function () {
				YAHOO.util.Assert.areSame("the second i1",FormsProcessor.getElementById("i1",document.getElementById('s1')).getAttribute("uid"));
			},
			testGetExposedScopedElementFromWithin : function () {
				YAHOO.util.Assert.areSame("the second i1",FormsProcessor.getElementById("i1",document.getElementById('u0')).getAttribute("uid"));
			},
			testGetNonExposedScopedElementFromWithin : function () {
				YAHOO.util.Assert.areSame("the third i1",FormsProcessor.getElementById("i1",document.getElementById('u1')).getAttribute("uid"));
			}
			
  	}
  ));
  
	YAHOO.tool.TestRunner.add(suiteGetElementById);

}());


