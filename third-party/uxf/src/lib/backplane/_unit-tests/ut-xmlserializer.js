(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "XML Serializer"
	});

	suite.add(
		new YAHOO.tool.TestCase({
			name: "Test new XMLSerializer()",

			setUp: function () {
				this.parser = new DOMParser();
				this.serializer = new XMLSerializer();
			},
	
			tearDown: function () {
				this.parser = null;
				this.serializer = null;
			},

			"test: Check set-up": function () {
				Assert.isObject(this.parser);
				Assert.isObject(this.serializer);
			},

			"test: serializeToString() on the document": function () {
				var str = "<root><greeting>hello</greeting><whom>world</whom></root>";

				Assert.areEqual(str,
					this.serializer.serializeToString(
						this.parser.parseFromString(str, "text/xml")
					)
				);
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());
