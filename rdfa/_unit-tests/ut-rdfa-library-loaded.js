(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "Test Library Loaded"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test Library loaded",
	
	    // Test that the library is loaded.
	    //
	    testRDFaLoaded : function () {
	      var Assert = YAHOO.util.Assert;
	  
	      Assert.isObject(document.meta, "document.meta has not been created");
	      Assert.isObject(document.meta.store, "document.meta.store has not been created");
	      Assert.isFunction(document.meta.store.insert, "The insert() method is not present");
	      Assert.isFunction(document.meta.query2, "The query2() method is not present");
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());