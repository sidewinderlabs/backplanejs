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

function XFAction(elmnt) {
	this.element = elmnt;
}

XFAction.prototype.handleEvent = DeferToConditionalInvocationProcessor;

XFAction.prototype.performAction = function (evt) {
  var oColl, i;
	 // An action handler simply supports a handleEvent method,
	 // so loop through executing them all.
	 
	oColl = this.element.childNodes;

	for (i = 0; i < oColl.length; i++) {
		if (oColl.item(i).handleEvent) {
			ActionExecutor.invokeListener(oColl.item(i), evt);
	  } 
	}
	return;
};
