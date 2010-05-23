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
				Assert.areEqual("redgreenblue", this.doc.text);
				this.evaluator = new XPathEvaluator();
				Assert.isObject(this.evaluator);
			},

			tearDown: function () {
				this.doc = null;
				this.evaluator = null;
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
				Assert.areEqual("red", result.singleNodeValue.text);
			},

			testEvaluateOrderedSnapshot: function () {
				var result = this.evaluator.evaluate("a/b", this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

				Assert.isObject(result);
				Assert.areEqual(XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, result.resultType);
				Assert.areEqual(3, result.snapshotLength);
				Assert.areEqual("red", result.snapshotItem(0).text);
				Assert.areEqual("green", result.snapshotItem(1).text);
				Assert.areEqual("blue", result.snapshotItem(2).text);
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
				Assert.areEqual("red", result.snapshotItem(0).text);
				Assert.areEqual("green", result.snapshotItem(1).text);
				Assert.areEqual("blue", result.snapshotItem(2).text);
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
				Assert.areEqual("red", result.iterateNext().text);
				Assert.areEqual("green", result.iterateNext().text);
				Assert.areEqual("blue", result.iterateNext().text);
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
			}
		})//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());