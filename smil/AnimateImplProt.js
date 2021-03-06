// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity SMIL module adds SMIL support to the Ubiquity library.
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

function AnimateImplScriptaculous()
{
}

AnimateImplScriptaculous.prototype.animateColour = function (elTarget, oAttrs, nDuration)
{
	return "E_NOTIMPL";
	//		var oAnim = new PROTOTYPE.util.ColorAnim(elTarget, oAttrs, nDuration);
	//		return oAnim;
};

AnimateImplScriptaculous.prototype.animate = function(elTarget, oAttrs, nDuration)
{
	for (var attr in oAttrs)
	{
		if (attr === "height") {
				var x = new Effect.Scale(elTarget,200,{scaleX:false});
		}
	}
};
