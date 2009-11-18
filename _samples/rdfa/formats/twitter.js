//

document.meta.store.insert(
  [
    {
      "$": "<file:///Users/markbirbeck/Documents/svn/backplane/_samples/rdfa/formats/twitter>",
	      "a": "<http://www.w3.org/2004/09/fresnel#Group>"
    },
    {
    	/* bnode */
	      "a": "<http://www.w3.org/2004/09/fresnel#Format>",
	      "http://www.w3.org/2004/09/fresnel#group": "<file:///Users/markbirbeck/Documents/svn/backplane/_samples/rdfa/formats/twitter>",

				"http://argot-hub.googlecode.com/constructor": function() {
		      document.Yowl.register(
		        "twitter",
		        [ "Status", "Found a Twitter account", "Twittered" ],
		        [ 0, 1, 2 ],
		        "http://twitter.com/favicon.ico"
		      );
		      document.Yowl.notify(
			      "Status",
			      "Twitter Status",
			      "Loaded Twitter formatter",
			      "twitter",
			      null,
			      false,
			      0
		      );

		      /*
		       * Add some tweets, for testing.
		       */

					document.meta.store.insert([{
		      	name: "http://twitter.com/markbirbeck",
            "$": "<http://www.twitter.com/markbirbeck/statuses/test1>",
            	"a": "<http://www.twitter.com/status>",
            	"http://www.twitter.com/text": "Hello, world!",
							"http://www.twitter.com/saidby": "<http://twitter.com/markbirbeck>"
					}]);
					document.meta.store.insert([{
						name: "http://twitter.com/markbirbeck",
						"$": "<http://twitter.com/markbirbeck>",
						"http://xmlns.com/foaf/0.1/depiction": "<>",
						"http://xmlns.com/foaf/0.1/name": "Mark Birbeck"
					}]);
		    },

				/*
				 * Find Twitter account details.
				 */

	      "http://www.w3.org/2004/09/fresnel#instanceFormatDomain":
	      	'select: [ "twittername" ],' +
	        'where:' +
	          '[' +
	          	'{ pattern: [ "?account", "http://xmlns.com/foaf/0.1/accountServiceHomepage", "http://www.twitter.com/" ] },' +
	            '{ pattern: [ "?account", "http://xmlns.com/foaf/0.1/accountName",            "?twittername"            ], setUserData: true }' +
	          ']',

				/*
				 * Set a CSS class on any element that indicates a Twitter name.
				 */

	      "http://www.w3.org/2004/09/fresnel#resourceStyle": "twitter-person",

				/*
				 * Also, for each Twitter account display a notification.
				 */

				"http://argot-hub.googlecode.com/action": function(obj) {
	        document.Yowl.notify(
	          "Found a Twitter account",
	          "Found Twitter account : " + obj.twittername.content,
	          "Retrieving more information from Twitter API",
	          "twitter",
	          null,
	          false,
	          0
	        );
	      },

				/*
				 * Now load their Tweets.
				 */

				"http://argot-hub.googlecode.com/pipesdata":
					'url: "http://www.twitter.com/statuses/user_timeline/${twittername}.json",' +
					'params:' +
						'{' +
							'callbackParamName: "callback",' +
							'count: "2"' +
						'}',
				"http://argot-hub.googlecode.com/adddata": function(context) {
	        for (var i = 0; i != context.data.length; i++) {
	          var item = context.data[i];
	          var uriStatus = "http://twitter.com/" + item.user.screen_name + "/statuses/" + item.id; 
	          var uriPerson = "http://twitter.com/" + item.user.screen_name;
	
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
	      }, //adddata()

				"http://argot-hub.googlecode.com/afterpipesdata": {
					"$": "<file:///Users/markbirbeck/Documents/svn/backplane/_samples/rdfa/formats/twitter/afterpipesdata>",
			      "a": "<http://www.w3.org/2004/09/fresnel#Group>"
				},

				"http://argot-hub.googlecode.com/afterpipesdata/format": {
			      "a": "<http://www.w3.org/2004/09/fresnel#Format>",
			      "http://www.w3.org/2004/09/fresnel#group": "<file:///Users/markbirbeck/Documents/svn/backplane/_samples/rdfa/formats/twitter/afterpipesdata>",

						/*
						 * Find all of the Twitter status messages.
						 */

			      "http://www.w3.org/2004/09/fresnel#instanceFormatDomain":
			      	'select: [ "twitterer", "tweet", "name", "depiction" ],' +
              'from: "http://twitter.com/${twittername}",' +
			        'where:' +
			          '[' +
                	'{ pattern: [ "?s",         "a",                                   "http://www.twitter.com/status" ] },' +
                  '{ pattern: [ "?s",         "http://www.twitter.com/text",         "?tweet" ] },' +
                  '{ pattern: [ "?s",         "http://www.twitter.com/saidby",       "?twitterer" ] },' +
                  '{ pattern: [ "?twitterer", "http://xmlns.com/foaf/0.1/name",      "?name" ] },' +
                  '{ pattern: [ "?twitterer", "http://xmlns.com/foaf/0.1/depiction", "?depiction" ] }' +
			          ']',

						"http://argot-hub.googlecode.com/action": function(obj) {
              if (obj.depiction === undefined)
                obj.depiction = null;

							document.Yowl.notify(
                "Twittered",
                obj.name.content + " said:",
                obj.tweet.content,
                "twitter",
                obj.depiction,
                true,
                0
			        );
			      }//action()
				}//afterpipesdata()
		} //end of item
	] //list of items to insert
); //insert
