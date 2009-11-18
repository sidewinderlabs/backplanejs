/*
 * Copyright (c) 2008-9 Backplane Ltd.
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

function Case(elmnt) {
    this.element = elmnt;
}

Case.prototype.deselect = function() {
    this.element.sDisplay = UX.getStyle(this.element, "display");
    UX.addStyle(this.element, "display", "none");
    return;
};

Case.prototype.select = function() {
    if(typeof this.element.sDisplay === "undefined") {
        //This must be the default case, and it has not been deselected.
        this.element.sDisplay = UX.getStyle(this.element, "display");
    }
    else {
        UX.addStyle(this.element, "display", this.element.sDisplay);
    }
    return;
};