// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa parser support to the Ubiquity
// library.
//
// Copyright (C) 2008-9 Mark Birbeck
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
(
	function() {
	  var moduleBase = pathToModule("rdfa-loader");

		loader.addModule({ name: "ubiquity-rdfparser",      type: "js",  fullpath: moduleBase + "rdfa/RDFParser.js" });
		
		loader.addModule({ name: "ubiquity-rdfgraph",       type: "js",  fullpath: moduleBase + "rdfa/RDFGraph.js" });
		
		loader.addModule({ name: "ubiquity-rdfstore",       type: "js",  fullpath: moduleBase + "rdfa/RDFStore.js",
		  requires: [ "ubiquity-rdfgraph" ] });

		loader.addModule({ name: "ubiquity-rdfquery",       type: "js",  fullpath: moduleBase + "rdfa/RDFQuery.js",
		  requires: [ "dom", "container", "ubiquity-rdfstore" ] });

		loader.addModule({ name: "ubiquity-kb",             type: "js",  fullpath: moduleBase + "kb/kb.js" });

		loader.addModule({ name: "yui-datatable-css",				type: "css", fullpath: "http://yui.yahooapis.com/2.7.0/build/datatable/assets/skins/sam/datatable.css" });
		
		loader.addModule({ name: "ubiquity-metascan",       type: "js",  fullpath: moduleBase + "rdfa/metascan.js",
		 	requires: [
				"treeview", "datatable", "datasource",
				"yui-datatable-css",
				"ubiquity-rdfquery", "ubiquity-rdfstore", "ubiquity-rdfparser",
				"ubiquity-kb"
			]
		});
		
		loader.require( "ubiquity-metascan" );

		loader.onSuccess = function(o) {
			setTimeout(
				function() {
					get_metadata();
				},
				500
			);
		};

		loader.insert();
		return;
  }()
);
