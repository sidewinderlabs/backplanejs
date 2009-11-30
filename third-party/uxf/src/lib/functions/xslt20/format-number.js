//
// Copyright © 2009 Backplane Ltd.
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
//

//
// See http://www.w3.org/TR/xslt20/#function-format-number
//

FormsProcessor.extend({
	"format-number": function (value, picture, decimalFormatName) {
		var decimalPlaces,
			prefix,
			result,
			suffix;

		if (picture) {
			picture.match( /^([^\#]*)?(\#*)?(\.(\#*))?([^\#]*)?/ );

			prefix = RegExp.$1 || "";
			decimalPlaces = (RegExp.$3)
				? (RegExp.$4 ? RegExp.$4.length : 0)
				: undefined;
			suffix = RegExp.$5 || "";

			result =
				prefix +
				(
					( decimalPlaces === undefined || isNaN(parseFloat(value)) )
						? value
						: parseFloat( value ).toFixed( decimalPlaces )
				) +
				suffix;
		} else {
			result = value;
		}

		return result;
	}
});
