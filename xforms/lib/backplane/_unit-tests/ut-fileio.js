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
		name: "Test file IO"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test FileWriter and FileReader",

			setUp: function () {
				this.fileWriter = document.fileIOFactory.createFileWriter("test-file-io.txt");
				this.fileReader = document.fileIOFactory.createFileReader("test-file-io.txt");
			},

			tearDown: function () {
				this.fileWriter.close();
				this.fileWriter = null;
				this.fileReader.close();
				this.fileReader = null;
			},

			testWriteToFileWriter: function () {
				var s = Date();

				this.fileWriter.write(s);
				Assert.areEqual(this.fileReader.read(null, null, -1), s);
			}
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());