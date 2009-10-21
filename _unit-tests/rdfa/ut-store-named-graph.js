(function() {
	var Assert = YAHOO.util.Assert;
	var r;

	var suite = new YAHOO.tool.TestSuite({
		name: "Store insert() with named graph"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test Insert and Query on named graphs",

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
		      "Store not reset"
		    );

	    },

	    tearDown : function () {
	    },

			// Test that we get triples from a named graph.
	    //
	    testInsertToNamedGraphThenQueryNamedGraph : function () {
	      document.meta.store.insert([{
	      	name: "my-named-graph-1",
          "$": "<http://ubiquity-rdfa.googlecode.com/>",
            "a": "<http://ubiquity-rdfa.googlecode.com/type>"
	      }]);

				Assert.isTrue(
		      document.meta.ask({
		        select: [ "s" ],
		      	from: "my-named-graph-1",
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );
	    },

	    // Test that we don't get any triples from the default graph, if we're querying a
	    // non-existent named graph.
	    //
	    testInsertToDefaultThenQueryNonexistentGraph : function () {
	      document.meta.store.insert(
	        [
	          {
	            "$": "<http://ubiquity-rdfa.googlecode.com/>",
	            	"a": "<http://ubiquity-rdfa.googlecode.com/type>"
	          }
	        ]
	      );

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "s" ],
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "s" ],
		        from: "non-existent-graph",
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );
	    },

	    // Test that we don't get any triples from some other named graph, if we're querying a
	    // non-existent named graph.
	    //
	    testInsertToNamedGraphThenQueryNonexistentGraph : function () {
	      document.meta.store.insert([{
	      	name: "my-named-graph-2",
          "$": "<http://ubiquity-rdfa.googlecode.com/>",
            "a": "<http://ubiquity-rdfa.googlecode.com/type>"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "s" ],
		        from: "my-named-graph-2",
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "s" ],
		        from: "non-existent-graph",
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );
	    },

			// Test that we don't get triples from the default graph, if we've inserted
	    // to a named graph.
	    //
	    testInsertToNamedGraphThenQueryDefaultGraph : function () {
	      document.meta.store.insert([{
	      	name: "my-named-graph-3",
          "$": "<http://ubiquity-rdfa.googlecode.com/>",
            "a": "<http://ubiquity-rdfa.googlecode.com/type>"
	      }]);

	      Assert.isTrue(
		      document.meta.ask({
		        select: [ "s" ],
		      	from: "my-named-graph-3",
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "s" ],
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );
			}
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());