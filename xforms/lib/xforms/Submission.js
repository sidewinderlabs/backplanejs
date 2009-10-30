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
 * This is really 'xf:submission'.
 */

function Submission(el) {
	this.element = el;
    this.submissionBody = "";
}

Submission.prototype.onDocumentReady = function() {
	/*
		* We invoke the submission when we see the
		* xforms-submit event.
		*/

	FormsProcessor.addDefaultEventListener(
	  this,
		"xforms-submit",
		{
			handleEvent: function(evt) {
			    evt.target.ownerDocument.submission.submit(evt.target);
				return;
			}
		}
	);

	FormsProcessor.addDefaultEventListener(
	  this,
		"xforms-submit-serialize",
		{
			handleEvent: function(evt) {
			    if (evt.context) {
                    evt.target.submissionBody = evt.context["submission-body"];
                }
			}
		}
	);
}//submission_documentReady()


/* This is a temporary home. */

if (!document.submissionJSON) {
    document.submissionJSON = {
        _timeoutlength: 30000,  /* 30 seconds by default */
        _running: [],

        _timeout: function(id, url) {
            var cbo = this._running[id];
            
            this._running[id] = null;
            if (!cbo.callbackErr)
                return;
            cbo.callbackErr("Timeout", -1, cbo.self);
        },//_timeout

        _callbackhandler: function(o) {
            var cbo = this._running[callbackIndex];
            
            if (!cbo)
                return;
            this._running[callbackIndex] = null;
            window.clearTimeout(cbo.timeout);
            if (!o || !o.count) {
                if (!cbo.callbackErr)
                    return;
                cbo.callbackErr("Bad response", -2, cbo.self);
                    return;
            }
            
            if (!cbo.callbackOk)
                return;
            cbo.callbackOk(o, cbo.resource, cbo.self);
        },//_callbackhandler

        _execute: function(url, resource, callbackOk, callbackErr, timeoutlength) {
            if (!timeoutlength)
                timeoutlength = this._timeoutlength;
            var id = this._running.length;

            url += "&_callback=document.submissionJSON._callbackhandler_" + id;
            
            var s = document.createElement("script");
            
            s.setAttribute("src", url);
            
            var fn = "" + this._callbackhandler;
            
            fn = fn.replace(/callbackIndex/g, id);
            eval("document.submissionJSON._callbackhandler_" + id + "=" + fn);
            this._running.push(
                {
                    self: this,
                    resource: resource,
                    callbackOk: callbackOk,
                    callbackErr: callbackErr,
                    timeout: window.setTimeout(
                        function()
                        {
                            this._timeout(id, url);
                        },
                        timeoutlength
                    )
                }
            );    
            document.getElementsByTagName("head")[0].appendChild(s);
            return id;
        },//_execute

        /* use these three calls to run and cancel Pipes calls */
        cancelrequest: function(id) {
            var cbo = this._running[i];
            
            window.clearTimeout(cbo.timeout);
            this._running[i]=null;
        },//cancelrequest
        
        cancelallrequests: function() {
            for (var i = 0; i < this._running.length; i++)
                this.cancelrequest(i);
        },//cancelallrequests
        
        run: function(action, params, resource, callbackOk, callbackErr, timeoutLength) {
            return this._execute(
                document.submission.buildGetUrl(action, params),
                resource,
                callbackOk,
                callbackErr,
                timeoutLength
            );
        }//run
    };//pipesrpc
}//if ( document.submissionJSON is not defined )