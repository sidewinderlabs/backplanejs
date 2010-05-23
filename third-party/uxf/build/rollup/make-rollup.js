
function Roller(){

  var makeCSSURLsAbsolute = function(fileURL,CSSText){
    if(fileURL.indexOf("file:///") === 0) {
      //If the url is on the local filesystem, don't make it absolute.
      return CSSText;
    } else {
      var filePath = fileURL.slice(0,fileURL.lastIndexOf("/")+1);
      return "/*" + filePath + "*/\n" + CSSText.replace(/url\(/g,"url(" + filePath);
    }
  };
  var m_paths = {};
  var m_preProcessors = {
    "js": function(url, s) {
      return jsmin("//from: " + url,s,2);
    },
    "css": function(url,s) {
      return makeCSSURLsAbsolute(url,s);
    }
  };
  //create a loader object to be used by the input file.
  var loader = new YAHOO.util.YUILoader();
  loader.allowRollup = false;
  generateRollup = true;
   var pathToModule = function (s){
     var sPath = m_paths[s];
     if(sPath === undefined) {
       throw("path not specifed for module: '" +s+"'");
     }
     return sPath;
   }; 
   
  var getData = function(path,XHRFactory) {
    var xhr = new XHRFactory();
    xhr.open("GET",path,false);
    
    
    xhr.send();
    if(xhr.status !== 200 && xhr.status !== 0) {
      throw("Failed to load "+path+": \n" + xhr.status + ":" + xhr.statusText + "\n"+ xhr.responseText);
    }
    return xhr.responseText;
  };

   return {
    makeRollup : function (InString, OutStreams,XHRFactory,InfoStream) {
        eval(InString);
        loader.calculate();
        var OutModuleSupersedes = {};
        var yahooIncluded = false;
        for(var i = 0; i < loader.sorted.length;++i) {
          var info = loader.moduleInfo[loader.sorted[i]];
          var OutStream =OutStreams[info.type];
          var PreProcessor = m_preProcessors[info.type];
          
          if(OutStream){
            var path = info.fullpath;
            if(!info.ext) {
              //a YAHOO object has been encountered.  The loader doesn't know that they need
              //  the yahoo base library, because it has already been included by the loader itself
              if(!yahooIncluded){
                var yahooPath = "http://yui.yahooapis.com/2.5.2/build/yahoo/yahoo-min.js";
                if(InfoStream) {
                  InfoStream.WriteLine(yahooPath);
                }
                var sData = getData(yahooPath,XHRFactory);
                if(PreProcessor) {
                  sData = PreProcessor(yahooPath, sData);
                }
                
                OutStream.WriteLine(sData);
                yahooIncluded = true;
              }
              path = "http://yui.yahooapis.com/2.5.2/build/" + info.path;
            }
            if(InfoStream) {
              InfoStream.WriteLine("[" + info.type + "] "  + path);
            }
            
            var sData = getData(path,XHRFactory);
            if(PreProcessor) {
              sData = PreProcessor(path, sData);
            }
            
            OutStream.WriteLine(sData);
            
            if(!OutModuleSupersedes[info.type]) {
              OutModuleSupersedes[info.type] = [];
            }
            OutModuleSupersedes[info.type].push(loader.sorted[i]);
          }
        }
        
        var outputModuleName = "myModule";
        if(OutModuleSupersedes.css) {
          InfoStream.WriteLine('loader.addModule({ name: "'+ outputModuleName + '-style", type: "css",  fullpath: "myFile.css", rollup:'+OutModuleSupersedes.css.length+', supersedes:["'+OutModuleSupersedes.css.join('","')+'"]');
        }
        if(OutModuleSupersedes.js) {
          InfoStream.WriteLine('loader.addModule({ name: "'+ outputModuleName + '-script", type: "js",  fullpath: "myFile.js", rollup:'+OutModuleSupersedes.js.length+', supersedes:["'+OutModuleSupersedes.js.join('","')+'"]');
        }
    },
    
    //The loader works with internally relative paths, normally determined by the relative location specified in script/@src
    //  Since this runs outside a DOM context, that information is unavailable.
  
    parsePathDeclarations : function (declarations) {
       var arrPaths = declarations.split(",");
       for(var i = 0;i < arrPaths.length; ++i) {
         var colonPos = arrPaths[i].indexOf(":");
         var sModule = arrPaths[i].slice(0,colonPos);
         var sPath = arrPaths[i].slice(colonPos+1);
         m_paths[sModule] = sPath;
       }
    },
    pathToModule : pathToModule
  };
}


