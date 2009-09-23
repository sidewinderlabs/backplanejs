(function() {
	var Assert = YAHOO.util.Assert;
	var suite = new YAHOO.tool.TestSuite({
		name: "Query Store"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test getSingleValue()",

	    setUp : function () {
	    	document.meta.store.clear();

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "s", "p", "o" ],
		        where:
		          [
		            { pattern: [ "?s", "?p", "?o" ] }
		          ]
		      })["boolean"],
		      "Failed to reset store"
		    );

	    },

	    tearDown : function () {
	    },

	    // Test that we can query for a single value.
	    //
	    testGetSingleValue : function () {
	      document.meta.store.insert(
	        [
	          {
	            "$": "<http://xmlns.com/foaf/0.1/depiction>",
	            	"http://www.w3.org/2004/09/fresnel#propertyFormatDomain": {
									"a": "<http://www.w3.org/2004/09/fresnel#Format>",
									"http://www.w3.org/2004/09/fresnel#resourceStyle": "foaf-depiction"
								}
	          }
	        ]
	      );

	      Assert.areEqual(
	      	"foaf-depiction",
					document.meta.getSingleValue(
						[
							{ pattern: [ "http://xmlns.com/foaf/0.1/depiction", "http://www.w3.org/2004/09/fresnel#propertyFormatDomain", "?format" ] },
							{ pattern: [ "?format", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2004/09/fresnel#Format" ] },
							{ pattern: [ "?format", "http://www.w3.org/2004/09/fresnel#resourceStyle", "?result" ] }
						]
					)
				);
	    }

	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());