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

var Repeat = new UX.Class({
	
	Mixins: [Context],
	
	toString: function() {
		return 'xf:repeat';
	},
	
	initialize: function(element) {
		this.element = element;
		this.bindingContainerName = "group";
		var sStartIndex = element.getAttribute("startindex");
		this.m_nIndex = (sStartIndex === null || isNaN(sStartIndex)) ? 1 : this.m_nIndex = Number(sStartIndex);
		if (!UX.hasDecorationSupport) {
			this.storeTemplate();
		}
		this.m_CurrentIterationCount = 0;
		this.m_offset = 0;
		this.m_iterationNodesetLength = 0;
	},

	onContentReady: function() {
		FormsProcessor.listenForXFormsFocus(this, this);
	},

	giveFocus: function() {
		var indexNode = this.getCurrentIteration();
		if (typeof DECORATOR.getBehaviour(indexNode).giveFocus === "function") {
			return DECORATOR.getBehaviour(indexNode).giveFocus();
		}
		return true;
	},

	onDocumentReady: function() {
		if (UX.hasDecorationSupport) {
			this.storeTemplate();
		}
		this.addControlToModel();
		this.element.addEventListener("DOMActivate", {
			control: this,
			handleEvent: function(evt) {
				this.control.Activate(evt.target);
			}
		},
		true);
	},

	Activate: function(o) {
		var coll = this.element.childNodes;
		for (var i = 0, l = coll.length; i < l; i++) {
			if (coll[i].contains(o)) {
				this.m_nIndex = i + 1;
				break;
			}
		}
	},

	storeTemplate: function() {

		// Issue 529 - Since the child nodes of the template are removed after initializing the template
		// initializing a second time will receive an empty template.
		if (!this.sTemplate) {
			this.sTemplate = this.element.cloneNode(true);
		}
		while (this.element.childNodes.length) {
			this.element.removeChild(this.element.firstChild);
		}
		UX.addClassName(this.element, "repeat-ready");
	},

	//register this element with the model
	//
	addControlToModel: function() {
		if (!this.m_bAddedToModel) {
			var oModel = getModelFor(this);
			if (oModel) {
				oModel.addControl(this);
			}
		}
	},

	refresh: function() {

	},

	getRequestedIterationCount: function() {
		//Alter the number of iterations, if appropriate
		var sNumber = this.element.getAttribute("number"),
			desiredIterationCount = 0;

		if (sNumber === null || isNaN(sNumber)) {
			//without a number attribute, vary the repeat with the size of the nodeset.
			desiredIterationCount = this.m_iterationNodesetLength;
		} else {
			desiredIterationCount = Number(sNumber);
		}
		return desiredIterationCount;
	},

	putIterations: function(desiredIterationCount) {
		var iterations = this.element.childNodes;
		// If we have iterations that are bound to nodes that have been
		// deleted then the iterations themselves must be deleted.
		//
		// Note that we can't treat this loop as being of a fixed size (such
		// as by starting with 'length' and then decrementing, or obtaining
		// a 'stop' value at the beginning) because as items are removed from
		// the array its size will change.
		//
		var i = 0;
		while (i < iterations.length) {
			var node = iterations[i];
			if (DECORATOR.getBehaviour(node).m_proxy && !DECORATOR.getBehaviour(node).m_proxy.m_oNode) {
				this.element.removeChild(node);
			} else {
				// If we deleted a child then we don't need to increment the loop counter
				// since the next child will have shifted into place.
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
		var formerOffset = this.m_offset;

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
		for (i = 0; i < this.m_CurrentIterationCount; i++) {
			node = iterations[i];
			if (node.getAttribute('bindingcontainer')) {
				var ordinal = parseInt(node.getAttribute("ordinal"), 10);
				var newOrdinal = 1 + i + this.m_offset;
				if (ordinal !== newOrdinal) {
					node.setAttribute("ordinal", newOrdinal);
				}
			}
			DECORATOR.getBehaviour(node).m_proxy = null;
		}

		var prefix = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms")[0] + ":";

		//Suspend the decorator,
		//	content added is received in order of opening tag, 
		//	and both ContentReady and DocumentReady are executed out of order. 
		var suspension = false;
		if (desiredIterationCount > this.m_CurrentIterationCount) {
			suspension = true;
			DECORATOR.suspend();
			this.m_model.stopXFormsReady();
		}
		var uid = this.element.ux_uid;
		if(!UX.isXHTML) {
			var html = [];
			var tpl = this.sTemplate.cloneNode(true).innerHTML;
			while (desiredIterationCount > this.m_CurrentIterationCount) {
				html.push('<' + prefix + this.bindingContainerName + ' ref="." ordinal="' + (this.m_offset + this.m_CurrentIterationCount + 1) + '" class="repeat-iteration" bindingcontainer="true" outerscope="' + uid + '">');
				html.push(tpl);
				html.push('</' + prefix + this.bindingContainerName + '>');
				this.m_CurrentIterationCount++;
			}
			if(html.length) this.element.insertAdjacentHTML('beforeEnd', html.join(''));
		} else {
			while (desiredIterationCount > this.m_CurrentIterationCount) {
				//In the absence of an iteration corresponding to this index, insert one.
				var item = document.createElementNS("http://www.w3.org/2002/xforms", prefix + this.bindingContainerName);
				item.setAttribute("ref", ".");
				item.setAttribute("ordinal", this.m_offset + this.m_CurrentIterationCount + 1);
				item.setAttribute("bindingcontainer", "true");
				UX.addClassName(item, "repeat-iteration");
				item.setAttribute("outerscope", uid);
				var templateClone = this.sTemplate.cloneNode(true);
				//Move each child of templateClone to item, maintaining order.
				while (templateClone.hasChildNodes()) {
					item.appendChild(templateClone.firstChild);
				}
				this.element.appendChild(item);
				this.m_CurrentIterationCount++;
			}
		}
		
		//Spawn the resumption of the decorator,
		//	spawning allows the content to add itself, prior to being initialised by the resumption
		var model = this.m_model;
		if (suspension) {
			DECORATOR.resume();
			model.resumeXFormsReady();
		}
	},

	/**
	 function: normaliseIndex
	 returns: The result of constraining val within the range of 1 to the length of the iteration nodeset.
	 */

	normaliseIndex: function(val) {
		return Math.max(Math.min(val, this.m_iterationNodesetLength), !this.m_iterationNodesetLength ? 0 : 1);
	},

	rewire: function() {
		var arrNodes = null,
			sExpr, sBind = this.element.getAttribute("bind"),
			oBind, oContext, r, newIndex;

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

				oContext = DECORATOR.getBehaviour(this.element).getEvaluationContext();
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
				DECORATOR.applyRules(this.element);
			}
		}

		return false;
	},

	getIndex: function() {
		return this.m_nIndex;
	},

	setIndex: function(newIndex) {
		var ix = this.normaliseIndex(newIndex);
		if (ix > newIndex) {
			UX.dispatchEvent(this.element, "xforms-scroll-first", true, false, true);
		} else if (ix < newIndex) {
			UX.dispatchEvent(this.element, "xforms-scroll-last", true, false, true);
		}
		if (ix !== this.m_nIndex) {
			this.m_nIndex = ix;
			this.m_model.flagRebuild();
		}
	},

	getCurrentIteration: function() {
		return this.element.childNodes[this.getIndex() - this.m_offset - 1];
	},

	getPublicElementById: function(id) {
		return FormsProcessor.getElementByIdWithAncestor(id, this.getCurrentIteration());
	},

	exposes: function(element) {
		return this.getCurrentIteration().contains(element);
	}
	
});
