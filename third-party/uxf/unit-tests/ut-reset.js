var Assert = YAHOO.util.Assert; 

var suiteReset = new YAHOO.tool.TestSuite({
	name : "Test reset",
	setUp		: 	function()
	{
	}
});

var caseReset = new YAHOO.tool.TestCase({
	name  :	"Test reset",
	setUp : function () {
    this.testModel = document.createElement("div");
    DECORATOR.extend(this.testModel ,new EventTarget(this.testModel), true);
    document.defaultModel = this.testModel;
    DECORATOR.extend(this.testModel ,new Model(this.testModel), true);
    this.Assert = YAHOO.util.Assert;

  },
  
	_should: { 
		error: { 
		
		} 
	},
	
	testResetOneInstance:
	function() {
    var instanceDiv = document.createElement("div");
    var testInstance = new Instance(instanceDiv);
    testInstance.replaceDocument(xmlParse("<x>hello</x>"))
    this.testModel.addInstance(testInstance);
    

    //Ensure that the new values are as expected, this does not test reset, but ensures that a 
    //  positive test result for reset is a genuine positive
    var val = this.testModel.getValue(".");
    this.Assert.areSame(val.stringValue(),"hello");
    this.testModel.setValue(this.testModel.getEvaluationContext(),".", "'goodbye'");
    val = this.testModel.getValue(".");
    this.Assert.areSame(val.stringValue(),"goodbye");

    //set the rebuild flag, so that it would return true, if reset fails. 
    this.testModel.flagRebuild();
    
    //reset the model
    this.testModel.reset();
    
    //check that the value is back to the default.
    val = this.testModel.getValue(".");
    this.Assert.areSame(val.stringValue(),"hello");
    
    //check that there is no pending rebuild.
    this.Assert.areSame(this.testModel.rebuildPending(),false);
    
	},
	
	testResetMultipleInstances:
	function() {
	
    //Set up two instances.
    var instanceDivDE = document.createElement("div");
    instanceDivDE.id = "DE";
    var testInstanceDE = new Instance(instanceDivDE);
    testInstanceDE.replaceDocument(xmlParse("<x>Guten Morgen</x>"))
    var instanceDivCY = document.createElement("div");
    instanceDivCY.id = "CY";
    var testInstanceCY = new Instance(instanceDivCY);
    testInstanceCY.replaceDocument(xmlParse("<x>Bore da</x>"))

    this.testModel.addInstance(testInstanceDE);
    this.testModel.addInstance(testInstanceCY);
    _model_contentReady(this.testModel);

    //change the values
    this.testModel.setValue(this.testModel.getEvaluationContext(),".", "'Tchuess'");
    this.testModel.setValue(this.testModel.getEvaluationContext(),"instance('CY')", "'Hwyl'");

    //Ensure that the new values are as expected, this does not test reset, but ensures that a 
    //  positive test result for reset is a genuine positive

    val = this.testModel.getValue(".");
    this.Assert.areSame(val.stringValue(),"Tchuess");
    val = this.testModel.getValue("instance('CY')");
    this.Assert.areSame(val.stringValue(),"Hwyl");

    //reset the model.
    this.testModel.reset();
    
    //ensure that the values are back to the originals.
    val = this.testModel.getValue(".");
    this.Assert.areSame(val.stringValue(),"Guten Morgen");
    val = this.testModel.getValue("instance('CY')");
    this.Assert.areSame(val.stringValue(),"Bore da");
	}



	
});

suiteReset.add(caseReset);