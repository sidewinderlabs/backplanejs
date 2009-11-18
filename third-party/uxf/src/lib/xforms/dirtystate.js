/*
 * Copyright (c) 2009 Backplane Ltd.
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
 
function DirtyState() {
  this.m_states = {
    value: false,
    //All MIPs are initially set to their default states, so are not dirty.
    valid: false,
    enabled: false,
    required: false,
    readonly: false
  };
}

DirtyState.prototype.isDirty = function (aspect) {
  var prop, retval = false;
  //If no argument given, return true if any property is dirty.
  if (typeof aspect === "undefined") {
    //By using for...in, instead of a||b||c, it is easier to maintain these functions.
    for (prop in this.m_states) {
      if (this.m_states[prop]) {
        retval = true;
        break;
      }
    }
  } else {
    //Otherwise, get the value of that aspect.
    retval = this.m_states[aspect];
    if (typeof retval === "undefined") {
      throw "DirtyState::isDirty, E_INVALIDARG";
    }
  }
  return retval;
};

DirtyState.prototype.setDirty = function (aspect) { 
  if (typeof this.m_states[aspect] === "undefined") {
    throw "DirtyState::setDirty, E_INVALIDARG";
  }
  this.m_states[aspect] = true;
};
  
DirtyState.prototype.setClean = function (aspect) {
  var prop;
  //If no argument given, perform a full reset
  if (typeof aspect === "undefined") {
    for (prop in this.m_states) {
      this.m_states[prop] = false;
    }
  } else {
    this.m_states[aspect] = false;
  }
};
