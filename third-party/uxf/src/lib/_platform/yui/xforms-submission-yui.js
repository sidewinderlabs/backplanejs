/*
 * Copyright (C) 2008 Backplane Ltd.
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

/*
 * [TODO] Could probably turn this into one object. 
 */

callback.prototype.success = function(o) {
   	this.processResult(
           { 
             status : o.status || NaN,             
             statusText : o.statusText || "",      
             responseText : o.responseText || "",  
             responseHeaders : o.getResponseHeader,
             resourceURI : this.resourceURI
     }
           , false); 
}

callback.prototype.failure = function(o) {
    this.processResult(
        { 
          status : o.status || NaN,             
          statusText : o.statusText || "",      
          responseText : o.responseText || "",  
          responseHeaders : o.getResponseHeader,
          resourceURI : this.resourceURI
}
        , true); 
}

submission.prototype.request = function(sMethod, sAction, sBody, nTimeout, oCallback) {
	if (nTimeout) {
		oCallback.timeout = nTimeout;
    }

    oCallback.resourceURI = sAction;

	return YAHOO.util.Connect.asyncRequest(
		sMethod,
		sAction,
		oCallback,
		sBody
	);
}

submission.prototype.getConnection = function() {
	return YAHOO.util.Connect;
}

//
// Add initialization functions for library specific features
//
submission.prototype.init = function() { 
    this.getConnection().setDefaultPostHeader(false);
    return true;
}
	
submission.prototype.setHeader = function(header, value) { 
    return this.getConnection().initHeader(header, value);
}

//
// initialize yui submission object 
//
document.submission.init();