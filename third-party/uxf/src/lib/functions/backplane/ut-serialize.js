//
// Copyright (c) 2010 Mark Birbeck, Backplane Ltd.
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
//

//
// test the serialize() XPath function
//
(
	function() {
		var Assert = YAHOO.util.Assert;
		var suite = new YAHOO.tool.TestSuite({
			name: "serialize function"
		});

		function evalXPath(expr) {
		  return xpathParse(expr).evaluate(
				new ExprContext(
					new DOMParser().parseFromString("<a><b c=\"1\" /></a>", "text/xml")
				)
			);
		};

		suite.add(
		  new YAHOO.tool.TestCase({
				name: "Test serialize",

				testFunctionExists : function () {
					Assert.isFunction(FunctionCallExpr.prototype.xpathfunctions["serialize"], "serialize() is not defined.");
				},

				testSerializeNoParam : function () {
					Assert.areEqual("<a><b c=\"1\"/></a>", evalXPath('serialize()').stringValue());
				},

				testSerializeCurrentNode : function () {
					Assert.areEqual("<a><b c=\"1\"/></a>", evalXPath('serialize(.)').stringValue());
				},

				testSerializeXPathExpression : function () {
					Assert.areEqual("<b c=\"1\"/>", evalXPath('serialize(a/b)').stringValue());
				},

				testSerializeXPathExpressionNoNode : function () {
					Assert.areEqual("", evalXPath('serialize(nonode)').stringValue());
				}
		  })//new TestCase
		);

		YAHOO.tool.TestRunner.add(suite);
	}
)();
