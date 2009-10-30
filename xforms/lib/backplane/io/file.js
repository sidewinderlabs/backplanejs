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

document.fileIOFactory = document.fileIOFactory || {
	// Based on java.io.File
	//
	createFile: function(pathName) {
		return {
			// Static members
			//
			pathSeparator: "/",
			pathSeparatorChar: "/",
			separator: ":",
			separatorChar: ":",

			// Internal members
			//
			_pathName: pathName,

			// Methods
			//
			createNewFile: function() {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

				file.initWithPath( this.getPath() );
				if ( !file.exists() ) {
					file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
					if ( file.exists() ) {
						return true;
					}
				}
				return false;
			},

			"delete": function() {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

				file.initWithPath( this.getPath() );
				file.remove( false );
				return !file.exists();
			},

			getAbsolutePath: function() {
				return makeAbsoluteURI(getBaseUrl(), this._pathName);
			},

			getPath: function() {
				return getLocalPath( this.getAbsolutePath() );
			},

			toString: function() {
				return this.getAbsolutePath();
			}
		};
	},
	// Based on java.io.FileReader
	//
	createFileReader: function(fileName) {
		var file, fileReader, objFSO, url = makeAbsoluteURI(getBaseUrl(), fileName);

		fileName = getLocalPath(url);

		if (navigator.userAgent.toLowerCase().indexOf('webkit') !== -1) {
			fileReader = {
				read: function() {
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, false);
					xhr.send();
					return xhr.responseText;
				},
				close: function() {
				}
			};
		} else if (navigator.userAgent.toLowerCase().indexOf("gecko") !== -1) {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

			//try {
				file.initWithPath(fileName);
			//} catch(e) {
			//	throw "Bad file name";
			//}
			//try {
				if (!file.exists()) {
					
				}
			//} catch(e) {
			//	throw "Cannot create file";
			//}
			fileReader = {
				_file: file,
				__stream: Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream),
				_stream: Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream),

				read: function() {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
					if (!arguments.length) {
						return this._stream.read(1);
					} else {
						buf = arguments[0];
						offset = arguments[1];
						return this._stream.read(arguments[2]);
					}
				},

				close: function() {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
					this.__stream.close();
					return this._stream.close();
				}
			};
			//try {
				fileReader.__stream.init(file, 1, 0, false);
				fileReader._stream.init(fileReader.__stream);
			//} catch(e) {
			//	throw "Cannot create file";
			//}
	  } else {
			objFSO = new ActiveXObject("Scripting.FileSystemObject");
			fileReader = {
				_stream: objFSO.CreateTextFile(fileName),

				write: function(s) {
					return this._stream.WriteLine(s);
				},
	
				close: function() {
					return this._stream.Close();
				}
			};
		}
		return fileReader;
	},//createFileReader()

	// Based on java.io.FileWriter
	//
	createFileWriter: function(fileName) {
		var file, fileWriter, objFSO;

		fileName = getLocalPath(
			makeAbsoluteURI(getBaseUrl(), fileName)
		);

		if (navigator.userAgent.toLowerCase().indexOf("gecko") !== -1) {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

			//try {
				file.initWithPath(fileName);
			//} catch(e) {
			//	throw "Bad file name";
			//}
			//try {
				if (!file.exists()) {
					file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
				}
			//} catch(e) {
			//	throw "Cannot create file";
			//}
			fileWriter = {
				_file: file,
				_stream: Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream),

				write: function(s) {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
					this._stream.write(s, s.length);
					return;
				},

				close: function() {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
					return this._stream.close();
				}
			};
			//try {
				fileWriter._stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
			//} catch(e) {
			//	throw "Cannot create file";
			//}
	  } else {
			objFSO = new ActiveXObject("Scripting.FileSystemObject");
			fileWriter = {
				_stream: objFSO.CreateTextFile(fileName),

				write: function(s) {
					return this._stream.WriteLine(s);
				},
	
				close: function() {
					return this._stream.Close();
				}
			};
		}
		return fileWriter;
	}//createFileWriter()
};
