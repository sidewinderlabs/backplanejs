/*
 * Copyright (c) 2008-9 Backplane Ltd.
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

function isFirefox3()
{
  return (navigator.oscpu && document.getElementsByClassName);
}
/**
	Inserts an element as the last child of body, and sets up the CSS to bind this to onload.xml
		Calling this as a final step in the script loading process ensures that all existing elements
		have been bound to an appropriate XBL, and have performed their decorations, prior to 
		calling any initialisation code that would otherwise have been called by onload.
*/
function FFInsertElementForOnloadXBL() {
  var oBody = document.getElementsByTagName("body")[0];
  oBody.insertAdjacentHTML("beforeEnd","<p id='second-onload-loading-element' style='width:0px;display:inline-block;'>Loading...</p>");

  if(isFirefox3() || UX.isIE) {
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href = g_sBehaviourDirectory +"onload.css";
    cssNode.media = 'screen';
    cssNode.title = 'dynamicLoadedSheet';
    document.getElementsByTagName("head")[0].appendChild(cssNode);
   }
   else
   {
      var oHead = document.getElementsByTagName("head")[0];
      var oStyle = document.createElement('style');
      var s = "";
  
      oStyle.setAttribute("type", "text/css");
      oStyle.innerHTML = "p#second-onload-loading-element{-moz-binding: url(\""+g_sBehaviourDirectory+"onload.xml#loader\");}";
      oHead.insertBefore(oStyle, null);
   }

}


InsertElementForOnloadXBL = (UX.isFF  || UX.isIE) ?
  FFInsertElementForOnloadXBL :  function(){};

//Run immediately if document already loaded, or on the load event, if not. 
if(document.body) {
  spawn(InsertElementForOnloadXBL);
}
else if(window.addEventListener){
 window.addEventListener("load", function(e){spawn(InsertElementForOnloadXBL);}, false);
}
else if(window.attachEvent){
 window.attachEvent("onload", function(e){spawn(InsertElementForOnloadXBL);});

}
