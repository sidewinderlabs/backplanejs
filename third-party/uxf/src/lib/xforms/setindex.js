/*
 * Copyright (c) 2008 Backplane Ltd.
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

/*global document, doUpdate, DeferToConditionalInvocationProcessor*/

var SetIndex = new UX.Class({
	
	Mixins: [Listener, Context],
	
	toString: function() {
		return 'xf:set-index';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(evt) {
		//Flush any pending deferred updates.
		doUpdate();
		//Find the desired repeat object.
		if (! (this.element.hasAttribute) || this.element.hasAttribute("repeat")) {
			var repeatID = this.element.getAttribute("repeat");
			var repeatElement = FormsProcessor.getElementById(repeatID, this.element);
			//If the id can't be resolved - it's a NO-OP.
			if (repeatElement) {
				if (repeatElement.setIndex) {
					//evaluate @index
					if (! (this.element.hasAttribute) || this.element.hasAttribute("index")) {
						var indexXPath = this.getAttribute("index");
						var ctx = this.getEvaluationContext();
						var indexResult = ctx.model.EvaluateXPath(indexXPath);
						if (indexResult) {
							var indexValue = indexResult.numberValue();
							//Set the index of the repeat object
							if (!isNaN(indexValue)) {
								repeatElement.setIndex(indexValue);
							}
						} else {
							throw "The number attribute of the setindex element must contain a valid XPath expression.";
						}
					} else {
						throw "The number attribute of the setindex element is required.";
					}
				} else {
					throw "The IDREF provided by setindex/@repeat must resolve to a repeating structure that implements a setIndex method. '" + repeatID + "' is not such a structure.";
				}

			}
		} else {
			throw "The repeat attribute of the setindex element is required.";
		}
	}
	
});

