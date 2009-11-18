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

document.notify = document.notify || { };

var global_window_counter = 0;

//YUI required class for message windows
UX.addClassName(document.body, "yui-skin-sam");

// A SimpleDialog message is one that shows up in a dialog window
// and goes away when there is a click on the OK button.
//
document.notify.messageWindow = function(pThis, activate) {
    var width_style = UX.getStyle(pThis.element, "width");
    var height_style = UX.getStyle(pThis.element, "height");
    
    // This is the dialog window that will show the actual message.
    pThis.yahooPanel = new YAHOO.widget.SimpleDialog(
        "dialog-window" + global_window_counter,
        {
            appendtodocumentbody: true,
            close: false,
            fixedcenter: true,
            constraintoviewport: false,
            modal: activate,
            visible: false,
            width: (width_style && width_style !== "auto") ? width_style : "300px",
            height: (height_style && height_style !== "auto") ? height_style : "140px"
        }
    );
    
    // This is the background-shadow that will only appear when the message is modal.
    // This is useful because users will know that they can not do other things on
    // the page until they click on the OK button.
    pThis.yahooPanel2 = new YAHOO.widget.SimpleDialog(
        "background-shadow" + global_window_counter,
        {
            draggable: false,
            close: false,
            fixedcenter: true,
            constraintoviewport: false,
            visible: false
        }
    );
    
    // This keeps the message and its background-shadow connected.
    pThis.yahooPanel.yahooPanel2 = pThis.yahooPanel2;
    
    global_window_counter++;
    
    UX.addClassName(pThis.yahooPanel2.element, "background-shadow");
    
    // The OK button and its functionality is added with this code.
    var handleOK = function() {
        this.hide();
        this.yahooPanel2.hide();
        this.yahooPanel2.destroy();
        this.destroy();
    };
    var myButtons = [ { text:"OK", handler:handleOK } ];
    pThis.yahooPanel.cfg.queueProperty("buttons", myButtons);
    
    pThis.yahooPanel.setHeader("[XForms]");
    if (UX.isIE) {
        pThis.yahooPanel.setBody(pThis.element.innerText);
    } else {
        pThis.yahooPanel.setBody(pThis.element.textContent);
    }
    pThis.yahooPanel.render(document.body);
    pThis.yahooPanel.show();
    
    // If the message is modal, then show the background-shadow.
    // If the message is modeless, then do not show the background-shadow.
    if (activate) {
        pThis.yahooPanel2.render(document.body);
        pThis.yahooPanel2.show();
    }
    
    return;
}
