/*
 * Copyright (C) 2008 Backplane Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Delete = new UX.Class({
	
	Mixins: [Listener, Context],
	
	toString: function() {
		return 'xf:delete';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		var context = this.getEvaluationContext();
		var bindid = this.element.getAttribute("bind");
		var atExpr = this.element.getAttribute("at");
		var instance = context.model.instances()[0];
		var nodeset;

		if (bindid) {
			var bindObject = FormsProcessor.getBindObject(bindid, this.element);
			nodeset = bindObject.boundNodeSet;
		} else {
			var nodesetExpr = this.element.getAttribute("nodeset");
			nodeset = (nodesetExpr) ? instance.evalXPath(nodesetExpr, context).nodeSetValue() : null;
		}

		if (instance.deleteFromNodeset(context, nodeset, atExpr)) {
			context.model.flagRebuild();
		}
	}
	
});

