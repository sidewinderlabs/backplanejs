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

function Header(element) {
	this.element = element;
	this.template = null;

	// Hack for issue 612. If there is no @nodeset, decorate child elements immediately.
	if (!this.element.getAttribute('nodeset')) {
		UX.addClassName(this.element, 'header-ready');
	}
};

Header.prototype.onDocumentReady = function() {
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
};

Header.prototype.refresh = function() {};

Header.prototype.rewire = function() {
	var expression = this.element.getAttribute("nodeset");
	var nodes;
	var context;
	var i;
	var name;
	var element;
	var template;

	if (expression) {
		while (this.element.childNodes.length > 0) {
			this.element.removeChild(this.element.firstChild);
		}

		context = this.element.getEvaluationContext();
		nodes = context.model.EvaluateXPath(expression, context).value;
		
		if (nodes) {
			name = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms")[0] + ":header";
			
			for ( i = 0; i < nodes.length; i++ ) {
				
				element = document.createElementNS("http://www.w3.org/2002/xforms", name);
				
				element.setAttribute("ref", ".");
				element.setAttribute("ordinal", i + 1);
				UX.addClassName(element, "header-ready");
				
				template = this.template.cloneNode(true);
				while (template.hasChildNodes()) {
					element.appendChild(template.firstChild);
				}
				
				this.element.appendChild(element);
			}

			if (!UX.hasDecorationSupport) {
				DECORATOR.applyDecorationRules(this.element);
			}
		}
		
	}
};