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

var Group = new UX.Class({
	
	Mixins: [MIPHandler, MIPEventTarget, Context, Container, OptionalIfUnspecifiedBinding],
	
	toString: function() {
		return 'xf:group';
	},
	
	initialize: function(element) {
		this.element = element;
		this.m_MIPSCurrentlyShowing = {};
	},

	isGroup: true,

	setValue: function(sValue) {
		return;
	},

	setType: function(sType) {
		return;
	}
	
});
