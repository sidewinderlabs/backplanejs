

var suiteModelStandalone = new YAHOO.tool.TestSuite({
	name : "Test model in standalone mode"
});

var caseModelStandalone = new YAHOO.tool.TestCase({
	name		:	"Test model in standalone mode",
  setUp   : function() {
    var modelDiv = document.createElement("div")
    new EventTarget(modelDiv);
    this.testModel = new Model(modelDiv);

  },
  
	_should: { 
		error: { 
		
		} 
	}, 
	testAddInstance: function() {
    var Assert = YAHOO.util.Assert;

    var instanceDiv = document.createElement("div");
    new EventTarget(instanceDiv);
    var testInstance = new Instance(instanceDiv);
    this.testModel.addInstance(testInstance);
    Assert.areSame(this.testModel.instances()[0],testInstance); 
	}, 
	
	testRemoveSingleInstance: function() {
    var Assert = YAHOO.util.Assert;

    var instanceDiv = document.createElement("div");
    new EventTarget(instanceDiv);
    var testInstance = new Instance(instanceDiv);
    this.testModel.addInstance(testInstance);
    this.testModel.removeInstance(testInstance);
    Assert.areSame(this.testModel.instances().length,0); 
	}, 
	
	testRemoveSingleInstanceFromMultipleInstances: function() {
    var Assert = YAHOO.util.Assert;
    var instances = [];
    var i; 
    var instanceDiv;
    var thisInstance;
    for(i = 0;i < 3; ++ i) {
      instanceDiv = document.createElement("div");
      new EventTarget(instanceDiv);
      thisInstance = new Instance(instanceDiv);  
      instances.push(thisInstance);
      this.testModel.addInstance(thisInstance);
    }
    var modelInstances = this.testModel.instances();

    Assert.areSame(modelInstances.length,3); 
    Assert.areSame(modelInstances[0], instances[0]); 
    Assert.areSame(modelInstances[1], instances[1]); 
    Assert.areSame(modelInstances[2], instances[2]); 
    
    this.testModel.removeInstance(instances[1]);
    modelInstances = this.testModel.instances();
    Assert.areSame(modelInstances.length,2); 
    Assert.areSame(modelInstances[0], instances[0]); 
    Assert.areSame(modelInstances[1],instances[2]); 
	},
	
	testRemoveInstanceMultipleTimes  : function() {

    var instances = [];
    var i; 
    var instanceDiv;
    var thisInstance;
    for(i = 0;i < 3; ++ i) {
      instanceDiv = document.createElement("div");
      new EventTarget(instanceDiv);
      thisInstance = new Instance(instanceDiv);  
      instances.push(thisInstance);
      this.testModel.addInstance(thisInstance);
      this.testModel.addInstance(thisInstance);
    }
    

    var modelInstances = this.testModel.instances();
    Assert.areSame(modelInstances.length,6); 

    this.testModel.removeInstance(instances[1]);
    modelInstances = this.testModel.instances();
    Assert.areSame(modelInstances.length,4); 
	
	}
	



	
});

suiteModelStandalone.add(caseModelStandalone);