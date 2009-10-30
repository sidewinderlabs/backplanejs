/*
 * Copyright (c) 2008-2009 Backplane Ltd.
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

function CommonSelect() {
  /**
    Updates the map of values to items, to reflect a change in the value of said item
  */
  this.itemValueChanged = function(item, oldvalue, newvalue) {
     //remove the multimap entry based on the old value, and create one based on the new value. 
    this.removeItem(item,oldvalue);
    this.addItem(item,newvalue);
  };
  /**
    Retrieves the label that corresponds to a given value.
  */
  this.getSingleDisplayValue = function(sValue) {
      this.currentDisplayValue = sValue;
      var retval = null;
      var theItem = null; 
      var i;
      if(this.items) {
        //get the item from the map,
        theItem = this.items[sValue];
        //if it's an array, get the first one.
        if (UX.isArray(theItem)) {
            if (typeof sValue === "object") {
                for (i = 0; i < theItem.length; ++i) {
                    if (UX.isEquivalentNode(theItem[i].getValue(), sValue)) {
                        theItem = theItem[i];
                        break;
                    }
                }
             }
             else {
                 theItem = theItem[0];
             }
        }
        
        if(theItem) {
          retval = theItem.getLabel();
        }
      }
      return retval;
    };
}

CommonSelect.prototype = new Multimap();
