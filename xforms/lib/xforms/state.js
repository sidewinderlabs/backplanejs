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

function setState(pThis, sMIPName, sOn, sOff){
	//ONLY PERFORM THIS TIME-CONSUMING OPERATION IF IT IS NEEDED!!!!!
	//	We have already established, in formsPlayer, that the switching in-and-out of classNames
	//	 is one of the more time-consuming actions in IE.  So doing it (6 * 4) times  ( == calls in this function * calls to this function)
	//	 on every single control on every single refresh is hardly sensible when we are trying to  produce a more performant version of the AJAX form.  
	//To Reiterate - If we want more performant software, then we must optimise out pointless calls such as this.
	var state;
	if (pThis.dirtyState && pThis.dirtyState.isDirty(sMIPName)) {
		UX.removeClassName(pThis.element, sOn);
		UX.removeClassName(pThis.element,sOff);

		if (typeof pThis.getMIPState === "function") {
			state = pThis.getMIPState(sMIPName);
			if (state && state.isSet) {
				pThis.m_MIPSCurrentlyShowing[sMIPName] = state.value;
				if (state.value) {
					UX.addClassName(pThis.element, sOn);
				} else {
					UX.addClassName(pThis.element, sOff);
				}
			}
		}
	}
}

function setInitialState(pThis) {
	pThis.m_MIPSCurrentlyShowing.readonly = false;
	pThis.m_MIPSCurrentlyShowing.required = false;
	pThis.m_MIPSCurrentlyShowing.valid = true;
	pThis.m_MIPSCurrentlyShowing.enabled = true;
	UX.addClassName(pThis.element, " read-write enabled valid optional");
}
