function getBaseUrl(doc) {
  return makeAbsoluteURI("", getCurrentUrl(doc))
}

function getCurrentUrl(doc) {
  if (!doc) {
    doc = document;
  }

  /*
   * If there is a 'base' element then we use its URL, otherwise
   * use the document's URL.
   */
  var baseColl = doc.getElementsByTagName("base");

  return (baseColl && baseColl.length) ? baseColl[0].href : doc.URL;
}

function spliturl(s)
{
	/*
	 *    See: http://www.gbiv.com/protocols/uri/rfc/rfc3986.html
	 */

    s.replace(/\\/g,"/").match( /^(([^\:\/\?#]+):)?(\/\/([^\/\?#]*))?([^\?#]*)(\?([^#]*))?(#([^\:#\[\]\@\!\$\&\\'\(\)\*\+\,\;\=]*))?/ );
    /*                            12              3    4            5        6  7        8 9 */

  return {
		/* protocol: RegExp.$1,
		hostname: RegExp.$4,
		pathname: RegExp.$5,
		filename: RegExp.$7,
		search : RegExp.$8,
		hash : RegExp.$9 */
		scheme: (RegExp.$1) ? RegExp.$2 : null,
		authority: (RegExp.$3) ? RegExp.$4 : null,
		path: RegExp.$5,
		query : (RegExp.$6) ? RegExp.$7 : null,
		fragment : (RegExp.$8) ? RegExp.$9 : null
	};
}

function makeAbsoluteURI(sBase, sURI, strict)
{
	return recomposeURI(
	    makeAbsolutePath(
	        spliturl(sBase),
	        spliturl(sURI),
	        strict
	    ),
	    true
	);
}

function makeAbsolutePath(Base, R, strict)
{
    var T = { };

		if (!strict  && (R.scheme === Base.scheme)) {
			R.scheme = null;
		}

    if (R.scheme)
    {
      T.scheme    = R.scheme;
      T.authority = R.authority;
      T.path      = remove_dot_segments(R.path);
      T.query     = R.query;
   }
   else
   {
      if (R.authority)
      {
         T.authority = R.authority;
         T.path      = remove_dot_segments(R.path);
         T.query     = R.query;
      }
      else
      {
         if (R.path == "")
         {
            T.path = Base.path;
            if (R.query)
               T.query = R.query;
            else
               T.query = Base.query;
         }
         else
         {
        	if (R.path.substring(0, 1) == '/')
               T.path = remove_dot_segments(R.path);
            else
            {
               if (Base.authority && !Base.path)
                  T.path = "/" + R.path;
               else
                  T.path = Base.path.substring(0, Base.path.lastIndexOf("/") + 1) + R.path;
               T.path = remove_dot_segments(T.path);
            }
            T.query = R.query;
         }
         T.authority = Base.authority;
      }
      T.scheme = Base.scheme;
   }

   T.fragment = R.fragment;
   return T;
}//makeAbsolutePath()

function remove_dot_segments(sURI) {
  var inputBuffer = sURI,
      outputBuffer = "",
      pos;

  while (inputBuffer !== "") {
    // A. If the input buffer begins with a prefix of "../" or "./", then remove that prefix from
    // the input buffer; otherwise
    //
    if (!inputBuffer.indexOf("../")) {
      inputBuffer = inputBuffer.substring(3);
    } else if (!inputBuffer.indexOf("./")) {
      inputBuffer = inputBuffer.substring(2);
    }
    // B. if the input buffer begins with a prefix of "/./" or "/.", where "." is a complete path
    // segment, then replace that prefix with "/" in the input buffer; otherwise,
    //
    else if (!inputBuffer.indexOf("/./")) {
      inputBuffer = "/" + inputBuffer.substring(3);
    } else if (inputBuffer === "/.") {
      inputBuffer = "/";
    }
    // C. if the input buffer begins with a prefix of "/../" or "/..", where ".." is a complete path
    // segment, then replace that prefix with "/" in the input buffer and remove the last segment and
    // its preceding "/" (if any) from the output buffer; otherwise,
    //
    else if (!inputBuffer.indexOf("/../")) {
      inputBuffer = "/" + inputBuffer.substring(4);
      outputBuffer = outputBuffer.substring(0, outputBuffer.lastIndexOf("/"));
    } else if (inputBuffer === "/..") {
      inputBuffer = "/";
      outputBuffer = outputBuffer.substring(0, outputBuffer.lastIndexOf("/"));
    }
    // D. if the input buffer consists only of "." or "..", then remove that from the input buffer;
    // otherwise,
    //
    else if ((inputBuffer === ".") || (inputBuffer === "..")) {
      inputBuffer = "";
    }
    // E. move the first path segment in the input buffer to the end of the output buffer, including
    // the initial "/" character (if any) and any subsequent characters up to, but not including, the
    // next "/" character or the end of the input buffer.
    //
    else {
      pos = inputBuffer.indexOf("/", 1);
      if (pos > -1 ) {
        outputBuffer += inputBuffer.substring(0, pos);
        inputBuffer = inputBuffer.substring(pos);
      } else {
        outputBuffer += inputBuffer;
        inputBuffer = "";        
      }
    }
  }
  return outputBuffer;
}

function recomposeURI(o, bFragment) {
   var sRet = ""

   if (o.scheme !== null)
      sRet += o.scheme + ":";

   if (o.authority !== null)
      sRet += "//" + o.authority;

   sRet += o.path;

   if (o.query !== null)
      sRet += "?" + o.query;

   if ((o.fragment !== null) && bFragment)
      sRet += "#" + o.fragment;

   return sRet;
}


function safeCurieOrUri(base, curieOrUri, namespaces) {
	if ((curieOrUri.indexOf('[') === 0) && (curieOrUri.lastIndexOf(']') === curieOrUri.length - 1)) {
		return curieToUri(curieOrUri, namespaces);
	} else {
		return makeAbsoluteURI(base, curieOrUri);
	}
}//safeCurieOrUri()


function curieToUri(curie, namespaces) {
	var s,
	    position;

	s = curie.substring(curie.indexOf('[') === 0 ? 1 : 0);
	s = s.substring(0, s.length - ((s.length === s.indexOf(']') + 1) ? 1 : 0));
  position = s.indexOf(':');

	if (position === -1) {
		return namespaces.get(s) || s;
	}

  // this will work even if prefix == -1
  //
  var prefix = s.substring(0, position);
  var suffix = s.substring(position + 1);

  return (namespaces.get(prefix) ? namespaces.get(prefix) : "unmapped:" + prefix) + suffix;
}//curieToUri()


function buildGetUrl(action, params, separator) {
	var key, pairs = [ ];

	separator = separator || "&";

	if (params) {
		for (key in params) {
			if (params.hasOwnProperty(key) && typeof(params[key]) !== "function") {
				pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
			}
		}
	}//if ( there are parameters to add to the action )

	return action
		+ (
			(pairs.length)
				? "?" + pairs.join(separator)
				: ""
		);
};//buildGetUrl

function getLocalPath(origPath) {
	var originalPath = /* convertUriToUTF8( */ origPath /*,config.options.txtFileSystemCharSet)*/;
	// Remove any location or query part of the URL
	var argPos = originalPath.indexOf("?");
	if (argPos != -1)
		originalPath = originalPath.substr(0,argPos);
	var hashPos = originalPath.indexOf("#");
	if (hashPos != -1)
		originalPath = originalPath.substr(0,hashPos);
	// Convert file://localhost/ to file:///
	if(originalPath.indexOf("file://localhost/") == 0)
		originalPath = "file://" + originalPath.substr(16);
	// Convert to a native file format
	var localPath;
	if(originalPath.charAt(9) == ":") // pc local file
		localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.charAt(8) == ":") // pc local file
		localPath = unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
		localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(7));
	else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(5));
	else // pc network file
		localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
	return localPath;
};
