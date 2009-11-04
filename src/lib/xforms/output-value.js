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

function XFormsOutputValue(elmnt) {
    this.element = elmnt;
    if (this.element.parentNode.m_sValue) {
        this.setValue(this.element.parentNode.m_sValue);
    }
}
    
XFormsOutputValue.prototype.setValue = function(sValue) {
    var mediatypeAttr;
    var renderAsString = true;
    var textValue;
    
    var sTagNameLC = NamespaceManager.getLowerCaseLocalName(this.element.parentNode);
    
    if (sTagNameLC === "mediatype") {
        // if this is an xf:output > xf:mediatype then override the output element @mediatype 
        // with mediatype element content
       //
       if ((this.element.parentNode.parentNode) && 
           (NamespaceManager.getLowerCaseLocalName(this.element.parentNode.parentNode) === "output")) {
           this.element.parentNode.parentNode.setAttribute("mediatype", sValue);
       }
    } else if (sTagNameLC === "output") {
        // check for mediatype or datatype and render as appropriate
        //   
        renderAsString = this.setValueForOutputRendering( sValue );
    } 

    textValue = renderAsString ? sValue : '';
    if (typeof this.element.textContent === 'string') {
        this.element.textContent = textValue;
    } else {
        this.element.innerText = textValue;
    }

    return true;
};

XFormsOutputValue.prototype.getValue = function() {
    var sRet = this.element.textContent || this.element.innerText; 
    var composedLabels = null;
    var sTagNameLC = NamespaceManager.getLowerCaseLocalName(this.element.parentNode);
    
    // if our parent is a label, it could be our label has content defined as a child label
    // check also to see if the node content is all whitespace or not
    // <xf:label>
    //     <xf:output ref=""/>
    //     ...
    // </xf:label>
    //
    if (sTagNameLC === "label" && !(/[^\t\n\r ]/.test(sRet)) ) {
        composedLabels = NamespaceManager.getElementsByTagNameNS(this.element.parentNode, 
                                "http://www.w3.org/2002/xforms", "output");
        if (composedLabels && composedLabels.length > 0) {
            return composedLabels[0].m_value.getValue();        
        } 
    }

    return sRet;   
};

XFormsOutputValue.prototype.createMediatypeElement = function(sElement) {
    var oRendertype = document.createElement(sElement);
    oRendertype.setAttribute("width", "auto");
    oRendertype.setAttribute("height", "auto"); 
    this.element.parentNode.appendChild(oRendertype);
    return oRendertype;
};

XFormsOutputValue.prototype.setContent = function(sValue) {
    var oRendertype = this.element.parentNode["m_mediatype"];
    // display html or xhtml content when instance data is surrounded by
    // a CDATASection (CDATA sections are not recognized in FF HTML parsing)
    //
    // content mime-type is "application/xhtml+xml" or "text/html"
    //
    // a div element is used to contain html/xhtml content
    //
    // check to see if we need to create a new div element
    // since this is dynamic
    //      
    if (oRendertype && (NamespaceManager.getLowerCaseLocalName(oRendertype) !== "div")) {
        this.element.parentNode.removeChild(oRendertype);
        oRendertype = null;
    }          
          
    if (!oRendertype) {
       oRendertype = this.createMediatypeElement("div");       
    }
    
    // establish the content under the div...
    //                  
    oRendertype.innerHTML = sValue;
    
    return oRendertype;
};

XFormsOutputValue.prototype.setImage = function(sValue) {
    var oRendertype = this.element.parentNode["m_mediatype"];
    //
    // an img element is used to contain the image content
    //           
    // if the datatype of the parent (output) hasn't been set yet, then render as default the 
    // string value.
    //
    if (this.element.parentNode.m_type) {
        // check to see if we need to create a new img element
        // the mediatype may have been dynamically changed 
        //      
        if (oRendertype && (NamespaceManager.getLowerCaseLocalName(oRendertype) !== "img")) {
            this.element.parentNode.removeChild(oRendertype);
            oRendertype = null;
        }
          
        // create one if necessary
        //  
        if (!oRendertype) {
             oRendertype = this.createMediatypeElement("img");       
        }        
    
        // check the output element type 
        // looking for xsd:base64Binary, xf:base64Binary, xforms:base64Binary
        // default everything else as xsd:anyURI, remember only mediatype="image/*" gets here...
        //     
        if (this.element.parentNode.m_type.indexOf("base64Binary") > 0 ) {
            // this incantation works for firefox, but doesn't for IE
            // still looking for answer on  IE (it may not be possible)
            //
            oRendertype.setAttribute("src", "data:image/*;base64," + sValue);
        } else {
            // default for mediatype===image is xsd:anyURI
            //
            oRendertype.setAttribute("src", sValue);
        }
    }           
    
    return oRendertype;   
};

XFormsOutputValue.prototype.setCalendar = function(sValue) {
    var oRendertype = this.element.parentNode["m_mediatype"];
    
    // a div element is used to contain the calendar content
    //           
    // check to see if we need to create a new div element
    //
    if (oRendertype && (NamespaceManager.getLowerCaseLocalName(oRendertype) !== "div")) {
        this.element.parentNode.removeChild(oRendertype);
        oRendertype = null;
    }
          
    // create one if necessary
    //
    if (!oRendertype) {
         oRendertype = this.createMediatypeElement("div");
         // establish the content under the div...
         //
         if (oRendertype) {
             oRendertype.setAttribute("id", "ux-calendar-bg" + UX.calendarcount);
             UX.addClassName(oRendertype, "ux-calendar-bg");
             this.calendar = new OutputValueCalendar(UX.calendarcount);
             UX.calendarcount++;
         }       
    } 
      
    if (this.calendar) {
        this.calendar.setValue(sValue);    
        this.calendar.render();
    } 
    
    return oRendertype;   
};

XFormsOutputValue.prototype.setValueForOutputRendering = function(sValue) { 
    var renderAsString = true;  
    var mediatypeAttr = this.element.parentNode.getAttribute("mediatype");
    var appearance = this.element.parentNode.getAttribute("appearance");
    var oRendertype = null;
    
    // The oRendertype object property contains the different rendering options for mediatypes and custom
    // controls such as calendars
    //
    try {
        if (mediatypeAttr) {        
            // is it an image mediatype? or
            // is it a content mediatype?
            //
            if (mediatypeAttr.indexOf("image") === 0) {
                oRendertype = this.setImage(sValue);
            } else if ((mediatypeAttr === "application/xhtml+xml") ||
                       (mediatypeAttr === "text/html")) {
                oRendertype = this.setContent(sValue);
            } else {
            	throw "Unrecognised media-type";
            }
        } else if ((appearance === "full") && 
            (this.element.parentNode.m_type) && 
            (this.element.parentNode.m_type.indexOf(":date") > 0)) {
            // is it a date type?
            oRendertype = this.setCalendar(sValue);   
        }             
            
        // set the new mediatype object
        //
        if (oRendertype) {
            this.element.parentNode["m_mediatype"] = oRendertype;
            renderAsString = false;
        }        
    } catch (e) {
        // if an exception occurs, then bail and
        // dispatch an xforms-output-error event
        //
        UX.dispatchEvent(this.parentNode, "xforms-output-error", false, true, true);   
    } 
    
    if (renderAsString) {
       // clean up oRendertype object
       //
       oRendertype = this.element.parentNode["m_mediatype"];
       this.element.parentNode["m_mediatype"] = null;
       if (oRendertype) {
           this.element.parentNode.removeChild(oRendertype)
       }
    }
     
    return renderAsString;  
}

XFormsOutputValue.prototype.isTypeAllowed = function(sType) { 
    // Data Binding Restrictions: Binds to any simpleContent
    return (!this.parentNode.isBoundToComplexContent());
};
