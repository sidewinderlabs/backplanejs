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

var ActionExecutor = {
	
	invokeListener: function(listener, oEvt) {
		var realListener, context, oRes, i, sIf, sWhile;
		//This is likely to have been called with a proxy listener, as defined in ConditionalInvocationListener
		realListener = listener.realListener || listener;
		//realListener will be the actual handler for the event that may contain the parameters for conditional invocation
		//listener will be the object on which to call handleEvent, it will pass the call on to the real listener.
		if (!realListener.getEvaluationContext) {
			listener.handleEvent(oEvt);
			return;
		}

		if (realListener.element.getAttribute("iterate")) {
			context = realListener.getEvaluationContext();
			oRes = context.model.EvaluateXPath(realListener.getAttribute("iterate"), context);
			if (!oRes || !oRes.value) return;
			for (i = 0; i < oRes.value.length; ++i) {
				realListener.unwire();
				realListener.m_context = {
					model: context.model,
					node: oRes.value[i],
					resolverElement: realListener.element,
					position: i,
					size: oRes.value.length
				};

				if (evaluateIfCondition(realListener, realListener.m_context)) {
					if (realListener.element.getAttribute("while")) {
						while (evaluateCondition(realListener.element.getAttribute("while"), realListener.m_context) && evaluateIfCondition(realListener, context)) {
							listener.handleEvent(oEvt);
						}
					} else {
						listener.handleEvent(oEvt);
					}
				}
			}
		} else {
			sIf = realListener.element.getAttribute("if");
			sWhile = realListener.element.getAttribute("while");
			if(!sIf && !sWhile) {
				listener.handleEvent(oEvt);
				return;
			}
			context = realListener.getEvaluationContext();
			if (evaluateIfCondition(realListener, context)) {
				if (realListener.element.getAttribute("while")) {
					while (evaluateCondition(realListener.element.getAttribute("while"), context) && evaluateIfCondition(realListener, context)) {
						listener.handleEvent(oEvt);
						context = realListener.getEvaluationContext();
					}
				} else {
					listener.handleEvent(oEvt);
				}
			}
		}
		return;
	}
	
};

/**
 Evaluates an XPath expression and returns the result as a boolean
 @param sCondition {String} The XPath expression to evaluate. 
 @param context {Context}  The context in which to evaluate sCondition
 @returns true if the expression resulted in a boolean within context, false otherwise.  
 Note that this means that if context is null, the return value will be false.  
 */
function evaluateCondition(condition, context) {
	if(!context) return false;
	var result = context.model.EvaluateXPath(condition, context);
	if(!result) return false;
	return result.booleanValue();
}

/**
 Where a listener has an "if" property, that may be used prevent it from executing,
 given the current state of the application, evaluate it.
 If there is no "if" property, this will evaluate to true.
 @returns false if the the if condition evaluated to false, true otherwise
 */
function evaluateIfCondition(listener, context) {
	if (!listener.element.getAttribute("if")) return true;
	return evaluateCondition(listener.element.getAttribute("if"), context);
}
