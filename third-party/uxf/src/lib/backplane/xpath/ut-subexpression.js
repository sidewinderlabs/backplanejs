(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "Test subexpression"
	});

	suite.add(new YAHOO.tool.TestCase({

		name: "Test subexpression",

		setUp: function() {

		},

		tearDown: function() {

		},

		testSubexpression: function() {
			var xmlString = '<page>\
				<p></p>\
				<list id="parent">\
					<item></item>\
					<item id="self">3</item>\
					<appendix></appendix>\
					<item></item>\
					<chapter>4</chapter>\
				</list>\
				<list id="parent">\
					<item></item>\
					<item id="self">3</item>\
					<item></item>\
					<chapter>4</chapter>\
				</list>\
				<f></f>\
				<item></item>\
			</page>';
			var node = xmlParse(xmlString);
			var expr = "//list[item]";
			
			var deps = getDependencies(expr, node);
			
			
			var items = xpathParse("//list//item").evaluate(new ExprContext(node));
			var lists = xpathParse("//list").evaluate(new ExprContext(node));
						
			Assert.areSame(items.value.length + lists.value.length, deps.length);
			
			var i, l;
			
			for(i = 0, l = items.value.length; i < l; i++){
				Assert.areNotEqual(deps.indexOf(items.value[i]), -1);
			}
			
			for(i = 0, l = lists.value.length; i < l; i++){
				Assert.areNotEqual(deps.indexOf(lists.value[i]), -1);
			}
			
		}

	}));
	
	YAHOO.tool.TestRunner.add(suite);
	
	YAHOO.util.Event.onDOMReady(function(){
	
		var logger = new YAHOO.tool.TestLogger();
		YAHOO.tool.TestRunner.run();
		
	});

})();
