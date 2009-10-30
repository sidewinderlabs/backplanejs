(function() {
	var Assert = YAHOO.util.Assert;
	var suite = new YAHOO.tool.TestSuite({
		name: "Query Store"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test querying a store",

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
	    },

			// Test filter.
	    //
	    testFilter : function () {
	      document.meta.store.insert([{
	      	name: "filter-test-graph-1",
          "$": "http://argot-hub.googlecode.com/filter-test",
	          "http://argot-hub.googlecode.com/predicate": "Mark Birbeck"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-1",
		        where:
		          [
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate", "?name" ],
		            	filter: function() { return true; }
		            }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-1",
		        where:
		          [
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate", "?name" ],
		            	filter: function() { return false; }
		            }
		          ]
		      })["boolean"]
		    );
	    },

	    testFilterUsingObjectOneProperty : function () {
	      document.meta.store.insert([{
	      	name: "filter-test-graph-2",
          "$": "http://argot-hub.googlecode.com/filter-test",
	          "http://argot-hub.googlecode.com/predicate": "Mark Birbeck"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-2",
		        where:
		          [
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate", "?name" ],
		            	filter: function(o) { return o["name"].content === "Mark Birbeck"; }
		            }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-2",
		        where:
		          [
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate", "?name" ],
		            	filter: function(o) { return o["name"].content !== "Mark Birbeck"; }
		            }
		          ]
		      })["boolean"]
		    );
	    },

	    testFilterUsingObjectTwoProperties : function () {
	      document.meta.store.insert([{
	      	name: "filter-test-graph-3",
          "$": "http://argot-hub.googlecode.com/filter-test",
	          "http://argot-hub.googlecode.com/predicate": "Mark Birbeck",
	          "http://argot-hub.googlecode.com/predicate1": "3",
	          "http://argot-hub.googlecode.com/predicate2": "4"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-3",
		        where:
		          [
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate", "?name" ] },
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate1", "?p1" ] },
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate2", "?p2" ],
		            	filter: function(o) { return Number(o["p1"].content) < Number(o["p2"].content); }
		            }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-3",
		        where:
		          [
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate", "?name" ] },
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate1", "?p1" ] },
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://argot-hub.googlecode.com/predicate2", "?p2" ],
		            	filter: function(o) { return 7 !== Number(o["p1"].content) + Number(o["p2"].content); }
		            }
		          ]
		      })["boolean"]
		    );
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());