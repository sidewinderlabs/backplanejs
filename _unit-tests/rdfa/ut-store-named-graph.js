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
	    },

			testQueryFromRemoteGraph : function () {
				var that = this;

	      document.meta.store.insert([{
	      	name: "about-graphs",
          "$": "http://www.twitter.com/",
          "http://argot-hub.googlecode.com/matches": "http://www.twitter.com/",
          "http://argot-hub.googlecode.com/uri": "<http://www.twitter.com/statuses/user_timeline/markbirbeck.json>",
          "http://argot-hub.googlecode.com/params": {
            "http://argot-hub.googlecode.com/callbackParamName": "callback",
            "http://argot-hub.googlecode.com/count": "2"
          },
					"http://argot-hub.googlecode.com/adddata": function(context) {
		        for (var i = 0; i != context.data.length; i++) {
		          var item = context.data[i];
		          var uriStatus = "http://www.twitter.com/" + item.user.screen_name + "/statuses/" + item.id; 
		          var uriPerson = "http://www.twitter.com/" + item.user.screen_name;
		
		          var sText = item.text.replace(/img(\@src)?\=([^\s]*)/g, "&lt;img src=\'$2\' /&gt;");
		          
		          sText = sText.replace(/tube(\@src)?\=(.*)/g, "&lt;object width=\'425\' height=\'355\'&gt;&lt;param name=\'movie\' value=\'$2\'/&gt;&lt;param name=\'wmode\' value=\'transparent\'/&gt;&lt;embed src=\'$2\' type=\'application/x-shockwave-flash\' wmode=\'transparent\' width=\'425\' height=\'355\'/&gt;&lt;/object&gt;");
		
		          document.meta.store.insert([
		          	{
			          	name: uriPerson,
			          	"$": uriStatus,
				          	"a": "<http://www.twitter.com/status>",
			          		"http://www.twitter.com/text": sText,
					        	"http://www.twitter.com/saidby": "<" + uriPerson + ">"
				        }
		          ]);
		
		          /*
		           * Add information about who said the status.
		           */
		
		           document.meta.store.insert([
			           {
				           name: uriPerson,
				           "$": uriPerson,
					           "http://xmlns.com/foaf/0.1/depiction": "<" + item.user.profile_image_url + ">",
					           "http://xmlns.com/foaf/0.1/name": item.user.name
			           }
		           ]);
		        }
		      } //adddata()
	      }]);

	      document.meta.query2(
		      {
		        select: [ "s", "text", "person" ],
		        from: "http://www.twitter.com/markbirbeck",
		        where:
		          [
		            { pattern: [ "?s", "a", "http://www.twitter.com/status" ] },
		            { pattern: [ "?s", "http://www.twitter.com/text", "?text" ] },
		            { pattern: [ "?s", "http://www.twitter.com/saidby", "?person" ] }
		          ]
		      },
		      function( r ) {
						that.resume(
							function() {
								Assert.areEqual(2, r.results.bindings.length, "Query failed");
							}
						);
		      }
	      );
	      this.wait();
			}
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());