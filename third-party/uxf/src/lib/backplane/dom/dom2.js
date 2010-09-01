// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
//
// Copyright (C) 2008 Backplane Ltd.
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

if (!document.createElementNS) {
	document.createElementNS = function(namespaceURI, elementName) {
		var element = document.createElement(elementName);
		
		element.namespaceURI = namespaceURI;
		return element;
	};
}

if (document.implementation) {
	if (document.implementation.createDocument) {
		document.DOMImplementation = document.implementation;
	} else {
		document.DOMImplementation = {
			createDocument: function(namespaceURI, qualifiedName, doctype) {
				var doc = null;
		
				/**
				 * According to http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
				 * best practice is to try MSXML 6.0 and then fall back to MSXML 3.0.
				 */

				if (typeof(ActiveXObject) != "undefined") {
					try {
						doc = new ActiveXObject("Msxml2.DOMDocument.6.0");
					} catch(e) {
						try {
							doc = new ActiveXObject("Msxml2.DOMDocument.3.0");
							doc.setProperty("SelectionLanguage", "XPath");
						} catch(e) {
							throw "No MSXML parser is installed."
						}
					}

					if (doc) {
						doc.async = false;
					}
				}

				return doc;
			}
		};
	}//if ( there is no createDocument ) method
}
