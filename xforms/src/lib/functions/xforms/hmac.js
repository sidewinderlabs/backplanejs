/*
 * Copyright © 2009 Backplane Ltd.
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

FormsProcessor.extend({
	hmac: function (key, data, algorithm, encoding) {
		var hmac;

		if (!encoding) {
			encoding = 'base64';
		} else if (encoding !== 'hex' && encoding !== 'base64') {
			throw 'hmac(): invalid encoding "' + encoding + '"';
		}

		switch (algorithm) {
			case "MD5":
				if (encoding === "hex") {
					hmac = MD5.hex_hmac_md5(key, data);
				} else {
					hmac = MD5.b64_hmac_md5(key, data);
				}
				break;
			case "SHA-1":
			case "SHA-256":
			case "SHA-384":
			case "SHA-512":
				hmac = (new jsSHA(data)).getHMAC(key, algorithm, encoding === "hex" ? "HEX" : "B64");
				break;
			default:
				throw 'hmac(): invalid algorithm "' + algorithm + '"';
		}

		return hmac;
	}
});
