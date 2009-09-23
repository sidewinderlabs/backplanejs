// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity Message module adds messaging support to the Ubiquity
// library.
//
// Copyright (C) 2008 Mark Birbeck
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// Mark Birbeck can be contacted at:
//
//  36 Tritton Road
//  London
//  SE21 8DE
//  United Kingdom
//
//  mark.birbeck@gmail.com
//
(
  function(){
    var moduleBase = pathToModule("yowl-loader");

    loader.addModule({ name: "ubiquity-message",     type: "js",  fullpath: moduleBase + "yowl/yowl.js" });

    loader.addModule({ name: "ubiquity-message-css", type: "css", fullpath: moduleBase + "yowl/yowl.css" });

    loader.addModule({ name: "yui-container-css",  type: "css", fullpath: "http://yui.yahooapis.com/2.7.0/build/container/assets/container.css" });

    loader.addModule({ name: "ubiquity-message-yui", type: "js",  fullpath: moduleBase + "yowl/display-yui.js",
      requires: [ "animation", "container", "ubiquity-message", "ubiquity-message-css", "yui-container-css" ] });

    loader.require( "event", "ubiquity-message-yui" );
    loader.insert();
  }()
);