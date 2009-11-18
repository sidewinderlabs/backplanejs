
var suiteFiniteControl = function () {

  var retval = new YAHOO.tool.TestSuite({
    name : "test FiniteControl",
    setUp : function() {
    },
    
    tearDown : function(){
    }
  });

  var caseFiniteControl = new YAHOO.tool.TestCase({
    name		:	"test FiniteControl",
    setUp   : function() {
    },
    tearDown : function(){
    },
    
    testIsInitiallyInRange : function() {
      var o = new FiniteControl();
      YAHOO.util.Assert.areSame(o.isInRange(),true);
    },

    testNoChangeIsNoChange : function() {
      var o = new FiniteControl();
      o.onInRange();
      YAHOO.util.Assert.areSame(o.isInRange(),true);
    },

    testGoOutOfRange : function() {
      var o = new FiniteControl();
      o.onOutOfRange();
      YAHOO.util.Assert.areSame(o.isInRange(),false);
    },
    
    testNoCrossPollution : function() {
      var o0 = new FiniteControl();
      var o1 = new FiniteControl();
      o0.onOutOfRange();
      YAHOO.util.Assert.areSame(o0.isInRange(),false);
      YAHOO.util.Assert.areSame(o1.isInRange(),true);
    },

    testGoOutOfRangeEvent : function() {
      var testStorage = "";
      var t = {
        dispatchEvent : function(e){
          testStorage = e.type;
        }
      };
      var o = new FiniteControl(t);
      o.onOutOfRange();
      YAHOO.util.Assert.areSame(testStorage,"xforms-out-of-range");
    },

    testGoInRangeEvent : function() {
      var testStorage = "";
      var t = {
        dispatchEvent : function(e){
          testStorage = e.type;
        }
      };
      var o = new FiniteControl(t);
      o.onOutOfRange();
      o.onInRange();
      YAHOO.util.Assert.areSame(testStorage,"xforms-in-range");
    },
    
    
    testNoEventOnNoChange : function() {
      var testStorage = "";
      var t = {
        dispatchEvent : function(e){
          testStorage = e.type;
        }
      }
      var o = new FiniteControl(t);
      o.onInRange();
      YAHOO.util.Assert.areSame(testStorage,"");
      o.onOutOfRange();
      YAHOO.util.Assert.areSame(testStorage,"xforms-out-of-range");
      testStorage = "quirkafleeg";
      o.onOutOfRange();
      YAHOO.util.Assert.areSame(testStorage,"quirkafleeg");
    },
    
    testClassName : function() {
      var testDIV = document.createElement("div");
      document.body.appendChild(testDIV);
      var getClass = function(obj) {
        if(obj.className) {
          return obj.className;
        }
        else {
          return obj.getAttribute("class");
        }
      
      } 
      var o = new FiniteControl(testDIV);
      YAHOO.util.Dom.addClass(testDIV,"someTestClass");
      
      YAHOO.util.Assert.areSame("someTestClass",getClass(testDIV));
      o.onOutOfRange();
      YAHOO.util.Assert.areSame("someTestClass xforms-out-of-range",getClass(testDIV));
      testDIV.parentNode.removeChild(testDIV);
    }
  });
  
  retval.add(caseFiniteControl);
  return retval;
}();

