/*
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

// IE6 does not support CSS attribute selectors, so we duplicate the
// functionality in JS. This is used iff user agent is IE6.

// Needs to be kept in sync with content in xforms-defs.js

// As the name indicates, this is a IE6-specific function
UX.applySelectorsIE6 = function(doc) {

    // Attribute selectors for <xf:input>
    var inputElements = doc.getElementsByTagName("input");
    for (var i = 0; i < inputElements.length; i++){

        var datatype = inputElements[i].getAttribute("datatype"),
            appearance = inputElements[i].getAttribute("appearance");

        // Calendar / datepicker
        if(datatype === "xf:date" || datatype === "xforms:date" || datatype === "xsd:date") {
            if(appearance === "minimal") {
                continue;
            }
            inputElements[i].className +=  " yui-widget-calendar";
        }

        // Colorpicker
        if(datatype === "xhd:color") {
            inputElements[i].className +=  " yui-widget-color";
        }
    }

};
