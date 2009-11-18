// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
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

/**
 * Stub implementation of xforms-submission callback and submission methods for unit tesing.
 */
submission.prototype.request = function(sMethod, sAction, sBody, nTimeout, oCallback) {
	if (nTimeout) {
		oCallback.timeout = nTimeout;
	}

	this.method = sMethod;
	this.action = sAction;
	this.body = sBody;
	this.timeout = nTimeout;
	this.callback = oCallback;
	
	return null;
};

submission.prototype.initConnection = function() {
    this.connection = {    
        headers: {},		
		initHeader: function(name, value) {
		    this.headers[name] = value;
		}
	};
    return this.connection; 
};

submission.prototype.getConnection = function() {
    if (!this.connection) {
        this.initConnection();
    }
    return this.connection;
};

submission.prototype.setHeader = function(name, value) {
	return this.getConnection().initHeader(name, value);
};