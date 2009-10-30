(function() {
	var Assert = YAHOO.util.Assert,
	    ar;

	var suite = new YAHOO.tool.TestSuite({
		name: "Array"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test adding items",
	
			setUp: function () {
				ar = new ubArray();
			},
	
			tearDown: function () {
				delete ar;
			},

			testAddStringItem : function () {
				ar.add("item1", "item1");
				Assert.areEqual("item1", ar.get("item1"));
	    },

			testAddNumericItem : function () {
				ar.add("item1", 1);
				Assert.areEqual(1, ar.get("item1"));
	    },

			testAddObjectItem : function () {
				ar.add("item1", { prop: 1 } );
				Assert.areEqual(1, ar.get("item1").prop);
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test overwriting items",
	
			setUp: function () {
				ar = new ubArray();
				ar.add("item1", "initial");
			},
	
			tearDown: function () {
				delete ar;
			},

			testOverwriteWithStringItem : function () {
				Assert.areEqual("initial", ar.get("item1"));
				ar.add("item1", "item1");
				Assert.areEqual("item1", ar.get("item1"));
	    },

			testOverwriteWithNumericItem : function () {
				Assert.areEqual("initial", ar.get("item1"));
				ar.add("item1", 1);
				Assert.areEqual(1, ar.get("item1"));
	    },

			testOverwriteWithObjectItem : function () {
				Assert.areEqual("initial", ar.get("item1"));
				ar.add("item1", { prop: 1 } );
				Assert.areEqual(1, ar.get("item1").prop);
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test retrieving items",
	
			setUp: function () {
				ar = new ubArray();
				ar.add("item1", "item1");
				ar.add("item2", "item2");
				ar.add("item3", "item3");
			},
	
			tearDown: function () {
				delete ar;
			},

			testRetrieveByName : function () {
				Assert.areEqual("item1", ar.get("item1"));
				Assert.areEqual("item2", ar.get("item2"));
				Assert.areEqual("item3", ar.get("item3"));
	    },

			testRetrieveByIndex : function () {
				Assert.areEqual("item1", ar.get(0));
				Assert.areEqual("item2", ar.get(1));
				Assert.areEqual("item3", ar.get(2));
	    },

			testRetrieveFails : function () {
				Assert.isNull(ar.get("primrose"));
				Assert.isNull(ar.get(-1));
				Assert.isNull(ar.get(100));
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
			name: "Test locking items",
	
			setUp: function () {
				ar = new ubArray();
				ar.add("item1", "initial", true);
			},
	
			tearDown: function () {
				delete ar;
			},

			testCannotOverwriteWhenLocked : function () {
				Assert.areEqual("initial", ar.get("item1"));
				ar.add("item1", "item1");
				Assert.areEqual("initial", ar.get("item1"));
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());