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

// Set up various flags for use by the Ubiquity library(ies)

(function(){
	var ua = navigator.userAgent.toLowerCase();

	UX.userAgent = ua;

	UX.isFF2 = /firefox\/2/.test(ua);
	UX.isFF3 = /firefox\/3/.test(ua);
	UX.isFF = /firefox/.test(ua);

	UX.isIE6 = /msie 6/.test(ua);
	UX.isIE7 = /msie 7/.test(ua);
	UX.isIE8 = /msie 8/.test(ua);
	UX.isIE = /msie/.test(ua);

	UX.isChrome = /chrome/.test(ua)
	UX.isWebKit = /safari/.test(ua);
	UX.isSafari = UX.isWebKit && !UX.isChrome;

	UX.isOpera = /opera/.test(ua);

	UX.isXHTML = !!(document.xmlVersion || (document.contentType && document.contentType === "application/xhtml+xml"));

	UX.hasDecorationSupport = UX.isIE;

	UX.isQuirksMode = document.compatMode === "BackCompat";
})();
