// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
//
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

(
	function() {
		var Assert = YAHOO.util.Assert;
		var suite = new YAHOO.tool.TestSuite({
			name: "XSLT 2.0 Extension Functions"
		});

		function evalXPath(expr) {
		  return xpathParse(expr).evaluate(
				new ExprContext(
				  xmlParse("<test />")
				)
			);
		};

		suite.add(
		  new YAHOO.tool.TestCase({
				name: "Test format-number",

				testFormatNumberExists : function () {
					Assert.isFunction(FunctionCallExpr.prototype.xpathfunctions["format-number"], "format-number() is not defined.");
				},

				testFormatNumberPictureEmpty : function () {
					Assert.areEqual("100", evalXPath('format-number(100)').stringValue());
					Assert.areEqual("100", evalXPath('format-number(100, "")').stringValue());
				},

				testFormatNumberPictureUSDollarPrefix : function () {
					Assert.areEqual("$100", evalXPath('format-number(100, "$#")').stringValue());
				},

				testFormatNumberPictureCANDollarPrefix : function () {
					Assert.areEqual("CAN 100", evalXPath('format-number(100, "CAN #")').stringValue());
				},

				testFormatNumberPictureUSCentsSuffix : function () {
					Assert.areEqual("16¢", evalXPath('format-number(16, "#¢")').stringValue());
				},

				testFormatNumberPictureDEMSuffix : function () {
					Assert.areEqual("25 DEM", evalXPath('format-number(25, "# DEM")').stringValue());
				},

				testFormatNumberPictureUSDPrefixSuffix : function () {
					Assert.areEqual("$23.16¢", evalXPath('format-number(23.16, "$#¢")').stringValue());
				},

				testFormatNumberPictureGBPPrefixSuffix : function () {
					Assert.areEqual("£25.89p", evalXPath('format-number(25.89, "£#p")').stringValue());
				},

				testFormatNumberPictureNoDecimalPlaces : function () {
					Assert.areEqual("23", evalXPath('format-number(23.1534, "#.")').stringValue());
				},

				testFormatNumberPictureOneDecimalPlace : function () {
					Assert.areEqual("23.2", evalXPath('format-number(23.1534, "#.#")').stringValue());
				},

				testFormatNumberPictureTwoDecimalPlaces : function () {
					Assert.areEqual("23.15", evalXPath('format-number(23.1534, "#.##")').stringValue());
				},

				testFormatNumberPictureSixDecimalPlaces : function () {
					Assert.areEqual("23.153400", evalXPath('format-number(23.1534, "#.######")').stringValue());
				},

				testFormatNumberPictureUSDPrefixSuffixTwoDecimalPlaces : function () {
					Assert.areEqual("$23.46¢", evalXPath('format-number(23.4567, "$#.##¢")').stringValue());
				},

				testFormatNumberPictureGBPPrefixSuffixTwoDecimalPlaces : function () {
					Assert.areEqual("£23.40p", evalXPath('format-number(23.4, "£#.##p")').stringValue());
				}
		  })//new TestCase
		);

		YAHOO.tool.TestRunner.add(suite);
	}()
);
