var Assert = YAHOO.util.Assert; 
var oTestAddSelectionNamespace = new YAHOO.tool.TestCase({
	name		:	"Test addSelectionNamespace",
	setUp		: 	function(){ NamespaceManager.clean()},
	tearDown	:	function(){ NamespaceManager.clean()},

	_should: { 
		error: { 
			testAddMultipleURIs: true
		} 
	}, 

	testConstruction:
	function() {
		Assert.isObject(NamespaceManager);
	},

	testAddGoodNamespace: 
	function () {
		Assert.isTrue(NamespaceManager.addSelectionNamespace("xf", "http://www.w3.org/2002/xforms"));
	},
	testAddMultiplePrefixes:
	function () {
		NamespaceManager.addSelectionNamespace("xf", "http://www.w3.org/2002/xforms");
		Assert.isTrue(NamespaceManager.addSelectionNamespace("banana", "http://www.w3.org/2002/xforms"));
	},
	testAddMultipleURIs:
	function () {
		NamespaceManager.addSelectionNamespace("xf", "http://www.w3.org/2002/xforms");
		NamespaceManager.addSelectionNamespace("xf", "http://www.example.com/eXtremeForgetfulness");
	},
	testAddPrefixTwice:
	function () {
		NamespaceManager.addSelectionNamespace("xf", "http://www.w3.org/2002/xforms");
		Assert.isFalse(NamespaceManager.addSelectionNamespace("xf", "http://www.w3.org/2002/xforms"));
	}

});

var oTestAddOutputNamespace = new YAHOO.tool.TestCase({
	name		:	"Test addOutputNamespace",
	setUp		: 	function(){ NamespaceManager.clean()},
	tearDown	:	function(){ NamespaceManager.clean()},

	testAddGoodNamespace:
	function () {
		Assert.isTrue(NamespaceManager.addOutputNamespace("y","urn:someNamespace"));
	},

	testGetNamespacePrefix:
	function () {
		NamespaceManager.addOutputNamespace("y","urn:someNamespace");
		var prefixes = NamespaceManager.getOutputPrefixesFromURI("urn:someNamespace")		
		Assert.isArray(prefixes);
		Assert.areEqual(prefixes[0],"y" );
	},
	testAddMultipleNamespacePrefixes:
	function () {
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		NamespaceManager.addOutputNamespace("y","urn:someNamespace");
	},
	testReadNamespacesFromDocument:
	function () {
		NamespaceManager.readOutputNamespacesFromDocument();
		var prefixes = NamespaceManager.getOutputPrefixesFromURI("urn:someNamespace")		
		Assert.isArray(prefixes);
		Assert.areEqual(prefixes[0],"x" );
		prefixes = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms")		
		Assert.isArray(prefixes);
		prefixes.sort()
		Assert.areEqual(prefixes[0],"umahasha" );
		Assert.areEqual(prefixes[1],"xf" );
		Assert.areEqual(prefixes[2],"xforms" );
	}
	
});

var oTestTranslateCSS = new YAHOO.tool.TestCase({
	name		:	"Test translation of CSS Selectors",
	setUp		: 	function(){ NamespaceManager.clean()},
	tearDown	:	function(){ NamespaceManager.clean()},

	_should: { 
		error: { 
			testUnknownNamespaceSelector: true
		} 
	}, 

	testNoNamespaceSelector:
	function() {
		Assert.areEqual(NamespaceManager.translateCSSSelector("someSelectorElement.someSelectorClass"),"someSelectorElement.someSelectorClass", "The selector translator should leave alone, that with which it has no business.");	
	},

	testUnknownNamespaceSelector:
	function() {
		NamespaceManager.addSelectionNamespace("xyz", "urn:someNamespace");
		NamespaceManager.translateCSSSelector("x|quirkafleeg");
	},
	testHomographousNamespaceSelector:
	function() {
		NamespaceManager.addSelectionNamespace("x", "urn:someNamespace");
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		Assert.areEqual(NamespaceManager.translateCSSSelector("x|quirkafleeg"), "x\\:quirkafleeg");
	},
	testHeterographousNamespaceSelector:
	function() {
		NamespaceManager.addSelectionNamespace("y", "urn:someNamespace");
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		Assert.areEqual(NamespaceManager.translateCSSSelector("y|quirkafleeg"), "x\\:quirkafleeg");
	},
	testSelectorWithMultipleNamespaceInstances:
	function() {
		NamespaceManager.addSelectionNamespace("y", "urn:someNamespace");
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		Assert.areEqual(NamespaceManager.translateCSSSelector("y|quirkafleeg y|performance"), "x\\:quirkafleeg x\\:performance");
	},
	testSelectorWithMultipleDifferentNamespaceInstances:
	function() {
		NamespaceManager.addSelectionNamespace("x", "urn:someNamespace");
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		NamespaceManager.addSelectionNamespace("y", "urn:someOtherNamespace");
		NamespaceManager.addOutputNamespace("y","urn:someOtherNamespace");
		Assert.areEqual(NamespaceManager.translateCSSSelector("x|quirkafleeg y|performance"), "x\\:quirkafleeg y\\:performance");
	},
	testSelectorWithMultipleDifferentOutputNamespacePrefixes:
	function() {
		NamespaceManager.addSelectionNamespace("x", "urn:someNamespace");
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		NamespaceManager.addOutputNamespace("y","urn:someNamespace");
		Assert.areEqual(NamespaceManager.translateCSSSelector("x|quirkafleeg"), "x\\:quirkafleeg, y\\:quirkafleeg");
	}, 
	testSelectorWithMultipleDifferentNamespaceInstancesAndMultiplePrefixesEach:
	function() {
		NamespaceManager.addSelectionNamespace("x", "urn:someNamespace");
		NamespaceManager.addOutputNamespace("x","urn:someNamespace");
		NamespaceManager.addOutputNamespace("x0","urn:someNamespace");
		NamespaceManager.addSelectionNamespace("y", "urn:someOtherNamespace");
		NamespaceManager.addOutputNamespace("y","urn:someOtherNamespace");
		NamespaceManager.addOutputNamespace("y0","urn:someOtherNamespace");
		Assert.areEqual(NamespaceManager.translateCSSSelector("x|quirkafleeg y|performance"),
			"x\\:quirkafleeg y\\:performance, x0\\:quirkafleeg y\\:performance, x\\:quirkafleeg y0\\:performance, x0\\:quirkafleeg y0\\:performance"
		);
	},
	testSelectorWithMultipleDifferentNamespaceInstancesAndMultiplePrefixesEachUsingDocumentNamespaces:
	function() {
		NamespaceManager.readOutputNamespacesFromDocument();
		NamespaceManager.addSelectionNamespace("x", "http://www.example.org/ns0");
		NamespaceManager.addSelectionNamespace("y", "http://www.example.org/ns1");

		//order is uncertain, depending on the order that the browser uses to report its namespace declarations.
		//	therefore, split it on the commas, sort, and check each individual bit.
		var arrResults = NamespaceManager.translateCSSSelector("x|quirkafleeg y|performance").split(", ");
		arrResults.sort();
		Assert.areEqual(arrResults[0],"a0\\:quirkafleeg b0\\:performance"); 
		Assert.areEqual(arrResults[1],"a0\\:quirkafleeg b\\:performance"); 
		Assert.areEqual(arrResults[2],"a\\:quirkafleeg b0\\:performance"); 
		Assert.areEqual(arrResults[3],"a\\:quirkafleeg b\\:performance"); 
	}
});

var oSuiteGetElementsByTagName = new YAHOO.tool.TestSuite({
	name : "Test getElementsByTagNameNs",
	setUp		: 	function()
	{
		this.testElement = document.createElement("div");
		
		if (UX.isXHTML) {
		   	var aMan = document.createElementNS("http://www.example.org/ns0" , "a:man");
			var aPlan = document.createElementNS("http://www.example.org/ns0" , "a:plan");
			var aCanal = document.createElementNS("http://www.example.org/ns0" , "a:canal");
			aCanal.setAttribute("id", "aCanal");
			aPlan.appendChild(aCanal);
			aMan.appendChild(aPlan);
			this.testElement.appendChild(aMan);
			
			aMan = document.createElementNS("http://www.example.org/ns0" , "a0:man");
			aPlan = document.createElementNS("http://www.example.org/ns0" , "a0:plan");
			aCanal = document.createElementNS("http://www.example.org/ns0" , "a0:canal");
			aCanal.setAttribute("id", "a0Canal");
			aPlan.appendChild(aCanal);
			aMan.appendChild(aPlan);
			this.testElement.appendChild(aMan);
			
			aMan = document.createElementNS("http://www.example.org/ns1" , "b:man");
			aPlan = document.createElementNS("http://www.example.org/ns1" , "b:plan");
			aCanal = document.createElementNS("http://www.example.org/ns1" , "b:canal");
			aCanal.setAttribute("id", "bCanal");
			aPlan.appendChild(aCanal);
			aMan.appendChild(aPlan);
			this.testElement.appendChild(aMan);
			
			aMan = document.createElementNS("","man");
			aPlan = document.createElementNS("","plan");
			aCanal = document.createElementNS("","canal");
			aCanal.setAttribute("id", "noNamespaceCanal");
			aPlan.appendChild(aCanal);
			aMan.appendChild(aPlan);
			this.testElement.appendChild(aMan);
	    } else {
	        this.testElement.innerHTML = '<a:man><a:plan><a:canal id="aCanal"></a:canal></a:plan></a:man><a0:man><a0:plan><a0:canal id="a0Canal"></a0:canal></a0:plan></a0:man><b:man><b:plan><b:canal id="bCanal"></b:canal></b:plan></b:man><man><plan><canal id="noNamespaceCanal"></canal></plan></man>';	
		}
		document.body.appendChild(this.testElement);
		NamespaceManager.clean();
		NamespaceManager.readOutputNamespacesFromDocument();
	},
	tearDown	:	function()
	{
		NamespaceManager.clean();
		this.testElement.parentNode.removeChild(this.testElement);
		delete this.testElement;
	}

});

var oTestGetElementsByTagName = new YAHOO.tool.TestCase({
	name		:	"Test getElementsByTagNameNS",
	
	testGetNoElementsWithAnyNamespace:
	function() {
		var elements = NamespaceManager.getElementsByTagNameNS(document.body, "", "ThereIsNoElementLikeThis");
		Assert.areEqual(elements.length, 0);
	},
	
	testGetElementsWithWrongNamespace:
	function() {
		var elements = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ThereIsNoNamespaceLikeThis", "canal");
		Assert.areEqual(elements.length, 0);
	},
	testGetElementsWithNoNamespace:
	function() {
		var elements = NamespaceManager.getElementsByTagNameNS(document.body, "", "canal");
		Assert.areEqual(elements.length, 1);
		Assert.areEqual(elements[0].getAttribute("id"), "noNamespaceCanal");
	},
	testGetElementsWithOnePrefix:
	function() {

		var elements = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns1", "canal");
		Assert.areEqual(elements.length, 1);
		Assert.areEqual(elements[0].getAttribute("id"), "bCanal");

	},
	testGetElementsWithDifferentPrefixes:
	function() {
		var elements = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal");
		Assert.areEqual(elements.length, 2);
	},
	testGetOrderOfElementsWithDifferentPrefixes:
	function() {
		var elements = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal");
		Assert.areEqual(elements.length, 2);
		Assert.areEqual(elements[0].getAttribute("id"), "aCanal");
		Assert.areEqual(elements[1].getAttribute("id"), "a0Canal");
	}	
	
});

var oTestGetLocalName = new YAHOO.tool.TestCase({
	name		:	"Test getLocalName",
	_should: { 
		error: { 
			testNoParam: true,
			testNullParam: true,
			testNotANodeParam: true
		} 
	}, 
  testNoNamespacePrefix : function() {
    Assert.areSame(NamespaceManager.getLowerCaseLocalName(document.body),"body");
  },
  testSomeNamespacePrefix : function() {
    var node =  NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal")[0];
    Assert.areSame(NamespaceManager.getLowerCaseLocalName(node),"canal");
  },
  testNoParam : function() {
    NamespaceManager.getLowerCaseLocalName();
  },
  testNullParam : function() {
    NamespaceManager.getLowerCaseLocalName(null);
  },
  testNotANodeParam : function() {
    NamespaceManager.getLowerCaseLocalName("Hello Sailor");
  }
});

var oTestCompareFullName = new YAHOO.tool.TestCase({
	name		:	"Test compareFullName",
	_should: { 
		error: { 
			testNoParam: true,
			testNullParam: true,
			testNotANodeParam: true
		} 
	}, 
  testNoNamespacePrefixOnNode : function() {
    Assert.areSame(NamespaceManager.compareFullName(document.body,"body",""),true);
  },
  testNoNamespacePrefixOnNodeAndOnlyTwoParameters : function() {
    Assert.areSame(NamespaceManager.compareFullName(document.body,"body"),true);
  },
  testSameNameAndNamespace : function() {
    var node = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal")[0];
    Assert.areSame(NamespaceManager.compareFullName(node,"canal","http://www.example.org/ns0"),true);
  },
  testSameNameButDifferentNamespace : function() {
    var node = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal")[0];
    Assert.areSame(NamespaceManager.compareFullName(node,"canal","BOO!!!"),false);
  },
  testSameNamespaceButDifferentName : function() {
    var node = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal")[0];
    Assert.areSame(NamespaceManager.compareFullName(node,"Rangoon","http://www.example.org/ns0"),false);
  },
  testQNameSuppliedAsLocalName : function() {
    var node = NamespaceManager.getElementsByTagNameNS(document.body, "http://www.example.org/ns0", "canal")[0];
    Assert.areSame(NamespaceManager.compareFullName(node,"a:canal"),false);
  },
  testNoParam : function() {
    NamespaceManager.getLowerCaseLocalName();
  },
  testNullParam : function() {
    NamespaceManager.getLowerCaseLocalName(null);
  },
  testNotANodeParam : function() {
    NamespaceManager.getLowerCaseLocalName("Hello Sailor");
  }
});


oSuiteGetElementsByTagName.add(oTestGetElementsByTagName);
oSuiteGetElementsByTagName.add(oTestGetLocalName);
oSuiteGetElementsByTagName.add(oTestCompareFullName);
var suiteNamespaceManager = new YAHOO.tool.TestSuite("Test Namespace Manager");
suiteNamespaceManager.add(oTestAddSelectionNamespace);
suiteNamespaceManager.add(oTestAddOutputNamespace);
suiteNamespaceManager.add(oTestTranslateCSS);
suiteNamespaceManager.add(oTestAddSelectionNamespace);
suiteNamespaceManager.add(oSuiteGetElementsByTagName);