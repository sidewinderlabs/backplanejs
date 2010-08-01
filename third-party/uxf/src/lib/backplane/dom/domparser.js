// From https://sites.google.com/a/van-steenbeek.net/archive/explorer_domparser_parsefromstring

if (typeof(DOMParser) == "undefined") {
	DOMParser = function() { };

	DOMParser.prototype.parseFromString = function(str, contentType) {
		var doc = null;

		if (document.DOMImplementation && document.DOMImplementation.createDocument) {
			doc = document.DOMImplementation.createDocument();

			doc.loadXML(str);
		} else if (typeof(XMLHttpRequest) != "undefined") {
			doc = new XMLHttpRequest;

			contentType = contentType || "application/xml";
			doc.open("GET", "data:" + contentType + ";charset=utf-8," + encodeURIComponent(str), false);
			if (doc.overrideMimeType) {
				doc.overrideMimeType(contentType);
			}
			doc.send(null);
			doc = doc.responseXML;
		}
		return doc;
	};
}
