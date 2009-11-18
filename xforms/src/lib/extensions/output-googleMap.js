/*
 * Copyright © 2009 Backplane Ltd.
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

function XFormsOutputValueGMap() {
}

XFormsOutputValueGMap.prototype.onDocumentReady = function() {
	this.createMap();
	this.map.disableDragging();
};

XFormsOutputValueGMap.prototype.addMapNavigationControl = function() {
	if (this.mapContainer.clientWidth >= 110 && this.mapContainer.clientHeight >= 100) {
		this.map.addControl(new GSmallZoomControl3D());
	} else if (this.mapContainer.clientWidth >= 80 && this.mapContainer.clientHeight >= 80) {
		this.map.addControl(new GSmallZoomControl());
	}
};
