// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms support to the Ubiquity library.
//
// Copyright (c) 2008-2009 Backplane Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var g_sBehaviourDirectory  = "";
 
(
  function(){
    var moduleBase = pathToModule("xforms-loader");
    g_sBehaviourDirectory = moduleBase + "../../behaviours/";
    
  	window.status = "configuring module loader";  	

  	  /*
	   * ubiquity-backplane
	   * 
	   * The following exist because the YUILoader does not load files from nested loaders consistently
	   * When the ubiquity-backplane library has a rollup that can be consumed the unrolled dependencies
	   * can be removed and ../lib/backplane-loader.js can be deleted.
	   */

		loader.addModule({
							name: "ub-threads",
		 					type: "js",
		 					fullpath: moduleBase + "../backplane/core/threads.js" });

	  loader.addModule({ name: "ub-array",
						 type: "js",  
						 fullpath: moduleBase + "../backplane/core/array.js" });
	  
	  loader.addModule({ name: "ub-tokmap",
						 type: "js",
						 fullpath: moduleBase + "../backplane/core/tokmap.js",
						 requires: [ "ub-array" ] });

		loader.addModule({
			name: "ub-dom2",
			type: "js",
			fullpath: moduleBase + "../backplane/dom/dom2.js"
		});

		loader.addModule({
			name: "ub-dom2events",
			type: "js",
			fullpath: moduleBase + "../backplane/dom/dom2events.js",
		  requires: [ "yahoo" ]
		});

		loader.addModule({
			name: "ub-event-target-proxy",
			type: "js",
			fullpath: moduleBase + "../backplane/dom/eventTargetProxy.js",
			requires: [ "ub-dom2events" ]
		});

		loader.addModule({
			name: "ub-listener",
			type: "js",
			fullpath: moduleBase + "../backplane/dom/listener.js"
		});

	  loader.addModule({ name: "ub-uri",
						 type: "js",
						 fullpath: moduleBase + "../backplane/uri/uri.js" });

	  loader.addModule({ name: "ub-security",
						 type: "js",
						 fullpath: moduleBase + "../backplane/security/security.js" });

	  loader.addModule({ name: "ub-io-submission-json",
						 type: "js",
						 fullpath: moduleBase + "../backplane/io/submission-json.js",
						 requires: [ "ub-uri" ] });
	  
	  loader.addModule({ name: "ub-file",
						 type: "js",
						 fullpath: moduleBase + "../backplane/io/file.js",
						 requires: [ "ub-uri", "ub-security" ] });
	  
	  loader.addModule({ name: "ub-io-file",
						 type: "js",
						 fullpath: moduleBase + "../backplane/io/file.js",
						 requires: [ "ub-uri", "ub-security" ] });
	  
	  loader.addModule({ name: "ub-dom3ls",
						 type: "js",
						 fullpath: moduleBase + "../backplane/dom/dom3ls.js",
						 requires: [ "ub-io-file" ] });
	  
	  loader.addModule({ name: "ub-io-scheme-file",
						 type: "js",
						 fullpath: moduleBase + "../backplane/io/scheme-file.js",
						 requires: [ "ub-file", "ub-io-file" ] });

	  loader.addModule({ name: "ubiquity-backplane",
						 type: "js",
						 fullpath: moduleBase + "../backplane/backplane-loader.js",
						 requires: [
						 				"ub-threads",
						 				"ub-array", "ub-tokmap",
						 				"ub-dom2", "ub-dom2events",
										"ub-uri",
										"ub-io-submission-json",
										"ub-file",
										"ub-io-file",
										"ub-dom3ls",
										"ub-io-scheme-file" ]});

	  /*
	   * End of ubiquity-backplane
	   */

  	loader.addModule({ name: "ux-default-css",       type: "css",  fullpath: moduleBase + "../../assets/style/default.css",
  	                   requires: [ "xforms-actions-css", "xforms-alert-css", "xforms-control-css", "xforms-output-css", "xforms-select-css", "xforms-submission-css" ]});

	  
    loader.addModule({ name: "libxh-xlink",          type: "js",  fullpath: moduleBase + "../_backplane/xlink.js",
    	 requires: [ "connection", "ubiquity-backplane" ] });

  	loader.addModule({ name: "xforms-utils", type: "js",  fullpath: moduleBase + "../UXUtils.js" });
  	
  	loader.addModule({ name: "xforms-vertex-target",       type: "js",  fullpath: moduleBase + "VertexTargets.js",
  		requires: [ "yahoo" ] });
  	loader.addModule({ name: "xforms-state",               type: "js",  fullpath: moduleBase + "state.js" });
  	
  	loader.addModule({ name: "backplane-pds",              type: "js",  fullpath: moduleBase + "pds.js" });
  	loader.addModule({ name: "backplane-model",            type: "js",  fullpath: moduleBase + "model.js",
  		requires: [ "backplane-pds" ] });

		loader.addModule({ name: "dirtystate",            type: "js",  fullpath: moduleBase + "dirtystate.js" });
		loader.addModule({ name: "xforms-mip-handler",            type: "js",  fullpath: moduleBase + "mip-handler.js",
  		requires: [ "dirtystate" ] });
		loader.addModule({ name: "xforms-mip-eventtarget",            type: "js",  fullpath: moduleBase + "mip-eventtarget.js",
  		requires: [ "xforms-mip-handler" ] });

		loader.addModule({ name: "xforms-model",               type: "js",  fullpath: moduleBase + "modelObj.js",
  		requires: ["xforms-instance",  "backplane-model", "libxh-namespace-manager", "ub-threads", "xforms-vertex-target" ] });

  	loader.addModule({ name: "xforms-submission-core",     type: "js",  fullpath: moduleBase + "xforms-submission.js",
  		requires: [ "ubiquity-backplane" ] });

    loader.addModule({ name: "xforms-submission",          type: "js",  fullpath: moduleBase + "Submission.js",
  		requires: ["libxh-xlink", "xforms-processor", "xforms-submission-core", "libxh-namespace-manager"  ] });
  	
  	loader.addModule({ name: "xforms-processor",           type: "js",  fullpath: moduleBase + "xforms.js",
  		requires: [ "xforms-model", "xforms-navigable-control-list" ] });
  	loader.addModule({ name: "xforms-conditional-invocation", type: "js", fullpath: moduleBase + "conditional-invocation.js",
  		requires: [ "xforms-processor" ] });
  	
  	loader.addModule({ name: "libxh-namespace-manager",            type: "js",  fullpath: moduleBase + "../namespaceManager.js",
  			requires:["dom"]});
  	
  	loader.addModule({ name: "libxh-decorator",            type: "js",  fullpath: moduleBase + "../decorate.js", 
  		requires:["libxh-namespace-manager"]});
  	
  ///The XForms loading of external data js files
  	loader.addModule({ name: "xforms-load-external-mixin", type: "js", fullpath: moduleBase + "LoadExternalMixin.js",
		   requires: [ "xforms-dom", "ub-dom2events", "xforms-ajaxslt-improvements", 
		               "xforms-core-function-library","libxh-xlink" ]});
  	
  	loader.addModule({ name: "xforms-instance", type: "js", fullpath: moduleBase + "Instance.js",
		   requires: [ "xforms-load-external-mixin"]});
  	
  
    // crypto
    loader.addModule({ name: "functions-hmac", type: "js", fullpath: moduleBase + "../functions/xforms/hmac.js",
		requires: [ "xforms-core-function-library", "xpath-extension-md5", "xpath-extension-sha" ] });
    loader.addModule({ name: "xpath-extension-md5",          type: "js",  fullpath: moduleBase + "../third-party/md5.js" });
    loader.addModule({ name: "xpath-extension-sha",        type: "js",  fullpath: moduleBase + "../third-party/jsSHA/src/sha.js" });

  	loader.addModule({ name: "xforms-dom-util",            type: "js",  fullpath: moduleBase + "../ajaxslt/util.js" });
  	loader.addModule({ name: "xforms-dom-xml",            type: "js",  fullpath: moduleBase + "../ajaxslt/xmltoken.js" });
  	loader.addModule({ name: "xforms-dom",                 type: "js",  fullpath: moduleBase + "../ajaxslt/dom.js",
  		requires: [ "xforms-dom-util", "xforms-dom-xml" ] });
  	loader.addModule({ name: "xforms-xpath",               type: "js",  fullpath: moduleBase + "../ajaxslt/xpath.js" });
  	loader.addModule({ name: "xforms-ajaxslt-improvements", type: "js",  fullpath: moduleBase + "ajaxslt-improvements.js",
  		requires: [ "xforms-dom", "xforms-xpath" ] });
  	loader.addModule({ name: "xforms-core-function-library", type: "js",  fullpath: moduleBase + "xforms-core-function-library.js",
  	requires: [ "xforms-xpath" ] });


  	loader.addModule({ name: "xforms-instance",
					   type: "js",
					   fullpath: moduleBase + "Instance.js",
  					   requires: [ "xforms-dom",
								   "ub-dom2events",
								   "xforms-ajaxslt-improvements",
								   "xforms-core-function-library",
								   "libxh-xlink" ]});
  	
  	loader.addModule({ name: "xforms-type-validator", type: "js",  fullpath: moduleBase + "validator.js", 
  		requires:["libxh-namespace-manager", "xforms-core-function-library"]});
  	
  	//control values
  	loader.addModule({ name: "xforms-pe-value",         type: "js",  fullpath: moduleBase + "pe-value.js" });
  	loader.addModule({ name: "xforms-input-value",         type: "js",  fullpath: moduleBase + "input-value.js" });
  	loader.addModule({ name: "xforms-input-value-boolean", type: "js",  fullpath: moduleBase + "input-value-boolean.js" });
  	loader.addModule({ name: "xforms-output-value",        type: "js",  fullpath: moduleBase + "output-value.js",
  		requires: ["output-googleMap"]});
  	loader.addModule({ name: "xforms-range-value",        type: "js",  fullpath: moduleBase + "range-value.js",
  		requires: ["slider", "range-googleMap"]});
    loader.addModule({ name: "xforms-trigger-minimal", type: "js", fullpath: moduleBase + "TriggerMinimalMixin.js" });

	// E X T E N S I O N S
	// ===================
	//

	// XSLT 2.0 functions
	//
	loader.addModule({ name: "functions-format-number", type: "js", fullpath: moduleBase + "../functions/xslt20/format-number.js" });

	// Map controls
  	loader.addModule({ name: "output-googleMap", type: "js", fullpath: moduleBase + "../extensions/output-googleMap.js", requires: ["base-googleMap"]});
  	loader.addModule({ name: "range-googleMap", type: "js", fullpath: moduleBase + "../extensions/range-googleMap.js", requires: ["base-googleMap"]});
  	loader.addModule({ name: "base-googleMap", type: "js", fullpath: moduleBase + "../extensions/base-googleMap.js", requires: ["hint-googleMap"]});

	// Map control children
  	loader.addModule({ name: "hint-googleMap", type: "js", fullpath: moduleBase + "../extensions/hint-googleMap.js"});

  	//container elements
  	loader.addModule({ name: "xforms-container",        type: "js",  fullpath: moduleBase + "container.js" });
  	loader.addModule({ name: "xforms-group",        type: "js",  fullpath: moduleBase + "Group.js" ,
        requires: [ "xforms-mip-eventtarget"]});
  	loader.addModule({ name: "xforms-repeat",        type: "js",  fullpath: moduleBase + "Repeat.js",
        requires: [ "xforms-model","xforms-group","ub-dom2"]});
	  
    loader.addModule({ name: "xforms-header",     type: "js", fullpath: moduleBase + "Header.js",
		requires: [ "libxh-decorator", "ub-dom2" ] });
  	
  	loader.addModule({ name: "backplane-case",        type: "js",  fullpath: moduleBase + "../_backplane/case.js" });
  	loader.addModule({ name: "xforms-case",        type: "js",  fullpath: moduleBase + "case.js", 
  		requires: [ "backplane-case"]});
  	loader.addModule({ name: "xforms-switch",        type: "js",  fullpath: moduleBase + "Switch.js",
  		requires: [ "xforms-case", "xforms-mip-eventtarget"]});
  	
  	
  	loader.addModule({ name: "xforms-optional-binding",             type: "js",  fullpath: moduleBase + "optional-binding.js",
  		requires: [ "xforms-mip-handler" ] });
  	loader.addModule({ name: "xforms-src-mixin",             type: "js",  fullpath: moduleBase + "SrcMixin.js",
  		requires: [ "xforms-load-external-mixin", "xforms-dom", "ub-dom2events", "xforms-ajaxslt-improvements",
  		  		"xforms-core-function-library", "libxh-xlink"] });
  	
  	loader.addModule({ name: "xforms-control",             type: "js",  fullpath: moduleBase + "Control.js",
  		requires: [ "xforms-mip-eventtarget", "dirtystate", "xforms-model", "xforms-processor", "xforms-state", "xforms-utils" ] });
  	loader.addModule({ name: "xforms-navigable-control",             type: "js",  fullpath: moduleBase + "navigable-control.js",
  		requires: [ "xforms-utils", "xforms-processor" ] });
  	loader.addModule({ name: "xforms-navigable-control-list",             type: "js",  fullpath: moduleBase + "navigable-control-list.js",
  		requires: [ "xforms-utils" ] });
  	loader.addModule({ name: "xforms-context",             type: "js",  fullpath: moduleBase + "context.js",
        requires:[ "libxh-namespace-manager", "ub-dom2" ]});
  
  	//actions
  	loader.addModule({ name: "xforms-actions",              type: "js",  fullpath: moduleBase + "actions.js",
  		requires:["container", "xforms-message-css", "yui-style-css", "xforms-notify", "message-yui"]});  
  	loader.addModule({ name: "xforms-action",              type: "js",  fullpath: moduleBase + "xf-action.js",
  		requires: [ "ub-listener", "ub-threads", "xforms-actions" ] });
  	loader.addModule({ name: "xforms-model-actions",        type: "js",  fullpath: moduleBase + "modelactions.js",
  		requires:["xforms-actions","xforms-processor"]});  

  	loader.addModule({ name: "xforms-setindex",             type: "js",  fullpath: moduleBase + "setindex.js",
  	    	requires:["xforms-instance","xforms-actions"]});
  	loader.addModule({ name: "xforms-setvalue",             type: "js",  fullpath: moduleBase + "setvalue.js",
  	    	requires:["xforms-instance","xforms-actions"]});
  	loader.addModule({ name: "xforms-setfocus",             type: "js",  fullpath: moduleBase + "setfocus.js",
  	    	requires:["xforms-instance","xforms-actions"]});
   loader.addModule({ name: "xforms-insert",               type: "js",  fullpath: moduleBase + "insert.js",
            requires:["xforms-instance","xforms-actions"]});
    loader.addModule({ name: "xforms-delete",               type: "js",  fullpath: moduleBase + "delete.js",
            requires:["xforms-instance","xforms-actions"]});
            
  	loader.addModule({ name: "xforms-toggle",             type: "js",  fullpath: moduleBase + "toggle.js",
  	    	requires:["xforms-actions", "libxh-namespace-manager"]});

  	loader.addModule({ name: "backplane-multimap",             type: "js",  fullpath: moduleBase + "../_backplane/multimap.js"});
  	
  	loader.addModule({ name: "backplane-select",             type: "js",  fullpath: moduleBase + "../_backplane/select.js",
  	    	requires:["backplane-multimap"]});

  	loader.addModule({ name: "finite-control",             type: "js",  fullpath: moduleBase + "finite-control.js"});
    
  	      
  	loader.addModule({ name: "xforms-common-select",             type: "js",  fullpath: moduleBase + "commonselect.js",
  	    	requires:["xforms-dropbox-yui"]});
  	loader.addModule({ name: "xforms-select1",             type: "js",  fullpath: moduleBase + "select1.js",
  	    	requires:["ub-dom2events", "backplane-select", "finite-control", "xforms-common-select"]});
  	loader.addModule({ name: "xforms-select",             type: "js",  fullpath: moduleBase + "select.js",
  	    	requires:["ub-dom2events", "backplane-select", "finite-control","xforms-common-select"]});
  	loader.addModule({ name: "xforms-item",             type: "js",  fullpath: moduleBase + "item.js",
  	    	requires:["ub-dom2events"]});
  	loader.addModule({ name: "xforms-copy",             type: "js",  fullpath: moduleBase + "copy.js",
  	    	requires:["ub-dom2events"]});
  	    	

    loader.addModule({ name: "xforms-submit",             type: "js",  fullpath: moduleBase + "submit.js"});

    // --- CUSTOM CONTROLS ---

    //     -- YUI --

  	loader.addModule({ name: "xforms-submission-core-yui", type: "js",  fullpath: moduleBase + "../_platform/yui/xforms-submission-yui.js",
  		requires: [ "connection" ] });

    loader.addModule({ name: "xforms-dropbox-yui",             type: "js",  fullpath: moduleBase + "../_platform/yui/dropbox-yui.js",
  	      requires:["menu"]});

    // ColorPicker widget
  	loader.addModule({ name: "yui-input-color",     type: "js",  fullpath: moduleBase + "../extensions/input-color.js",
  		requires: ["yui-color","yui-colorpicker-css"]});
  	loader.addModule({ name: "yui-color",           type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0/build/colorpicker/colorpicker-min.js",
  		requires: ["yui-slider"]});
  	loader.addModule({ name: "yui-slider",          type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0/build/slider/slider-min.js" });
  	loader.addModule({ name: "yui-colorpicker-css", type: "css", fullpath: "http://yui.yahooapis.com/2.8.0/build/colorpicker/assets/skins/sam/colorpicker.css" });

    // Calendar widget
    loader.addModule({ name: "yui-input-calendar",  type: "js",  fullpath: moduleBase + "../extensions/input-calendar.js",
            requires: ["yui-element","yui-dom-event","yui-button","yui-container-core","yui-calendar","yui-calendar-css","yui-button-css"]});
    loader.addModule({ name: "yui-calendar",        type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0/build/calendar/calendar-min.js" });
    loader.addModule({ name: "yui-container-core",  type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0/build/container/container_core-min.js" });
    loader.addModule({ name: "yui-button",          type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0/build/button/button-min.js" });
    loader.addModule({ name: "yui-dom-event",       type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0r4/build/yahoo-dom-event/yahoo-dom-event.js" });
    loader.addModule({ name: "yui-element",         type: "js",  fullpath: "http://yui.yahooapis.com/2.8.0/build/element/element-min.js" });
    loader.addModule({ name: "yui-calendar-css",    type: "css", fullpath: "http://yui.yahooapis.com/2.8.0/build/calendar/assets/skins/sam/calendar.css" });
    loader.addModule({ name: "yui-button-css",      type: "css", fullpath: "http://yui.yahooapis.com/2.8.0/build/button/assets/skins/sam/button.css" });

    // Messaging work
    loader.addModule({ name: "yui-style-css",       type: "css", fullpath: moduleBase + "../_platform/yui/message-panel.css" });
    loader.addModule({ name: "xforms-notify",       type: "js",  fullpath: moduleBase + "../_backplane/notify.js" });
    loader.addModule({ name: "message-yui",         type: "js",  fullpath: moduleBase + "../_platform/yui/message.js" });
	loader.addModule({ name: "xforms-help-css",     type: "css", fullpath: moduleBase + "../../assets/style/help.css" });
	loader.addModule({ name: "xforms-hint-css",     type: "css", fullpath: moduleBase + "../../assets/style/hint.css" });
	loader.addModule({ name: "xforms-message-css",  type: "css", fullpath: moduleBase + "../../assets/style/message.css" });

	// Theming work
	loader.addModule({ name: "xforms-actions-css",  type: "css", fullpath: moduleBase + "../../assets/style/actions.css" });
	loader.addModule({ name: "xforms-alert-css",  type: "css", fullpath: moduleBase + "../../assets/style/alert.css" });
	loader.addModule({ name: "xforms-control-css",  type: "css", fullpath: moduleBase + "../../assets/style/control.css" });
	loader.addModule({ name: "xforms-output-css",  type: "css", fullpath: moduleBase + "../../assets/style/output.css" });
	loader.addModule({ name: "xforms-select-css",  type: "css", fullpath: moduleBase + "../../assets/style/select.css" });
	loader.addModule({ name: "xforms-submission-css",  type: "css", fullpath: moduleBase + "../../assets/style/submission.css" });

    loader.addModule({ name: "xforms-hint",         type: "js",  fullpath: moduleBase + "HintMixin.js",
      requires: [ "xforms-hint-css", "xforms-notify" ] });

    loader.addModule({ name: "xforms-help",         type: "js",  fullpath: moduleBase + "HelpMixin.js",
      requires: [ "xforms-help-css", "xforms-notify" ] });

    // XF4H Processor
    loader.addModule( { name: "xf4h",  type: "js",  fullpath: moduleBase + "xf4h.js"});

    loader.addModule({ name: "xforms-defs",                type: "js",  fullpath: moduleBase + "xforms-defs.js",
      requires: [
		"ux-default-css",
		"libxh-decorator",
		"ub-listener", "ub-event-target-proxy",
		"xforms-conditional-invocation", "xforms-type-validator",
		"xforms-model", "xforms-load-external-mixin", "xforms-submission",
		"xforms-action", "xforms-context", "xforms-control", "xforms-navigable-control", "xforms-optional-binding",
		"xforms-pe-value", "xforms-input-value-boolean", "xforms-input-value", "xforms-output-value", "xforms-range-value", 
		"xforms-container", "xforms-group","xforms-repeat","xforms-switch", "xforms-instance",
		"xforms-select","xforms-select1", "xforms-item", "xforms-copy", "xforms-src-mixin" , 
		"xforms-submit", "xforms-trigger-minimal",
		"xforms-actions","xforms-model-actions",
		"xforms-setindex", "xforms-setvalue", "xforms-setfocus", "xforms-insert", "xforms-delete",
		"xforms-toggle", 
		"xforms-hint", "xforms-help",
		"xforms-header",
		"yui-input-calendar","yui-input-color",
		"xf4h","xforms-submission-core-yui",
		"functions-hmac", "functions-format-number"
      ]
    });
    loader.require( "xforms-defs" );

    loader.addModule({
      name: "second-onload",
      type: "js",  
      fullpath: moduleBase + "../second-onload.js", 
      requires:[ "xforms-utils" ]
    });

    loader.require( "second-onload" );
  }()
);
