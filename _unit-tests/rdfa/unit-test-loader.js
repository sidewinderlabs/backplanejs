// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa support to the Ubiquity
// library.
//
// Copyright (C) 2007-9 Mark Birbeck
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
function runTheTests() {
	 	var moduleBase = pathToModule("unit-test-loader");
		var loader = new YAHOO.util.YUILoader();

		// There is no 'short name' for these two CSS files, so we need to reference them directly.
		//
		loader.addModule({ name: "logger-css",      type: "css",  fullpath: "http://yui.yahooapis.com/2.7.0/build/logger/assets/logger.css" });
		loader.addModule({ name: "test-logger-css", type: "css",  fullpath: "http://yui.yahooapis.com/2.7.0/build/yuitest/assets/testlogger.css" });
		
		// Add references to unit test scripts here.
		//
		loader.addModule({ name: "ur-ut-library-loaded", type: "js",  fullpath: moduleBase + "ut-rdfa-library-loaded.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });

		loader.addModule({ name: "ur-ut-kb",   type: "js",  fullpath: moduleBase + "ut-kb.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });

		// RDFStore
		//
		loader.addModule({ name: "ur-ut-store",   type: "js",  fullpath: moduleBase + "ut-store.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });
		loader.addModule({ name: "ur-ut-store-insert",   type: "js",  fullpath: moduleBase + "ut-store-insert.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });
		loader.addModule({ name: "ur-ut-store-named-graph",   type: "js",  fullpath: moduleBase + "ut-store-named-graph.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });
		loader.addModule({ name: "ur-ut-store-pipes",   type: "js",  fullpath: moduleBase + "ut-store-pipes.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });

		// RDFParser
		//
		loader.addModule({ name: "ur-ut-w3c-ts",   type: "js",  fullpath: moduleBase + "ut-w3c-ts.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });

		// RDFQuery
		//
		loader.addModule({ name: "ur-ut-store-query",   type: "js",  fullpath: moduleBase + "ut-store-query.js",
			requires: [ "yuitest", "logger-css", "test-logger-css" ] });

		loader.require(
			"ur-ut-library-loaded", "ur-ut-store-insert",
			"ur-ut-store", "ur-ut-store-pipes", "ur-ut-store-named-graph", /* "ur-ut-w3c-ts", */
			"ur-ut-kb",
			"ur-ut-store-query"
		);

  loader.onSuccess = function(o) {
    var logger = new YAHOO.tool.TestLogger();

		YAHOO.tool.TestRunner.run();
    return;
  };

  loader.insert();
	return;
}