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
var Submit = new UX.Class({
	
	Mixins: [NavigableControl, OptionalBinding],
	
	toString: function() {
		return 'xf:submit';
	},
	
	initialize: function(element) {
		this.element = element;
		this.element.addEventListener("DOMActivate", this, false);
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		var control = this;
		var submission = null;
		var doc = control.element.ownerDocument;
		//WebKit issues its own DOMActivate that we need to ignore.
		if (event.type != "DOMActivate" || (UX.isWebKit && !event.mappedFromClick)) return;
		var id = control.element.getAttribute("submission");
		if (id) {
			submission = doc.getElementById(id);
			if (!submission || !NamespaceManager.compareFullName(submission, "submission", "http://www.w3.org/2002/xforms")) {
				UX.dispatchEvent(this.element, "xforms-binding-exception", true, false, false);
			}
		} else {
			// if there is not a declared submssion id, get the first submission
			// element of the default model
			var model = getModelFor(doc);

			if (model) {
				// halt on the first submission in model
				var children = model.element.childNodes;
				for (var i = 0, l = children.length; i < l; i++) {
					if (NamespaceManager.compareFullName(children[i], "submission", "http://www.w3.org/2002/xforms")) {
						submission = children[i];
						break;
					}
				}
			}

			if (!submission) {
				throw "There is no submission element associated with the default model.";
			}
		}

		if (submission) {
			var submitEvent = doc.createEvent("Events");
			submitEvent.initEvent("xforms-submit", true, true, null, null);
			spawn(function() {
				FormsProcessor.dispatchEvent(submission, submitEvent);
			});
		}
	}
	
});
