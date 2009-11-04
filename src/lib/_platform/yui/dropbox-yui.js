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

/*global UX, YAHOO*/
/*--members Button, Element, Menu, addClass, addClassName, align, 
    appendChild, cfg, context, createElement, fn, hide, 
    insertAdjacentElement, isChrome, isFF, isIE, isSafari, isQuirksMode, offsetHeight, 
    offsetWidth, onclick, ownerDocument, render, scope, setProperty, 
    setStyle, show, subscribe, toggle, type, util, widget
*/

/**
  class:DropBox
  Attaches a dropbox and button to an element.
  
  containerElement - {Element} The element used to contain the dropbox and button
  referenceElement - {Element} The element used to position the button and dropbox on the screen
  dropElement - {Element} The element that will become the content of the dropbox
*/

function DropBox(containerElement, referenceElement, dropElement) {
  this.PRIVATE = {containerElement:containerElement,referenceElement:referenceElement};
  this.PRIVATE.m_showing = false;

  var button,
  callbackScope,
  buttonElement = document.createElement("button"),
  btnHeight,
  deltaPosition = 0,
  referenceYUIElement = new YAHOO.util.Element(this.PRIVATE.referenceElement),
  dropWrapper = document.createElement("div");
  
  UX.addClassName(this.PRIVATE.containerElement, "yui-skin-sam");
  UX.addClassName(this.PRIVATE.containerElement, "ux-dropbox-container");

  this.PRIVATE.referenceElement.insertAdjacentElement("afterEnd", buttonElement);  
  
  button = new YAHOO.widget.Button(buttonElement, {type: "push", onclick: { scope: this, fn: this.toggle } });
  button.addClass("ux-drop-button");
  referenceYUIElement.setStyle("display", "inline-block");
  
  btnHeight = this.PRIVATE.referenceElement.offsetHeight;
  
  if (!(UX.isIE && UX.isQuirksMode)) {
    //not borders, just a quirk.
    btnHeight -= 3;
  }
  
  button.setStyle("height", btnHeight + "px");  
  
  if (UX.isIE || UX.isSafari || !UX.isQuirksMode) {
     //In these browsers, top will align top of button to top of sibling.
     //  but middle will align midpoint of button with baseline of text
    button.setStyle("vertical-align", "top");
  } else {
    button.setStyle("vertical-align", "middle");
    //align with true top of referenceElement
    if (UX.isChrome) {
      deltaPosition = -2;
    } else if (UX.isFF) {
      deltaPosition = -1;
    }
    button.setStyle("top", deltaPosition);
  }

  UX.addClassName(dropWrapper, "yuimenu");
  this.PRIVATE.containerElement.appendChild(dropWrapper);
  UX.addClassName(dropElement, "bd");
  dropWrapper.appendChild(dropElement);
  this.PRIVATE.m_Menu = new YAHOO.widget.Menu(dropWrapper, {context: [this.PRIVATE.referenceElement, "tl", "bl"]});
  this.PRIVATE.m_Menu.render();
  
  //delay flicking the toggle controlling boolean, in case giving focus to
  //  the toggling button has invoked the hide.  Without this delay
  //  it would be reopened when the user expects it to close
  callbackScope = this;
  this.PRIVATE.m_Menu.subscribe("hide", function () {
    setTimeout(function ()
    {
      callbackScope.PRIVATE.m_showing = false;
    }, 100);
  });
  this.PRIVATE.m_Menu.subscribe("show", function () {
    setTimeout(function ()
    {
      callbackScope.PRIVATE.m_showing = true;
    }, 100);
  });
}

/**
  method:toggle
  If the dropbox is currently hidden, shows the dropbox.  If it is visible, hides it. 
*/
DropBox.prototype.toggle = function(){
  if (this.PRIVATE.m_showing) {
    this.hide();
  } else {
    this.show();
  }
};

/**
  function:show
  shows the dropbox.
*/
DropBox.prototype.show = function () {
  this.PRIVATE.m_Menu.align("tl", "bl");
  this.PRIVATE.m_Menu.cfg.setProperty("width", this.PRIVATE.referenceElement.offsetWidth + "px");
  this.PRIVATE.m_Menu.show();
};
  /**
    function:hide
    hides the dropbox.
  */

DropBox.prototype.hide = function () {
    this.PRIVATE.m_Menu.hide();
};
  
  

  


