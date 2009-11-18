var suiteLibraryLoaded = new YAHOO.tool.TestSuite("Test Library Loaded");

suiteLibraryLoaded.add(
  new YAHOO.tool.TestCase({
    name: "Test Library loaded",

    // Test that the library is loaded.
    //
    testMessageLoaded : function () {
      var Assert = YAHOO.util.Assert;
  
      Assert.isObject(document.Yowl, "document.Yowl has not been created");
    }
  })//new TestCase
);
