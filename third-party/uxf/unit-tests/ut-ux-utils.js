(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name : "Test UX utils",

		setUp : function() {
			return;
		},
		// setUp()
		tearDown : function() {
			return;
		}// tearDown()
	});

	// Add test for data type conversion.
	//
	suite.add(
		new YAHOO.tool.TestCase({
			name : "Test UX.JsBooleanFromXsdBoolean",

			setUp : function() {
				// Check that the initial data is correct.
				//
				return;
		},
		// setUp()
			tearDown : function() {
				return;
		},
		// tearDown()
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

	// Add test for class manipulation functions.
	//
	suite.add(
		new YAHOO.tool.TestCase({
			name : "Test UXUtils class functions",

			setUp : function() {
				this.element = document.createElement("div");
				return;
			}, // setUp()

			tearDown : function() {
				this.element = null;
				return;
			}, // tearDown()

			"test: UX.addClassName()": function() {
				Assert.isFalse(UX.hasClassName(this.element, "foo"), "Class 'foo' should not be present at start.");
				UX.addClassName(this.element, "foo");
				Assert.isTrue(UX.hasClassName(this.element, "foo"), "Class 'foo' has not been added.");
				return;
			},

			"test: UX.removeClassName()": function() {
				Assert.isFalse(UX.hasClassName(this.element, "foo"), "Class 'foo' should not be present at start.");
				UX.addClassName(this.element, "foo");
				Assert.isTrue(UX.hasClassName(this.element, "foo"), "Class 'foo' has not been added.");
				UX.removeClassName(this.element, "foo");
				Assert.isFalse(UX.hasClassName(this.element, "foo"), "Class 'foo' has not been removed.");
				return;
			},

			"test: UX.replaceClassName()": function() {
				Assert.isFalse(UX.hasClassName(this.element, "foo"), "Class 'foo' should not be present at start.");
				UX.addClassName(this.element, "foo");
				Assert.isTrue(UX.hasClassName(this.element, "foo"), "Class 'foo' has not been added.");
				UX.replaceClassName(this.element, "foo", "bar");
				Assert.isFalse(UX.hasClassName(this.element, "foo"), "Class 'foo' has not been removed.");
				Assert.isTrue(UX.hasClassName(this.element, "bar"), "Class 'bar' has not been added.");
				return;
			}
 		})//new TestCase
	); //suite.add( ... )
	YAHOO.tool.TestRunner.add(suite);
}());
