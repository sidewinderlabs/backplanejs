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

/*global DeferToConditionalInvocationProcessor, getElementValueOrContent, getProxyNode*/

function SetValue(elmnt) {
	this.element = elmnt;
}

SetValue.prototype.handleEvent = DeferToConditionalInvocationProcessor;

SetValue.prototype.performAction = function (evt) {
  var oContext, oNode, oPE, sValue;
  //Retrieve the instance data node.	
	oContext = this.getBoundNode(1);
	oNode = oContext.node;
	oPE = getProxyNode(oNode);

	//Evaluate the value attribute in context of the instance data node
	//	in order to resolve the value to set in the instance data node.
	
	sValue = getElementValueOrContent(oContext, this.element);
	
	//Update the node.
	//	 Passing a model value indicates that recalculate etc. is desired. 

	oPE.setValue(sValue, oContext.model);
};
