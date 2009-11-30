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

UX.userAgent = navigator.userAgent;

UX.isFF2 = UX.userAgent.toUpperCase().indexOf("FIREFOX/2.") != -1;
UX.isFF3 = UX.userAgent.toUpperCase().indexOf("FIREFOX/3.") != -1;
UX.isFF = UX.isFF2 || UX.isFF3;

UX.isIE6 = UX.userAgent.toUpperCase().indexOf("MSIE 6.") != -1;
UX.isIE7 = UX.userAgent.toUpperCase().indexOf("MSIE 7.") != -1;
UX.isIE8 = UX.userAgent.toUpperCase().indexOf("MSIE 8.") != -1;
UX.isIE = UX.isIE6 || UX.isIE7 || UX.isIE8;

UX.isChrome = UX.userAgent.toUpperCase().indexOf("CHROME/") != -1;
UX.isSafari = UX.userAgent.toUpperCase().indexOf("SAFARI/") != -1 && UX.userAgent.toUpperCase().indexOf("CHROME/") == -1;
UX.isWebKit = UX.isChrome || UX.isSafari;

UX.isOpera = UX.userAgent.toUpperCase().indexOf("OPERA/") != -1;

UX.isXHTML = (document.xmlVersion || (document.contentType && document.contentType === "application/xhtml+xml")) ? true : false;

UX.hasDecorationSupport = UX.isIE || UX.isFF;

UX.isQuirksMode = document.compatMode === "BackCompat";
