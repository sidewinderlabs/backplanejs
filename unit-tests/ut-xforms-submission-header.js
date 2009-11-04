// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
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

var suiteXFormsSubmissionHeader = new YAHOO.tool.TestSuite({
	name : "Test xforms-submission module, headers"
});

suiteXFormsSubmissionHeader.add(
	new YAHOO.tool.TestCase(
		{
			name: "Test xf:header",
			
			setUp: function() {
				this.model = document.createElementNS("http://www.w3.org/2002/xforms", "xf:model");
				this.submission = document.createElementNS("http://www.w3.org/2002/xforms", "xf:submission");
				this.header = document.createElementNS("http://www.w3.org/2002/xforms", "xf:header");
				this.header.element = this.header;
				this.name = document.createElementNS("http://www.w3.org/2002/xforms", "xf:name");
				this.value = document.createElementNS("http://www.w3.org/2002/xforms", "xf:value");

				this.model.appendChild(this.submission);
				this.submission.appendChild(this.header);
				this.header.appendChild(this.name);
				this.header.appendChild(this.value);

				DECORATOR.extend(this.model, new EventTarget(this.model), false);
				DECORATOR.extend(this.model, new Model(this.model), false);
				
				DECORATOR.extend(this.name, new EventTarget(this.name), false);
				DECORATOR.extend(this.name, new Context(this.name), false);
				DECORATOR.extend(this.name, new Value(this.name), false);

				DECORATOR.extend(this.value, new EventTarget(this.value), false);
				DECORATOR.extend(this.value, new Context(this.value), false);
				DECORATOR.extend(this.value, new Value(this.value), false);

				
			},
			
			tearDown: function() {
				delete this.value;
				delete this.name;
				delete this.header;
				delete this.submission;
				delete this.model;
			},
			
			testSetHeadersReadsNameAndValueContent: function() {
				var Assert = YAHOO.util.Assert;
				
				var connection = document.submission.getConnection();
				
				this.name.appendChild(document.createTextNode("header-name"));
				this.value.appendChild(document.createTextNode("header-value"));

				document.submission.setHeaders(null, this.submission);
				
				Assert.isNotNull(connection.headers["header-name"]);
				Assert.areEqual("header-value", connection.headers["header-name"]);
			},
			
			testSetHeaderIgnoresHeadersWithoutNames: function() {
				var Assert = YAHOO.util.Assert;
				
				var connection = document.submission.initConnection();
				var key;
				var count = 0;
				
				/*
				 * Blank xf:header
				 */
				
				this.name.appendChild(document.createTextNode(""));
				
				connection = document.submission.getConnection();
				document.submission.setHeaders(null, this.submission);

				// Make sure there aren't any headers.				
				for ( key in connection.headers ) {
					count++;
				}
				Assert.areEqual(0, count);
				
			
				
				/*
				 * Missing xf:header
				 */
				
				this.header.removeChild(this.name);

				connection = document.submission.getConnection();
				document.submission.setHeaders(null, this.submission);

				// Make sure there aren't any headers.				
				for ( key in connection.headers ) {
					count++;
				}
				Assert.areEqual(0, count);

			},
			
			testSetHeaderSetsValueToBlankStringWhenNoValueIsPresent: function() {
				var Assert = YAHOO.util.Assert;

				var connection;
				
				
				this.name.appendChild(document.createTextNode("header-name"));
				
				/*
				 * Blank xf:value
				 */
				
				this.value.appendChild(document.createTextNode(""));
				
				connection = document.submission.getConnection();
				document.submission.setHeaders(null, this.submission);
				
				Assert.isNotNull(connection.headers["header-name"]);
				Assert.areEqual("", connection.headers["header-name"]);
				

				/*
				 * Missing xf:value
				 */
				
				this.header.removeChild(this.value);
				
				connection = document.submission.getConnection();
				document.submission.setHeaders(null, this.submission);
				
				Assert.isNotNull(connection.headers["header-name"]);				
				Assert.areEqual("", connection.headers["header-name"]);
			},
			
			testSetHeadersAcceptsMultipleValues: function() {
				
				var Assert = YAHOO.util.Assert;
				
				var value;
				var connection;
				

				this.name.appendChild(document.createTextNode("header-name"));
				this.value.appendChild(document.createTextNode("header-value-1"));

				value = document.createElementNS("http://www.w3.org/2002/xforms", "xf:value");
				value.appendChild(document.createTextNode("header-value-2"));
				this.header.appendChild(value);
									  
				DECORATOR.extend(value, new EventTarget(value), false);
				DECORATOR.extend(value, new Context(value), false);
				DECORATOR.extend(value, new Value(value), false);
				


				connection = document.submission.getConnection();
				document.submission.setHeaders(null, this.submission);
				
				Assert.isNotNull(connection.headers["header-name"]);
				Assert.areEqual("header-value-1,header-value-2", connection.headers["header-name"]);
									  
			}
			

		}));
