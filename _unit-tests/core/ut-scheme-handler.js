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
		name: "Test scheme handlers"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test file scheme handler",

			setUp: function () {
				this.schemeHandler = schemeHandlers['file'];
			},

			tearDown: function () {
			},

			testFilePut: function () {
				var fileReader, testString = 'a string';
				this.schemeHandler['PUT']('testFilePut.txt', testString, 0, null);
				fileReader = document.fileIOFactory.createFileReader("testFilePut.txt");
				Assert.areEqual(testString, fileReader.read(null, null, -1));
			},

			testFileGet: function () {
				var testStringIn = 'a string', testStringOut = '';
				this.schemeHandler['PUT']('testFileGet.txt', testStringIn, 0, null);
				this.schemeHandler['GET']('testFileGet.txt', null, 0,
					{
						processResult: function (arg) {
							testStringOut = arg.responseText;
						}
					}
				);
				Assert.areEqual(testStringIn, testStringOut);
			},

			testFileDelete: function () {
				var success = false;

				this.schemeHandler["PUT"]("testFileDelete.txt", "A test string", 0, null);
				this.schemeHandler["DELETE"]("testFileDelete.txt", null, 0,
					{
						processResult: function (arg) {
							success = true;
						}
					}
				);
				Assert.isTrue( success );
			}
	  })
	);

	YAHOO.tool.TestRunner.add(suite);
}());