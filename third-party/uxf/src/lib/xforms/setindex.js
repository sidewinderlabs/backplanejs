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

function SetIndex(elmnt) {
	this.element = elmnt;
}


SetIndex.prototype.handleEvent = DeferToConditionalInvocationProcessor;

SetIndex.prototype.performAction = function (evt) {
  var ctx, repeatID, repeatElement, indexResult, indexValue, indexXPath, err;
  //Flush any pending deferred updates.
  doUpdate();
  //Find the desired repeat object.
  if (!(this.element.hasAttribute) || this.element.hasAttribute("repeat")) {
    repeatID = this.element.getAttribute("repeat");  
    repeatElement = FormsProcessor.getElementById(repeatID, this.element);
    //If the id can't be resolved - it's a NO-OP.
    if (repeatElement) {
      if (repeatElement.setIndex) {
        //evaluate @index
        if (!(this.element.hasAttribute) || this.element.hasAttribute("index")) {
          indexXPath = this.getAttribute("index");
          ctx = this.getEvaluationContext();
          indexResult = ctx.model.EvaluateXPath(indexXPath);
          if (indexResult) {
            indexValue = indexResult.numberValue();
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
};
