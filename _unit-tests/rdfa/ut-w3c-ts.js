// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa support to the Ubiquity
// library.
//
// Copyright (C) 2007-9 Mark Birbeck
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

// Tests still to be added:
//
// Test 0011 requires UNION to be added to the WHERE support
// Test 0012, 0013 requires lang support
// Test 0014 requires datatype support
// Test 0017 requires ISBLANK() function support
// Test 0023
// Test 0027
// Tests 0029-0042
// Tests 0046-0054
// Tests 0056-0094
// Tests 0099-0121
// Test 1001

(function() {
	var Assert = YAHOO.util.Assert;
	var r;
	var meta = new RDFQuery( new RDFStore() );
	var parser = new RDFParser(meta.store);
	var ns = {
		dc: "http://purl.org/dc/elements/1.1/"
	};

	var suite = new YAHOO.tool.TestSuite({
		name: "W3C Test Suite"
	});

	function tripleCount(meta) {
    return meta.query2({
      select: [ "s", "p", "o" ],
      where:
        [
          { pattern: [ "?s", "?p", "?o" ] }
        ]
    }).results.bindings.length;
	};

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test parse",

	    setUp : function () {
				meta.store.clear();

	      Assert.isFalse(
		      meta.ask({
		        select: [ "s", "p", "o" ],
		        where:
		          [
		            { pattern: [ "?s", "?p", "?o" ] }
		          ]
		      })["boolean"],
		      "Failed to reset store"
		    );
	    },

			runW3CTest: function (testName, where) {
				var that = this;

				parser.parseExternal(
					"http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/" + testName + ".xhtml",
					function() {
						that.resume(function() {

							Assert.areEqual(where.length, tripleCount(meta));

							Assert.isTrue(
								meta.ask({
									where: where
								})["boolean"]
							);

						});//that.resume()
					}
				);//parser.parseExternal();

				this.wait();
			},

	    tearDown : function () {
	    },

	    // W3C tests.
	    //
			testParse0001 : function () {
				this.runW3CTest(
					"0001",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg", "http://purl.org/dc/elements/1.1/creator", "Mark Birbeck" ] }
					]
				);
			},

			testParse0006 : function () {
				this.runW3CTest(
					"0006",
					[
						{ pattern: [ "http://www.blogger.com/profile/1109404", "http://xmlns.com/foaf/0.1/img", "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg" ] },
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg", "http://purl.org/dc/elements/1.1/creator", "http://www.blogger.com/profile/1109404" ] }
					]
				);
			},

			testParse0007 : function () {
				this.runW3CTest(
					"0007",
					[
						{ pattern: [ "http://www.blogger.com/profile/1109404", "http://xmlns.com/foaf/0.1/img", "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg" ] },
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg", "http://purl.org/dc/elements/1.1/title", "Portrait of Mark" ] },
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg", "http://purl.org/dc/elements/1.1/creator", "http://www.blogger.com/profile/1109404" ] }
					]
				);
			},

			testParse0008 : function () {
				this.runW3CTest(
					"0008",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0008.xhtml", "http://creativecommons.org/ns#license", "http://creativecommons.org/licenses/by-nc-nd/2.5/" ] }
					]
				);
			},

			testParse0009 : function () {
				this.runW3CTest(
					"0009",
					[
						{ pattern: [ "http://example.org/people#Person2", "http://xmlns.com/foaf/0.1/knows", "http://example.org/people#Person1" ] }
					]
				);
			},

			testParse0010 : function () {
				this.runW3CTest(
					"0010",
					[
						{ pattern: [ "http://example.org/people#Person2", "http://xmlns.com/foaf/0.1/knows", "http://example.org/people#Person1" ] },
						{ pattern: [ "http://example.org/people#Person1", "http://xmlns.com/foaf/0.1/knows", "http://example.org/people#Person2" ] }
					]
				);
			},

			testParse0015 : function () {
				this.runW3CTest(
					"0015",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0015.xhtml", "http://purl.org/dc/elements/1.1/creator", "Fyodor Dostoevsky" ] },
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0015.xhtml", "http://purl.org/dc/elements/1.1/source", "urn:isbn:0140449132" ] }
					]
				);
			},

			testParse0018 : function () {
				this.runW3CTest(
					"0018",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg", "http://purl.org/dc/elements/1.1/creator", "http://www.blogger.com/profile/1109404" ] }
					]
				);
			},

			testParse0019 : function () {
				this.runW3CTest(
					"0019",
					[
						{ pattern: [ "mailto:manu.sporny@digitalbazaar.com", "http://xmlns.com/foaf/0.1/knows", "mailto:michael.hausenblas@joanneum.at" ] }
					]
				);
			},

			testParse0020 : function () {
				this.runW3CTest(
					"0020",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/photo1.jpg", "http://purl.org/dc/elements/1.1/creator", "Mark Birbeck" ] }
					]
				);
			},

			testParse0021 : function () {
				this.runW3CTest(
					"0021",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0021.xhtml", "http://purl.org/dc/elements/1.1/creator", "Mark Birbeck" ] }
					]
				);
			},

			testParse0025 : function () {
				this.runW3CTest(
					"0025",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0025.xhtml", "http://purl.org/dc/elements/1.1/creator", "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0025.xhtml#me" ] },
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0025.xhtml#me", "http://xmlns.com/foaf/0.1/name", "Ben Adida" ] }
					]
				);
			},

			testParse0055 : function () {
				this.runW3CTest(
					"0055",
					[
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0055.xhtml", "http://purl.org/dc/elements/1.1/creator", "http://www-sop.inria.fr/acacia/fabien/" ] },
						{ pattern: [ "http://www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/0055.xhtml", "http://purl.org/dc/elements/1.1/publisher", "http://www-sop.inria.fr/acacia/fabien/" ] }
					]
				);
			},

	    testParse0121 : function () {
				this.runW3CTest(
					"0121",
					[
						{ pattern: [ "http://example.org/", "http://purl.org/dc/elements/1.1/title", "Test case 0123" ] },
						{ pattern: [ "http://example.org/", "http://purl.org/dc/elements/1.1/contributor", "Shane McCarron" ] }
					]
				);
			}
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());
