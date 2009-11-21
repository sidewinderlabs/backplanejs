(function() {
	var Assert = YAHOO.util.Assert;
	var suite = new YAHOO.tool.TestSuite({
		name: "Filter functions on queries"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test querying with filters",

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

			// Test filter.
	    //
	    testFilter : function () {
	      document.meta.store.insert([{
	      	name: "filter-test-graph-1",
          "$": "http://argot-hub.googlecode.com/filter-test",
	          "http://xmlns.com/foaf/0.1/name": "Marie Curie"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-1",
		        where:
		          [
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://xmlns.com/foaf/0.1/name", "?name" ],
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
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://xmlns.com/foaf/0.1/name", "?name" ],
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
	          "http://xmlns.com/foaf/0.1/name": "Marie Curie"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-2",
		        where:
		          [
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://xmlns.com/foaf/0.1/name", "?name" ],
		            	filter: function(o) { return o["name"].content === "Marie Curie"; }
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
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://xmlns.com/foaf/0.1/name", "?name" ],
		            	filter: function(o) { return o["name"].content !== "Marie Curie"; }
		            }
		          ]
		      })["boolean"]
		    );
	    },

	    testFilterUsingObjectTwoProperties : function () {
	      document.meta.store.insert([{
	      	name: "filter-test-graph-3",
          "$": "http://argot-hub.googlecode.com/filter-test",
	          "http://xmlns.com/foaf/0.1/name": "Marie Curie",
	          "http://purl.org/dc/terms/created": "2000-01-01",
	          "http://purl.org/dc/terms/valid": "2000-01-02"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-3",
		        where:
		          [
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://xmlns.com/foaf/0.1/name", "?name" ] },
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/created", "?c" ] },
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/valid", "?v" ],
		            	filter: function(o) { return o["c"].content < o["v"].content; }
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
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://xmlns.com/foaf/0.1/name", "?name" ] },
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/created", "?c" ] },
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/valid", "?v" ],
		            	filter: function(o) { return o["c"].content === o["v"].content; }
		            }
		          ]
		      })["boolean"]
		    );
	    },

	    testFilterUsingRegularExpression : function () {
	      document.meta.store.insert([{
	      	name: "filter-test-graph-4",
          "$": "http://argot-hub.googlecode.com/filter-test",
	          "http://purl.org/dc/terms/creator": "Marie Curie",
	          "http://purl.org/dc/terms/title": "Agricultural Output for 2008",
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "author" ],
		      	from: "filter-test-graph-4",
		        where:
		          [
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/creator", "?author" ] },
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/title", "?title" ],
		            	filter: function(o) {
		            		return Number(o["title"].content.match( /\d{4}/ )[0]) >= "2008";
		            	}
		            }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "name" ],
		      	from: "filter-test-graph-4",
		        where:
		          [
		            { pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/creator", "?author" ] },
		            {
		            	pattern: [ "http://argot-hub.googlecode.com/filter-test", "http://purl.org/dc/terms/title", "?title" ],
		            	filter: function(o) {
		            		return Number(o["title"].content.match( /\d{4}/ )[0]) < "2008";
		            	}
		            }
		          ]
		      })["boolean"]
		    );
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());