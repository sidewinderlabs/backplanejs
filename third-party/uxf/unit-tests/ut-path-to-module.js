var Assert = YAHOO.util.Assert;

var oSuitePathToModule = new YAHOO.tool.TestSuite({
	name : "Test getPathToModule",
	setUp		: 	function()
	{
          var arrScripts = [
            "../somescript0.js",
            "../../../../somescript1.js",
            "/scripts/somescript2.js",
            "http://www.example.com/somescript3.js",
            "/somescripts.js/somescripts.js",
            "xy/absomescript4.js",
            "http://www.example.com/somescript4.js",
            "c:\\somedir\\somescript5.js",
            "somescript6.js"
          ];
          var childNodes = document.childNodes; 
          var l = childNodes.length;
          var i;
          var head = document.getElementsByTagName("head")[0];
          
          this.addedElements = [];
          l = arrScripts.length;
          for (i = 0 ; i < l ; ++i) {
            el = document.createElement("script");
            //IE7 tries to interpret these unfound files when loading, 
            //  and throws an uncatchable "invalid character" error
            //  telling it that it's just plain text prevents this.
            el.setAttribute("type","text/plain");
            this.addedElements.push(el);
            el.setAttribute("src", arrScripts[i]);
            head.appendChild(el);
          }
	},
	
	tearDown : function() {
	   var el = this.addedElements.pop();
	   while(el) {
	     el.parentNode.removeChild(el);
	     el = this.addedElements.pop();
	   }
	}
});


var oTestGetPathToModule = new YAHOO.tool.TestCase({
	name		:	"Test oTestGetPathToModule",
	
	_should: { 
		error: { 
			testGetPathToModuleThatDoesNotExist : true,
			testGetPathToModuleWithNoArg : true,
	    testGetPathToModuleWithNullArg : true
		} 
	}, 
	testGetPathToModuleRelative:
	function() {
		Assert.areEqual(pathToModule("somescript0"), "../");
		Assert.areEqual(pathToModule("somescript1"), "../../../../");
		Assert.areEqual(pathToModule("somescript2"), "/scripts/");
	},

	testGetPathToModuleAbsolute:
	function() {
		Assert.areEqual(pathToModule("somescript3"), "http://www.example.com/");
	},
	
	testGetPathToModuleWithDuplicateNameInPath:
	function() {
		Assert.areEqual(pathToModule("somescripts"), "/somescripts.js/");
	},
	
	testGetPathToModuleWithPrecedingSimilarlyNamedScript:
	function() {
		Assert.areEqual(pathToModule("absomescript4"), "xy/");
		Assert.areNotEqual(pathToModule("somescript4"), "xy/");
		Assert.areEqual(pathToModule("somescript4"), "http://www.example.com/");
	},
	
	testGetPathToModuleOnFileSystem:
	function() {
		Assert.areEqual(pathToModule("somescript5"), "c:\\somedir\\");
	},
	
	testGetPathToModuleInSameDirectory:
	function() {
		Assert.areSame(pathToModule("somescript6"), "");
	},

	testGetPathToModuleThatDoesNotExist:
	function() {
	  pathToModule("Quirkafleeg");
	},

	testGetPathToModuleWithNoArg:
	function() {
	  pathToModule();
	},
	
	testGetPathToModuleWithNullArg:
	function() {
	  pathToModule(null);
	}

	
});

oSuitePathToModule.add(oTestGetPathToModule);
