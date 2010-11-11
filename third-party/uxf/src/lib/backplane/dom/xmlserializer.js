if (typeof(XMLSerializer) == "undefined") {
	XMLSerializer = function() { };

	XMLSerializer.prototype.serializeToString = function(node) {
		if (node.xml) {
			var str = node.xml;

			/**
			 * MSXML likes to add a trailing CR+LF, so remove it.
			 */
			if(node.nodeType == 9) {//doc
				//fix processing instruction, ie don't show encoding
				str = str.replace(/<\?xml.*?\?>\r/, '<?xml ' + node.firstChild.nodeValue + '?>');
			}
			return str.replace(/\r\n$/, "")
			.replace(/( ux_uid.*?".*?")/g, "");//remove ux_uid* attributes (see UX.getNodeUID for info about this attr)
		}
		return null;
	};
}
