/*
 * Copyright (c) 2008-2009 Backplane Ltd.
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
/*global DECORATOR, NamespaceManager, UX, document, window, getModelFor*/

function Repeat(elmnt) {
  this.element = elmnt;
  var sStartIndex;
  if (this.element) {
    this.element.bindingContainerName = "group";

    sStartIndex = elmnt.getAttribute("startindex");
    
    this.m_nIndex = (sStartIndex === null || isNaN(sStartIndex))?1:this.m_nIndex = Number(sStartIndex);
  }
  
  this.m_CurrentIterationCount = 0;
  this.m_offset = 0;
  this.m_iterationNodesetLength = 0;
}    

Repeat.prototype.onContentReady = function () {
	FormsProcessor.listenForXFormsFocus(this, this);
};

Repeat.prototype.giveFocus = function () {
	var indexNode = this.getCurrentIteration();
	if (typeof indexNode.giveFocus === "function") {
		return indexNode.giveFocus();
	}

	return true;
};

Repeat.prototype.onDocumentReady = function () {
  this.storeTemplate();
  this.addcontroltomodel();
  this.element.addEventListener(
    "DOMActivate",
    {
      control: this,
      handleEvent: function (evt) {
        this.control.Activate(evt.target);
      }
    },
    true
  );
};

Repeat.prototype.Activate  = function (o) {
  var coll = this.element.childNodes,
  len = coll.length,
  i;
  for (i = 0; i < len; ++i) {
    if (coll[i].contains(o)) {
      this.m_nIndex = i + 1;
      break;
    }
  }
};

Repeat.prototype.storeTemplate = function () {
	
	
	// Issue 529 - Since the child nodes of the template are removed after initializing the template
	// initializing a second time will receive an empty template.
	if (!this.sTemplate) {
		this.sTemplate = this.element.cloneNode(true);
	}
	while (this.element.childNodes.length) {
		this.element.removeChild(this.element.firstChild); 
	}
	UX.addClassName(this.element, "repeat-ready");
};

//register this element with the model
//
Repeat.prototype.addcontroltomodel = function ()	{
  if (!this.m_bAddedToModel) {
    var oModel = getModelFor(this);
    if (oModel) {
      oModel.addControl(this);
    } 
  }    
};

Repeat.prototype.refresh = function () {

};

Repeat.prototype.getRequestedIterationCount = function () {
  //Alter the number of iterations, if appropriate
  var sNumber = this.getAttribute("number"),
  desiredIterationCount = 0;
  
  if (sNumber === null || isNaN(sNumber)) {
      //without a number attribute, vary the repeat with the size of the nodeset.
    desiredIterationCount = this.m_iterationNodesetLength;
  } else {
    desiredIterationCount =  Number(sNumber);
  }
  return desiredIterationCount;
};


Repeat.prototype.putIterations = function (desiredIterationCount) {

	var
		formerOffset,
		i,
		currentOrdinal,
		sDefaultPrefix,
		iterations = this.element.childNodes,
		oIterationElement,
		templateClone,
		thisModel,
		ordinal,
		newOrdinal;

	// If we have iterations that are bound to nodes that have been
	// deleted then the iterations themselves must be deleted.
	//

	// Note that we can't treat this loop as being of a fixed size (such
	// as by starting with 'length' and then decrementing, or obtaining
	// a 'stop' value at the beginning) because as items are removed from
	// the array its size will change.
	//
	i = 0;

	while (i < iterations.length) {
		node = iterations[ i ];
		if (node.m_proxy && !node.m_proxy.m_oNode) {
		  this.element.removeChild( node );
		}
		// If we deleted a child then we don't need to increment the loop counter
		// since the next child will have shifted into place.
		//
		else {
			i++;
		}
	}

	// Now set the value for the number of current iterations to the
	// the number of child nodes. If we don't have enough then we'll
	// create some more shortly.
	//
	this.m_CurrentIterationCount = iterations.length;

	//hold the current offset, to determine whether it is necessary to change
	//  the ordinals of the various iterations.
	formerOffset = this.m_offset;
	
	
	//Fix the viewport so that the desired index will be visible.
	if (this.m_nIndex < this.m_offset) {
		//If offset is later than index, move the viewport such that index is the last visible iteration
		this.m_offset = 1 + this.m_nIndex - desiredIterationCount;
	} else if (this.m_nIndex > (desiredIterationCount + this.m_offset)) {
		//If there are fewer iterations than would allow the current index to be visible
		//Set the offset and index to match.
		this.m_offset = this.m_nIndex - 1;
	}
	
	// Bring the @ordinal values into line and unwire remaining iterations
	//
	for (i = 0; i < this.m_CurrentIterationCount; ++i) {
		node = iterations[i];
		if (node.isBindingContainer) {
			ordinal = node.getAttribute("ordinal");
			newOrdinal = 1 + i + this.m_offset;
			if (ordinal !== newOrdinal) {
				node.setAttribute("ordinal", newOrdinal);
			}
		} 
		node.m_proxy = null;
	}
	
	sDefaultPrefix = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms")[0] + ":";
	
	//Suspend the decorator,
	//	content added is received in order of opening tag, 
	//	and both ContentReady and DocumentReady are executed out of order. 
	var suspension = false;
	if (desiredIterationCount > this.m_CurrentIterationCount) {
		suspension = true;
		DECORATOR.suspend();
		this.m_model.stopXFormsReady();
  	}

	while (desiredIterationCount > this.m_CurrentIterationCount) {
		//In the absence of an iteration corresponding to this index, insert one.
		oIterationElement = (UX.isXHTML) ? 
			document.createElementNS("http://www.w3.org/2002/xforms", sDefaultPrefix + this.element.bindingContainerName) :
			document.createElement(sDefaultPrefix + this.element.bindingContainerName);
		oIterationElement.setAttribute("ref", ".");
		oIterationElement.setAttribute("ordinal", this.m_offset + this.m_CurrentIterationCount + 1);
		oIterationElement.isBindingContainer = true;
		UX.addClassName(oIterationElement, "repeat-iteration");
		
		oIterationElement.outerScope = this;
		
		templateClone = this.element.sTemplate.cloneNode(true);
		
		//Move each child of templateClone to oIterationElement, maintaining order.
		while (templateClone.hasChildNodes()) {
			oIterationElement.appendChild(templateClone.firstChild);
		}
		this.element.appendChild(oIterationElement);
		window.status = "";
		//set the status bar, to fix the progress bar.
		//See: http://support.microsoft.com/default.aspx?scid=kb;en-us;Q320731 
		
		this.m_CurrentIterationCount++;
	}
	thisModel = this.m_model;
  //Spawn the resumption of the decorator,
  //	spawning allows the content to add itself, prior to being initialised by the resumption
	if(suspension) {
		spawn(function () {
			DECORATOR.resume();
			thisModel.resumeXFormsReady();
		});
	}
  
};


/**
  function: normaliseIndex
  returns: The result of constraining val within the range of 1 to the length of the iteration nodeset.
*/

Repeat.prototype.normaliseIndex = function (val) {
  return Math.max(Math.min(val, this.m_iterationNodesetLength), !this.m_iterationNodesetLength? 0: 1);
};

Repeat.prototype.rewire = function () {
  var arrNodes = null,
      sExpr,
      sBind = this.element.getAttribute("bind"),
      oBind,
      oContext,
      r,
      newIndex;
  
  if (sBind) {
    oBind = FormsProcessor.getBindObject(sBind, this.element);
    if (oBind) {
      arrNodes = oBind.boundNodeSet;
      this.m_model = oBind.ownerModel;
    }
  } else {
    sExpr = this.element.getAttribute("nodeset");
    
    if (sExpr) {
      document.logger.log("Rewiring: " + this.element.tagName + ":" + this.element.uniqueID + ":" + sExpr, "info");
      
      oContext = this.element.getEvaluationContext();
      this.m_model = oContext.model;
      r = this.m_model.EvaluateXPath(sExpr, oContext);
      
      arrNodes = r.value;
    } else {
      document.logger.log("Element: " + this.element.tagName + ":" + this.element.uniqueID + " lacks binding attributes.", "warn");
    }
  }
  
  if (arrNodes) {
    this.m_iterationNodesetLength = arrNodes.length;
    newIndex = this.m_model.indexOfNewNode(arrNodes);
    if (newIndex !== -1) {
      this.m_nIndex = newIndex + 1;
    }
    this.m_nIndex = this.normaliseIndex(this.m_nIndex);
    this.putIterations(this.getRequestedIterationCount());

    if (!UX.hasDecorationSupport) {
      DECORATOR.applyDecorationRules(this.element);
    }
  }

  return false;
};


Repeat.prototype.getIndex = function () {
  return this.m_nIndex;
};

Repeat.prototype.setIndex = function (newIndex) {
  var ix = this.normaliseIndex(newIndex);
  if (ix > newIndex) {
    UX.dispatchEvent(this.element, "xforms-scroll-first", true, false, true);
  } else if (ix < newIndex){
    UX.dispatchEvent(this.element, "xforms-scroll-last", true, false, true);
  }
  if (ix !== this.m_nIndex) {
    this.m_nIndex = ix;
    this.m_model.flagRebuild();
  }
};


Repeat.prototype.getCurrentIteration = function () {
	return this.element.childNodes.item(this.getIndex() - this.m_offset - 1);
};

Repeat.prototype.getPublicElementById = function (id) {

	return FormsProcessor.getElementByIdWithAncestor(id,this.getCurrentIteration());
};

Repeat.prototype.exposes = function (element) {
	return this.getCurrentIteration().contains(element);
};
