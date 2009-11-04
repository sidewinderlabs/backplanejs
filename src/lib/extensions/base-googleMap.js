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

function GMapControl(element) {
	this.element = element;
	this.element.parentNode.setMapInfo = function(infoElement) {
		element.setMapInfo(infoElement);
	};
}

GMapControl.prototype.setMapInfo = function(infoElement) {
	this.mapInfo = infoElement;
};

GMapControl.prototype.createMap = function() {
	this.mapContainer = document.createElement('div');
	this.element.appendChild(this.mapContainer);

	this.setMapDimensionUnlessParentIsSet('width', '300px');
	this.setMapDimensionUnlessParentIsSet('height', '200px');

	this.map = new GMap2(this.mapContainer);
	this.mapLocation = new GLatLng(51.523811, -0.107878);
	this.map.setCenter(this.mapLocation, this.estimateInitialZoom());

	this.addMapControls();
};

GMapControl.prototype.setMapDimensionUnlessParentIsSet = function(dimension, value) {
	if (this.element.parentNode.style[dimension] === '') {
		UX.addStyle(this.mapContainer, dimension, value);
	} else {
		UX.addStyle(this.mapContainer, dimension, this.element.parentNode.style[dimension]);
	}
};

GMapControl.prototype.estimateInitialZoom = function() {
	if (this.mapContainer.clientWidth < 120 || this.mapContainer.clientHeight < 120) {
		return 8;
	}

	if (this.mapContainer.clientWidth < 160 || this.mapContainer.clientHeight < 160) {
		return 13;
	}

	if (this.mapContainer.clientWidth < 200 || this.mapContainer.clientHeight < 200) {
		return 14;
	}

	return 16;
};

GMapControl.prototype.addMapControls = function() {
	this.addCommonMapControls();

	if (typeof this.addMapNavigationControl === 'function') {
		this.addMapNavigationControl();
	}
};

GMapControl.prototype.addCommonMapControls = function() {
	this.addMapTypeControl();
	this.addMapScaleControl();
	this.addMapOverviewControl();
};

GMapControl.prototype.addMapTypeControl = function() {
	if (this.mapContainer.clientWidth >= 260 && this.mapContainer.clientHeight >= 100) {
		this.map.addControl(new GMapTypeControl());
	} else if (this.mapContainer.clientWidth >= 190 && this.mapContainer.clientHeight >= 120) {
		this.map.addControl(new GHierarchicalMapTypeControl());
	} else if (this.mapContainer.clientWidth >= 140 && this.mapContainer.clientHeight >= 140) {
		this.map.addControl(new GMenuMapTypeControl());
	}
};

GMapControl.prototype.addMapScaleControl = function() {
	if (this.mapContainer.clientWidth >= 500 && this.mapContainer.clientHeight >= 200) {
		this.map.addControl(new GScaleControl());
	}
};

GMapControl.prototype.addMapOverviewControl = function() {
	if (this.mapContainer.clientWidth >= 620 && this.mapContainer.clientHeight >= 200) {
		this.map.addControl(new GOverviewMapControl());
	}
};

GMapControl.prototype.setValue = function(value) {
	var match;
	if (value !== this.currentValue) {
		match = value.match(/([\-+]?\d*\.?\d+)[\,\s\;]*([\-+]?\d*\.?\d+)/);
		if (match) {
			this.setMapCoordinates(new GLatLng(Number(match[1]), Number(match[2])));
		} else {
			this.setMapLocation(value);
		}

		this.currentValue = value;
	}
};

GMapControl.prototype.setMapLocation = function(location) {
	var self = this;

	if (!this.geocoder) {
		this.geocoder = new GClientGeocoder();
	}

	this.geocoder.getLatLng(location, function(coords) {
		self.setMapCoordinates(coords);
	});
};

GMapControl.prototype.setMapCoordinates = function(coords) {
	if (coords) {
		this.mapLocation = coords;

		if (this.mapMarker) {
			this.moveMapMarker();
		} else {
			this.addMapMarker();
		}
	}
};

GMapControl.prototype.addMapMarker = function() {
	var self = this;
	this.mapMarker = new GMarker(this.mapLocation, { clickable: this.mapInfo ? true : false, draggable: false });
	GEvent.addListener(this.mapMarker, 'click', function () {
		self.onClickMapMarker();
	});
	GEvent.addListener(this.mapMarker, 'infowindowclose', function () {
		self.onMapInfoDismissed();
	});
	GEvent.addListener(this.map, 'moveend', function() {
		var value;
		if (!self.mapInfoIsVisible) {
			value = self.map.getCenter().lat() + ";" + self.map.getCenter().lng();
			if(value !== self.currentValue) {
				self.valueChanged(value);
			}
		}
	});
	this.map.addOverlay(this.mapMarker);
};

GMapControl.prototype.moveMapMarker = function() {
	if (!this.mapInfoIsVisible) {
		this.mapMarker.setLatLng(this.mapLocation);
		this.map.setCenter(this.mapLocation, this.map.getZoom());
	}
};

GMapControl.prototype.onClickMapMarker = function() {
	if (this.mapInfo) {
		if (this.mapInfoIsVisible) {
			this.mapMarker.closeInfoWindow();
		} else {
			this.mapInfoIsVisible = true;
			FormsProcessor.refreshDescendents(this.mapInfo.childNodes);
			this.mapMarker.openInfoWindowHtml(this.mapInfo.getValue(), { maxWidth: this.mapContainer.clientWidth >= 200 ? this.mapContainer.clientWidth - 80 : 120 });
		}
	}
};

GMapControl.prototype.onMapInfoDismissed = function() {
	this.map.panTo(this.mapLocation);
	this.mapInfoIsVisible = false;
};
