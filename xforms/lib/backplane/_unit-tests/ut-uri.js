(function() {
	var Assert = YAHOO.util.Assert;
	var r;

	var suite = new YAHOO.tool.TestSuite({
		name: "URI"
	});

	// Test reference resolution, as per:
	//
	//  http://gbiv.com/protocols/uri/rfc/rfc3986.html#reference-examples
	//
	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test using RFC3986 Examples",
	
	    setUp: function () {
	      this.base = "http://a/b/c/d;p?q";
	    },
	
	    tearDown: function () {
	      this.base = null;
	    },
	
	    testReferenceResolutionNormal : function () {
	      Assert.areEqual("g:h", makeAbsoluteURI(this.base, "g:h"), "'g:h' failed");
	      Assert.areEqual("http://a/b/c/g", makeAbsoluteURI(this.base, "g"), "'g' failed");
	      Assert.areEqual("http://a/b/c/g/", makeAbsoluteURI(this.base, "g/"), "'g/' failed");
	      Assert.areEqual("http://a/g", makeAbsoluteURI(this.base, "/g"), "'/g' failed");
	      Assert.areEqual("http://g", makeAbsoluteURI(this.base, "//g"), "'//g' failed");
	      Assert.areEqual("http://a/b/c/d;p?y", makeAbsoluteURI(this.base, "?y"), "'?y' failed");
	      Assert.areEqual("http://a/b/c/g?y", makeAbsoluteURI(this.base, "g?y"), "'g?y' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#s", makeAbsoluteURI(this.base, "#s"), "'#s' failed");
	      Assert.areEqual("http://a/b/c/g#s", makeAbsoluteURI(this.base, "g#s"), "'g#s' failed");
	      Assert.areEqual("http://a/b/c/g?y#s", makeAbsoluteURI(this.base, "g?y#s"), "'g?y#s' failed");
	      Assert.areEqual("http://a/b/c/;x", makeAbsoluteURI(this.base, ";x"), "';x' failed");
	      Assert.areEqual("http://a/b/c/g;x", makeAbsoluteURI(this.base, "g;x"), "'g;x' failed");
	      Assert.areEqual("http://a/b/c/g;x?y#s", makeAbsoluteURI(this.base, "g;x?y#s"), "'g;x?y#s' failed");
	      Assert.areEqual("http://a/b/c/d;p?q", makeAbsoluteURI(this.base, ""), "'' failed");
	    },
	
	    testReferenceResolutionDotSegments : function () {
	      Assert.areEqual("http://a/b/c/g", makeAbsoluteURI(this.base, "./g"), "'./g' failed");
	      Assert.areEqual("http://a/b/c/", makeAbsoluteURI(this.base, "."), "'.' failed");
	      Assert.areEqual("http://a/b/c/", makeAbsoluteURI(this.base, "./"), "'./' failed");
	      Assert.areEqual("http://a/b/", makeAbsoluteURI(this.base, ".."), "'..' failed");
	      Assert.areEqual("http://a/b/", makeAbsoluteURI(this.base, "../"), "'../' failed");
	      Assert.areEqual("http://a/b/g", makeAbsoluteURI(this.base, "../g"), "'../' failed");
	      Assert.areEqual("http://a/", makeAbsoluteURI(this.base, "../.."), "'../..' failed");
	      Assert.areEqual("http://a/", makeAbsoluteURI(this.base, "../../"), "'../../' failed");
	      Assert.areEqual("http://a/g", makeAbsoluteURI(this.base, "../../g"), "'../../g' failed");
	    },
	
	    testReferenceResolutionDotDotCannotChangeAuthority : function () {
	      Assert.areEqual("http://a/g", makeAbsoluteURI(this.base, "../../../g"), "'../../../g' failed");
	      Assert.areEqual("http://a/g", makeAbsoluteURI(this.base, "../../../../g"), "'../../../../g' failed");
	    },
	
	    testReferenceResolutionDotSegmentsOnlyRemovedWhenInPathComponent : function () {
	      Assert.areEqual("http://a/g", makeAbsoluteURI(this.base, "/./g"), "'/./g' failed");
	      Assert.areEqual("http://a/g", makeAbsoluteURI(this.base, "/../g"), "'/../g' failed");
	      Assert.areEqual("http://a/b/c/g.", makeAbsoluteURI(this.base, "g."), "'g.' failed");
	      Assert.areEqual("http://a/b/c/.g", makeAbsoluteURI(this.base, ".g"), "'.g' failed");
	      Assert.areEqual("http://a/b/c/g..", makeAbsoluteURI(this.base, "g.."), "'g..' failed");
	      Assert.areEqual("http://a/b/c/..g", makeAbsoluteURI(this.base, "..g"), "'..g' failed");
	    },
	
	    testReferenceResolutionDotDotUnnecessary : function () {
	      Assert.areEqual("http://a/b/g", makeAbsoluteURI(this.base, "./../g"), "'./../g' failed");
	      Assert.areEqual("http://a/b/c/g/", makeAbsoluteURI(this.base, "./g/."), "'./g/.' failed");
	      Assert.areEqual("http://a/b/c/g/h", makeAbsoluteURI(this.base, "g/./h"), "'g/./h' failed");
	      Assert.areEqual("http://a/b/c/h", makeAbsoluteURI(this.base, "g/../h"), "'g/../h' failed");
	      Assert.areEqual("http://a/b/c/g;x=1/y", makeAbsoluteURI(this.base, "g;x=1/./y"), "'g;x=1/./y' failed");
	      Assert.areEqual("http://a/b/c/y", makeAbsoluteURI(this.base, "g;x=1/../y"), "'g;x=1/../y' failed");
	    },
	
	    testReferenceResolutionPreserveDotSegmentsInFragments : function () {
	      Assert.areEqual("http://a/b/c/g?y/./x", makeAbsoluteURI(this.base, "g?y/./x"), "'g?y/./x' failed");
	      Assert.areEqual("http://a/b/c/g?y/../x", makeAbsoluteURI(this.base, "g?y/../x"), "'g?y/../x' failed");
	      Assert.areEqual("http://a/b/c/g#s/./x", makeAbsoluteURI(this.base, "g#s/./x"), "'g#s/./x' failed");
	      Assert.areEqual("http://a/b/c/g#s/../x", makeAbsoluteURI(this.base, "g#s/../x"), "'g#s/../x' failed");
	    },

	    testReferenceResolutionRelativeReferenceWhenSameScheme : function () {
	      Assert.areNotEqual("http:g", makeAbsoluteURI(this.base, "http:g"), "'http:g' failed");
	      Assert.areEqual("http://a/b/c/g", makeAbsoluteURI(this.base, "http:g"), "'http:g");
	    },

	    testReferenceResolutionStrictlyNoRelativeReferenceWhenSameScheme : function () {
	      Assert.areEqual("http:g", makeAbsoluteURI(this.base, "http:g", true), "'http:g' failed");
	      Assert.areNotEqual("http://a/b/c/g", makeAbsoluteURI(this.base, "http:g", true), "'http:g");
	    }
	  })//new TestCase
	);
	
	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test fragment identifier",
	
	    setUp: function () {
	      this.base = "http://a/b/c/d;p?q#s";
	    },
	
	    tearDown: function () {
	      this.base = null;
	    },
	
	    testFragmentIdentifierRemoved : function () {
	      Assert.areEqual("http://a/b/c/d;p?q", makeAbsoluteURI(this.base, ""), "Fragment was not removed correctly");
	    },
	
	    testFirstFragmentIdentifier : function () {
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t#u"), "'#t#u' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t#u#v"), "'#t#u#v' failed");
	    },
	
	    testFragmentFollowedByReservedCharacter : function () {
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t:"), "'#t:' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t#"), "'#t#' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t["), "'#t[' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t]"), "'#t]' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t@"), "'#t@' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t!"), "'#t!' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t$"), "'#t$' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t&"), "'#t&' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t\'"), "'#t\'' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t("), "'#t(' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t)"), "'#t)' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t*"), "'#t*' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t+"), "'#t+' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t,"), "'#t,' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t;"), "'#t;' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t", makeAbsoluteURI(this.base, "#t="), "'#t=' failed");
	    },
	
	    testFragmentFollowedByUnreservedCharacter : function () {
	      Assert.areEqual("http://a/b/c/d;p?q#t?", makeAbsoluteURI(this.base, "#t?"), "'#t?' failed");
	      Assert.areEqual("http://a/b/c/d;p?q#t/", makeAbsoluteURI(this.base, "#t/"), "'#t/' failed");
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test empty parts missing but separator present",
	
	    setUp: function () {
	      this.base = "file:///a/b/c/d.e";
	    },
	
	    tearDown: function () {
	      this.base = null;
	    },
	
	    testEmptyAuthority : function () {
	      Assert.areEqual("file:///a/b/f.g", makeAbsoluteURI(this.base, "../f.g"), "'../f.g' failed");
	    },
	
	    testEmptyQuery : function () {
	      Assert.areEqual("file:///a/b/f.g?", makeAbsoluteURI(this.base, "../f.g?"), "'../f.g?' failed");
	      Assert.areEqual("file:///a/b/f.g?#", makeAbsoluteURI(this.base, "../f.g?#"), "'../f.g?#' failed");
	    },
	
	    testEmptyFragment : function () {
	      Assert.areEqual("file:///a/b/f.g#", makeAbsoluteURI(this.base, "../f.g#"), "'../f.g#' failed");
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test dots in file-name",
	
	    setUp: function () {
	      this.base = "file:///a/b/c/d.e.f.g";
	    },
	
	    tearDown: function () {
	      this.base = null;
	    },
	
	    testDotsInFileName : function () {
	      Assert.areEqual("file:///a/b/c/h.i.j.k", makeAbsoluteURI(this.base, "h.i.j.k"), "'h.i.j.k' failed");
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test scheme",
	
	    setUp: function () {
	      this.base = "file:///a/b/c/d.e.f.g";
	    },
	
	    tearDown: function () {
	      this.base = null;
	    },
	
	    testSchemeWithNoAuthority : function () {
	      Assert.areEqual("file:///a/b/c/h.i.j.k", makeAbsoluteURI(this.base, "file:h.i.j.k"), "'file:h.i.j.k' failed");
	    }
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test spliturl()",

	    testSplitFullUrl : function () {
	    	var o = spliturl("file://localhost/a/b/c/h.i.j.k?l#m");

	      Assert.areEqual("file", o.scheme);
	      Assert.areEqual("localhost", o.authority);
	      Assert.areEqual("/a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitFullUrlEmptyAuthority : function () {
	    	var o = spliturl("file:///a/b/c/h.i.j.k?l#m");

	      Assert.areEqual("file", o.scheme);
	      Assert.areEqual("", o.authority);
	      Assert.areEqual("/a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitAbsoluteUrlNoScheme : function () {
	    	var o = spliturl("//localhost/a/b/c/h.i.j.k?l#m");

	      Assert.isNull(o.scheme);
	      Assert.areEqual("localhost", o.authority);
	      Assert.areEqual("/a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitAbsoluteUrlNoSchemeEmptyAuthority : function () {
	    	var o = spliturl("///a/b/c/h.i.j.k?l#m");

	      Assert.isNull(o.scheme);
	      Assert.areEqual("", o.authority);
	      Assert.areEqual("/a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitAbsoluteUrlNoSchemeNoAuthority : function () {
	    	var o = spliturl("/a/b/c/h.i.j.k?l#m");

	      Assert.isNull(o.scheme);
	      Assert.isNull(o.authority);
	      Assert.areEqual("/a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitAbsoluteUrlSchemeNoAuthority : function () {
	    	var o = spliturl("file:/a/b/c/h.i.j.k?l#m");

	      Assert.areEqual("file", o.scheme);
	      Assert.isNull(o.authority);
	      Assert.areEqual("/a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitRelativeUrlSchemeNoAuthority : function () {
	    	var o = spliturl("file:a/b/c/h.i.j.k?l#m");

	      Assert.areEqual("file", o.scheme);
	      Assert.isNull(o.authority);
	      Assert.areEqual("a/b/c/h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    },

	    testSplitRelativeUrlSchemeNoAuthorityNoPath : function () {
	    	var o = spliturl("file:h.i.j.k?l#m");

	      Assert.areEqual("file", o.scheme);
	      Assert.isNull(o.authority);
	      Assert.areEqual("h.i.j.k", o.path);
	      Assert.areEqual("l", o.query);
	      Assert.areEqual("m", o.fragment);
	    }
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());