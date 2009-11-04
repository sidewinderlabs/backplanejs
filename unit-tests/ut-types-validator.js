// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
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
// limitations under the License
var Assert = YAHOO.util.Assert;

/*
 * Test case to test the XForms Validator
 */

var XML_SCHEMA_NS = "http://www.w3.org/2001/XMLSchema";
var XFORMS_NS = "http://www.w3.org/2002/xforms";

function validateXFormsData(datatype, value) {
	return Validator.validateValue(XFORMS_NS, datatype, value);
};

function validateSchemaData(datatype, value) {
	return Validator.validateValue(XML_SCHEMA_NS, datatype, value);
};


var oXMLSchemaTypeTest = new YAHOO.tool.TestCase({
    name        : "Test XML Schema types validation",
    setUp       :   function() {
    },  
    tearDown : function() {
    }, // tearDown()
    test:  
    function() {
         // dateTime
         Assert.isTrue(validateSchemaData("dateTime", "1999-05-31T13:20:00-05:00"), "dateTime '1999-05-31T13:20:00-05:00' failed to return true");
         Assert.isFalse(validateSchemaData("dateTime", "1999-MM-DDT13:20:00-05:00"), "dateTime '1999-MM-DDT13:20:00-05:00' failed to return false");
         // time
         Assert.isTrue(validateSchemaData("time", "13:20:00-05:00"), "time '13:20:00-05:00' failed to return true");
         Assert.isFalse(validateSchemaData("time", "13:HH:00-05:00"), "time '13:HH:00-05:00' failed to return false");
         // date
         Assert.isTrue(validateSchemaData("date", "1999-05-31"), "date '1999-05-31' failed to return true");
         Assert.isFalse(validateSchemaData("date", "1999-MM-DD"), "date '1999-MM-DD' failed to return false");
         // gYearMonth
         Assert.isTrue(validateSchemaData("gYearMonth", "1999-05"), "gYearMonth '1999-05' failed to return true");
         Assert.isFalse(validateSchemaData("gYearMonth", "1999---"), "gYearMonth '1999---' failed to return false");
         // gYear
         Assert.isTrue(validateSchemaData("gYear", "1999"), "gYear '1999' failed to return true");
         Assert.isFalse(validateSchemaData("gYear", "YYYY"), "gYear 'YYYY' failed to return false");
         // gMonthDay
         Assert.isTrue(validateSchemaData("gMonthDay", "--09-14"), "gMonthDay '--09-14' failed to return true");
         Assert.isFalse(validateSchemaData("gMonthDay", "09-14"), "gMonthDay '09-14' failed to return false");
         // gDay
         Assert.isTrue(validateSchemaData("gDay", "---15"), "gDay '---15' failed to return true");
         Assert.isFalse(validateSchemaData("gDay", "15"), "gDay '15' failed to return false");
         // gMonth
         Assert.isTrue(validateSchemaData("gMonth", "--11"), "gMonth '--11' failed to return true");
         Assert.isFalse(validateSchemaData("gMonth", "11"), "gMonth '11' failed to return false");
         // boolean
         Assert.isTrue(validateSchemaData("boolean", "true"), "boolean 'true' failed to return true");
         Assert.isFalse(validateSchemaData("boolean", "notTrue"), "boolean 'notTrue' failed to return false");
         // base64Binary
         Assert.isTrue(validateSchemaData("base64Binary", "WEZvcm1zIFJ1bGVz"), "base64Binary 'WEZvcm1zIFJ1bGVz' failed to return true");
         Assert.isFalse(validateSchemaData("base64Binary", "WEZvcm!!!FJ1bGVz"), "base64Binary 'WEZvcm!!!FJ1bGVz' failed to return false");
         // hexBinary
         Assert.isTrue(validateSchemaData("hexBinary", "DEADBEEF"), "hexBinary 'DEADBEEF' failed to return true");
         Assert.isFalse(validateSchemaData("hexBinary", "LIVEBEEF"), "hexBinary 'LIVEBEEF' failed to return false");
         // float
         Assert.isTrue(validateSchemaData("float", "1e-6"), "float '1e-6' failed to return true");
         Assert.isFalse(validateSchemaData("float", "+-1e-6"), "float '+-1e-6' failed to return false");
         // decimal
         Assert.isTrue(validateSchemaData("decimal", "12678967.543233"), "decimal '12678967.543233' failed to return true");
         Assert.isFalse(validateSchemaData("decimal", "12678967.543.233"), "decimal '12678967.543.233' failed to return false");
         // double
         Assert.isTrue(validateSchemaData("double", "INF"), "double 'INF' failed to return true");
         Assert.isFalse(validateSchemaData("double", "INFINITY"), "double 'INFINITY' failed to return false");
         // anyURI
         Assert.isTrue(validateSchemaData("anyURI", "http://example.com/data/potato"), "anyURI 'http://example.com/data/potato' failed to return true");
         Assert.isFalse(validateSchemaData("anyURI", "% 6 7"), "anyURI '% 6 7' failed to return false");
         // QName
         Assert.isTrue(validateSchemaData("QName", "my:myelement"), "QName 'my:myelement' failed to return true");
         Assert.isFalse(validateSchemaData("QName", "my::myelement"), "QName 'my::myelement' failed to return false");
         // normalizedString
         Assert.isTrue(validateSchemaData("normalizedString", "AString"), "normalizedString 'AString' failed to return true");
         Assert.isFalse(validateSchemaData("normalizedString", "A String"), "normalizedString 'A String' failed to return false");
         // token
         Assert.isTrue(validateSchemaData("token", "thisIsAToken"), "token 'thisIsAToken' failed to return true");
         Assert.isFalse(validateSchemaData("token", "Invalid  Token"), "token 'Invalid  Token' failed to return false");
         // language
         Assert.isTrue(validateSchemaData("language", "en"), "language 'en' failed to return true");
         Assert.isFalse(validateSchemaData("language", "e4"), "language 'e4' failed to return false");
         // Name
         Assert.isTrue(validateSchemaData("Name", "ev:name"), "Name 'ev:name' failed to return true");
         Assert.isFalse(validateSchemaData("Name", "ev!name"), "Name 'ev!name' failed to return false");
         // NCName
         Assert.isTrue(validateSchemaData("NCName", "name"), "NCName 'name' failed to return true");
         Assert.isFalse(validateSchemaData("NCName", "name:"), "NCName 'name' failed to return false");
         // ID
         Assert.isTrue(validateSchemaData("ID", "identifier"), "ID 'identifier' failed to return true");
         Assert.isFalse(validateSchemaData("ID", "identifier:"), "ID 'identifier:' failed to return false");
         // IDREF
         Assert.isTrue(validateSchemaData("IDREF", "idref-one"), "IDREF 'idref-one' failed to return true");
         Assert.isFalse(validateSchemaData("IDREF", "idref:one"), "IDREF 'idref:one' failed to return false");
         // IDREFS
         Assert.isTrue(validateSchemaData("IDREFS", "idref-one idref-two"), "IDREFS 'idref-one idref-two' failed to return true");
         Assert.isFalse(validateSchemaData("IDREFS", "idref:one idref:two"), "IDREFS 'idref:one idref-two' failed to return false");
         // NMTOKEN
         Assert.isTrue(validateSchemaData("NMTOKEN", "name"), "NMTOKEN 'name' failed to return true");
         Assert.isFalse(validateSchemaData("NMTOKEN", "name*"), "NMTOKEN 'name*' failed to return false");
         // NMTOKENS
         Assert.isTrue(validateSchemaData("NMTOKENS", "name1 name2"), "NMTOKENS 'name1 name2' failed to return true");
         Assert.isFalse(validateSchemaData("NMTOKENS", "name*1 name*2"), "NMTOKENS 'name*1 name*2' failed to return false");
         // integer
         Assert.isTrue(validateSchemaData("integer", "32"), "integer '32' failed to return true");
         Assert.isFalse(validateSchemaData("integer", "32A"), "integer '32A' failed to return false");
         // nonPositiveInteger
         Assert.isTrue(validateSchemaData("nonPositiveInteger", "-1"), "nonPositiveInteger '-1' failed to return true");
         Assert.isFalse(validateSchemaData("nonPositiveInteger", "32"), "nonPositiveInteger '32' failed to return false");
         // negativeInteger
         Assert.isTrue(validateSchemaData("negativeInteger", "-1"), "negativeInteger '-1' failed to return true");
         Assert.isFalse(validateSchemaData("negativeInteger", "-1A"), "negativeInteger '-1A' failed to return false");
         // long
         Assert.isTrue(validateSchemaData("long", "-9223372036854775808"), "long '-9223372036854775808' failed to return true");
         Assert.isFalse(validateSchemaData("long", "-9223372036854775808A"), "long '-9223372036854775808A' failed to return false");
         // int
         Assert.isTrue(validateSchemaData("int", "-2147483648"), "int '-2147483648' failed to return true");
         Assert.isFalse(validateSchemaData("int", "-2147483648A"), "int '-2147483648A' failed to return false");
         // short
         Assert.isTrue(validateSchemaData("short", "-32768"), "short '-32768' failed to return true");
         Assert.isFalse(validateSchemaData("short", "-32768A"), "short '-32768A' failed to return false");
         // byte
         Assert.isTrue(validateSchemaData("byte", "-128"), "byte '-128' failed to return true");
         Assert.isFalse(validateSchemaData("byte", "-128A"), "short '-128A' failed to return false");
         // nonNegativeInteger
         Assert.isTrue(validateSchemaData("nonNegativeInteger", "1"), "nonNegativeInteger '1' failed to return true");
         Assert.isFalse(validateSchemaData("nonNegativeInteger", "1A"), "nonNegativeInteger '1A' failed to return false");
         // unsignedLong
         Assert.isTrue(validateSchemaData("unsignedLong", "18446744073709551615"), "unsignedLong '18446744073709551615' failed to return true");
         Assert.isFalse(validateSchemaData("unsignedLong", "18446744073709551615A"), "unsignedLong '18446744073709551615A' failed to return false");
         // unsignedInt
         Assert.isTrue(validateSchemaData("unsignedInt", "4294967295"), "unsignedInt '4294967295' failed to return true");
         Assert.isFalse(validateSchemaData("unsignedInt", "4294967295A"), "unsignedInt '4294967295A' failed to return false");
         // unsignedShort
         Assert.isTrue(validateSchemaData("unsignedShort", "65535"), "unsignedShort '65535' failed to return true");
         Assert.isFalse(validateSchemaData("unsignedShort", "65535A"), "unsignedShort '65535A' failed to return false");
         // unsignedByte
         Assert.isTrue(validateSchemaData("unsignedByte", "255"), "unsignedByte '255' failed to return true");
         Assert.isFalse(validateSchemaData("unsignedByte", "255A"), "unsignedByte '255A' failed to return false");
         // positiveInteger
         Assert.isTrue(validateSchemaData("positiveInteger", "+10000"), "positiveInteger '+10000' failed to return true");
         Assert.isFalse(validateSchemaData("positiveInteger", "-10000"), "positiveInteger '-10000' failed to return false");
    } 
});

var oXFormsBultinPrimitiveTypeTest = new YAHOO.tool.TestCase({
    name        : "Test XForms built-in primitive types validation",
    setUp       :   function() {
    },  
    tearDown : function() {
    }, // tearDown()
    test:  
    function() {
         // dateTime
         Assert.isTrue(validateXFormsData("dateTime", "1999-05-31T13:20:00-05:00"), "dateTime '1999-05-31T13:20:00-05:00' failed to return true");
         Assert.isFalse(validateXFormsData("dateTime", "1999-MM-DDT13:20:00-05:00"), "dateTime '1999-MM-DDT13:20:00-05:00' failed to return false");
         // time
         Assert.isTrue(validateXFormsData("time", "13:20:00-05:00"), "time '13:20:00-05:00' failed to return true");
         Assert.isFalse(validateXFormsData("time", "13:HH:00-05:00"), "time '13:HH:00-05:00' failed to return false");
         // date
         Assert.isTrue(validateXFormsData("date", "1999-05-31"), "date '1999-05-31' failed to return true");
         Assert.isFalse(validateXFormsData("date", "1999-MM-DD"), "date '1999-MM-DD' failed to return false");
         // gYearMonth
         Assert.isTrue(validateXFormsData("gYearMonth", "1999-05"), "gYearMonth '1999-05' failed to return true");
         Assert.isFalse(validateXFormsData("gYearMonth", "1999---"), "gYearMonth '1999---' failed to return false");
         // gYear
         Assert.isTrue(validateXFormsData("gYear", "1999"), "gYear '1999' failed to return true");
         Assert.isFalse(validateXFormsData("gYear", "YYYY"), "gYear 'YYYY' failed to return false");
         // gMonthDay
         Assert.isTrue(validateXFormsData("gMonthDay", "--09-14"), "gMonthDay '--09-14' failed to return true");
         Assert.isFalse(validateXFormsData("gMonthDay", "09-14"), "gMonthDay '09-14' failed to return false");
         // gDay
         Assert.isTrue(validateXFormsData("gDay", "---15"), "gDay '---15' failed to return true");
         Assert.isFalse(validateXFormsData("gDay", "15"), "gDay '15' failed to return false");
         // gMonth
         Assert.isTrue(validateXFormsData("gMonth", "--11"), "gMonth '--11' failed to return true");
         Assert.isFalse(validateXFormsData("gMonth", "11"), "gMonth '11' failed to return false");
         // boolean
         Assert.isTrue(validateXFormsData("boolean", "true"), "boolean 'true' failed to return true");
         Assert.isFalse(validateXFormsData("boolean", "notTrue"), "boolean 'notTrue' failed to return false");
         // base64Binary
         Assert.isTrue(validateXFormsData("base64Binary", "WEZvcm1zIFJ1bGVz"), "base64Binary 'WEZvcm1zIFJ1bGVz' failed to return true");
         Assert.isFalse(validateXFormsData("base64Binary", "WEZvcm!!!FJ1bGVz"), "base64Binary 'WEZvcm!!!FJ1bGVz' failed to return false");
         // hexBinary
         Assert.isTrue(validateXFormsData("hexBinary", "DEADBEEF"), "hexBinary 'DEADBEEF' failed to return true");
         Assert.isFalse(validateXFormsData("hexBinary", "LIVEBEEF"), "hexBinary 'LIVEBEEF' failed to return false");
         // float
         Assert.isTrue(validateXFormsData("float", "1e-6"), "float '1e-6' failed to return true");
         Assert.isFalse(validateXFormsData("float", "+-1e-6"), "float '+-1e-6' failed to return false");
         // decimal
         Assert.isTrue(validateXFormsData("decimal", "12678967.543233"), "decimal '12678967.543233' failed to return true");
         Assert.isFalse(validateXFormsData("decimal", "12678967.543.233"), "decimal '12678967.543.233' failed to return false");
         // double
         Assert.isTrue(validateXFormsData("double", "INF"), "double 'INF' failed to return true");
         Assert.isFalse(validateXFormsData("double", "INFINITY"), "double 'INFINITY' failed to return false");
         // anyURI
         Assert.isTrue(validateXFormsData("anyURI", "http://example.com/data/potato"), "anyURI 'http://example.com/data/potato' failed to return true");
         Assert.isFalse(validateXFormsData("anyURI", "% 6 7"), "anyURI '% 6 7' failed to return false");
         // QName
         Assert.isTrue(validateXFormsData("QName", "my:myelement"), "QName 'my:myelement' failed to return true");
         Assert.isFalse(validateXFormsData("QName", "my::myelement"), "QName 'my::myelement' failed to return false");
    } 
});

var oXFormsBultinDerivedTypeTest = new YAHOO.tool.TestCase({
    name        : "Test XForms built-in derived types validation",
    setUp       :   function() {
    },  
    tearDown : function() {
    }, // tearDown()
    test:  
    function() {
         // normalizedString
         Assert.isTrue(validateXFormsData("normalizedString", "AString"), "normalizedString 'AString' failed to return true");
         Assert.isFalse(validateXFormsData("normalizedString", "A String"), "normalizedString 'A String' failed to return false");
         // listItem
         Assert.isTrue(validateXFormsData("listItem", "Red"), "listItem 'Red' failed to return true");
         Assert.isFalse(validateXFormsData("listItem", "R\te\td"), "listItem 'R\te\td' failed to return false");
         // listItems
         Assert.isTrue(validateXFormsData("listItems", "Red Blue Green"), "listItems 'Red Blue Green' failed to return true");
         Assert.isFalse(validateXFormsData("listItems", "Red\tBlue\tGreen"), "listItems 'Red\tBlue\tGreen' failed to return false");
         // token
         Assert.isTrue(validateXFormsData("token", "thisIsAToken"), "token 'thisIsAToken' failed to return true");
         Assert.isFalse(validateXFormsData("token", "Invalid  Token"), "token 'Invalid  Token' failed to return false");
         // language
         Assert.isTrue(validateXFormsData("language", "en"), "language 'en' failed to return true");
         Assert.isFalse(validateXFormsData("language", "e4"), "language 'e4' failed to return false");
         // Name
         Assert.isTrue(validateXFormsData("Name", "ev:name"), "Name 'ev:name' failed to return true");
         Assert.isFalse(validateXFormsData("Name", "ev!name"), "Name 'ev!name' failed to return false");
         // NCName
         Assert.isTrue(validateXFormsData("NCName", "name"), "NCName 'name' failed to return true");
         Assert.isFalse(validateXFormsData("NCName", "name:"), "NCName 'name' failed to return false");
         // ID
         Assert.isTrue(validateXFormsData("ID", "identifier"), "ID 'identifier' failed to return true");
         Assert.isFalse(validateXFormsData("ID", "identifier:"), "ID 'identifier:' failed to return false");
         // IDREF
         Assert.isTrue(validateXFormsData("IDREF", "idref-one"), "IDREF 'idref-one' failed to return true");
         Assert.isFalse(validateXFormsData("IDREF", "idref:one"), "IDREF 'idref:one' failed to return false");
         // IDREFS
         Assert.isTrue(validateXFormsData("IDREFS", "idref-one idref-two"), "IDREFS 'idref-one idref-two' failed to return true");
         Assert.isFalse(validateXFormsData("IDREFS", "idref:one idref:two"), "IDREFS 'idref:one idref-two' failed to return false");
         // NMTOKEN
         Assert.isTrue(validateXFormsData("NMTOKEN", "name"), "NMTOKEN 'name' failed to return true");
         Assert.isFalse(validateXFormsData("NMTOKEN", "name*"), "NMTOKEN 'name*' failed to return false");
         // NMTOKENS
         Assert.isTrue(validateXFormsData("NMTOKENS", "name1 name2"), "NMTOKENS 'name1 name2' failed to return true");
         Assert.isFalse(validateXFormsData("NMTOKENS", "name*1 name*2"), "NMTOKENS 'name*1 name*2' failed to return false");
         // integer
         Assert.isTrue(validateXFormsData("integer", "32"), "integer '32' failed to return true");
         Assert.isFalse(validateXFormsData("integer", "32A"), "integer '32A' failed to return false");
         // nonPositiveInteger
         Assert.isTrue(validateXFormsData("nonPositiveInteger", "-1"), "nonPositiveInteger '-1' failed to return true");
         Assert.isFalse(validateXFormsData("nonPositiveInteger", "32"), "nonPositiveInteger '32' failed to return false");
         // negativeInteger
         Assert.isTrue(validateXFormsData("negativeInteger", "-1"), "negativeInteger '-1' failed to return true");
         Assert.isFalse(validateXFormsData("negativeInteger", "-1A"), "negativeInteger '-1A' failed to return false");
         // long
         Assert.isTrue(validateXFormsData("long", "-9223372036854775808"), "long '-9223372036854775808' failed to return true");
         Assert.isFalse(validateXFormsData("long", "-9223372036854775808A"), "long '-9223372036854775808A' failed to return false");
         // int
         Assert.isTrue(validateXFormsData("int", "-2147483648"), "int '-2147483648' failed to return true");
         Assert.isFalse(validateXFormsData("int", "-2147483648A"), "int '-2147483648A' failed to return false");
         // short
         Assert.isTrue(validateXFormsData("short", "-32768"), "short '-32768' failed to return true");
         Assert.isFalse(validateXFormsData("short", "-32768A"), "short '-32768A' failed to return false");
         // byte
         Assert.isTrue(validateXFormsData("byte", "-128"), "byte '-128' failed to return true");
         Assert.isFalse(validateXFormsData("byte", "-128A"), "short '-128A' failed to return false");
         // nonNegativeInteger
         Assert.isTrue(validateXFormsData("nonNegativeInteger", "1"), "nonNegativeInteger '1' failed to return true");
         Assert.isFalse(validateXFormsData("nonNegativeInteger", "1A"), "nonNegativeInteger '1A' failed to return false");
         // unsignedLong
         Assert.isTrue(validateXFormsData("unsignedLong", "18446744073709551615"), "unsignedLong '18446744073709551615' failed to return true");
         Assert.isFalse(validateXFormsData("unsignedLong", "18446744073709551615A"), "unsignedLong '18446744073709551615A' failed to return false");
         // unsignedInt
         Assert.isTrue(validateXFormsData("unsignedInt", "4294967295"), "unsignedInt '4294967295' failed to return true");
         Assert.isFalse(validateXFormsData("unsignedInt", "4294967295A"), "unsignedInt '4294967295A' failed to return false");
         // unsignedShort
         Assert.isTrue(validateXFormsData("unsignedShort", "65535"), "unsignedShort '65535' failed to return true");
         Assert.isFalse(validateXFormsData("unsignedShort", "65535A"), "unsignedShort '65535A' failed to return false");
         // unsignedByte
         Assert.isTrue(validateXFormsData("unsignedByte", "255"), "unsignedByte '255' failed to return true");
         Assert.isFalse(validateXFormsData("unsignedByte", "255A"), "unsignedByte '255A' failed to return false");
         // positiveInteger
         Assert.isTrue(validateXFormsData("positiveInteger", "+10000"), "positiveInteger '+10000' failed to return true");
         Assert.isFalse(validateXFormsData("positiveInteger", "-10000"), "positiveInteger '-10000' failed to return false");
    } 
});

var oXFormsDayTimeDurationTypeTest = new YAHOO.tool.TestCase({
    name        : "Test xf:dayTimeDuration validation",
    setUp       :   function() {
	this.testDIV = document.createElement( "div" );
	this.testInstance = new Instance( this.testDIV );
	this.testInstance.replaceDocument(
		xmlParse(
			"<ID xmlns=''></ID>"
		)
	);
    },
    
    tearDown : function() {
		delete this.testDIV;
		this.testDIV = null;
		delete this.testInstance;
		this.testInstance = null;	
		return;
    }, // tearDown()
    
    testDayTimeDurationType:  
    function() {
    	Assert.isTrue(validateXFormsData("dayTimeDuration", "P5DT3H4M2S"), "dayTimeDuration P5DT3H4M2S failed to return true");
    	Assert.isFalse(validateXFormsData("dayTimeDuration", "Y2M30DSS"), "dayTimeDuration Y2M30DSS failed to return true");
    	Assert.isTrue(validateXFormsData("dayTimeDuration", "P1Y2M"), "dayTimeDuration P1Y2M failed to return true");
    	Assert.isFalse(validateXFormsData("dayTimeDuration", "P1Y2MD"), "dayTimeDuration P1Y2MD failed to return true");
    }    
});

var oXFormsYearMonthDurationTypeTest = new YAHOO.tool.TestCase({
    name        : "Test xf:yearMonthDuration validation",
    setUp       :   function() {
	this.testDIV = document.createElement( "div" );
	this.testInstance = new Instance( this.testDIV );
	this.testInstance.replaceDocument(
		xmlParse(
			"<ID xmlns=''></ID>"
		)
	);

    },
    
    tearDown : function() {
		delete this.testDIV;
		this.testDIV = null;
		delete this.testInstance;
		this.testInstance = null;		
		return;
    }, // tearDown()
    
    testYearMonthDurationType:  
    function() {
    	Assert.isTrue(validateXFormsData("yearMonthDuration", "P1Y2M"), "yearMonthDuration P1Y2M failed to return true");
    	Assert.isFalse(validateXFormsData("yearMonthDuration", "P34MX689Y"), "yearMonthDuration P34MX689Y failed to return false");
    	Assert.isTrue(validateXFormsData("yearMonthDuration", "PT1H1M6S"), "yearMonthDuration PT1H1M6S failed to return true");
    	Assert.isFalse(validateXFormsData("yearMonthDuration", "KT10H2M9S900"), "yearMonthDuration KT10H2M9S900 failed to return false");
    }    
});

var oXFormsEmailTypeTest = new YAHOO.tool.TestCase({
    name        : "Test xf:email validation",
    setUp       :   function() {
    },  
    tearDown : function() {
		return;
    }, // tearDown()    
    testEmailType:  
    function() {
    	Assert.isTrue(validateXFormsData("email", "editors@example.com"), "email editors@example.com failed to return true");
    	Assert.isFalse(validateXFormsData("email", "editors{at}example{dot}info"), "email editors{at}example{dot}info failed to return false");
    	Assert.isTrue(validateXFormsData("email", "~my_mail+{nospam}$?@sub-domain.example.info"), "email ~my_mail+{nospam}$?@sub-domain.example.info failed to return true");
    	Assert.isFalse(validateXFormsData("email", "editors@(this is a comment)example.info"), "email editors@(this is a comment)example.info failed to return false");
    }
});

var oXFormsCardNumberTypeTest = new YAHOO.tool.TestCase({
    name        : "Test xf:card-number validation",
    setUp       :   function() {
    },  
    tearDown : function() {
		return;
    }, // tearDown() 
    testCardNumberType:
    function() {
    	Assert.isTrue(validateXFormsData("card-number", "012345678910"), "card-number 012345678910 failed to return true");
    	Assert.isTrue(validateXFormsData("card-number", "1234567891011121314"), "card-number 1234567891011121314 failed to return true");
    	Assert.isFalse(validateXFormsData("card-number", "0II23581321"), "card-number 0II23581321 failed to return false");
    	Assert.isFalse(validateXFormsData("card-number", "0112E581321345589144"), "card-number 0112E581321345589144 failed to return false");
    	Assert.isTrue(validateXFormsData("card-number", "4111111111111111"), "card-number 4111111111111111 failed to return true");
    }    
});


var suiteTypeValidator = new YAHOO.tool.TestSuite("Test Type Validator");
suiteTypeValidator.add(oXMLSchemaTypeTest);
suiteTypeValidator.add(oXFormsBultinPrimitiveTypeTest);
suiteTypeValidator.add(oXFormsBultinDerivedTypeTest);
suiteTypeValidator.add(oXFormsDayTimeDurationTypeTest);
suiteTypeValidator.add(oXFormsYearMonthDurationTypeTest);
suiteTypeValidator.add(oXFormsEmailTypeTest);
suiteTypeValidator.add(oXFormsCardNumberTypeTest);
