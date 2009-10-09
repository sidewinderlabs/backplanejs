/**
  function: crackNVPairs
  Cracks a list of Name-value pairs, into either an array, or as members of saveIn (if present)

  list - {String} a list of name-value pairs in the required format. 
  innerSeparator - {String} The string used to separate a name from a value
  outerSeparator - {String} The string used to separate pairs from other pairs in the list
  saveIn - {Object} (optional) Object in which to save the name-value pairs.
 
  returns - If saveIn is present, an empty array, if saveIn is absent, an array of Pair objects, Pair objects have two properties, "left" and "right"
     corresponding to the LHS and RHS of the pair in the string that it corresponds to.
*/
function crackNVPairs(list, innerSeparator, outerSeparator, saveIn ){
  var unparsedPairs = list.split(outerSeparator), parsedPairs = [], i, thisPairAsArray, leftVal,rightVal;

  for(i = 0;i < unparsedPairs.length;++i) {
    thisPairAsArray  = unparsedPairs[i].split(innerSeparator);
    leftVal = thisPairAsArray.shift();
    rightVal = thisPairAsArray.join(innerSeparator);
    if(!saveIn) {
      parsedPairs.push({left: leftVal, right: rightVal});
    }
    else {
      saveIn[leftVal] = rightVal;
    }
    
  }
  return parsedPairs;
}

/**
  class: FragmentParser
    Used to parse xpointer style URL fragments.
*/
var FragmentParser = function(){
  var self = {};
  //first group trims leading whitespace and fetches the identifier before the opening paren
  //then match a group made up of 0 or more examples of:
  //  0-or-more examples of anything that is neither the escape character, nor the closing paren, followed by 
  //  0 or more examples of either the sequence ^^ or ^), i.e. the escape character followed by an escaped character
  //All followed by a closing paren.
  var m_expr = /\s*([^\(]+)\((([^\^\)]*(?:(\^\)))*(?:\^\^)*)*)\)/g
  var m_schemeHandlers = {};
  /**
    function: parseFragment
    Splits an XPointer style fragment into an array of objects broken into scheme and content, 
      where "content" corresponds to the content of an expression,  
    s - {String} The fragment portion of a URL

    returns - A list of objects of the form {scheme:A,rawData:B,data:C}, each representing a pointer part.  
      Where A is the scheme of the pointer part, and B, its content. If the FragmentParser has been provided with a mechanism for parsing content 
      for the given scheme, then C will contain its output.  Otherwise, the content may be further processed by the calling application according to the scheme.
  */
  var parseFragment = function(s) {
    var result, fullResult = null, content, pos;
    result = m_expr.exec(s);
    
    if(result) {
      fullResult = [];
    }
    
    while(result) {
      //trim out escape characters from content.
      content = result[2];
      pos = content.indexOf("^");
      while(pos > -1 && pos < content.length - 1) {
        content = content.slice(0,pos) + content.slice(pos+1);
        //maintain escaped examples of the escape character, by jumping over them
        //  when they are at the front of the search string.
        if( content.charAt(pos)==="^") {
          ++pos;
        }
        pos = content.indexOf("^",pos);
      }
      var schemeHandler = m_schemeHandlers[result[1]];
      var parsedContent = null;
      if(typeof schemeHandler == 'function') {
        parsedContent = schemeHandler(content);
      }
      fullResult.push({scheme : result[1], rawData : content, data:parsedContent  });
      result = m_expr.exec(s);
    }
    return fullResult;
  }
  

  var setSchemeHandler = function (scheme,handler) {
    m_schemeHandlers[scheme] = handler;
  }

  //The default behaviour for vars, is to split them as Name Value pairs.
  setSchemeHandler('vars', 
    function(s) {
     return crackNVPairs(s,'=',',');
    }
  )

  self.setSchemeHandler = setSchemeHandler;
  self.parseFragment = parseFragment;
  return self;
}();


/**
  function: saveParametersFromURL
  Saves parameters set in a vars pointer part in a url, as properties on a given object.

  s - A URL with a fragment that contains a "vars" pointer part
  o - the object in which the vars will be stored as properties.
*/
function saveParametersFromURL(s, o) {
  var fragmentMarker = s.indexOf("#");
  if(fragmentMarker > -1) {
    var fragment = s.slice(s.indexOf("#") + 1, s.length);
    var parsedFragment = FragmentParser.parseFragment(fragment);
    for(var i = 0 ; i < parsedFragment.length; ++i) {
      if(parsedFragment[i].scheme === 'vars') {
        for(var j = 0; j < parsedFragment[i].data.length;++j) {
          var currentDataItem = parsedFragment[i].data[j];
          o[currentDataItem.left] = currentDataItem.right;
        }
      }
    }
  }
}


