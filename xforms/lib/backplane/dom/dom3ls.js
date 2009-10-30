// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
//
// Copyright © 2008-9 Backplane Ltd.
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

// Based on http://www.w3.org/TR/DOM-Level-3-LS/
//
document.DOMImplementationLS = document.DOMImplementationLS || {
	// DOMImplementationLSMode
	//
	MODE_SYNCHRONOUS: 1,
	MODE_ASYNCHRONOUS: 2,

	/* LSOutput */ createLSOutput: function() {
		return {
			characterStream: null,
			byteStream: null,
			systemId: null,
			encoding: null
		};
	},//createLSOutput()

	/* LSInput */ createLSInput: function() {
		return {
			characterStream: null,
			byteStream: null,
			stringData: null,
			systemId: null,
			publicId: null,
			baseURI: null,
			encoding: null,
			certifiedText: false
		};
	},//createLSInput()

	/* LSParser */ createLSParser: function() {
		return {
		};
	},//createLSParser

	/* LSSerializer */ createLSSerializer: function() {
		return {
			writeToURI: function(nodeArg, uri) {
				var output = document.DOMImplementationLS.createLSOutput();

				output.systemID = uri;
				return this.write(nodeArg, output);
			},

			write: function(nodeArg, destination) {
				var characterStream;

				if (!destination.characterStream) {
					destination.characterStream = document.fileIOFactory.createFileWriter(destination.systemID);
				}
				characterStream = destination.characterStream;
				try {
					characterStream.write(nodeArg);
					characterStream.close();
					return true;
				} catch(e) {
					return false;
				}
			}
		};
	}//createLSSerializer()
};
