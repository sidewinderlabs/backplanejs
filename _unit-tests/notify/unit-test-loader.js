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
function runTheTests() {
  var moduleBase = pathToModule("unit-test-loader");
  var loader = new YAHOO.util.YUILoader();

  // There is no 'short name' for these two CSS files, so we need to reference them directly.
  //
  loader.addModule({ name: "logger-css",      type: "css",  fullpath: "http://yui.yahooapis.com/2.5.2/build/logger/assets/logger.css" });
  loader.addModule({ name: "test-logger-css", type: "css",  fullpath: "http://yui.yahooapis.com/2.5.2/build/yuitest/assets/testlogger.css" });

  // Add references to unit test scripts here.
  //
  loader.addModule({ name: "ur-ut-library-loaded", type: "js",  fullpath: moduleBase + "ut-message-library-loaded.js",
    requires: [ "yuitest", "logger-css", "test-logger-css" ] });

  loader.require( "ur-ut-library-loaded" );

  loader.onSuccess = function(o) {
    //create the logger
    var logger = new YAHOO.tool.TestLogger();

    //add the test suite to the runner's queue
    YAHOO.tool.TestRunner.add(suiteLibraryLoaded);

    //run the tests
    YAHOO.tool.TestRunner.run();
  };

  loader.insert();
  return;
}