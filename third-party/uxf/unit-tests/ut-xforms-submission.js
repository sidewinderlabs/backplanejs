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


var suiteXFormsSubmission = new YAHOO.tool.TestSuite({
	name : "Test xforms-submission module"
});

suiteXFormsSubmission.add(
	new YAHOO.tool.TestCase(
		{
			name: "Test xf:submission @method",
			
			setUp: function() {

				this.model = document.createElement("xf:model");
				
				this.instance = document.createElement("xf:instance");
				this.model.appendChild(this.instance);
				
				this.submission = document.createElement("xf:submission");
				this.submission.setAttribute("replace", "none");
				this.submission.setAttribute("resource", ".");
				this.model.appendChild(this.submission);

				DECORATOR.extend(this.model, new EventTarget(this.model), false);
				DECORATOR.extend(this.model, new Model(this.model), false);
				DECORATOR.extend(this.instance, new EventTarget(this.instance), false);
				DECORATOR.extend(this.instance, new Instance(this.instance), false);
				DECORATOR.extend(this.submission, new EventTarget(this.submission), false);
				DECORATOR.extend(this.submission, new Context(this.submission), false);
				DECORATOR.extend(this.submission, new Submission(this.submission), false);

				this.instance.replaceDocument(xmlParse("<car><make>Ford</make><color>blue</color></car>"));
				this.model.addInstance(this.instance);

			},
			
			tearDown: function() {
				delete this.submission;
				delete this.instance;
				delete this.model;
			},
			
			testPostMethod: function() {
				var Assert = YAHOO.util.Assert;
				
				this.submission.setAttribute("method", "post");
				document.submission.submit(this.submission);
				Assert.areEqual("POST", document.submission.method);
			}
		}));

suiteXFormsSubmission.add(
	new YAHOO.tool.TestCase(
		{
			name: "Test Submission application/x-www-url-encoded",
			
			setUp: function() {
				this.model = document.createElement("xf:model");
				this.instance = document.createElement("xf:instance");
				this.model.appendChild(this.instance);

				DECORATOR.extend(this.model, new EventTarget(this.model), false);
				DECORATOR.extend(this.model, new Model(this.model), false);
				DECORATOR.extend(this.instance, new EventTarget(this.instance), false);
				DECORATOR.extend(this.instance, new Instance(this.instance), false);

				this.instance.replaceDocument(xmlParse("<car><make>Ford</make><color>blue</color></car>"));
				this.model.addInstance(this.instance);
			},
			
			tearDown: function() {
				delete this.model;
				delete this.instance;
			},
			
			testSerializeWhenRefIsLeafNode: function() {
				
				var Assert = YAHOO.util.Assert;
				var node = getFirstNode(this.model.EvaluateXPath("/car/color"));
				var string = document.submission.buildGetUrl("", document.submission.serializeURLEncoded(node));
				
				Assert.areEqual("?color=blue", string);
			},
			
			testSerializeWhenRefIsNotLeafNode: function() {
				
				var Assert = YAHOO.util.Assert;
				var node = getFirstNode(this.model.EvaluateXPath("/car"));
				var string = document.submission.buildGetUrl("", document.submission.serializeURLEncoded(node));
				
				Assert.areEqual("?make=Ford&color=blue", string);
			}
			
		}));
