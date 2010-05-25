if (typeof(XPathEvaluator) == "undefined") {

	/**
	 * XPathException
	 * @param code
	 */

	XPathException = function(code) {
		this.code = code;
	};

	XPathException.INVALID_EXPRESSION_ERR      = 51;
	XPathException.TYPE_ERR                    = 52;

	/**
	 * XPathResult
	 */

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
		if (this._iteratorNext >= this._iterator.length) {
			return null;
		}
		return this._iterator[this._iteratorNext++];
	};

	XPathResult.prototype.snapshotItem = function(index) {
		if (this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE && this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE) {
			throw new XPathException(XPathException.TYPE_ERR);
		}

		if (index < 0 || index >= this.snapshotLength) {
			return null;
		}
		return this._snapshot[index];
	};

	/**
	 * XPathExpression
	 */

	XPathExpression = function(expression, resolver) {
		this._expression = xpathParse( expression );
		this._resolver = resolver;
	};

	XPathExpression.prototype._selectSingleNode = function(node, expression) {
		return this._expression.evaluate( node );
		return node.selectSingleNode(expression);
	};

	XPathExpression.prototype._selectNodes = function(node, expression) {
		return node.selectNodes(expression);
	};

	XPathExpression.prototype._evaluate = function(node, type, result) {
	    var ctx = new ExprContext(node);

	    switch (type) {
			case XPathResult.ANY_UNORDERED_NODE_TYPE:
			case XPathResult.FIRST_ORDERED_NODE_TYPE:
				return this._expression.evaluate(ctx).nodeSetValue()[0];

			case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
			case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
				return this._expression.evaluate(ctx).nodeSetValue();
		}
	};

	XPathExpression.prototype.evaluate = function(node, type, result) {
		var res = result || new XPathResult();

		delete res.snapshotLength;
		delete res._iterator;
		delete res._snapshot;

		switch (type) {
			case XPathResult.ANY_UNORDERED_NODE_TYPE:
			case XPathResult.FIRST_ORDERED_NODE_TYPE:
				res.resultType = type;
				res.singleNodeValue = this._evaluate(node, type, result);
				break;

			case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
				res.resultType = type;
				res._snapshot = this._evaluate(node, type, result);
				res.snapshotLength = res._snapshot.length;
				break;

			case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
				res.resultType = type;
				res._iterator = this._evaluate(node, type, result);
				res._iteratorNext = 0;
				break;

			default:
				break;
		}
		return res;
	};

	/**
	 * XPathEvaluator
	 */

	XPathEvaluator = function() { };

	XPathEvaluator.prototype.createExpression = function(expression, resolver) {
		return new XPathExpression(expression, resolver);
	};

	XPathEvaluator.prototype.evaluate = function(expression, node, resolver, type, result) {
		var expr = this.createExpression(expression, resolver);

		return expr.evaluate(node, type, result);
	};
}
