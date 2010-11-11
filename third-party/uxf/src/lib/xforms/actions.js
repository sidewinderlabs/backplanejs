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

/*global ActionExecutor, document, spawn, FormsProcessor, UX, setTimeout*/
//[TODO]  (issue 10) Now that loading performance is not a concern, break actions.js into one class per file
/**
 Used in conjunction with Conditional Invocation
 */
function ConditionalInvocationListener(obj, funcName) {
	return {
		realListener: obj,
		handleEvent: function(evt) {
			return obj[funcName](evt);
		}
	};
}

/**
 Event handlers are mandated to be invoked by their "handleEvent" member function, 
 however, XForms provides the possibility for events to be conditionally invoked, 
 or looped. XForms Actions, therefore, implement the "performAction" method, and  
 use DeferToConditionalInvocationProcessor as handleEvent
 
 @param {Event} evt An object reprenting the event that is occuring.
 */
function DeferToConditionalInvocationProcessor(evt) {
	var self = this;
	ActionExecutor.invokeListener({
		realListener: this,
		handleEvent: function(evt) {
			return self.performAction(evt);
		}
	}, evt);
}

var Recalculate = new UX.Class({
	
	toString: function() {
		return 'xf:recalculate';
	},
	
	intialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		var id = this.element.getAttribute("model");
		var model = this.element.ownerDocument.getElementById(id);
		model.recalculate();
	}

});

var Dispatch = new UX.Class({
	
	Mixins: [Listener],
	
	toString: function() {
		return 'xf:dispatch';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(evt) {
		var targetID = UX.getPropertyValue(this, "targetid") || UX.getPropertyValue(this, "target");
		
		if(!targetID) return;
		
		target = FormsProcessor.getElementById(targetID, this.element);
		if(!target) return;
		var name = UX.getPropertyValue(this, "name");
		if(!name) return;
		var oEvt = this.element.ownerDocument.createEvent("Events");

		oEvt.initEvent(name, UX.JsBooleanFromXsdBoolean(UX.getPropertyValue(this, "bubbles"), "false"), false);

		// Copy through the current event depth.
		oEvt._actionDepth = evt._actionDepth;

		var delay_time = UX.getPropertyValue(this, "delay");
		if (!delay_time || isNaN(parseInt(delay_time, 10)) || delay_time < 0) {
			delay_time = 0;
		}
		setTimeout(function() {
			FormsProcessor.dispatchEvent(target, oEvt);
		},
		delay_time);

		// I'm assuming that there is no point in copying the
		// 'new' depth, since it should be the same as the
		// old one...but that might not be true, hence the
		// debugger statement (now changed to throw).
		if (evt._actionDepth !== oEvt._actionDepth) {
			throw "Unexpected Discord between action depths.";
		}
	}
	
});

var Send = new UX.Class({
	
	Mixins: [Listener],
	
	toString: function() {
		return 'xf:send';
	},
	
	intialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(evt) {
		var id, submission, oEvt;
		id = this.element.getAttribute("submission");
		if(!id) {
			throw "A submission ID is required.";
		}
		evt.target.ownerDocument.logger.log("Sending to '" + id + "'", "submission");

		submission = document.getElementById(id);
		if(!submission) {
			throw "There is no submission element with an ID of '" + id + "'";
		}
		oEvt = this.element.ownerDocument.createEvent("Events");
		oEvt.initEvent("xforms-submit", false, false, null, null);
		/* Copy through the current event depth.*/
		oEvt._actionDepth = evt._actionDepth;
		spawn(function() {
			FormsProcessor.dispatchEvent(submission, oEvt);
		});

		/*
		* I'm assuming that there is no point in copying the
		* 'new' depth, since it should be the same as the
		* old one...but that might not be true, hence the
		* debugger statement (now changed to throw).
		*/
		if (evt._actionDepth !== oEvt._actionDepth) {
			throw "Unexpected Discord between action depths.";
		}

	}
	
});

var Load = new UX.Class({
	
	Mixins: [Listener, Context, OptionalBinding],
	
	toString: function() {
		return 'xf:load';
	},
	
	initialize: function(element) {
		this.element = element;
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		var boundNode = this.element.getBoundNode(1);
		var resource = UX.getPropertyValue(this.element, "resource");

		if ((boundNode.node && resource) || (!boundNode.node && !resource)) {
			return;
		}

		if (boundNode.node) {
			var textNode = getFirstTextNode(boundNode.node);
			if (textNode) {
				resource = textNode.nodeValue;
			} else {
				resource = boundNode.node.nodeValue;
			}
		}

		this.element.setAttribute("xlink:href", resource);

		if (!this.Actuate) {
			this.element.setAttribute("xlink:show", this.element.getAttribute("show") || "replace");

			var target = this.element.getAttribute("target");

			if (!target) {
				var id = event.target.id;
				if (id) {
					this.element.setAttribute("target", id);
				}
			}
			UX.extend(this, new XLinkElement(this.element));
			this.handleEvent = DeferToConditionalInvocationProcessor;
		}

		if (this.Actuate) {
			this.Actuate();
		}
	}
	
});

var Message = new UX.Class({
	
	Mixins: [Listener, MIPHandler, Context, SrcMixin, Control, OptionalBinding, LoadExternalMixin],
	
	toString: function() {
		return 'xf:message';
	},
	
	initialize: function(element) {
		this.element = element;
		this.element.addEventListener("ub-activate", this, false);
	},

	handleEvent: DeferToConditionalInvocationProcessor,

	performAction: function(event) {
		FormsProcessor.refreshDescendents(this.element.childNodes);
		
		var level = this.element.getAttribute("level");
		switch (level) {
			case "modeless":
				document.notify.messageWindow(this, false);
				break;
			case "ephemeral":
				document.notify.ephemeral(this.element, event.activate);
				break;
			case "modal":
				document.notify.messageWindow(this, true);
				break;
			default:
				document.notify.messageWindow(this, true);
		}
	}
	
});
