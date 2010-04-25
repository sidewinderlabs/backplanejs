(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name : "Test submission object.",

		setUp : function() {
			this.testSubmission = new submission();
			return;
		},// setUp()

		tearDown : function() {
			delete this.testSubmission;
			this.testSubmission = null;
			return;
		}// tearDown()
	});

	// Add test for contentTypeIsXML().
	//
	suite.add(
		new YAHOO.tool.TestCase({
			name: "Test contentTypeIsXML()",

			// Verify that 'text/xml' is recognised as an XML type.
			//
			testFunctionContentTypeIsXMLTextXml: function() {
				Assert.isTrue(suite.testSubmission.contentTypeIsXML( "text/xml" ));
				return;
			},

			// Verify that 'TEXT/XML' is recognised as an XML type.
			//
			testFunctionContentTypeIsXMLTextXmlUpperCase: function() {
				Assert.isTrue(suite.testSubmission.contentTypeIsXML( "TEXT/XML" ));
				return;
			},

			// Verify that 'text/xml; charset=utf-8' is recognised as an XML type.
			//
			testFunctionContentTypeIsXMLTextXmlUtf8: function() {
				Assert.isTrue(suite.testSubmission.contentTypeIsXML( "text/xml; charset=utf-8" ));
				return;
			},

			// Verify that 'application/xml' is recognised as an XML type.
			//
			testFunctionContentTypeIsXMLApplicationXml: function() {
				Assert.isTrue(suite.testSubmission.contentTypeIsXML( "application/xml" ));
				return;
			},

			// Verify that 'APPLICATION/XML' is recognised as an XML type.
			//
			testFunctionContentTypeIsXMLApplicationXmlUpperCase: function() {
				Assert.isTrue(suite.testSubmission.contentTypeIsXML( "APPLICATION/XML" ));
				return;
			},

			// Verify that 'application/soap+xml' is recognised as an XML type.
			//
			testFunctionContentTypeIsXMLApplicationSoapXml: function() {
				Assert.isTrue(suite.testSubmission.contentTypeIsXML( "application/soap+xml" ));
				return;
			},

			// Verify that 'text/javascript' is NOT recognised as an XML type.
			//
			testFunctionContentTypeIsXMLTextJavascript: function() {
				Assert.isFalse(suite.testSubmission.contentTypeIsXML( "text/javascript" ));
				return;
			}
		})//new TestCase
	); //suite.add( ... )
	YAHOO.tool.TestRunner.add(suite);
}());
