/*
 * Copyright  2009 Backplane Ltd.
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

function MIPEventTarget(element) {
	this.element = element;
}

MIPEventTarget.prototype.broadcastMIPs = function () {
	var proxyNode = FormsProcessor.getProxyNode(this.element);
	if (proxyNode) {
		UX.dispatchEvent(this.element, proxyNode.valid.getValue() ? "xforms-valid" : "xforms-invalid", true, false);
		UX.dispatchEvent(this.element, proxyNode.required.getValue() ? "xforms-required" : "xforms-optional", true, false);
		UX.dispatchEvent(this.element, proxyNode.readonly.getValue() ? "xforms-readonly" : "xforms-readwrite", true, false);
	}

	UX.dispatchEvent(this.element, this.isEnabled() ? "xforms-enabled" : "xforms-disabled", true, false);
};
