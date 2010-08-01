if (typeof(XMLSerializer) == "undefined") {
	XMLSerializer = function() { };

	XMLSerializer.prototype.serializeToString = function(node) {
		if (node.xml) {
			var str = node.xml;

			/**
			 * MSXML likes to add a trailing CR+LF, so remove it.
			 */

			return str.replace(/\r\n$/, "");
		}
		return null;
	};
}
