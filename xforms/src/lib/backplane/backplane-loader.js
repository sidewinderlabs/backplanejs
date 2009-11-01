// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity Backplane module adds support that is used across the
// various modules in the Ubiquity library.
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
/* 
 * All of the following dependencies have been placed individually into
 * ../xforms/xforms-loader.js. They can be safely removed from there, and
 * this module reinistated, when the rollup builder for ubiquity-xforms is
 * capable of traversing nested loaders.
 */
 /*(
	function() {
	 	var moduleBase = pathToModule("backplane-loader");

		loader.addModule({ name: "ub-array",           type: "js",  fullpath: moduleBase + "core/array.js" });
		loader.addModule({ name: "ub-tokmap",          type: "js",  fullpath: moduleBase + "core/tokmap.js",
			requires: [ "ub-array" ] });

		loader.addModule({ name: "ub-uri",             type: "js",  fullpath: moduleBase + "uri/uri.js" });

		loader.addModule({ name: "ub-security",        type: "js",  fullpath: moduleBase + "security/security.js" });
		loader.addModule({ name: "ub-io-submission-json", type: "js",  fullpath: moduleBase + "io/submission-json.js",
			requires: [ "ub-uri" ] });
		loader.addModule({ name: "ub-file",            type: "js",  fullpath: moduleBase + "io/file.js",
			requires: [ "ub-uri", "ub-security" ] });
		loader.addModule({ name: "ub-io-file",         type: "js",  fullpath: moduleBase + "io/file.js",
			requires: [ "ub-uri", "ub-security" ] });
		loader.addModule({ name: "ub-dom3ls",          type: "js",  fullpath: moduleBase + "dom/dom3ls.js",
			requires: [ "ub-io-file" ] });
		loader.addModule({ name: "ub-io-scheme-file", type: "js",  fullpath: moduleBase + "io/scheme-file.js",
			requires: [ "ub-file", "ub-io-file" ] });

	 	loader.require(
			"ub-tokmap", "ub-array",
			"ub-uri",
			"ub-security",
			"ub-io-submission-json", "ub-file", "ub-io-file", "ub-dom3ls", "ub-io-scheme-file"
		);
		loader.insert();
		return;
  }()
);*/