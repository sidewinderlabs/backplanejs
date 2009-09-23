(
	function() {
		var Assert = YAHOO.util.Assert;
		var r;

		var suite = new YAHOO.tool.TestSuite({
			name: "Store Pipes"
		});

		suite.add(
		 	new YAHOO.tool.TestCase({
				name: "Test making Pipes request",

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

				// Test that a set of formatters can be imported using 'include'.
				//
				testEbay : function () {
					var parser = new RDFParser(document.meta.store);

					document.meta.store.insert(
						[
							{
								/* no subject, so a bnode is used */
									"http://argot-hub.googlecode.com/formatter": "<http://ubiquity-rdfa.googlecode.com/svn/trunk/_samples/formats/ebay>"
							},
							{
								"$": "<http://ubiquity-rdfa.googlecode.com#a>",
									"http://ebay.com/item": "120245313159"
							}
						]
					);

					document.meta.store.loadFormatters("", parser);

					Assert.isTrue(
						document.meta.ask({
							select: [ "s", "o" ],
							where:
								[
									{ pattern: [ "?s", "http://argot-hub.googlecode.com/formatter", "?o" ] }
								]
						})["boolean"]
					);
				}
			})//new TestCase
		);

		YAHOO.tool.TestRunner.add(suite);
	}()
);