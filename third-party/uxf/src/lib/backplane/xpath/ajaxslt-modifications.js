(function() {

	var withDeps;
	var deps = [];

	
	this.getDependencies = function(expr, node) {
		withDeps = true;
		deps = [];
		var val = xpathParse(expr).evaluate(new ExprContext(node));
		withDeps = false;
		return deps;
	};

	FunctionCallExpr.prototype.evaluate = function(ctx) {
		var fn = '' + this.name.value;
		var f = this.xpathfunctions[fn];
		if (f) {
			val = f.call(this, ctx);
			if (withDeps && val.type == 'node-set') {
				nodes = val.nodeSetValue();
				for (var i = 0, l = nodes.length; i < l; i++) {
					deps.push(nodes[i]);
				}
			}
			return val;
		} else {
			xpathLog('XPath NO SUCH FUNCTION ' + fn);
			return new BooleanValue(false);
		}
	};

	LocationExpr.prototype.evaluate = function(ctx) {
		var start;
		if (this.absolute) {
			start = ctx.root;
		} else {
			start = ctx.node;
		}
		var nodes = [];
		xPathStep(nodes, this.steps, 0, start, ctx);
		var val = new NodeSetValue(nodes);
		if(withDeps) {
			for (var i = 0, l = nodes.length; i < l; i++) {
				deps.push(nodes[i]);
			}
		}
		return val;
	};

})();
