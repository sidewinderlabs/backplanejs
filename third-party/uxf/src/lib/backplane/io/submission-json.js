/*
 * xH provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 * Copyright (C) 2007-8 Mark Birbeck
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Mark Birbeck can be contacted at:
 *
 *  36 Tritton Road
 *  London
 *  SE21 8DE
 *  United Kingdom
 *
 *  mark.birbeck@gmail.com
 */

/* This is a temporary home. */

if (!document.submissionJSON)
{
    document.submissionJSON = {
        _timeoutlength: 120000,  /* 2 minutes, by default */
        _running: [ ],

        _timeout: function(id, url)
        {
            var cbo = this._running[id];
            
            this._running[id] = null;
            if (!cbo.callbackErr)
                return;
            cbo.callbackErr("Timeout", -1, cbo.self);
        },//_timeout

        _callbackhandler: function(o)
        {
            var cbo = this._running[callbackIndex];

            if (!cbo)
                return;
            this._running[callbackIndex] = null;
            window.clearTimeout(cbo.timeout);
            if (!o /* || !o.count */)
            {
                if (!cbo.callbackErr)
                    return;
                cbo.callbackErr("Bad response", -2, cbo.self);
                    return;
            }
            
            if (!cbo.callbackOk)
                return;
            cbo.callbackOk(o, cbo.userData, cbo.self);
        },//_callbackhandler

        _execute: function(url, id, userData, fnName, callbackOk, callbackErr, timeoutlength)
        {
            var s = document.createElement("script");
            
            s.setAttribute("src", url);
            
            var fn = "" + this._callbackhandler;
            var pThis = this;
            
            fn = fn.replace(/callbackIndex/g, id);
            eval("document.submissionJSON._callbackhandler_" + id + "=" + fn);
            if (fnName)
              eval(fnName + "= function(o) { document.submissionJSON._callbackhandler_" + id + "(o) }");
            this._running.push(
                {
                    self: this,
                    userData: userData,
                    callbackOk: callbackOk,
                    callbackErr: callbackErr,
                    timeout: window.setTimeout(
                        function()
                        {
                            pThis._timeout(id, url);
                        },
                        timeoutlength
                    )
                }
            );    
            document.getElementsByTagName("head")[0].appendChild(s);
            return id;
        },//_execute

        /* use these three calls to run and cancel Pipes calls */
        cancelrequest: function(id)
        {
            var cbo = this._running[i];
            
            window.clearTimeout(cbo.timeout);
            this._running[i]=null;
        },//cancelrequest
        
        cancelallrequests: function()
        {
            for (var i = 0; i < this._running.length; i++)
                this.cancelrequest(i);
        },//cancelallrequests
        
        run: function(action, params, userData, callbackOk, callbackErr, timeoutLength)
        {
            if (!timeoutLength)
                timeoutLength = this._timeoutlength;
            var id = this._running.length;
            var sCallBackParamName = "callback";
            var fnName = null;

            if (params["callbackName"])
            {
              fnName = params["callbackName"]; 
              params["callbackName"] = null;
            }
            else
            {
              if (params["callbackParamName"])
              {
                sCallBackParamName = params["callbackParamName"]; 
                params["callbackParamName"] = null;
              }
  
              params[sCallBackParamName] = "document.submissionJSON._callbackhandler_" + id;
            }

            return this._execute(
                buildGetUrl(action, params),
                id,
                userData,
                fnName,
                callbackOk,
                callbackErr,
                timeoutLength
            );
        }//run
    };//pipesrpc
}//if ( document.submissionJSON is not defined )