(function() {
	var elIframe = document.createElement("iframe");

	YAHOO.util.Event.addListener(
		elIframe,
		"load",
		function() {
			var
				doc = this.contentDocument || this.contentWindow.document,
				elPanel = doc.createElement("div"),
				elScript = doc.createElement("script"),
				elTable = doc.createElement("div"),
				elTree = doc.createElement("div")
				;

			doc.runContext = document.runContext;

			elScript.setAttribute("src", baseDefaultPath + "ubiquity-loader.js");
			elScript.setAttribute("type", "text/javascript");
			var head = doc.getElementsByTagName("head");
			if (head && head.length) {
				head = head[0];
			} else {
				head = doc.createElement("head");
				doc.firstChild.insertBefore(head, doc.firstChild.firstChild);
			}
			head.appendChild(elScript);

			elPanel.setAttribute("id", "panel");
			doc.body.appendChild(elPanel);

			elTable.setAttribute("id", "table");
			elPanel.appendChild(elTable);
			this.elTable = elTable;

			elTree.setAttribute("id", "tree");
			elPanel.appendChild(elTree);
			this.elTree = elTree;

			return;
		}
	);//load handler

	elIframe.setAttribute("style", "\
		width: 100%; \
		height: 300px; \
		padding: 0; \
		margin: 0; \
		overflow: hidden; \
		position: fixed; \
		bottom: 0; \
		left: 0; \
		border: 0; \
		z-index: 999; \
	");
	elIframe.setAttribute("frameborder", "0");
	elIframe.setAttribute("hspace", "0");
	elIframe.setAttribute("vspace", "0");
	elIframe.setAttribute("scrolling", "no");
	elIframe.setAttribute("allowtransparency", "yes");
	document.body.appendChild(elIframe);
  return;
})();
