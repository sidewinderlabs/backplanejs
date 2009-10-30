// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
//
// Copyright © 2008-9 Backplane Ltd.
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
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "DOM 3 Load and Save"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test LSSerializer",
	
			setUp: function () {
				this.serializer = document.DOMImplementationLS.createLSSerializer();
			},
	
			tearDown: function () {
				this.serializer = null;
			},
	
			testWriteToLSSerializer: function () {
				Assert.isTrue(this.serializer.writeToURI("<data>Hello, world!</data>", "test-lsserializer.xml"));
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());