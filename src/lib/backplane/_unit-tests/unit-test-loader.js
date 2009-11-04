// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa 1.1 support to the Ubiquity
// library.
//
// Copyright (C) 2007-8 Mark Birbeck
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
(
	function() {
	 	var moduleBase = pathToModule("unit-test-loader");

		// There is no 'short name' for these two CSS files, so we need to reference them directly.
		//
		loader.addModule({ name: "logger-css",      type: "css",  fullpath: "http://yui.yahooapis.com/2.6.0/build/logger/assets/logger.css" });
		loader.addModule({ name: "test-logger-css", type: "css",  fullpath: "http://yui.yahooapis.com/2.6.0/build/yuitest/assets/testlogger.css" });
		
		// Add references to unit test scripts here.
		//
		loader.addModule({ name: "ub-ut-array",     type: "js",  fullpath: moduleBase + "ut-array.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-array" ] });
		loader.addModule({ name: "ub-ut-tokmap",    type: "js",  fullpath: moduleBase + "ut-tokmap.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-tokmap" ] });
		loader.addModule({ name: "ub-ut-curie",     type: "js",  fullpath: moduleBase + "ut-curie.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-uri" ] });
		loader.addModule({ name: "ub-ut-uri",       type: "js",  fullpath: moduleBase + "ut-uri.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-uri" ] });
		loader.addModule({ name: "ub-ut-build-get-uri", type: "js",  fullpath: moduleBase + "ut-build-get-uri.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-uri" ] });
		loader.addModule({ name: "ub-ut-file", type: "js",  fullpath: moduleBase + "ut-file.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-file" ] });
		loader.addModule({ name: "ub-ut-io-file", type: "js",  fullpath: moduleBase + "ut-fileio.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-io-file" ] });
		loader.addModule({ name: "ub-ut-dom3ls", type: "js",  fullpath: moduleBase + "ut-dom3ls.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-dom3ls" ] });
		loader.addModule({ name: "ub-ut-scheme-handler", type: "js",  fullpath: moduleBase + "ut-scheme-handler.js",
			requires: [ "yuitest", "logger-css", "test-logger-css", "ub-io-scheme-file" ] });

		loader.require(
			"logger",
			"ub-ut-array", "ub-ut-tokmap",
			"ub-ut-curie", "ub-ut-uri", "ub-ut-build-get-uri",
			"ub-ut-file", "ub-ut-io-file",
			"ub-ut-dom3ls",
			"ub-ut-scheme-handler"
		);
		loader.insert();
		return;
 	}()
);

function runTheTests() {
	//create the logger
	var logger = new YAHOO.tool.TestLogger();

	//run the tests
	YAHOO.tool.TestRunner.run();
	return;
}