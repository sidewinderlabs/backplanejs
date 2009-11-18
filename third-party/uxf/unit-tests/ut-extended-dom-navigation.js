(function(){ 
  var testDataContainer;
  YAHOO.tool.TestRunner.add(
    new YAHOO.tool.TestCase({
      setUp: function(){
        testDataContainer = document.createElement("div");
        document.body.appendChild(testDataContainer);
      },
      
      tearDown: function(){
        testDataContainer.parentNode.removeChild(testDataContainer);
      },
      
      testSimpleGetFirstNamedNode : function() {
        testDataContainer.insertAdjacentHTML("beforeEnd",
          + "<x>"
          + "  <a0:somenode id='test-extended-DOM-a'></a0:somenode>"
          + "  <a0:somenode></a0:somenode>"
          + "  <a0:somenode></a0:somenode>"
          + "</x>"
        );
        var result = UX.getFirstNodeByName(testDataContainer,"somenode","http://www.example.org/ns0");
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"));
      },
      
      testGetFirstNamedNodeWithDifferentFirstNode : function() {
        testDataContainer.insertAdjacentHTML("beforeEnd",
          + "<x>"
          + "  <a1:somenode></a0:somenode>"
          + "  <a0:somenode id='test-extended-DOM-a'></a0:somenode>"
          + "  <a0:somenode></a0:somenode>"
          + "  <a0:somenode></a0:somenode>"
          + "</x>"
        );
        var result = UX.getFirstNodeByName(testDataContainer,"somenode","http://www.example.org/ns0");
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"));
      },
      
      testGetFirstNamedNodeFromWithinDifferentFirstNode : function() {
        testDataContainer.insertAdjacentHTML("beforeEnd",
          + "<x>"
          + "  <a1:somenode>"
          + "    <a0:somenode id='test-extended-DOM-a'></a0:somenode>"
          + "  </a1:somenode>"
          + "  <a0:somenode></a0:somenode>"
          + "  <a0:somenode></a0:somenode>"
          + "</x>"
        );
        var result = UX.getFirstNodeByName(testDataContainer,"somenode","http://www.example.org/ns0");
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"));
      }
    })
  );

  var suiteSimpleNextPrevious = new YAHOO.tool.TestSuite({
    name: "Next and Previous where results match nextSibling/previousSibling",
    setUp: function() {
      testDataContainer = document.createElement("div");
      document.body.appendChild(testDataContainer);
      testDataContainer.insertAdjacentHTML("beforeEnd",
        "<x>"+
        "  <a0:somenode id='test-extended-DOM-first'></a0:somenode>"+
        "  <a0:somenode id='test-extended-DOM-a'></a0:somenode>"+
        "  <a0:somenode id='test-extended-DOM-b'></a0:somenode>"+
        "  <a0:somenode id='test-extended-DOM-c'></a0:somenode>"+
        "  <a0:somenode id='test-extended-DOM-last'></a0:somenode>"+
        "</x>"
      );
    
    },
    
    tearDown: function(){
      testDataContainer.parentNode.removeChild(testDataContainer);
    }      
  });

  
  var suiteNextPreviousWithInterlopers = new YAHOO.tool.TestSuite({
    name: "Next and Previous where results differ from nextSibling/previousSibling",
    setUp: function() {
      testDataContainer = document.createElement("div");
      document.body.appendChild(testDataContainer);
      testDataContainer.insertAdjacentHTML("beforeEnd",
        "<x>"+
        "  <a1:somenode id='test-extended-DOM-BEFORE'></a1:somenode>"+
        "  <a0:somenode id='test-extended-DOM-first'></a0:somenode>"+
        "  <a0:somenode id='test-extended-DOM-a'></a0:somenode>"+
        "  <a1:somenode id='test-extended-DOM-a-AFTER'></a1:somenode>"+
        "  <a0:somenode id='test-extended-DOM-b'></a0:somenode>"+
        "  <a1:somenode id='test-extended-DOM-b-AFTER'></a1:somenode>"+
        "  <a0:somenode id='test-extended-DOM-c'></a0:somenode>"+
        "  <a1:somenode id='test-extended-DOM-c-AFTER'></a1:somenode>"+
        "  <a0:somenode id='test-extended-DOM-last'></a0:somenode>"+
        "  <a1:somenode id='test-extended-DOM-AFTER'></a1:somenode>"+
        "</x>"
      );
    
    },
    
    tearDown: function(){
      testDataContainer.parentNode.removeChild(testDataContainer);
    }      
  });  
  
  var suiteNextPreviousWithHeirarchy = new YAHOO.tool.TestSuite({
    name: "Next and Previous within a complex heirarchy",
    setUp: function() {
      testDataContainer = document.createElement("div");
      document.body.appendChild(testDataContainer);
      testDataContainer.insertAdjacentHTML("beforeEnd",
        "<x>"+
        "  <a0:somenode id='test-extended-DOM-first'></a0:somenode>"+
        "  <a1:somenode>"+
        "    <a0:somenode id='test-extended-DOM-a'></a0:somenode>"+
        "    <a1:somenode>"+
        "      <a0:somenode id='test-extended-DOM-b'></a0:somenode>"+
        "    </a1:somenode>"+
        "    <a0:somenode id='test-extended-DOM-c'></a0:somenode>"+
        "    <a1:somenode>"+
        "      <a0:somenode id='test-extended-DOM-d'></a0:somenode>"+
        "      <a0:somenode id='test-extended-DOM-e'></a0:somenode>"+
        "      <a1:somenode></a1:somenode>"+
        "      <a0:somenode id='test-extended-DOM-f'></a0:somenode>"+
        "    </a1:somenode>"+
        "    <a1:somenode>"+
        "      <a1:somenode>"+
        "        <a0:somenode id='test-extended-DOM-g'></a0:somenode>"+
        "      </a1:somenode>"+
        "    </a1:somenode>"+
        "    <a1:somenode>"+
        "      <a1:somenode>"+
        "        <a1:somenode></a1:somenode>"+
        "      </a1:somenode>"+
        "    </a1:somenode>"+
        "    <a1:somenode>"+
        "      <a1:somenode>"+
        "        <a0:somenode id='test-extended-DOM-h'></a0:somenode>"+
        "      </a1:somenode>"+
        "    </a1:somenode>"+
        "  </a1:somenode>"+
        "  <a0:somenode id='test-extended-DOM-last'></a0:somenode>"+
        "</x>"
      );
    
    },
    
    tearDown: function(){
      testDataContainer.parentNode.removeChild(testDataContainer);
    }
  });
  
    
  var caseNextPrevious = new YAHOO.tool.TestCase({
    testGetNextNodeAtEnd : function() {
      var refNode = document.getElementById("test-extended-DOM-last");
      var result = UX.getNextNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
      YAHOO.util.Assert.areSame(result,null);
    },
    testGetPreviousNodeAtStart : function() {
      var refNode = document.getElementById("test-extended-DOM-first");
      var result = UX.getPreviousNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
      YAHOO.util.Assert.areSame(result,null);
    },
    testGetPreviousNode : function() {
      var refNode = document.getElementById("test-extended-DOM-b");
      var result = UX.getPreviousNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
      YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"));
    },
    testGetNextNode : function() {
      var refNode = document.getElementById("test-extended-DOM-b");
      var result = UX.getNextNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
      YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-c"));
    }
  });
  
  suiteSimpleNextPrevious.add(caseNextPrevious);
  suiteNextPreviousWithInterlopers.add(caseNextPrevious);
  suiteNextPreviousWithHeirarchy.add(caseNextPrevious);
  
  //heirarchy search requires a few more tests  
  suiteNextPreviousWithHeirarchy.add(
    new YAHOO.tool.TestCase({
      name: "further tests on the heirarchy sample",
      
      testStepIntoNextSibling: function () {
        var result, refNode = document.getElementById("test-extended-DOM-a");
        result = UX.getNextNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-b"));
      },
      
      testStepIntoPreviousSibling: function () {
        var result, refNode = document.getElementById("test-extended-DOM-c");
        result = UX.getPreviousNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-b"));
      },
      
      testStepOutToFollowingSiblingOfParent: function () {
        var result, refNode = document.getElementById("test-extended-DOM-b");
        result = UX.getNextNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-c"));
      },

      testStepOutToPrecedingSiblingOfParent: function () {
        var result, refNode = document.getElementById("test-extended-DOM-b");
        result = UX.getPreviousNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"));
      },
      
      testStepOutToDescendentOfFollowingSiblingOfAncestor: function () {
        var result, refNode = document.getElementById("test-extended-DOM-g");
        result = UX.getNextNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-h"));
      },

      testStepOutToDescendentOfPrecedingSiblingOfAncestor: function () {
        var result, refNode = document.getElementById("test-extended-DOM-h");
        result = UX.getPreviousNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-g"));
      },
      
      
      
      testRunThroughNodes: function () {
        //a-h-a run through.  
        var result, refNode = document.getElementById("test-extended-DOM-first");
        result = UX.getNextNodeByName(refNode,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"),"A+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-b"),"B+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-c"),"C+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-d"),"D+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-e"),"E+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-f"),"F+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-g"),"G+");
        result = UX.getNextNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-h"),"H+");
  
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-g"),"G-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-f"),"F-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-e"),"E-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-d"),"D-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-c"),"C-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-b"),"B-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-a"),"A-");
        result = UX.getPreviousNodeByName(result,"somenode","http://www.example.org/ns0",testDataContainer);
        YAHOO.util.Assert.areSame(result,document.getElementById("test-extended-DOM-first"));

      }
    })
  );

  YAHOO.tool.TestRunner.add(suiteSimpleNextPrevious);
  YAHOO.tool.TestRunner.add(suiteNextPreviousWithInterlopers);
  YAHOO.tool.TestRunner.add(suiteNextPreviousWithHeirarchy);
}());


