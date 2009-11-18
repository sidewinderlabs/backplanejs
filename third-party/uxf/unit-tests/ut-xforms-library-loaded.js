// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
//
// Copyright (C) 2008 Backplane Ltd.
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

var suiteXFormsLibraryLoaded = new YAHOO.tool.TestSuite("Test XForms Library Loaded");

suiteXFormsLibraryLoaded.add(
  new YAHOO.tool.TestCase({
    name: "Test DOM 2 Events createEvent()",

    // Test that the document.createEvent method is available.
    //
    testCreateEventMethodExist : function () {
      var Assert = YAHOO.util.Assert;

      Assert.isFunction(document.createEvent, "document.createEvent is not available");
    }
  })//new TestCase
);

suiteXFormsLibraryLoaded.add(
  new YAHOO.tool.TestCase({
    name: "Test that AJAXSLT has loaded",

    // Test that the AJAXSLT library has loaded correctly.
    //
    testAjaxsltLoaded : function () {
      var Assert = YAHOO.util.Assert;

      Assert.isObject(FunctionCallExpr, "No AJAXSLT 'FunctionCallExpr' object is defined.");
      Assert.isObject(FunctionCallExpr.prototype.xpathfunctions, "No 'xpathfunctions' extension object is defined.");
    }
  })//new TestCase
);
