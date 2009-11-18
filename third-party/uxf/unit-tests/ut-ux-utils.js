(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name : "Test UX utils",

		setUp : function() {
			return;
		},// setUp()

		tearDown : function() {
			return;
		}// tearDown()
	});

	// Add test for delete nodes.
	//
	suite.add(
		new YAHOO.tool.TestCase({
			name : "Test UX.JsBooleanFromXsdBoolean",

			setUp : function() {
				// Check that the initial data is correct.
				//
				return;
			}, // setUp()

			tearDown : function() {
				return;
			}, // tearDown()

			testXsdBooleanTrue: function() {
				Assert.isTrue(UX.JsBooleanFromXsdBoolean("true"));
				Assert.isTrue(UX.JsBooleanFromXsdBoolean("1"));
				return;
			},

			testXsdBooleanFalse: function() {
				Assert.isFalse(UX.JsBooleanFromXsdBoolean("false"));
				Assert.isFalse(UX.JsBooleanFromXsdBoolean("0"));
				return;
			},

			testInvalidXsdBoolean: function() {
				Assert.isUndefined(UX.JsBooleanFromXsdBoolean("foo"));
				return;
			},

			testXsdBooleanDefault: function() {
				Assert.isTrue(UX.JsBooleanFromXsdBoolean("foo", "true"));
				Assert.isFalse(UX.JsBooleanFromXsdBoolean("foo", "false"));
				return;
			}
 		})//new TestCase
	); //suite.add( ... )

	YAHOO.tool.TestRunner.add(suite);
}());
