var Assert = YAHOO.util.Assert; 

var oSuiteRRRR = new YAHOO.tool.TestSuite({
	name : "Mockobj Test Re... functions",
	setUp		: 	function()
	{
	  
	
	},
	tearDown	:	function()
	{
	}

});


var oTestRRRR = new YAHOO.tool.TestCase({
	name		:	"Test oTestGetPathToModule",
	setUp : function () {
	  this.statusDiv = document.getElementById("ut-reactions-status");
	},
	_should: { 
		error: { 
		  testRebuildWithWrongModelAttribute: true
		} 
	}, 
   

	testAllFunctions:
	function() {
	

	  build0.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m0 - rebuild");
	  calc0.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m0 - recalculate");
	  valid0.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m0 - revalidate");
	  fresh0.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m0 - refresh");
	  
	},


	testRebuildWithDifferentModels:
	function() {

	  build0.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m0 - rebuild");
	  build1.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m1 - rebuild");
	  build2.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m2 - rebuild");
	  
	},

	testRebuildWithWrongModelAttribute:
	function() {
    build.performAction();
	  
	},
	
	testRebuildWithNoModelAttribute:
	function() {
    buildFail.performAction();
	  Assert.areEqual(this.statusDiv.innerHTML, "m0 - rebuild");
	}
	
});

oSuiteRRRR.add(oTestRRRR);
