/*
 * Copyright (c) 2008-9 Backplane Ltd.
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

var Header = new UX.Class({
	
	Mixins: [Context],
	
	toString: function() {
		return 'xf:header';
	},
	
	initialize: function(element) {
		this.element = element;
		this.template = null;
		// Hack for issue 612. If there is no @nodeset, decorate child elements immediately.
		if (!this.element.getAttribute('nodeset')) {
			UX.addClassName(this.element, 'header-ready');
		}
	},

	onDocumentReady: function() {
		var model = null;

		if (this.element.getAttribute("nodeset")) {
			this.template = this.element.cloneNode(true);

			while (this.element.hasChildNodes()) {
				this.element.removeChild(this.element.firstChild);
			}

			model = getModelFor(this);
			model.addControl(this);

			UX.addClassName(this.element, "header-ready");
		}
	},

	refresh: function() {
		
	},

	rewire: function() {
		var expression = this.element.getAttribute("nodeset");
		if(!expression) return;
			while (this.element.childNodes.length > 0) {
			this.element.removeChild(this.element.firstChild);
		}
		var context = this.element.getEvaluationContext();
		var nodes = context.model.EvaluateXPath(expression, context).value;
		if(!nodes) return;
		
		var name = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms")[0] + ":header";

		for (var i = 0, l = nodes.length; i < l; i++) {

			var element = document.createElementNS("http://www.w3.org/2002/xforms", name);

			element.setAttribute("ref", ".");
			element.setAttribute("ordinal", i + 1);
			UX.addClassName(element, "header-ready");

			var template = this.template.cloneNode(true);
			
			while (template.hasChildNodes()) {
				element.appendChild(template.firstChild);
			}

			this.element.appendChild(element);
		}

		if (!UX.hasDecorationSupport) {
			DECORATOR.applyRules(this.element);
		}
		
	}
	
});
