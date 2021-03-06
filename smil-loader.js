// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity SMIL module adds SMIL support to the Ubiquity library.
//
// Copyright (C) 2008 Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var gLibrary = { };

gLibrary["animate"] = "YUI";
//gLibrary["animate"] = "script.aculo.us";

(
  function(){
    var moduleBase = pathToModule("smil-loader");

    loader.addModule({ name: "animate-factory",  type: "js", fullpath: moduleBase + "smil/Animate.js" });
    loader.addModule({ name: "smil-set",         type: "js", fullpath: moduleBase + "smil/smil-set.js",
      requires: [ "animate-factory" ] });
    loader.addModule({ name: "smil-animate",     type: "js", fullpath: moduleBase + "smil/smil-animate.js",
      requires: [ "animate-factory" ] });
    loader.addModule({ name: "animate-impl-yui", type: "js", fullpath: moduleBase + "smil/AnimateImplYUI.js",
      requires: [ "animate-factory", "animation" ] });

    loader.addModule({ name: "smil-defs",        type: "js", fullpath: moduleBase + "smil/smil-defs.js",
      requires: [ "libxh-decorator", "ub-listener", "xforms-conditional-invocation", "animate-impl-yui", "smil-set", "smil-animate" ] });

    loader.require( "smil-defs" );
    loader.insert();
  }()
);
