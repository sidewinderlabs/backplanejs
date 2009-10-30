(function() {
	var Assert = YAHOO.util.Assert;
	var base, dict;

	var suite = new YAHOO.tool.TestSuite({
		name: "buildGetUrl()"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test building URIs with buildGetUrl()",

	    setUp: function () {
	      base = "http://a/b/c/d;p?q";
	      dict = [ ];
	    },

	    tearDown: function () {
	      base = null;
	      dict.length = 0;
	    },

	    testBuildUrlDefaultSeparator: function () {
	      dict[ "a" ] = "b";
	      dict[ "c" ] = "d";
	      Assert.areEqual("http://webBackplane.com?a=b&c=d", buildGetUrl("http://webBackplane.com", dict));
	    },

	    testBuildUrlExplicitSeparator: function () {
	      dict[ "a" ] = "b";
	      dict[ "c" ] = "d";
	      Assert.areEqual("http://webBackplane.com?a=b&c=d", buildGetUrl("http://webBackplane.com", dict, "&"));
	      Assert.areEqual("http://webBackplane.com?a=b;c=d", buildGetUrl("http://webBackplane.com", dict, ";"));
	    },

	    testBuildUrlControlCharacters: function () {
	      dict[ "a" ] = "\0"; /* NUL */
	      dict[ "b" ] = "\r"; /* CR */
	      dict[ "c" ] = "\x08"; /* TAB */
	      Assert.areEqual("http://webBackplane.com?a=%00&b=%0D&c=%08", buildGetUrl("http://webBackplane.com", dict));
	    },

	    testBuildUrlEscapeReservedCharacters: function () {
	      dict[ "a" ] = "$";
	      dict[ "b" ] = "&";
	      dict[ "c" ] = "+";
	      dict[ "d" ] = ",";
	      dict[ "e" ] = "/";
	      dict[ "f" ] = ":";
	      dict[ "g" ] = "=";
	      dict[ "h" ] = "?";
	      dict[ "i" ] = "@";
	      Assert.areEqual(
	      	"http://webBackplane.com?a=%24&b=%26&c=%2B&d=%2C&e=%2F&f=%3A&g=%3D&h=%3F&i=%40",
	      	buildGetUrl("http://webBackplane.com", dict)
	      );
	    },

	    testBuildUrlEscapeUnsafeCharacters: function () {
	      dict[ "a" ] = " ";
	      dict[ "b" ] = "\"";
	      dict[ "c" ] = "<";
	      dict[ "d" ] = ">";
	      dict[ "e" ] = "#";
	      dict[ "f" ] = "%";
	      dict[ "g" ] = "{";
	      dict[ "h" ] = "}";
	      dict[ "i" ] = "|";
	      dict[ "j" ] = "\\";
	      dict[ "k" ] = "^";
	      dict[ "l" ] = "[";
	      dict[ "m" ] = "]";
	      dict[ "n" ] = "`";
	      Assert.areEqual(
	      	"http://webBackplane.com?a=%20&b=%22&c=%3C&d=%3E&e=%23&f=%25&g=%7B&h=%7D&i=%7C&j=%5C&k=%5E&l=%5B&m=%5D&n=%60",
	      	buildGetUrl("http://webBackplane.com", dict)
	      );
	     },

	    testBuildUrlInternationalCharacters: function () {
	      dict[ "name" ] = "P\xE9l\xE9"; /* 'Pélé' */
	      Assert.areEqual("http://webBackplane.com?name=P%C3%A9l%C3%A9", buildGetUrl("http://webBackplane.com", dict));
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());