(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "DOM 3 XPath"
	});

	suite.add(
		new YAHOO.tool.TestCase({
			name: "Test evaluate()",

			_should: {
				error: {
					testEvaluateSnapshotMethodException: true,
					testEvaluateIteratorException: true
				}
			},

			setUp: function () {
				this.doc = (new DOMParser()).parseFromString("<a><b>red</b><b>green</b><b>blue</b></a>", "text/xml");
				this.evaluator = new XPathEvaluator();
				this.serializer = new XMLSerializer();
			},

			tearDown: function () {
				this.doc = null;
				this.evaluator = null;
				this.serializer = null;
			},

			"test: Verify 'Test evaluate()' set-up": function () {
				Assert.isObject(this.evaluator);
				Assert.isObject(this.serializer);
				Assert.areEqual("<a><b>red</b><b>green</b><b>blue</b></a>", this.serializer.serializeToString(this.doc));
			},

			testXPathExpression: function () {
				var expression = this.evaluator.createExpression("a/b", null);

				Assert.isObject(expression);

				var result = expression.evaluate(this.doc, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.FIRST_ORDERED_NODE_TYPE, result.resultType);
				Assert.isObject(result.singleNodeValue);
				Assert.areEqual("<b>red</b>", this.serializer.serializeToString(result.singleNodeValue));
			},

			testEvaluate: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
			},

			testEvaluateFirstOrderedNode: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.FIRST_ORDERED_NODE_TYPE, result.resultType);
				Assert.isObject(result.singleNodeValue);
				Assert.areEqual("<b>red</b>", this.serializer.serializeToString(result.singleNodeValue));
			},

			testEvaluateOrderedSnapshot: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.areEqual(3, result.snapshotLength);
				Assert.areEqual("<b>red</b>",  this.serializer.serializeToString(result.snapshotItem(0)));
				Assert.areEqual("<b>green</b>", this.serializer.serializeToString(result.snapshotItem(1)));
				Assert.areEqual("<b>blue</b>", this.serializer.serializeToString(result.snapshotItem(2)));
			},

			testEvaluateOrderedSnapshotSnapshotItemRange: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.isNull(result.snapshotItem(-1));
				Assert.isNull(result.snapshotItem(result.snapshotLength));
			},

			testEvaluateUnorderedSnapshot: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.areEqual(3, result.snapshotLength);
				Assert.areEqual("<b>red</b>",  this.serializer.serializeToString(result.snapshotItem(0)));
				Assert.areEqual("<b>green</b>", this.serializer.serializeToString(result.snapshotItem(1)));
				Assert.areEqual("<b>blue</b>", this.serializer.serializeToString(result.snapshotItem(2)));
			},

			testEvaluateUnorderedSnapshotSnapshotItemRange: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.isNull(result.snapshotItem(-1));
				Assert.isNull(result.snapshotItem(result.snapshotLength));
			},

			testEvaluateSnapshotMethodException: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.BOOLEAN_TYPE, null);

				Assert.isObject(result);
				Assert.areNotEqual(XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.areNotEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);

				/**
				 * This MUST throw an exception in order to pass this test. 
				 */

				result.snapshotItem(1);
			},

			testEvaluateSnapshotLengthUndefined: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.BOOLEAN_TYPE, null);

				Assert.isObject(result);
				Assert.areNotEqual(XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.areNotEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);

				Assert.isUndefined(result.snapshotLength);
			},

			testEvaluateOrderedNodeIterator: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.ORDERED_NODE_ITERATOR_TYPE, result.resultType);
				Assert.areEqual("<b>red</b>",  this.serializer.serializeToString(result.iterateNext()));
				Assert.areEqual("<b>green</b>", this.serializer.serializeToString(result.iterateNext()));
				Assert.areEqual("<b>blue</b>", this.serializer.serializeToString(result.iterateNext()));
				Assert.isNull(result.iterateNext());
			},

			testEvaluateIteratorException: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.BOOLEAN_TYPE, null);

				Assert.isObject(result);
				Assert.areNotEqual(XPathResult.UNORDERED_NODE_ITERATOR_TYPE, result.resultType);
				Assert.areNotEqual(XPathResult.ORDERED_NODE_ITERATOR_TYPE, result.resultType);

				/**
				 * This MUST throw an exception in order to pass this test. 
				 */

				result.iterateNext();
			},

			testEvaluateReuseResult: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.FIRST_ORDERED_NODE_TYPE, result.resultType);
				this.evaluator.evaluate("a/b", this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result);
				Assert.areEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.areEqual(3, result.snapshotLength);
			},

			testEvaluateResolverFunction: function () {
				FunctionCallExpr.prototype.xpathfunctions["foo"] = function (ctx) {
					return new NumberValue( 2 );
				};

				var result = this.evaluator.evaluate("a/b[foo()]", this.doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

				Assert.isObject(result, "Result is not an object.");
				Assert.areEqual(XPathResult.FIRST_ORDERED_NODE_TYPE, result.resultType);
				Assert.isObject(result.singleNodeValue, "There is not singleNodeValue.");
				Assert.areEqual("<b>green</b>", this.serializer.serializeToString(result.singleNodeValue));
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());