//dummy jsmin - this file is not to test jsmin, and its output may vary as algorithms improve.
  var jsmin =  function(a,s,b){
    return "minified["+s+"]";
  };
(function(){
  var roller;
  // A test is not a unit test if it communicates across a network (p298), 
  //  however, not having at least a dummy xhr to show that things are happening
  //  would render a large portion of the code untestable.
  var FakeSuccessfulXHR = function() {
    return {
      status:200,
      responseText:"",
      open:function(a,b,c){
        this.responseText = "opened[" + b + "]";
      },
      send: function() {
        this.responseText = "sent[" + this.responseText + "]"; 
      }
    };
  };
  
  var suiteMakeRollup = new YAHOO.tool.TestSuite({
    name		:	"Test parsePathDeclarations",
    setUp   : function() {
      roller = new Roller();
    },
    tearDown : function(){
      roller = null;
    }
  
  });
  
  var caseParsePathDeclarations = new YAHOO.tool.TestCase({
    name		:	"Test parsePathDeclarations",
    setUp   : function() {
    },
    tearDown : function(){
    },
    
    _should:{
       error:{
         testNonExistantModule:true
       }
    },
    
    testParseSinglePathDeclaration : function() {
      roller.parsePathDeclarations("a:b");
      YAHOO.util.Assert.areSame(roller.pathToModule("a"),"b");
    },
    
    testParseMultiplePathDeclarations : function() {
      roller.parsePathDeclarations("c:d,e:f");
      YAHOO.util.Assert.areSame(roller.pathToModule("c"),"d");
      YAHOO.util.Assert.areSame(roller.pathToModule("e"),"f");
    },
    testComplexPathDeclaration : function() {
      roller.parsePathDeclarations("x:http://www.example.com/");
      YAHOO.util.Assert.areSame(roller.pathToModule("x"),"http://www.example.com/");
    
    },
    testMultipleComplexPathDeclaration : function() {
      roller.parsePathDeclarations("y:http://www.example.com/dirY/,z:http://www.example.com/dirZ/");
      YAHOO.util.Assert.areSame(roller.pathToModule("y"),"http://www.example.com/dirY/");
      YAHOO.util.Assert.areSame(roller.pathToModule("z"),"http://www.example.com/dirZ/");
    },
    testNonExistantModule : function(){
      roller.pathToModule("j");
    }
  });
  
  var caseMakeRollup = new YAHOO.tool.TestCase({
    name		:	"Test parsePathDeclarations",
    setUp   : function() {
    },
    tearDown : function(){
    },
    
    _should:{
       error:{
         testNonExistantModule:true
       }
    },
    
    testMakeJSRollup : function() {
      var stream0 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var stream1 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var sSpec = 
      "(function(){" + 
      "  loader.addModule({name: 'mod-1', type: 'js', fullpath: 'path-to-mod-1', requires:['mod-0'] });" +
      "  loader.addModule({name: 'mod-0', type: 'js', fullpath: 'path-to-mod-0' });" +
      "  loader.require('mod-1')" + 
      "}());";
      roller.makeRollup(sSpec, {js:stream0},FakeSuccessfulXHR,stream1);
      YAHOO.util.Assert.areSame("minified[sent[opened[path-to-mod-0]]]",stream0.lines[0]);
      YAHOO.util.Assert.areSame("minified[sent[opened[path-to-mod-1]]]",stream0.lines[1]);
    },
    testMakeJSWithCSS : function() {
      var stream0 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var stream1 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var sSpec = 
      "(function(){" + 
      "  loader.addModule({name: 'mod-1', type: 'js', fullpath: 'path-to-mod-1', requires:['mod-0','mod-1-style'] });" +
      "  loader.addModule({name: 'mod-0', type: 'js', fullpath: 'path-to-mod-0' });" +
      "  loader.addModule({name: 'mod-1-style', type: 'css', fullpath: 'path-to-mod-1-style' });" +
      "  loader.require('mod-1')" + 
      "}());";
      roller.makeRollup(sSpec, {js:stream0},FakeSuccessfulXHR,stream1);
      YAHOO.util.Assert.areSame("minified[sent[opened[path-to-mod-0]]]",stream0.lines[0]);
      YAHOO.util.Assert.areSame("minified[sent[opened[path-to-mod-1]]]",stream0.lines[1]);
    },
    testMakeBothWithCSS : function() {
      var stream0 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var stream1 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var stream2 = {lines:[],WriteLine:function(s){this.lines.push(s);}};
      var sSpec = 
      "(function(){" + 
      "  loader.addModule({name: 'mod-1', type: 'js', fullpath: 'path-to-mod-1', requires:['mod-0','mod-1-style'] });" +
      "  loader.addModule({name: 'mod-0', type: 'js', fullpath: 'path-to-mod-0' });" +
      "  loader.addModule({name: 'mod-1-style', type: 'css', fullpath: 'path-to-mod-1-style' });" +
      "  loader.require('mod-1')" + 
      "}());";
      roller.makeRollup(sSpec, {js:stream0,css:stream1},FakeSuccessfulXHR,stream2);
      YAHOO.util.Assert.areSame("minified[sent[opened[path-to-mod-0]]]",stream0.lines[0]);
      YAHOO.util.Assert.areSame("minified[sent[opened[path-to-mod-1]]]",stream0.lines[1]);
      YAHOO.util.Assert.areSame("/**/\nsent[opened[path-to-mod-1-style]]",stream1.lines[0]);
    }
  });
  suiteMakeRollup.add(caseParsePathDeclarations);
  suiteMakeRollup.add(caseMakeRollup);
  YAHOO.tool.TestRunner.add(suiteMakeRollup);
})();