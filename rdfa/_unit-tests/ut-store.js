(function() {
	var Assert = YAHOO.util.Assert;
	var r;

	var suite = new YAHOO.tool.TestSuite({
		name: "Store"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test resetting of a store",

	    setUp : function () {
	    },

	    tearDown : function () {
	    },

	    // Test that we can reset the default graph.
	    //
	    testInsertToDefaultGraphThenReset : function () {
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

				document.meta.store.clear();

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "s" ],
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );
	    },

	    // Test that we can reset a named graph.
	    //
	    testInsertToNamedGraphThenReset : function () {
	      document.meta.store.insert([{
	      	name: "my-named-graph",
          "$": "<http://ubiquity-rdfa.googlecode.com/>",
            "a": "<http://ubiquity-rdfa.googlecode.com/type>"
	      }]);

				Assert.isTrue(
		      document.meta.ask({
		        select: [ "s" ],
		        from: "my-named-graph",
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type" ] }
		          ]
		      })["boolean"]
		    );

				document.meta.store.clear();

	      Assert.isFalse(
		      document.meta.ask({
		        select: [ "s" ],
		        from: "my-named-graph",
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