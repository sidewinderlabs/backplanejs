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
 
 //When using Yahoo connect on a local filesystem, the 0 response code causes a failure.  This overrides the noremal YUI connect code, 
//	to prevent failure on the filesystem.
 	
YAHOO.util.Connect.handleTransactionResponse = function(o, callback, isAbort) 
{
		// If no valid callback is provided, then do not process any callback handling.
		if(!callback){
			this.releaseObject(o);
			YAHOO.log('No callback object to process. Transaction complete.', 'info', 'Connection');
			return;
		}
		var httpStatus, responseObject;

		try
		{
			if(o.conn.status !== undefined ){
				httpStatus = o.conn.status;
			}
			else{
				httpStatus = 13030;
			}
		}
		catch(e){

			 // 13030 is the custom code to indicate the condition -- in Mozilla/FF --
			 // when the o object's status and statusText properties are
			 // unavailable, and a query attempt throws an exception.
			httpStatus = 13030;
		}
		if ((httpStatus >= 200 && httpStatus < 300) || httpStatus === 1223 || (httpStatus === 0 && callback.scheme === 'file')) {

			responseObject = this.createResponseObject(o, callback.argument);
			if(callback.success){
				if(!callback.scope){
					callback.success(responseObject);
					YAHOO.log('Success callback. HTTP code is ' + httpStatus, 'info', 'Connection');
				}
				else{
					// If a scope property is defined, the callback will be fired from
					// the context of the object.
					callback.success.apply(callback.scope, [responseObject]);
					YAHOO.log('Success callback with scope. HTTP code is ' + httpStatus, 'info', 'Connection');
				}
			}

			// Fire global custom event -- successEvent
			this.successEvent.fire(responseObject);

			if(o.successEvent){
				// Fire transaction custom event -- successEvent
				o.successEvent.fire(responseObject);
			}
		}
		else{
			switch(httpStatus){
				// The following cases are wininet.dll error codes that may be encountered.
				case 12002: // Server timeout
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030:
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					responseObject = this.createExceptionObject(o.tId, callback.argument, (isAbort?isAbort:false));
					if(callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
							YAHOO.log('Failure callback. Exception detected. Status code is ' + httpStatus, 'warn', 'Connection');
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
							YAHOO.log('Failure callback with scope. Exception detected. Status code is ' + httpStatus, 'warn', 'Connection');
						}
					}
					break;
				default:
					responseObject = this.createResponseObject(o, callback.argument);
					if(callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
							YAHOO.log('Failure callback. HTTP status code is ' + httpStatus, 'warn', 'Connection');
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
							YAHOO.log('Failure callback with scope. HTTP status code is ' + httpStatus, 'warn', 'Connection');
						}
					}
			}

			// Fire global custom event -- failureEvent
			this.failureEvent.fire(responseObject);

			if(o.failureEvent){
				// Fire transaction custom event -- failureEvent
				o.failureEvent.fire(responseObject);
			}

		}

		this.releaseObject(o);
		responseObject = null;
    };
    
function XLinkElement(element)
{
	var m_bTraversed = false;
	//The point of actuation determines the startup behaviour of an xlink-defined element.
	//	later modification of it by the DOM can have no effect.
	var m_sActuate = "";

	this.onDocumentReady = function()
	{
		m_sActuate = element.getAttribute("xlink:actuate");
		if(m_sActuate == "onRequest"){
			// if the xlink is to be actuated on a request, then register for the appropriate event.
			if(element.XLinkRequestEvent){
				element.addEventListener(element.XLinkRequestEvent,this,false);
			}
		}
		else if(m_sActuate == "onLoad"){
			//E_NOTIMPL
			//Actuating on load is trickier than one might initially think
			//	if the element has been inserted into the DOM after the document has loaded,
			//	then registering for onLoad is insufficient, as the link will never be actuated.
			//	If on the other hand, it is discovered during loading, it should not be actuated straight away,
			//	and should await the onload event.  Therefore, a reliable mechanism for determining the 
			//	readystate of the ownerdocument must be queried.
			//In a .htc, it is possible to register for documentReady, this will fire at the appropriate time
			//	required above, however, this is not reliable across multiple platforms.  An xbl implementation
			//	will not despatch such an event.
			this.Actuate();
		}
	};

	
	this.handleEvent = function(evt)
	{
		//Check that the type of event for which this object has recieved notification
		//	is the same as the event that is meant to actuate the xlink.
		if(evt.type == element.XLinkRequestEvent)
		{
			this.Actuate();
		}
	};
	

	
	/**
		Executes the xlink behaviour.
	*/
	this.Actuate = function()
	{
		if(m_bTraversed){
			return;
		}
		
		//Extract the href and show attibute values.
		var sHref = element.getAttribute("xlink:href");
		var sShow = element.getAttribute("xlink:show");
		var sResolvedHref = resolveURL(this.element, sHref);
		var oCallback;
		//Switch on @show to determine the behaviour of this xlink.
		switch(sShow)
		{
			//In the case of replace and new, it should be sufficient to use standard ECMAScript
			//	calls, handing the href value to the appropriate handler supplied by the browser.				
			case "replace":
				document.location.href = sResolvedHref;
				break;
			case "new":
				window.open(sResolvedHref,"_blank");
				break;
			//embed should kick off an AJAX request, which will later fill up the appropriate element.
			case "embed":
				//Set up the callback object to give to the asyncRequest
				oCallback =
				{
					processResult: function(data, isFailure) {
						isFailure ? embed_handleFailure(data) : embed_handleResponse(data);
					},
					success: embed_handleResponse,
					failure: embed_handleFailure,
					scope:this
				};
				var oTargetElement = getTargetElement();
				oTargetElement.innerHTML = "<img src='theme/bartek/images/spinner.gif' />";
				//Set xml:base and add the appropriate behaviour.
				fetchData(sResolvedHref,oCallback);
				oTargetElement.setAttribute("xml:base", sHref);
				break;
			case "none":
				//Set up the callback object to give to the asyncRequest
				oCallback =
				{
					processResult: doNothing,
					success: doNothing,
					failure: doNothing,
					scope:this
					
				};
				fetchData(sResolvedHref,oCallback);
				break;
			case "other":
				var sAction = element.getAttribute("xlinkShowAction");
				//debugger;
				if(sAction)
				{
					oCallback =
					{
						processResult: doAction,
						success: doAction,
						failure: doAction,
						action:sAction,
						element:element
					};
					fetchData(sResolvedHref,oCallback);
				}
				
		}
	};
	
	function doAction(o)
	{
		if(o.status === 0)
		{
			o.responseXML.async = false;
			if(o.responseText.indexOf("<?xml") === 0){
				o.responseXML.loadXML(o.responseText.substr(o.responseText.indexOf("?>")+2));
			}
			else{
				o.responseXML.loadXML(o.responseText);
			}
		}
		var sAction = this.action;
		spawn(function(){eval(sAction);	onXLinkTraversed();});
	}

	//Does nothing, exists to prevent errors occurring  in asynchronous request
	//	 callbacks that are to be ignored
	function doNothing(o)
	{
	
	}
	
	function fetchData(sHref,oCallback)
	{
		//debugger;

		var schemeHandler,
			m_transaction;
		
		try
		{
			oCallback.scheme = spliturl(sHref).scheme;
			schemeHandler = schemeHandlers[oCallback.scheme];

			if ((UX.isFF || UX.isWebKit) && schemeHandler && schemeHandler["GET"]) {
				spawn(function() {
						  schemeHandler["GET"](sHref, null, null, oCallback);
					  });
			} else {
				//Send the request.
				m_transaction = YAHOO.util.Connect.asyncRequest(
					"GET",
					sHref,
					oCallback,
					null
				);
			}
		}
		catch(e)
		{
	//		alert(e + "\n" + sHref)
            if (element.getAttribute("xlink:show") === "embed") {
                oCallback.failure();
            }
            else {
			    debugger;
			}
			//oCallback.failure()
		}

	}
	
	/**
		Responds to a successful return from the http request.
		@param {Object} an object containing the response
	*/
	function getTargetElement()
	{
		var oTargetElement = null;
		var sId = element.getAttribute("targetref") || element.getAttribute("target");
		if(sId)
		{	
			oTargetElement = this.element.ownerDocument.getElementById(sId);
		}
		
		if(oTargetElement === null)
		{
			oTargetElement = element;
		}
		
		return	oTargetElement;
	}	
	
	function embed_handleResponse(o)
	{
		//Set the innerHTML of the masterElement to contain the response.
		var oTargetElement = getTargetElement();
		if(!oTargetElement.xlinkEmbed)
		{
			oTargetElement.xlinkEmbed = function(s)
			{
				this.innerHTML = s;
			};
		}
	//	debugger;
		spawn(	function(){
					oTargetElement.xlinkEmbed(o.responseText, element.getAttribute("xlink:href"));
					window.status = "";
					onXLinkTraversed();
				}
			);
//			oTargetElement.innerHTML = o.responseText;
		//set the status bar, to fix the progress bar.
		//See: http://support.microsoft.com/default.aspx?scid=kb;en-us;Q320731
//			window.status = "";
//			onXLinkTraversed()
	}

	function embed_handleFailure(o) {
	    var evt;
	    try {
			evt = element.ownerDocument.createEvent("Events");
			evt.initEvent("xlink-traversal-failure", false, false);
			evt.context = { "resource-uri": element.getAttribute("xlink:href") };
			element.dispatchEvent(evt);
		} catch (e) {
		    // ignore
		}
		if (m_sActuate === "onRequest" && element.XLinkRequestEvent) {
			element.removeEventListener(element.XLinkRequestEvent, this, false);
		}
	}

	function onXLinkTraversed()
	{
		try
		{
			//Once the xlink has been traversed, dispatch an event to say so.
			var evt = element.ownerDocument.createEvent("Events");
			evt.initEvent("xlink-traversed", false,false);
			element.dispatchEvent(evt);
		}
		catch(e)
		{
			//ignore
		}
		//remove the actuation event listener, this xlink's task is now complete.
		if(m_sActuate == "onRequest" && element.XLinkRequestEvent) {
			element.removeEventListener(element.XLinkRequestEvent,this,false);
		}
		m_bTraversed = true;
	}
	
	
	/*
	 * [ISSUE] There are loads of issues with this...what if @xml:base is
	 * already absolute, on the first iteration? The code here doesn't test
	 * for that until the end of the while loop, but should do so at the
	 * beginning. Also, if a path uses ".." they must be factored out.
	 */
	
	function getBase(oEl)
	{
	
		/*
		 * If we have an @xml:base then begin with that.
		 */
	
		var sBase = oEl.getAttribute("xml:base");
	
		if (!sBase) {
			sBase = "";
		}
	
		//walk up the tree, concatenating bases where appropriate
		var n = oEl.parentNode;
	
		while (n && n.nodeType === 1)
		{
			//if n has a cached base then use it.
			if (n.getAttribute("base"))
			{
				sBase = n.getAttribute("base")+ sBase;
				n = null;
				break;
			}
	
			//Otherwise, get the base attribute of the current walkee.
			var s = n.getAttribute("xml:base");
			
			//If that base attribute exists, prepend it to sBase
			if (!!s)
			{
				sBase = s.substr(0, s.lastIndexOf("/") + 1) + sBase;
			}
			
			//If m_sBase has become absolute, stop here.
			if (!isRelativePath(sBase))
			{
				break;
			}
			n = n.parentNode;
		}
	
		/*
		 * If we got to the top of the document then use the URL
		 * of the document.
		 */
	
		if (!n || n.nodeType === 9) {
			var sDocumentHref = oEl.ownerDocument.location.href;
			sBase = sDocumentHref.substr(0, sDocumentHref.lastIndexOf("/") + 1) + sBase;
		}
	
		return sBase;
	}

	 ///This function has been refactored by erikj54@gmail.com
	 ///Assumption: This function is passed a valid URL based on the authors
	 /// 			knowledge of URLS.
	 ///Return Val:	Returns only whether the passed URL is relative or absolute
	 ///			as a boolean value and no information regarding the validity of the URL
	function isRelativePath(sURL)
	{
		var bRet = true;

		if (sURL.charAt(0) == "/")
		{
			///Signifies a URL relative to the root directory,
			///	This will still need to be modified, if an ancestor base
			///	specifies a different root, this requires different handling
			///	to pure relative URLs.
			///	Ignoring this case for now, current user story involves only relative bases
			bRet = false;	
		}
		else
		{
			//Using backplane splitUrl function to check the validity of the URL scheme
			if ((spliturl( sURL ).scheme)){
				bRet = false; // valid URI and therefore is not relative but Absolute
			}
		} 
		return bRet;
	}//isRelativePath	
	
	//Resolves a URL in relation to an ancestor base.
	function resolveURL(oEl, sURL)
	{
		var sRet;

		if (isRelativePath(sURL))
		{
			//calvulate the cached base value, if absent.
			if (!oEl.getAttribute("base")) {
				oEl.setAttribute("base",getBase(oEl));
			}

			//append the relative URL onto the base.
			sRet = oEl.getAttribute("base") + sURL;
		}
		else{
			sRet = sURL;
		}

		return sRet;
	}
}
