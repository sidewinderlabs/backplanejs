(function () {
	var suite = new YAHOO.tool.TestSuite("Test Notify Library Loaded");
	
	suite.add(
		new YAHOO.tool.TestCase({
			name: "Test Library loaded",
	
			// Test that the library is loaded.
			//
			testNotifyLoaded: function () {
				var Assert = YAHOO.util.Assert;
				
				Assert.isObject(document.Yowl, "document.Yowl has not been created");
			}
		})
	);
	
	YAHOO.tool.TestRunner.add(suite);
}());
