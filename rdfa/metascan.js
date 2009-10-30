/*
 * xH provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 * Copyright (C) 2007-8 Mark Birbeck
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Mark Birbeck can be contacted at:
 *
 *  36 Tritton Road
 *  London
 *  SE21 8DE
 *  United Kingdom
 *
 *  mark.birbeck@gmail.com
 */

var oDoc = getMainDoc();

function getMainDoc() {

	/*
	 * See if we're in a UBX side-bar
	 */

	if (window.external && window.external.document) {
		return window.external.document;
	} else if (window.parent) {
		return window.parent.document;
	}
	return window.document;
}

function get_metadata()
{

  /*
   * Create a triple store to put all the triples into.
   */

	if (!document.meta) {
		document.meta = new RDFQuery( new RDFStore() );
		document.Yowl.register(
			"RDFa Parser",
			[ "Parsing status" ],
			[ 0 ],
			null
		);
	}


  /*
   * Create a parser, and give it access to the triple store.
   */

  var oParser = new RDFParser(document.meta.store);


	/*
	 * If we're running as a bookmarklet, then load a default formatter.
	 */

	if (document.runContext === "bookmarklet") {
	  document.meta.store.insert(
	    [
	      {
	        "http://argot-hub.googlecode.com/formatter": "<http://ubiquity-rdfa.googlecode.com/svn/trunk/_samples/formats/debug>"
	      }
	    ]
	  );
	}

  /*
   * Parse the document for triples. Note that we are parsing either 'this' document
   * or an external document if we are in a sidebar, but the results always go to
   * 'this' document.
   */

	oParser.parse(oDoc, getBaseUrl(oDoc), null);

  var pThis = oParser;

  spawn(
    function()
    {
      if (document.meta.store.loadFormatters)
        document.meta.store.loadFormatters("", oParser);

      /*
       * Register any formatters.
       */

			var loader = new YAHOO.util.YUILoader();
			var r = document.meta.query2(
        {
          select: [ "formatter" ],
          where:
            [
              { pattern: [ "?s", "http://argot-hub.googlecode.com/formatter", "?formatter" ] }
            ]
        }
      );
      var uriFormatter;

      if (r && r.results.bindings[0] && r.results.bindings[0]["formatter"])
      {
      	uriFormatter = r.results.bindings[0]["formatter"];

        loader.addModule({ name: "fresnel-formatter-css", type: "css", fullpath: r.results.bindings[0]["formatter"] + ".css" });
        loader.addModule({ name: "fresnel-formatter", type: "js", fullpath: r.results.bindings[0]["formatter"] + ".js",
          requires: [ "fresnel-formatter-css" ] });

        loader.require( "fresnel-formatter" );

        loader.onSuccess = function(o) {
          var loader = new YAHOO.util.YUILoader();
          var r = document.meta.query2(
            {
              select: [ "css" ],
              where:
                [
                  { pattern: [ "?s", "http://www.w3.org/1999/xhtml/vocab#stylesheet", "?css" ] }
                ]
            }
          );//query for any stylesheets

          if (r && r.results.bindings[0] && r.results.bindings[0]["css"])
          {
            loader.addModule({ name: "fresnel-css-stylesheet", type: "css", fullpath: r.results.bindings[0]["css"] });
            if (window.external && window.external.document)
            {
              var d = window.external.document;
              var h = d.getElementsByTagName("head")[0];
              var l = d.createElement("link");

              l.setAttribute("rel", "stylesheet");
              l.setAttribute("href", r.results.bindings[0]["css"]);
              h.appendChild(l);
            }
          }
          loader.insert();

          r = document.meta.query2(
            {
              select: [ "init" ],
              where:
                [
                  { pattern: [ "?s" /* pThis.src */, "http://argot-hub.googlecode.com/constructor", "?init" ] }
                ]
            }
          );//query for a constructor
  
          /*
           * ...and for each one execute the script.
           */
  
          document.meta.walk2(
            r,
            {
              action: function(obj)
              {
                try
                {
                	(typeof obj.init.content === "function")
                		? obj.init.content.call( null )
                		: eval( false || obj.init.content );
                }
                catch(e)
                {
                  alert("Constructor failed: " + e.description);
                }
              }//action()
            }
          );
          if (window.external && window.external.document)
            oParser.parse(window.external.document, getBaseUrl(window.external.document), null);
          processFresnelSelectors( uriFormatter );
          return;
        }//onSuccess;
      }//if there are some formatters to load
      else
        initialiseFresnelFormats(oParser);
      loader.insert();
      return;
    },
    null
  );
	return;
}//get_metadata()


function initialiseFresnelFormats(parser) {
  var loader = new YAHOO.util.YUILoader();
  var r = document.meta.query2(
    {
      select: [ "css" ],
      where:
        [
          { pattern: [ "?s", "http://www.w3.org/1999/xhtml/vocab#stylesheet", "?css" ] }
        ]
    }
  );//query for any stylesheets

  if (r && r.results.bindings[0] && r.results.bindings[0]["css"])
  {
    loader.addModule({ name: "fresnel-css-stylesheet", type: "css", fullpath: r.results.bindings[0]["css"] });
    if (window.external && window.external.document)
    {
      var d = window.external.document;
      var h = d.getElementsByTagName("head")[0];
      var l = d.createElement("link");

      l.setAttribute("rel", "stylesheet");
      l.setAttribute("href", r.results.bindings[0]["css"]);
      h.appendChild(l);
    }
  }
  loader.insert();

  r = document.meta.query2(
    {
      select: [ "init" ],
      where:
        [
          { pattern: [ "?s" /* pThis.src */, "http://argot-hub.googlecode.com/constructor", "?init" ] }
        ]
    }
  );//query for a constructor

  /*
   * ...and for each one execute the script.
   */

  document.meta.walk2(
    r,
    {
      action: function(obj)
      {
        try
        {
          eval( false || obj.init.content );
        }
        catch(e)
        {
          alert("Constructor failed: " + e.description);
        }
      }//action()
    }
  );
  if (window.external && window.external.document)
    parser.parse(window.external.document, getBaseUrl(window.external.document), null);
  processFresnelSelectors();
  return;
}//initialiseFresnelFormats
