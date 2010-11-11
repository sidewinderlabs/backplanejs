(function() {

var suiteInstanceStandalone = new YAHOO.tool.TestSuite({
	name: "Test instance in standalone mode"
});

var caseInstanceStandalone = new YAHOO.tool.TestCase({
	name: "Test instance in standalone mode",
	setUp: function() {
		var testDIV = document.createElement("div");
		this.testInstance = new Instance(testDIV);
	},

	_should: {
		error: {

		}
	},
	testStoreDOM: function() {
		var Assert = YAHOO.util.Assert;
		var someDOM = new DOMParser().parseFromString("<x>hello</x>", "text/xml");
		this.testInstance.replaceDocument(someDOM);
		Assert.areEqual(xmlText(this.testInstance.getDocument()), xmlText(someDOM));

	},

	testReplaceDOM: function() {
		var Assert = YAHOO.util.Assert;
		var someDOM = new DOMParser().parseFromString("<x>hello</x>", "text/xml");
		this.testInstance.replaceDocument(someDOM);
		var someOtherDOM = new DOMParser().parseFromString("<y>bonjour</y>", "text/xml");
		this.testInstance.replaceDocument(someOtherDOM);
		Assert.areEqual(xmlText(this.testInstance.getDocument()), xmlText(someOtherDOM));
	},
	testResetDOM: function() {
		var Assert = YAHOO.util.Assert;
		var someDOM = new DOMParser().parseFromString("<x>hello</x>", "text/xml");
		this.testInstance.replaceDocument(someDOM);
		var someOtherDOM = new DOMParser().parseFromString("<y>bonjour</y>", "text/xml");
		this.testInstance.replaceDocument(someOtherDOM);
		this.testInstance.reset();
		Assert.areEqual(xmlText(this.testInstance.getDocument()), xmlText(someDOM));
	}

});

suiteInstanceStandalone.add(caseInstanceStandalone);

YAHOO.tool.TestRunner.add(suiteInstanceStandalone);

})();
