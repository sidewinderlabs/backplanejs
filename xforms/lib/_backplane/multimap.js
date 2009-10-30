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
 
function Multimap() {
  return {
    /**
      Adds an item to the map with the given key
      @param theItem The item to store
      @param key The key under which to store it.
    */
    addItem : function(theItem,key) {
    
      if(!this.items) {
        this.items = {}; 
      }
      key = key || theItem.getValue();
      if(this.items[key]) {
        // if there is already an item for that value, make an array containing the existing entry.
        var o = this.items[key];
        if(!(o instanceof Array)) {
          this.items[key] = [];
          this.items[key].push(o);
        }
        //insert the new entry
        this.items[key].push(theItem);
      }
      else {
        this.items[key] = theItem;
      }
      
      if(this.onItemAdded) {
        this.onItemAdded(theItem,key);
      }
    },

    /**
      Removes an item from the map if stored under the given key
      @param theItem The item to remove
      @param key The key under which it is stored.
      @returns true if item was successfully removed, otherwise false.
    */
    removeItem : function(item, key) {
      var retval = false;
      if (this.items) {
        var thisItem = this.items[key];
        if(thisItem && (thisItem instanceof Array)) {
          var l = thisItem.length;
          for(var i = 0; i < l; ++i) {
            if(thisItem[i] === item) {
              thisItem.splice(i,1);
              if(l === 2) {
              //Make this map entry an array no more.
                this.items[key] = thisItem[0];
              }
              retval = true;
               break;
            }
          }
        }
        else if (this.items[key] === item) {
          retval = true;
          //only a single item with this value exists, just get rid of it.
          delete this.items[key];
        }
        
      }
      if(retval && this.onItemRemoved) {
        this.onItemRemoved(item,key);
      }
      return retval;
    },
    
    /**
      Retrieves the item stored alongside the given key
      @param key The key under which to look
      @param index [optional] If the key corresponds to more than one value, return the one at the given index.  If omitted, 0 is default.
      @returns The item specified by the given key and index
    */
    getItem : function(key,index) {
      var theItem = this.items[key];
      if(theItem instanceof Array) {
        var ix = index | 0;
        theItem = theItem[ix];
      }
      return theItem;
    }
  };
}