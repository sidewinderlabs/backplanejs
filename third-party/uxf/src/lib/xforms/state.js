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


function setInitialState(self) {
	if (self.initialStateSeted) return;
	
	self.m_MIPSCurrentlyShowing.readonly = false;
	self.m_MIPSCurrentlyShowing.required = false;
	self.m_MIPSCurrentlyShowing.valid = true;
	self.m_MIPSCurrentlyShowing.enabled = true;
	var element = self.element;
	if (!(element.className || UX.isXHTML)) {
		element.className = "read-write enabled valid optional";
	} else {
		UX.addClassNames(element, ["read-write", "enabled", "valid", "optional"]);
	}
	self.initialStateSeted = true;
}
