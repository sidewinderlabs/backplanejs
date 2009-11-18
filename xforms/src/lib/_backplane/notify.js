// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
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

document.notify = document.notify || { };

// To enable and disable notifications we simply add and remove CSS
// classes.
//
document.notify.activate = function( el ) {
  UX.replaceClassName(el, "inactive", "active");
  return;
};

document.notify.deactivate = function( el ) {
  UX.replaceClassName(el, "active", "inactive");
  return;
};

// An ephemeral message is one that will be removed automatically.
//
document.notify.ephemeral = function(message, activate) {
  if (activate === undefined || activate) {
    document.notify.activate( message );
  
    setTimeout(
      function() {
        document.notify.deactivate( message );
        return;
      },
     6000
    );
  } else {
    document.notify.deactivate( message );
  }
  return;
};
