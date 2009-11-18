(function () {
	var loader = new YAHOO.util.YUILoader({
		base: "http://ajax.googleapis.com/ajax/libs/yui/2.8.0r4/build/",
		require: [ "logger", "yuitest"],
		loadOptional: false,
		combine: false,
		filter: "MIN",
		allowRollup: true,
		onSuccess: function () {
			var loader = new YAHOO.util.YUILoader({
				base: "",
				onSuccess: function () {
					var logger = new YAHOO.tool.TestLogger();

					YAHOO.tool.TestRunner.run();
				}
			});
			loader.addModule({
				name: "tests",
				type: "js",
				path: "unit-tests.js"
			});
			loader.require("tests");
			loader.insert();
		}
	});

	loader.addModule({
		name: "logger-css", type: "css", path: "logger/assets/logger.css"
	});
	loader.addModule({
		name: "test-logger-css", type: "css", path: "yuitest/assets/testlogger.css"
	});
	loader.require("logger-css", "test-logger-css");
	loader.insert();
})();