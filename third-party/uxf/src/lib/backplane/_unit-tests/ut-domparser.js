(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "DOM Parser"
	});

	suite.add(
		new YAHOO.tool.TestCase({
			name: "Test new DOMParser()",

			setUp: function () {
			},
	
			tearDown: function () {
			},
	
			testParseFromString: function () {
				var doc = (new DOMParser()).parseFromString("<hello>world!</hello>", "text/xml");

				Assert.areEqual("hello", doc.documentElement.nodeName);
				Assert.areEqual("world!", doc.text || doc.documentElement.textContent);
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());
