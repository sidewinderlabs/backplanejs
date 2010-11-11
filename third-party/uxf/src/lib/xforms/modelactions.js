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

/**
 Action handler used as a base class for elements that are used to call an extant method on a model.
 @param method {Function} a function that takes a model as an argument, and calls the appropriate method on it.
 */
function ModelFunctionAction(method) {
	this.ModelMethod = method;
	this.handleEvent = DeferToConditionalInvocationProcessor;

	this.performAction = function(evt) {
		var m = getModelFor(this.element);
		this.ModelMethod(m);
	};
	return this;
}
/**Specialisation of ModelFunctionAction to call rebuild*/

var Rebuild = new UX.Class({
	
	Mixins: [Listener, new ModelFunctionAction(function(model) {
		model._rebuild();
	})],
	
	toString: function() {
		return 'xf:rebuild';
	},
	
	initialize: function(element) {
		this.element = element;
	}
});

/**
 Specialisation of ModelFunctionAction to call recalculate
 */
var Recalculate = new UX.Class({
	
	Mixins: [Listener, new ModelFunctionAction(function(model) {
		model._recalculate();
	})],
	
	toString: function() {
		return 'xf:recalculate';
	},
	
	initialize: function(element) {
		this.element = element;
	}
	
});

/**
 Specialisation of ModelFunctionAction to call revalidate
 */
var Revalidate = new UX.Class({
	
	Mixins: [Listener, new ModelFunctionAction(function(model) {
		model._revalidate();
	})],
	
	toString: function() {
		return 'xf:revalidate';
	},
	
	initialize: function(element) {
		this.element = element;
	}
	
});

/**
 Specialisation of ModelFunctionAction to call refresh
 */
var Refresh = new UX.Class({
	
	Mixins: [Listener, new ModelFunctionAction(function(model) {
		model._refresh();
	})],
	
	toString: function() {
		return 'xf:refresh';
	},
	
	initialize: function(element) {
		this.element = element;
	}
	
});

/**
 Specialisation of ModelFunctionAction to call reset
 */
var Reset = new UX.Class({
	
	Mixins: [Listener, new ModelFunctionAction(function(model) {
		//create and dispatch an xforms-reset event on the model, as defined in http://www.w3.org/TR/xforms11/#action-reset
		UX.dispatchEvent(model, "xforms-reset", true, true);
	})],
	
	toString: function() {
		return 'xf:reset';
	},
	
	initialize: function(element) {
		this.element = element;
	}
	
});
