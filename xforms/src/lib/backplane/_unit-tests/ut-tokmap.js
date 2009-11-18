(function() {
	var Assert = YAHOO.util.Assert,
	    mapURIs;

	var suite = new YAHOO.tool.TestSuite({
		name: "URI mappings"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test adding mappings",

			setUp: function () {
				mapURIs = new mappings();
			},

			tearDown: function () {
				delete mapURIs;
			},

			testAddEmptyURI : function () {
				mapURIs.add("", "http://www.w3.org/1999/xhtml/vocab#");
				Assert.areEqual("http://www.w3.org/1999/xhtml/vocab#", mapURIs.get(""));
	 		},

			testAddBnodeURI : function () {
				mapURIs.add("_", "bnode:thisdoc");
				Assert.areEqual("bnode:thisdoc", mapURIs.get("_"));
			},

			testAddFromElement : function () {
				var el = document.createElement("div");

				el.setAttribute("xmlns:fresnel", "http://www.w3.org/2004/09/fresnel#");
				mapURIs.addFromElement(el);
				Assert.areEqual("http://www.w3.org/2004/09/fresnel#", mapURIs.get("fresnel"));
			}
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test overwriting mappings",
	
			setUp: function () {
				mapURIs = new mappings();
				mapURIs.add("dc", "initial");
			},
	
			tearDown: function () {
				delete mapURIs;
			},

			testOverwriteDublinCore : function () {
				Assert.areEqual("initial", mapURIs.get("dc"));
				mapURIs.add("dc", "http://purl.org/dc/elements/1.1/");
				Assert.areEqual("http://purl.org/dc/elements/1.1/", mapURIs.get("dc"));
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test retrieving mappings",
	
			setUp: function () {
				mapURIs = new mappings();
				mapURIs.add("dc", "http://purl.org/dc/elements/1.1/");
				mapURIs.add("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
				mapURIs.add("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
			},
	
			tearDown: function () {
				delete mapURIs;
			},

			testRetrieveByName : function () {
				Assert.areEqual("http://purl.org/dc/elements/1.1/", mapURIs.get("dc"));
				Assert.areEqual("http://www.w3.org/1999/02/22-rdf-syntax-ns#", mapURIs.get("rdf"));
				Assert.areEqual("http://www.w3.org/2000/01/rdf-schema#", mapURIs.get("rdfs"));
	    },

			testRetrieveByIndex : function () {
				Assert.areEqual("http://purl.org/dc/elements/1.1/", mapURIs.get(0));
				Assert.areEqual("http://www.w3.org/1999/02/22-rdf-syntax-ns#", mapURIs.get(1));
				Assert.areEqual("http://www.w3.org/2000/01/rdf-schema#", mapURIs.get(2));
	    },

			testRetrieveFails : function () {
				Assert.isNull(mapURIs.get("fresnel"));
				Assert.isNull(mapURIs.get(-1));
				Assert.isNull(mapURIs.get(100));
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());