//
// Copyright (c) 2010 Mark Birbeck, Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

FunctionCallExpr.prototype.xpathfunctions["serialize"] = function (ctx) {
	var o, ns, n;

	if (this.args[0]) {
		o = this.args[0].evaluate(ctx);
		ns = o.nodeSetValue();
		if (ns.length && ns[0]) {
			n = ns[0];
		} else {
			return new StringValue( "" );
		}
	} else {
		n = ctx.node;
	}

	// We need to be sure that all descendents are noted as dependencies
	if (g_bSaveDependencies) {
		descendants = [];
		xpathCollectDescendants(descendants, n);
		for (var i = 0; i < descendants.length; ++i) {
			if (descendants[i].nodeName != '#text')
			g_arrSavedDependencies.push(descendants[i]);
		}
	}

	return new StringValue( xmlText( n ) );
};
