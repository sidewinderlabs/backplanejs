(function() {
	var Assert = YAHOO.util.Assert;
	var xmlDoc, xmlString = ['<foo>', '<bar>hello</bar>', '<baz>world</baz>', '<koda>basanda<bosoya>umahasha</bosoya>tikki<ottobo/></koda>', '</foo>'].join('');

	var suite = new YAHOO.tool.TestSuite({
		name: "AJAXSLT Extensions"
	});

	// Tests our enhancements to AJAXSLT.
	//
	suite.add(
	new YAHOO.tool.TestCase({
		name: "Test createProcessingInstruction",

		setUp: function() {
			xmlDoc = new DOMParser().parseFromString(xmlString, "text/xml");
		},

		tearDown: function() {
			xmlDoc = null;
		},

		testAddXMLPI: function() {
			xmlDoc.insertBefore(
			xmlDoc.createProcessingInstruction("xml", 'version="1.0" encoding="ISO-8859-1"'), xmlDoc.firstChild);
			Assert.areEqual('<?xml version="1.0" encoding="ISO-8859-1"?>\n' + xmlString, new XMLSerializer().serializeToString(xmlDoc));
		},
		
		testCDATA: function() {
			Assert.areEqual("<foo><bar><![CDATA[hello]]></bar><baz>world</baz><koda><![CDATA[basanda]]><bosoya>umahasha</bosoya><![CDATA[tikki]]><ottobo/></koda></foo>", xmlText(xmlDoc, ["bar", "koda"]));
		}
	}));

	// Add our test suite to the test runner.
	//
	YAHOO.tool.TestRunner.add(suite);
} ());
