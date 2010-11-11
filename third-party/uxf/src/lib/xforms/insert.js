/*
 * Copyright (c) 2008-2009 Backplane Ltd.
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

var Insert = new UX.Class({
	
	Mixins: [Listener, Context, OptionalBinding],
	
	toString: function() {
		return 'xf:insert';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(evt) {
		var context = this.getEvaluationContext();
		var bindid = this.element.getAttribute("bind");
		var atExpr = this.element.getAttribute("at");
		var positionExpr = this.element.getAttribute("position");
		var originExpr = this.element.getAttribute("origin");
		
		var nodeset;
		if (bindid) {
			var bindObject = FormsProcessor.getBindObject(bindid, this.element);
			nodeset = bindObject.boundNodeSet;
		} else {
			var nodesetExpr = this.element.getAttribute("nodeset");
			instance = context.model.instances()[0];
			nodeset = (nodesetExpr) ? instance.evalXPath(nodesetExpr, context).nodeSetValue() : null;
		}

		/* We need to determine what instance to use - calling through the right instance is 
			important, in particular, in order to dispatch an xforms-insert event to
			the correct target. We also need model that contains the instance so 
			so we can mark it for deferred rebuild. 
		*/

		var instance = (nodeset && nodeset.length > 0) ? DECORATOR.getBehaviour(nodeset[0].ownerDocument.documentElement.getAttribute('ux_uid_element')) : context.model.instances()[0];
		model = DECORATOR.getBehaviour(instance.model);
		if (instance.insertNodeset(context, nodeset, atExpr, positionExpr, originExpr)) {
			if (model && typeof(model.flagRebuild === 'function')) model.flagRebuild();
		}

		this.m_context = null;
	}
	
});
