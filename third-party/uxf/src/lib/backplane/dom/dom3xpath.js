if (typeof(XPathEvaluator) == "undefined") {
	XPathException = function(code) {
		this.code = code;
	};

	XPathException.INVALID_EXPRESSION_ERR      = 51;
	XPathException.TYPE_ERR                    = 52;

	XPathResult = function() {
		this.resultType = XPathResult.ANY_TYPE;

		/**
		 * Note that we purposefully don't set default values for
		 * properties like snapshotLength so that exceptions are
		 * thrown if they are accessed when using an incompatible
		 * type.
		 */
	};

	XPathResult.ANY_TYPE                       = 0;
	XPathResult.NUMBER_TYPE                    = 1;
	XPathResult.STRING_TYPE                    = 2;
	XPathResult.BOOLEAN_TYPE                   = 3;
	XPathResult.UNORDERED_NODE_ITERATOR_TYPE   = 4;
	XPathResult.ORDERED_NODE_ITERATOR_TYPE     = 5;
	XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE   = 6;
	XPathResult.ORDERED_NODE_SNAPSHOT_TYPE     = 7;
	XPathResult.ANY_UNORDERED_NODE_TYPE        = 8;
	XPathResult.FIRST_ORDERED_NODE_TYPE        = 9;

	XPathResult.prototype.iterateNext = function() {
		if (this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE && this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
			throw new XPathException(XPathException.TYPE_ERR);
		}
		return this._iterator.nextNode;
	};

	XPathResult.prototype.snapshotItem = function(index) {
		if (this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE && this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE) {
			throw new XPathException(XPathException.TYPE_ERR);
		}

		if (index < 0 || index >= this.snapshotLength) {
			return null;
		}
		return this._snapshot.item(index);
	};

	XPathEvaluator = function() { };

	XPathEvaluator.prototype.evaluate = function(expression, node, resolver, type, result) {
		var res = result || new XPathResult();

		delete res.snapshotLength;
		delete res._iterator;
		delete res._snapshot;

		switch (type) {
			case XPathResult.ANY_UNORDERED_NODE_TYPE:
			case XPathResult.FIRST_ORDERED_NODE_TYPE:
				res.resultType = type;
				res.singleNodeValue = node.selectSingleNode(expression);
				break;

			case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
				res.resultType = type;
				res._snapshot = node.selectNodes(expression);
				res.snapshotLength = res._snapshot.length;
				break;

			case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
				res.resultType = type;
				res._iterator = node.selectNodes(expression);
				break;

			default:
				break;
		}
		return res;
	};
}
