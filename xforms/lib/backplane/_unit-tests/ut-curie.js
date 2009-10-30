(function() {
	var Assert = YAHOO.util.Assert,
	    base = getBaseUrl(),
	    mapURIs;

	var suite = new YAHOO.tool.TestSuite({
		name: "CURIE"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test parsing",

			setUp: function () {
				mapURIs = new mappings();
				mapURIs.add("", "http://www.w3.org/1999/xhtml/vocab#");
				mapURIs.add("dc", "http://purl.org/dc/elements/1.1/");
				mapURIs.add("license", "http://www.w3.org/1999/xhtml/vocab#license");
			},
			
			tearDown: function () {
				delete mapURIs;
			},

			testMapExplicitPrefix : function () {
				Assert.areEqual("http://purl.org/dc/elements/1.1/title", curieToUri("dc:title", mapURIs));
			},

			testMapDefaultPrefix : function () {
				Assert.areEqual("http://www.w3.org/1999/xhtml/vocab#foo", curieToUri(":foo", mapURIs));
			},

			testMapToken : function () {
				Assert.areEqual("http://www.w3.org/1999/xhtml/vocab#license", curieToUri("license", mapURIs));
			},

			testSafeCurie : function () {
				Assert.areEqual("http://purl.org/dc/elements/1.1/title", curieToUri("[dc:title]", mapURIs));
			},

			testSafeCurieOrUri : function () {
				Assert.areEqual("http://purl.org/dc/elements/1.1/title", safeCurieOrUri(base, "http://purl.org/dc/elements/1.1/title", mapURIs));
				Assert.areEqual(makeAbsoluteURI(base, "local"), safeCurieOrUri(base, "local", mapURIs));
				Assert.areEqual("http://purl.org/dc/elements/1.1/title", safeCurieOrUri(base, "[dc:title]", mapURIs));
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());