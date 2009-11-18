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

var ActionExecutor = function () {
	/**
		Evaluates an XPath expression and returns the result as a boolean
		@param sCondition {String} The XPath expression to evaluate. 
		@param oContext {Context}  The context in which to evaluate sCondition
		@returns true if the expression resulted in a boolean within oContext, false otherwise.  
			Note that this means that if context is null, the return value will be false.  
	*/
	function evaluateCondition(sCondition, oContext)	{
		var oRes, bIf;
		bIf = false;
		if (oContext) {
			oRes = oContext.model.EvaluateXPath(sCondition, oContext);
	
			if (oRes) {
				bIf = oRes.booleanValue();
			}
		}
		return bIf;
	}

	/**
	Where a listener has an "if" property, that may be used prevent it from executing,
	given the current state of the application, evaluate it.
	 If there is no "if" property, this will evaluate to true.
	@returns false if the the if condition evaluated to false, true otherwise
	*/
	function evaluateIfCondition(oListener, oContext) {
		var bIf = true;
		if (oListener.getAttribute("if")) {
			bIf = evaluateCondition(oListener.getAttribute("if"), oContext);
		}
		return bIf;
	}
	
	var itself = { };
	
	itself.invokeListener = function (oListener, oEvt) {
		var oRealListener, oContext, oRes, i, sIf, sWhile;
		//This is likely to have been called with a proxy listener, as defined in ConditionalInvocationListener
		oRealListener = oListener.realListener?oListener.realListener:oListener;
		//oRealListener will be the actual handler for the event that may contain the parameters for conditional invocation
		//oListener will be the object on which to call handleEvent, it will pass the call on to the real listener.
		
		if (typeof oRealListener.getEvaluationContext !== "undefined") {

			if (oRealListener.getAttribute("iterate")) {
				oContext = oRealListener.getEvaluationContext();
				oRes = oContext.model.EvaluateXPath(oRealListener.getAttribute("iterate"), oContext);
				if (oRes && oRes.value) {
					for (i = 0; i < oRes.value.length; ++i) {
						oRealListener.unwire();
						oRealListener.m_context = {
						    model: oContext.model,
						    node: oRes.value[i],
						    resolverElement: oRealListener.element,
						    position: i,
						    size: oRes.value.length
						};
						
						if (evaluateIfCondition(oRealListener, oRealListener.m_context)) {
							if (oRealListener.getAttribute("while")) {
								while (evaluateCondition(oRealListener.getAttribute("while"), oRealListener.m_context) && evaluateIfCondition(oRealListener, oContext)) {
									oListener.handleEvent(oEvt);
								}
							} else {
								oListener.handleEvent(oEvt);
							}
						}
					}
				}
					
			} else {
				sIf = oRealListener.getAttribute("if");
				sWhile = oRealListener.getAttribute("while");
				if(sIf || sWhile) {
					oContext = oRealListener.getEvaluationContext();

					if (evaluateIfCondition(oRealListener, oContext)) {	
						if (oRealListener.getAttribute("while")) {
							while (evaluateCondition(oRealListener.getAttribute("while"), oContext) && evaluateIfCondition(oRealListener, oContext)) {
								oListener.handleEvent(oEvt);
								oContext = oRealListener.getEvaluationContext();
							}
						}	else {
							oListener.handleEvent(oEvt);
						}
					}
				}	else {
					oListener.handleEvent(oEvt);
				}
			}
		}
		else {
			oListener.handleEvent(oEvt);
		}
		return;
	};
	return itself;
}();