// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity Message module adds messaging support to the Ubiquity
// library.
//
// Copyright (C) 2008 Mark Birbeck
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// Mark Birbeck can be contacted at:
//
//  36 Tritton Road
//  London
//  SE21 8DE
//  United Kingdom
//
//  mark.birbeck@gmail.com
//
//= require <notify/yowl>
//= require <notify/display-yui>
//= provide "assets"
//
(function () {
	var loader = new YAHOO.util.YUILoader({
		base: "http://ajax.googleapis.com/ajax/libs/yui/2.8.0r4/build/",
		require: [ "animation", "container" ],
		loadOptional: false,
		combine: false,
		filter: "MIN",
		allowRollup: true,
		onSuccess: function () {
			var loader = new YAHOO.util.YUILoader({
				base: pathToModule(moduleName)
			});
			loader.addModule({ name: "notify-css", type: "css", path: "assets/yowl.css" });
			loader.require("notify-css");
			loader.insert();
		}
	});

	loader.addModule({
		name: "container-css", type: "css", path: "container/assets/container.css"
	});
	loader.require("container-css");
	loader.insert();
})();