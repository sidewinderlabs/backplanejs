// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
//
// Copyright (C) 2008-2009 Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function RangeValueGMAP(elmnt) {
}

RangeValueGMAP.prototype.valueChanged = function(sNewValue)
{
	var oEvt = this.element.ownerDocument.createEvent("MutationEvents");
	if(oEvt.initMutationEvent === undefined) {
		oEvt.initMutationEvent = oEvt.initEvent;
	}
		
	oEvt.initMutationEvent("control-value-changed", true, true,
		null, this.currentValue, sNewValue, null, null);
    var that = this;
	spawn(function() {
			FormsProcessor.dispatchEvent(that.element, oEvt);
	});
};

RangeValueGMAP.prototype.onDocumentReady = function() {
	this.createMap();
};

RangeValueGMAP.prototype.addMapNavigationControl = function() {
	if (this.mapContainer.clientWidth >= 180 && this.mapContainer.clientHeight >= 300) {
		this.map.addControl(new GLargeMapControl3D());
	} else if (this.mapContainer.clientWidth >= 120 && this.mapContainer.clientHeight >= 140) {
		this.map.addControl(new GSmallMapControl());
	}
};
