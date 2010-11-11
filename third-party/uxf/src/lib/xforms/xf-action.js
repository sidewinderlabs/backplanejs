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
/*global DeferToConditionalInvocationProcessor, ActionExecutor*/

var XFAction = new UX.Class({
	
	toString: function() {
		return 'xf:action';
	},
	
	Mixins: [Listener, Context],
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		// An action handler simply supports a handleEvent method,
		// so loop through executing them all.
		var children = this.element.childNodes;

		for (var i = 0, l = children.length; i < l; i++) {
			var behaviour = DECORATOR.getBehaviour(children[i]);
			if (behaviour && behaviour.handleEvent) {
				ActionExecutor.invokeListener(behaviour, event);
			}
		}
		return;
	}
	
});
