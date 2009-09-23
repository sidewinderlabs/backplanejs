(function() {
	var Assert = YAHOO.util.Assert;
	var r;

	var suite = new YAHOO.tool.TestSuite({
		name: "Store insert()"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test Insert with array",

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

	    // Test that "a" can be used to insert an rdf:type predicate.
	    //
	    testAbbreviationForRdfTypeInsert : function () {
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
	    },

	    // Test that if no "$" is specified, a default bnode is created.
	    //
	    testBNodeCreation : function () {
	      document.meta.store.insert(
	        [
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>"
	          }
	        ]
	      );
	      r = document.meta.query2({
	        select: [ "s" ],
	        where:
	          [
	            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type1" ] }
	          ]
	      });

	      Assert.isTrue(r.results.bindings[0]["s"].substr(0, 6) === "bnode:" , "?bnode not returned correctly");
	    },

	    // Test that two predicates will share the same subject.
	    //
	    testSharedSubject : function () {
	      document.meta.store.insert(
	        [
	          {
	          	"$": "<http://ubiquity-rdfa.googlecode.com/>",
		            "a": "<http://ubiquity-rdfa.googlecode.com/type1>",
		            "http://ubiquity-rdfa.googlecode.com/predicate1": "plain literal"
	          }
	        ]
	      );

	      Assert.isTrue(
		      document.meta.ask({
		      	select: [ "o" ],
		        where:
		          [
		          	{ pattern: [ "http://ubiquity-rdfa.googlecode.com/", "a", "http://ubiquity-rdfa.googlecode.com/type1" ] },
		            { pattern: [ "http://ubiquity-rdfa.googlecode.com/", "http://ubiquity-rdfa.googlecode.com/predicate1", "plain literal" ] },
		            { pattern: [ "http://ubiquity-rdfa.googlecode.com/", "http://ubiquity-rdfa.googlecode.com/predicate1", "?o" ] }
		          ]
		      })["boolean"]
		    );
	    },

	    // Test that if a predicate is a JSON object literal, then its subject
	    // is the same bnode as the object of the predicate.
	    //
	    testNestedBNodeCreation : function () {
	      document.meta.store.insert(
	        [
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>",
	            "http://ubiquity-rdfa.googlecode.com/predicate1": {
	              "http://ubiquity-rdfa.googlecode.com/predicate2": "plain literal 1",
	              "http://ubiquity-rdfa.googlecode.com/predicate3": "plain literal 2"
	            }
	          }
	        ]
	      );

	      Assert.isTrue(
		      document.meta.ask({
	        select: [ "o1", "o2" ],
	        where:
	          [
	            { pattern: [ "?s1", "a", "http://ubiquity-rdfa.googlecode.com/type1" ] },
	            { pattern: [ "?s1", "http://ubiquity-rdfa.googlecode.com/predicate1", "?s2" ] },
	            { pattern: [ "?s2", "http://ubiquity-rdfa.googlecode.com/predicate2", "?o1" ] },
	            { pattern: [ "?s2", "http://ubiquity-rdfa.googlecode.com/predicate3", "?o2" ] }
	          ]
		      })["boolean"]
		    );
	    },

	    // Test that if a predicate is a JSON object literal, then its subject
	    // is the same as the object of the predicate.
	    //
	    testNestedSharedSubjectCreation : function () {
	      document.meta.store.insert(
	        [
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>",
	            "http://ubiquity-rdfa.googlecode.com/predicate1": {
	            	"$": "<http://ubiquity-rdfa.googlecode.com/>",
		              "http://ubiquity-rdfa.googlecode.com/predicate2": "plain literal"
	            }
	          }
	        ]
	      );

	      Assert.isTrue(
		      document.meta.ask({
	        select: [ "o" ],
	        where:
	          [
	            { pattern: [ "?s", "a", "http://ubiquity-rdfa.googlecode.com/type1" ] },
	            { pattern: [ "?s", "http://ubiquity-rdfa.googlecode.com/predicate1", "http://ubiquity-rdfa.googlecode.com/" ] },
	            { pattern: [ "http://ubiquity-rdfa.googlecode.com/", "http://ubiquity-rdfa.googlecode.com/predicate2", "?o" ] }
	          ]
		      })["boolean"]
		    );
	    },

	    // Test that multiple items can be added.
	    //
	    testMultipleItemCreation : function () {
	      document.meta.store.insert(
	        [
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>"
	          },
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>"
	          },
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>"
	          },
	          {
	            "a": "<http://ubiquity-rdfa.googlecode.com/type1>"
	          }
	        ]
	      );

	      Assert.areEqual(
		      document.meta.query2({
		        select: [ "s" ],
		        where:
		          [
		            { pattern: [ "?s", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://ubiquity-rdfa.googlecode.com/type1" ] }
		          ]
		      }).results.bindings.length,
		      4
		    );
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());