// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// Copyright (C) 2009 Mark Birbeck
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
(function(){
  
  var caseSplitter = new YAHOO.tool.TestCase({
    name		:	"Test splitNVPairs",
    setUp   : function() {
    },
    tearDown : function(){
    },
    _should:{
       error:{
       
       }
    },
    testNothingReturnsEmptyList : function(){
      var result = crackNVPairs("","","");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(0, result.length);
    },
    testOuterSeparatedListReturnsAppropriatelySizedList : function(){
      var result = crackNVPairs("a=b;c=d;e=f","",";");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(3, result.length);
    
    },
    testSinglePairReturnsCrackedPair : function(){
      var result = crackNVPairs("a=b","=",";");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(1, result.length);
      YAHOO.util.Assert.areSame('b',result[0].right);
      YAHOO.util.Assert.areSame('a',result[0].left);
    },
    testSomePairsReturnCrackedPairs : function(){
      var result = crackNVPairs("a=b;a=c;a=d","=",";");
      YAHOO.util.Assert.areSame('b',result[0].right);
      YAHOO.util.Assert.areSame('c',result[1].right);
      YAHOO.util.Assert.areSame('d',result[2].right);
      YAHOO.util.Assert.areSame('a',result[0].left);
      YAHOO.util.Assert.areSame('a',result[1].left);
      YAHOO.util.Assert.areSame('a',result[2].left);
    },
    testPairsWithMultipleInstancesOfInnerSeparatorTreatSecondInstanceAsPartOfValue : function(){
      var result = crackNVPairs("a=b=c;q=e=d;z=d","=",";");
      YAHOO.util.Assert.areSame('b=c',result[0].right);
      YAHOO.util.Assert.areSame('e=d',result[1].right);
      YAHOO.util.Assert.areSame('d',result[2].right);
     },
     testPairsThatAreNotPairsHaveEmptyRightHandValue : function(){
      var result = crackNVPairs("a;b;c=d","=",";");
      YAHOO.util.Assert.areSame('', result[0].right);
      YAHOO.util.Assert.areSame('', result[1].right);
      YAHOO.util.Assert.areSame('a',result[0].left);
      YAHOO.util.Assert.areSame('b',result[1].left);
      YAHOO.util.Assert.areSame('c',result[2].left);
     },
     testSaveToObject : function() {
       var obj = {};
       var result = crackNVPairs("a;b;c=d;e=f=g","=",";", obj);
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(0, result.length);
      YAHOO.util.Assert.areSame(obj.a,'');
      YAHOO.util.Assert.areSame(obj.c,'d');
      YAHOO.util.Assert.areSame(obj.e,'f=g');
             
     }
  });
  var caseURL = new YAHOO.tool.TestCase({
    name		:	"Test SavePairsFromURL",
    setUp   : function() {
    },
    tearDown : function(){
    },
    _should:{
       error:{
       
       }
    },
    testURLWithNoParams : function() {
      var obj = {};
      saveParametersFromURL("http://www.example.com/",obj);
      YAHOO.util.Assert.isUndefined(obj.a);
    },
    testURLWithSomeParams : function() {
      var obj = {};
      saveParametersFromURL("http://www.example.com/#vars(a=b,b=c)",obj);
      YAHOO.util.Assert.areSame(obj.a,"b");
      YAHOO.util.Assert.areSame(obj.b,"c");
    },
    testURLWithEvaluableParamsThatShouldNotBeEvaluated : function() {
      var obj = {};
      saveParametersFromURL("http://www.example.com/#vars(a=1+2)",obj);
      YAHOO.util.Assert.areSame(obj.a,"1+2");
    },
    testURLWithApparentNVPairsPriorToTheFragmentMarker : function() {
      var obj = {};
      saveParametersFromURL("http://www.example.com/vars(a=b)/hello#vars(b=c)",obj);
      YAHOO.util.Assert.isUndefined(obj.a);
      YAHOO.util.Assert.areSame(obj.b,"c");
    }
  });
  
  var caseFragmentParser = new YAHOO.tool.TestCase({
    name		:	"Test FragmentParser",
    setUp   : function() {
    },
    tearDown : function(){
    },
    _should:{
       error:{
       
       }
    },
    testEmptyStringParsesToEmptyNull : function() {
      var result = FragmentParser.parseFragment("");
      YAHOO.util.Assert.isNull(result);
    },
    testNonCompliantStringParsesToNull : function() {
      var sFragment = "someAnchor";
      var result = FragmentParser.parseFragment(sFragment);
      YAHOO.util.Assert.isNull(result);
    },
    testFragmentWithSchemeParsesToObject : function() {
      var result = FragmentParser.parseFragment("xpointer(a/b/c)");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(1, result.length);
      YAHOO.util.Assert.areSame("xpointer", result[0].scheme);
      YAHOO.util.Assert.areSame("a/b/c", result[0].rawData);
    },
    testFragmentWithTwoSchemesParsesToObjects : function() {
      var result = FragmentParser.parseFragment("xmlns(x:http://www.example.com/) xpointer(a/b/c)");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(2, result.length);
      YAHOO.util.Assert.areSame("xmlns", result[0].scheme);
      YAHOO.util.Assert.areSame("x:http://www.example.com/", result[0].rawData);
      YAHOO.util.Assert.areSame("xpointer", result[1].scheme);
      YAHOO.util.Assert.areSame("a/b/c", result[1].rawData);
    },
    testEscapedParensIgnored: function() {
      var result = FragmentParser.parseFragment("vars(a=b,c=^))");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(1, result.length);
      YAHOO.util.Assert.areSame("vars", result[0].scheme);
      YAHOO.util.Assert.areSame("a=b,c=)", result[0].rawData);
    },
    testEscapedEscapeIsNotAnEscape: function() {
      var result = FragmentParser.parseFragment("vars(a=b,c=d,e=^),f=^^,g=^),h=^^) xpointer(a/b/c) xmlns(xyz:http://something^^/^^)");
      YAHOO.util.Assert.isArray(result);
      YAHOO.util.Assert.areSame(3, result.length);
      YAHOO.util.Assert.areSame("vars", result[0].scheme);
      YAHOO.util.Assert.areSame("a=b,c=d,e=),f=^,g=),h=^", result[0].rawData);
      YAHOO.util.Assert.areSame("a", result[0].data[0].left);
      YAHOO.util.Assert.areSame("b", result[0].data[0].right);

    }
 });
  YAHOO.tool.TestRunner.add(caseSplitter);
  YAHOO.tool.TestRunner.add(caseURL);
  YAHOO.tool.TestRunner.add(caseFragmentParser);
})();

