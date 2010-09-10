(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name : "Regression tests for backplanejs issue 101",

		setUp : function() {
			return;
		},
		// setUp()
		tearDown : function() {
			return;
		}// tearDown()
	});

	suite.add(
		new YAHOO.tool.TestCase({
			name : "Test addClassNameNative()",

			_should: {
				ignore: {
					"test: addClassNameNative()": !(document.createElement("div").classList && typeof(document.createElement("div").classList) == "object")
				}
			},

			setUp : function() {
				// addClassNameNative() is only called in XHTML mode.
				//
				this.isXHTML = UX.isXHTML;
				UX.isXHTML = true;
				this.element = document.createElement("div");
				return;
			}, // setUp()

			tearDown : function() {
				UX.isXHTML = this.isXHTML;
				this.element = null;
				return;
			}, // tearDown()

			"test: addClassNameNative()": function() {
				Assert.isFalse(UX.hasClassName(this.element, "foo"), "Class 'foo' should not be present at start.");
				UX.addClassName(this.element, " foo");
				Assert.isTrue(UX.hasClassName(this.element, "foo"), "Class 'foo' has not been added.");
				return;
			}
 		})//new TestCase
	); //suite.add( ... )
	YAHOO.tool.TestRunner.add(suite);
}());