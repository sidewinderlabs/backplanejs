// backplane provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The RDFa module adds RDFa support to the backplane library.
//
// Copyright (C) 2007-9 Mark Birbeck
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
//
//= require <backplane>
//= require "metascan"
//
function processFresnelSelectors(subj, obj) {
  /*
   * First find any Fresnel class styles.
   */

  //var s = (subj) ? subj : "?format";
  var s = "?format";
  var g = (subj) ? subj : "?group";
  var q;

  var classstyles = document.meta.query2({
    select: [ "t", "cl", "action", "notify", "yowl", "icon", "tooltip", "pipesdata", "adddata", "afterpipesdata" ],
    where:
      [
        { pattern: [ s,         "a",                                                   "http://www.w3.org/2004/09/fresnel#Format" ] },
        { pattern: [ s,         "http://www.w3.org/2004/09/fresnel#group",             g ] },
        { pattern: [ g,         "a",                                                   "http://www.w3.org/2004/09/fresnel#Group" ] },
        { pattern: [ s,         "http://www.w3.org/2004/09/fresnel#classFormatDomain", "?t" ] },
        { pattern: [ s,         "http://www.w3.org/2004/09/fresnel#resourceStyle",     "?cl" ],      optional: true },
        { pattern: [ s,         "http://argot-hub.googlecode.com/action",                 "?action" ],  optional: true },
        { pattern: [ s,         "http://argot-hub.googlecode.com/yowl",                   "?yowl" ],    optional: true },
        { pattern: [ s,         "http://argot-hub.googlecode.com/notify",                 "?notify" ],    optional: true },
        {
          where:
            [
              { pattern: [ s,     "http://argot-hub.googlecode.com/tooltip",          "?tt" ] },
              { pattern: [ "?tt",     "http://argot-hub.googlecode.com/icon",             "?icon" ], optional: true },
              { pattern: [ "?tt",     "http://argot-hub.googlecode.com/template",         "?tooltip" ] }
            ],
          optional: true
        },
        {
          where:
            [
              { pattern: [ s, "http://argot-hub.googlecode.com/pipesdata",        "?pipesdata" ] },
              { pattern: [ s, "http://argot-hub.googlecode.com/adddata",          "?adddata" ] },
              { pattern: [ s, "http://argot-hub.googlecode.com/afterpipesdata",   "?afterpipesdata" ], optional: true }
            ],
          optional: true
        }
      ]
  });

  /*
   * Now find all elements that have the types indicated, and set the corresponding CSS class.
   */

  document.meta.walk2(
    classstyles,
    {
      action: function(classobj)
      {
        var instances = document.meta.query2(
          {
            select: [ "s" ],
            where:
              [
                { pattern: [ "?s", "a", classobj.t ], setUserData: true }
              ]
          }
        );

        document.meta.walk2(
          instances,
          {
            action: function(instobj)
              {
                processFresnelFormats(instobj.user, classobj);
                processLibXhFormats(instobj, classobj);
              }
          }
        );
      }
    }
  );

  /*
   * Now do the same for properties.
   */

  classstyles = document.meta.query2({
    select: [ "p", "cl" ],
    where:
      [
        { pattern: [ s, "a",                                                      "http://www.w3.org/2004/09/fresnel#Format" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#propertyFormatDomain", "?p" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#resourceStyle",        "?cl" ] }
      ]
  });

  /*
   * Now find all elements that have the predicates indicated, and set the corresponding CSS class.
   */

  document.meta.walk2(
    classstyles,
    {
      action: function(classobj)
      {
        var results = document.meta.query2(
          {
            select: [ "o" ],
            where:
              [
                { pattern: [ "?s", classobj.p, "?o" ], setUserData: true }
              ]
          }
        );

        document.meta.walk2(
          results,
          {
            action: function(instobj)
            {
              processFresnelFormats(instobj.user, classobj);
            }
          }
        );
      }
    }
  );


  /*
   * Now do the same for any SPARQL queries.
   */

  classstyles = document.meta.query2({
    select: [ "q", "cl", "action", "notify", "yowl", "embedInit", "embedTemplate", "embedTitle", "icon", "tooltip", "pipesdata", "adddata", "afterpipesdata" ],
    where:
      [
        { pattern: [ s, "a",                                                      "http://www.w3.org/2004/09/fresnel#Format" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#group",                g ] },
        { pattern: [ g, "a",                                                      "http://www.w3.org/2004/09/fresnel#Group" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#instanceFormatDomain", "?q" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#resourceStyle",        "?cl" ],      optional: true },
        { pattern: [ s, "http://argot-hub.googlecode.com/action",                    "?action" ],  optional: true },
        { pattern: [ s, "http://argot-hub.googlecode.com/yowl",                      "?yowl" ],    optional: true },
        { pattern: [ s, "http://argot-hub.googlecode.com/notify",                    "?notify" ],  optional: true },
        {
          where:
            [
              { pattern: [ s, "http://argot-hub.googlecode.com/tooltip",             "?tt" ] },
              { pattern: [ "?tt",     "http://argot-hub.googlecode.com/icon",                "?icon" ], optional: true },
              { pattern: [ "?tt",     "http://argot-hub.googlecode.com/template",            "?tooltip" ] }
            ],
          optional: true
        },
        {
          where:
            [
              { pattern: [ s,        "http://argot-hub.googlecode.com/embed",    "?embed" ] },
              { pattern: [ "?embed", "http://argot-hub.googlecode.com/template", "?embedTemplate" ] },
              { pattern: [ "?embed", "http://argot-hub.googlecode.com/init",     "?embedInit" ], optional: true }
            ],
          optional: true
        },
        {
          where:
            [
              { pattern: [ s, "http://argot-hub.googlecode.com/pipesdata",           "?pipesdata" ] },
              { pattern: [ s, "http://argot-hub.googlecode.com/adddata",             "?adddata" ] },
              { pattern: [ s, "http://argot-hub.googlecode.com/afterpipesdata",      "?afterpipesdata" ], optional: true }
            ],
          optional: true
        }
      ]
  });

  /*
   * Now run each of the queries returned.
   */

  document.meta.walk2(
    classstyles,
    {
      action: function(classobj)
      {
      	var r;

      	if (typeof classobj.q.content === "string") {
					try {
						q = classobj.q.content.replace(
							/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
							function (m) { return getPropertyFromVar(obj, m); }
						);
					} catch(e) {
					}

	        r = document.meta.query2( eval( "({" + q + "})" ) );
	      } else {
	        r = document.meta.query2( classobj.q.content );
	      }

        document.meta.walk2(
          r,
          {
            action: function(instobj)
            {
              processFresnelFormats(instobj.user, classobj);
              processLibXhFormats(instobj, classobj);
            }
          }
        );
      }
    }
  );
  return;
}//processFresnelSelectors

function processFresnelFormats(user, format) {
  if (format.cl)
  {
    YAHOO.util.Dom.addClass(user, format.cl.content);
  }
  return;
}//processFresnelFormats

function processLibXhFormats(obj, format) {
  var context = obj.user;

  /*
   * Prioritise getting external data, just in case we need it.
   */

  if (format.pipesdata)
  {
    var pThis = this;
    eval(
      "var rq = {" +
				format.pipesdata.content.replace(
					/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
					function (m) { return getPropertyFromVar(obj, m); }
				) +
      "};"
    );

    var requestId = document.submissionJSON.run(
      rq.url,
      rq.params,
      obj,
      function(data, userData)
      {
        if (format.adddata) {
        	execFuncWithObj(format.adddata.content, { data: data, obj: userData}, "adddata");

					//eval(
          //  format.adddata.content.replace(/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g, "obj.$1")
          //);
        }
        if (format.afterpipesdata) {
          processFresnelSelectors(format.afterpipesdata, userData);
        }
        return;
      }//callback from Pipes
    );
  }//if ( we need to retrieve more data )


  if (context)
  {
    var icon = null;

    if (format.icon)
    {
      icon = context.ownerDocument.createElement('img');
  
      icon.setAttribute("src", format.icon);
      context.appendChild(icon);
    }//if ( there is an icon for this action definition )

    if (format.tooltip) {
      var t;
      try {
        eval(
        	"t = '" +
        	format.tooltip.content.replace(/\n/g, "").replace(/\'/g, "\\\'").replace(
        		/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
        		"' + obj.$1 + '"
        	) +
        	"';"
       	);
      } catch(e) {
        t = "error: " + e.description;
      }
      if (icon) {
        new YAHOO.widget.Tooltip(
          "anon" + this.somenum++,
          {
            context: icon,
            text: t
            //text: oAction.tooltip(obj)
          }
        );
      } else {
        var el = context.ownerDocument.createElement('span');
  
        el.innerHTML = t;
        context.appendChild(el);
      }
    }//if ( there is a tooltip definition in the format )

    if (format.embedTemplate) {
			var t;
			var el = context.ownerDocument.createElement('span');

			try {
				t = format.embedTemplate.content.replace(
					/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
					function (m) { return getPropertyFromVar(obj, m, true); }
				);
			} catch(e) {
			  t = "error: " + e.description;
			}
			el.innerHTML = t;

      // The new node is a sibling of the node that generated the mark-up, not a child.
      //
      context.parentNode.insertBefore(el, context.nextSibling);

      if (format.embedInit) {
        execFuncWithObj(format.embedInit.content, { data: context, obj: obj}, "embedInit");
      }
    }//if ( there is a template to embed )
  }//if ( there is a context )

  if (format.action) {
  	if (typeof(format.action.content) === "string") {
	    eval(
	      format.action.content.replace(/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g, "obj.$1")
	    );
	  } else if (typeof(format.action.content) === "function") {
			format.action.content.call(null, obj);
	  }
  }

  if (format.yowl) {
    eval(
      format.yowl.content.replace(/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g, "obj.$1")
    );
  }

  if (format.notify) {
	  r = document.meta.query2({
	    select: [ "name", "title", "summary" ],
	    where:
	      [
	        { pattern: [ format.notify, "http://argot-hub.googlecode.com/notifyName", "?name" ] },
	        { pattern: [ format.notify, "http://purl.org/dc/elements/1.1/title", "?title" ] },
	        { pattern: [ format.notify, "http://purl.org/dc/elements/1.1/summary", "?summary" ] }
	      ]
	  });

    document.meta.walk2(
      r,
      {
        action: function(instobj)
        {
			    document.Yowl.notify(
			      instobj.name.content,
			      instobj.title.content,
						instobj.summary.content.replace(
							/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
							function (m) { return getPropertyFromVar(obj, m); }
						),
			      "chem",
			      null,
			      true,
			      0
			    );
        }
      }
    );
  }
  return;
}//processLibXhFormats
