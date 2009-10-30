//  var oLogReader = new YAHOO.widget.LogReader("fc-logger",{top:"50%",right:"10px"});
//  document.logger = new YAHOO.widget.LogWriter("ajaxfP");
document.logger = { log: function(sText, sContext) { } };

var loader = new YAHOO.util.YUILoader();

loader.onFailure = function(msg, xhrobj) {
  window.status = "Failed to load Ubiquity XForms: ";
};

var sBars = "";
loader.onProgress = function(o) {
  sBars += ("|");
  window.status = ("Loading Ubiquity modules: " + sBars + " [" + o.name + "]");
};

loader.onSuccess = function(o) {
   window.status = "Successfully loaded Ubiquity XForms";
  spawn(InsertElementForOnloadXBL);
};

