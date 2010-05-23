(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "DOM 2"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test createDocument()",
			testCreateDocument: function () {
				var doc = document.DOMImplementation.createDocument();

				Assert.isNotNull(this.doc);
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());