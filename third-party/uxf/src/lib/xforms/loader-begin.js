//  var oLogReader = new YAHOO.widget.LogReader("fc-logger",{top:"50%",right:"10px"});
//  document.logger = new YAHOO.widget.LogWriter("ajaxfP");
document.logger = {
	log: function(sText, sContext) {}
};

var loader = new YAHOO.util.YUILoader();

window.onload = function(o) {
	InsertElementForOnloadXBL();
};
