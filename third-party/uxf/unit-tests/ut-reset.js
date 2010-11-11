
(function(){

var Assert = YAHOO.util.Assert;

var suiteReset = new YAHOO.tool.TestSuite({
	name: "Test reset",
	setUp: function() {}
});

var caseReset = new YAHOO.tool.TestCase({
	name: "Test reset",
	setUp: function() {
		this.testModel = document.createElement("div");
		//DECORATOR.extend(this.testModel, new EventTarget(this.testModel), true);
		document.defaultModel = this.testModel;
		var model = new Model(this.testModel);
		this.testModelObject = model;
		DECORATOR.addBehaviour(this.testModel, model);
		if(UX.isIE) UX.extend(this.testModel, new EventTarget(this.testModel));
		this.Assert = YAHOO.util.Assert;
		window.testModelObject = this.testModelObject;

	},

	_should: {
		error: {

		}
	},

	testResetOneInstance: function() {
		var instanceDiv = document.createElement("div");
		var testInstance = new Instance(instanceDiv);
		DECORATOR.addBehaviour(instanceDiv, testInstance);
		testInstance.replaceDocument(new DOMParser().parseFromString("<x>hello</x>", "text/xml"));
		this.testModelObject.addInstance(testInstance);
		this.testModelObject.m_bReady = true;

		//Ensure that the new values are as expected, this does not test reset, but ensures that a 
		//  positive test result for reset is a genuine positive
		var val = this.testModelObject.getValue(".");
		this.Assert.areSame(val.stringValue(), "hello");
		this.testModelObject.setValue(this.testModelObject.getEvaluationContext(), ".", "'goodbye'");
		val = this.testModelObject.getValue(".");
		this.Assert.areSame(val.stringValue(), "goodbye");

		//set the rebuild flag, so that it would return true, if reset fails. 
		this.testModelObject.flagRebuild();

		//reset the model
		this.testModelObject.reset();

		//check that the value is back to the default.
		val = this.testModelObject.getValue(".");
		this.Assert.areSame(val.stringValue(), "hello");

		//check that there is no pending rebuild.
		this.Assert.areSame(this.testModelObject.rebuildPending(), false);

	},

	testResetMultipleInstances: function() {

		//Set up two instances.
		var instanceDivDE = document.createElement("div");
		instanceDivDE.setAttribute("id", "DE");
		this.testModel.appendChild(instanceDivDE);
		var testInstanceDE = new Instance(instanceDivDE);
		DECORATOR.addBehaviour(instanceDivDE, testInstanceDE);
		testInstanceDE.replaceDocument(new DOMParser().parseFromString("<x>Guten Morgen</x>", "text/xml"));
		var instanceDivCY = document.createElement("div");
		this.testModel.appendChild(instanceDivCY);
		instanceDivCY.setAttribute("id", "CY");
		var testInstanceCY = new Instance(instanceDivCY);
		DECORATOR.addBehaviour(instanceDivCY, testInstanceCY);
		testInstanceCY.replaceDocument(new DOMParser().parseFromString("<x>Bore da</x>", "text/xml"));

		this.testModelObject.addInstance(testInstanceDE);
		this.testModelObject.addInstance(testInstanceCY);
		_model_contentReady(this.testModelObject);
		
		//change the values
		this.testModelObject.setValue(this.testModelObject.getEvaluationContext(), ".", "'Tchuess'");
		this.testModelObject.setValue(this.testModelObject.getEvaluationContext(), "instance('CY')", "'Hwyl'");

		//Ensure that the new values are as expected, this does not test reset, but ensures that a 
		//  positive test result for reset is a genuine positive
		val = this.testModelObject.getValue(".");
		this.Assert.areSame(val.stringValue(), "Tchuess");
		val = this.testModelObject.getValue("instance('CY')");
		this.Assert.areSame(val.stringValue(), "Hwyl");
		//reset the model.
		this.testModelObject.reset();

		//ensure that the values are back to the originals.
		val = this.testModelObject.getValue(".");
		this.Assert.areSame(val.stringValue(), "Guten Morgen");
		val = this.testModelObject.getValue("instance('CY')");
		this.Assert.areSame(val.stringValue(), "Bore da");
	}

});

suiteReset.add(caseReset);


YAHOO.tool.TestRunner.add(suiteReset);

})();
