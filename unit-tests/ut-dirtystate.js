(function(){ 
  
  var d, flipTest;
   //test a given aspect switching on and off.
  flipTest = function(s){
    d.setDirty(s);
    YAHOO.util.Assert.areSame(true,d.isDirty(s), s + " should be dirty");
    YAHOO.util.Assert.areSame(true,d.isDirty(), "the object should be dirty");
    d.setClean(s);
    YAHOO.util.Assert.areSame(false,d.isDirty(s), s + " should be clean");
    YAHOO.util.Assert.areSame(false,d.isDirty(), "the object should be clean");
  };
  
  YAHOO.tool.TestRunner.add(
    new YAHOO.tool.TestCase({
      setUp: function () {
        d = new DirtyState();
      },
      
      testIsInitiallyClean : function () {
        YAHOO.util.Assert.areSame(false,d.isDirty());
      },
      
      testValueInitiallyClean : function () {
        YAHOO.util.Assert.areSame(false,d.isDirty("value"));
      },
      
      testMIPsInitiallyClean : function () {
        YAHOO.util.Assert.areSame(false,d.isDirty("valid"));
        YAHOO.util.Assert.areSame(false,d.isDirty("enabled"));
        YAHOO.util.Assert.areSame(false,d.isDirty("required"));
        YAHOO.util.Assert.areSame(false,d.isDirty("readonly"));
      },
      
      testCleanValue : function () {
        d.setClean("value");
        YAHOO.util.Assert.areSame(false,d.isDirty("value"));
      },
      
      testFlipValid : function () {
        d.setClean("value");
        flipTest("valid");
      },
      
      testFlipEnabled : function () {
        d.setClean("value");
        flipTest("enabled");
      },
      
      testFlipRequired: function () {
        d.setClean("value");
        flipTest("required");
      },
      
      testFlipReadonly : function () {
        d.setClean("value");
        flipTest("readonly");
      }
      
    })
  );
}());