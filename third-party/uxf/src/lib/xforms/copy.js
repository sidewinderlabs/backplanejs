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

var Copy = new UX.Class({
	
	Mixins: [Context, Control, OptionalBinding],
	
	toString: function() {
		return 'xf:copy';
	},
	
	initialize: function(element) {
		this.element = element;
		this.m_oValue = undefined;
		UX.addStyle(this.element, "display", "none");
	},

	onContentReady: function() {
		var ownerSelect = this.element.parentNode.getOwnerSelect();
		if (ownerSelect) {
			ownerSelect.addItem(this.element.parentNode, this.getValue());
		}
	},

	onDocumentReady: function() {
		var self = this;
		spawn(function() {
			var ownerSelect;
			if (typeof self.element.parentNode.getOwnerSelect === "function") {
				ownerSelect = self.element.parentNode.getOwnerSelect();
				if (getModelFor(self) !== getModelFor(ownerSelect)) {
					UX.dispatchEvent(self.element, "xforms-binding-exception", true, false);
				}
			}
		});
	},

	setValue: function(o) {
		var ownerSelect = this.element.parentNode.getOwnerSelect();
		if(!ownerSelect || this.m_oValue == this.m_proxy.m_oNode) return;
		// When the value of an xf:copy element changes, this must be reflected
		//  in the select or select1 to which it is bound. 
		ownerSelect.itemValueChanged(this.element.parentNode, this.getValue(), this.m_proxy.m_oNode);
		this.m_oValue = this.m_proxy.m_oNode;
		ownerSelect.refreshDisplayValue();
	},

	getValue: function() {
		return this.m_oValue || null;
	}
	
});
