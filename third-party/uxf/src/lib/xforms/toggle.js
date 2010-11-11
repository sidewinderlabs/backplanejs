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

var Toggle = new UX.Class({
	
	Mixins: [Listener, Context],
	
	toString: function() {
		return 'xf:toggle';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		var context = this.getEvaluationContext();
		var ns = NamespaceManager.getElementsByTagNameNS(this.element, "http://www.w3.org/2002/xforms", "case");

		var caseId = (ns && ns.length > 0) ? UX.getElementValueOrContent(context, ns[0]) : this.element.getAttribute("case");
		if (caseId) {
			var oCase = DECORATOR.getBehaviour(FormsProcessor.getElementById(caseId, this.element));
			if (oCase && oCase.toggle) {
				oCase.toggle();
			}
		}
	}
	
});
