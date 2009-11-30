/*
 * Ubiquity provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 * Copyright (C) 2007-9 Mark Birbeck
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
//= require <backplane>
//= require "metascan"
//
function RDFParser(oRDFStore)
{
  /*
   * Initialise the reference to the triple store.
   */

  this.store = oRDFStore;

  /*
   * Create a stack for the contexts.
   */

  this._context = [ ];
  return;
}

RDFParser.prototype.parse = function(oRoot, sBase, oWhy)
{
  var parserContext = this;
  var mapURIs = new mappings();

  /*
   * Set up some default URI mappings.
   */

  mapURIs.add("", "http://www.w3.org/1999/xhtml/vocab#", true);
  mapURIs.add("_", "bnode:" + sBase, true);
  mapURIs.add("_fresnel", "http://www.w3.org/2004/09/fresnel#", true);
  mapURIs.add("_xh", "http://www.w3.org/1999/xhtml", true);
  mapURIs.add("_rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#", true);
  mapURIs.add("_rdfs", "http://www.w3.org/2000/01/rdf-schema#", true);
  mapURIs.add("_dc", "http://purl.org/dc/elements/1.1/", true);

  /*
   * Add the predefined XHTML vocab tokens.
   */

  mapURIs.add("alternate", "http://www.w3.org/1999/xhtml/vocab#alternate", true);
  mapURIs.add("appendix", "http://www.w3.org/1999/xhtml/vocab#appendix", true);
  mapURIs.add("bookmark", "http://www.w3.org/1999/xhtml/vocab#bookmark", true);
  mapURIs.add("cite", "http://www.w3.org/1999/xhtml/vocab#cite", true);
  mapURIs.add("chapter", "http://www.w3.org/1999/xhtml/vocab#chapter", true);
  mapURIs.add("contents", "http://www.w3.org/1999/xhtml/vocab#contents", true);
  mapURIs.add("copyright", "http://www.w3.org/1999/xhtml/vocab#copyright", true);
  mapURIs.add("first", "http://www.w3.org/1999/xhtml/vocab#first", true);
  mapURIs.add("glossary", "http://www.w3.org/1999/xhtml/vocab#glossary", true);
  mapURIs.add("help", "http://www.w3.org/1999/xhtml/vocab#help", true);
  mapURIs.add("icon", "http://www.w3.org/1999/xhtml/vocab#icon", true);
  mapURIs.add("index", "http://www.w3.org/1999/xhtml/vocab#index", true);
  mapURIs.add("last", "http://www.w3.org/1999/xhtml/vocab#last", true);
  mapURIs.add("license", "http://www.w3.org/1999/xhtml/vocab#license", true);
  mapURIs.add("meta", "http://www.w3.org/1999/xhtml/vocab#meta", true);
  mapURIs.add("next", "http://www.w3.org/1999/xhtml/vocab#next", true);
  mapURIs.add("p3pv1", "http://www.w3.org/1999/xhtml/vocab#p3pv1", true);
  mapURIs.add("prev", "http://www.w3.org/1999/xhtml/vocab#prev", true);
  mapURIs.add("role", "http://www.w3.org/1999/xhtml/vocab#role", true);
  mapURIs.add("section", "http://www.w3.org/1999/xhtml/vocab#section", true);
  mapURIs.add("stylesheet", "http://www.w3.org/1999/xhtml/vocab#stylesheet", true);
  mapURIs.add("subsection", "http://www.w3.org/1999/xhtml/vocab#subsection", true);
  mapURIs.add("start", "http://www.w3.org/1999/xhtml/vocab#start", true);
  mapURIs.add("top", "http://www.w3.org/1999/xhtml/vocab#top", true);
  mapURIs.add("up", "http://www.w3.org/1999/xhtml/vocab#up", true);

  /*
   * Set the initial context and then begin the parsing.
   */

  parserContext.traverse(
    oRoot,
    {
      base: sBase,
      graph: this.store.getGraph( "" ),
      parentSubject: sBase,
      language: "",
      uriMappings: mapURIs,
      incompleteTriples: [ ],
      parentObject: null,
      classIsPredicate: false
    }
  );
};//parse



/*
 * Include the triples from another document, by parsing the RDFa.
 */

RDFParser.prototype.parseExternal = function(uri, callback) {
	var that = this;
	var baseURI;

	if (typeof uri === "object") {
		baseURI = uri.base;
		uri = uri.uri;
	} else {
		baseURI = uri;
	}

  if (uri.substr(0, 6) != "bnode:")
  {

    /*
     * Create an iframe ready to take the external document, but note that we don't
     * put the src attribute on yet.
     */

    var elHead = document.getElementsByTagName("head")[0];
    var el;

    el = document.createElement('iframe');
    elHead.appendChild(el);


    /*
     * Since we don't know how long it will take to load the document we register an
     * onload handler, and we do our parsing in there.
     */

    YAHOO.util.Event.addListener(
      el,
      "load",
      function()
      {

        /*
         * The DOM for the loaded document is in 'contentDocument'.
         */

        /*
         * If documents are from the same domain then this request will have no effect.
         * However, if the documents are from different domains, then it's up to the
         * user whether to allow this.
         */

				//netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        that.parse(this.contentDocument || this.contentWindow.document, baseURI, null);

				// We've got what we want from the external DOM...now throw it away.
				//
        this.parentNode.removeChild(this);


        /*
         * Now that we've finished parsing, we query for any constructors
         * that have been loaded...
         */

				var loader = new YAHOO.util.YUILoader();

        var r = document.meta.query2(
          {
            select: [ "css" ],
            where:
              [
                { pattern: [ uri, "http://www.w3.org/1999/xhtml/vocab#stylesheet", "?css" ] }
              ]
          }
        );

        if (r && r.results.bindings[0] && r.results.bindings[0]["css"])
        {
          loader.addModule({ name: "fresnel-css-stylesheet", type: "css", fullpath: r.results.bindings[0]["css"] });
          loader.require( "fresnel-css-stylesheet" );
        }

				// This doesn't quite behave how you'd expect. Although we correctly add multiple CSS files in
				// separate calls to this function, we only seem to get one onSuccess() call. This means that
				// if we were to change the following code so that the query had a subject of "uri" - which
				// would seem the more 'correct' way to do this - then we'd only invoke one constructor.
				//
	      loader.onSuccess = function(o) {
          var results = document.meta.query2(
            {
              select: [ "init" ],
              where:
                [
                  { pattern: [ "?s", "http://argot-hub.googlecode.com/constructor", "?init" ] }
                ]
            }
          );//query for a constructor

          /*
           * ...and for each one execute the script.
           */

          document.meta.walk2(
            results,
            {
              action: function(obj)
              {
                try
                {
                  eval( obj.init.content );
                }
                catch(e)
                {
                  alert("Constructor failed: " + e.description);
                }
              }//action()
            }
          );

          processFresnelSelectors(uri);

          /*
           * If there is a callback function then call it.
           */

          if ( callback ) {
            callback();
          }
        };
				loader.insert();
        return;
      },
      false
    );

    /*
     * We leave the setting of the iframe's URL until last, because we have to be
     * sure that our event handler is in place.
     */

    el.setAttribute("src", uri);
  }//if ( the URI is not a bnode )
  return;
};//parseExternal()


RDFParser.prototype.traverse = function(element, oContext)
{
    var bRet = false;
    var bRecurse = true;
    var bSkip = false;

    var bCreateBNode = false;

    var incompleteTriples = [ ];
    var uriMappings = oContext.uriMappings;
    var language = oContext.language;
    var graph = oContext.graph;

    var sThisSubject = "";
    var sThisObject = null;
    var oUser = element;
    var sPred, arrPred;
		var i;

   /*
    * First add any URI mappings.
    *
    * Note that we do this outside of our test for an ELEMENT because in IE
    * namespaces get moved off the HTML element to the document object.
    */

    uriMappings.addFromElement(element);

    if (element.nodeType == 1 /* ELEMENT */)
    {

      var elementname = element.nodeName.toLowerCase();

      /*
       * Next set any language information.
       */

      language = element.getAttribute("lang") || language;

      /*
       * The first step is to set any subject and object information.
       */

      if (element.getAttribute("rel") !== null || element.getAttribute("rev") !== null)
      {
        if (element.getAttribute("about") !== null) {
					sThisSubject = safeCurieOrUri(oContext.base, element.getAttribute("about"), oContext.uriMappings);
				}
        else if (element.getAttribute("src") !== null)
        {
          sThisSubject = makeAbsoluteURI(oContext.base, element.getAttribute("src"));
        }
        else if ((elementname == "head") || (elementname == "body"))
        {
          sThisSubject = makeAbsoluteURI(oContext.base, "");
          bRet = true;
        }
        else if (element.getAttribute("typeof") !== null)
        {
          sThisSubject = curieToUri("_:" + element.nodeName.toLowerCase() + this.store.bnode_counter++, oContext.uriMappings);
        }
        else if (oContext.parentObject)
        {
          sThisSubject = oContext.parentObject;
        }

        if (element.getAttribute("resource") !== null) {
					sThisObject = safeCurieOrUri(oContext.base, element.getAttribute("resource"), oContext.uriMappings);
				}
        else if (element.getAttribute("href") !== null)
        {
          sThisObject = makeAbsoluteURI(oContext.base, element.getAttribute("href"));
        }
        else
        {
          bCreateBNode = true;
        }
      }
      else
      {
				if (element.getAttribute("about") !== null) {
					sThisSubject = safeCurieOrUri(oContext.base, element.getAttribute("about"), oContext.uriMappings);
					bRet = true;
				}
        else if (element.getAttribute("src") !== null)
        {
          sThisSubject = makeAbsoluteURI(oContext.base, element.getAttribute("src"));
          bRet = true;
        }
        else if (element.getAttribute("resource") !== null)
        {
					sThisSubject = safeCurieOrUri(oContext.base, element.getAttribute("resource"), oContext.uriMappings);
          bRet = true;
        }
        else if (element.getAttribute("href") !== null)
        {
          sThisSubject = makeAbsoluteURI(oContext.base, element.getAttribute("href"));
          bRet = true;
        }
        else if ((elementname == "head") || (elementname == "body"))
        {
          sThisSubject = makeAbsoluteURI(oContext.base, "");
          bRet = true;
        }
        else if (element.getAttribute("typeof") !== null)
        {
          sThisSubject = curieToUri("_:" + element.nodeName.toLowerCase() + this.store.bnode_counter++, oContext.uriMappings);
          bRet = true;
        }
        else if (oContext.parentObject)
        {
          if (!element.getAttribute("property")) {
            bSkip = true;
          }
          sThisSubject = oContext.parentObject;
        }
      }

      /*
       * And use @typeof.
       */

      if (element.getAttribute("typeof") !== null) {
        var sTypeOf = element.getAttribute("typeof");
        var arrTypeOf = sTypeOf.split(/[\s]/);

        for (i = 0; i < arrTypeOf.length; i++) {
	        graph.add(
	          sThisSubject,
	          curieToUri("_rdf:type", oContext.uriMappings),
	          curieToUri(arrTypeOf[i], oContext.uriMappings),
	          false,
	          oUser
	        );
        }//for (each type)
        bRet = true;
      }//if (there is a @typeof)

      if (bCreateBNode)
      {
        if (element.getAttribute("rel") !== null)
        {
          sPred = element.getAttribute('rel');
          arrPred = sPred.split(/[\s]/);

          for (i = 0; i < arrPred.length; i++)
          {
            incompleteTriples.push(
              {
                rel: true,
                predicate: curieToUri(arrPred[i], oContext.uriMappings),
                user: oUser
              }
            );
          }//for (each predicate)
        }//if (there is a @rel)

        /*
         * Next use @rev.
         */

        if (element.getAttribute("rev") !== null)
        {
          sPred = element.getAttribute('rev');
          arrPred = sPred.split(/[\s]/);

          for (i = 0; i < arrPred.length; i++)
          {
            incompleteTriples.push(
              {
                rel: false,
                predicate: curieToUri(arrPred[i], oContext.uriMappings),
                user: oUser
              }
            );
          }
        }//if (there is a @rev)
        sThisObject = curieToUri("_:" + element.nodeName.toLowerCase() + this.store.bnode_counter++, oContext.uriMappings);
      }//if ( there is no object )


      /*
       * Next the object literal with datatype.
       */

      if (element.getAttribute('property') !== null)
      {

        /*
         * If @datatype="" is set then we use it, even if the literal contains mark-up.
         *
         * This allows authors to prevent XML literals being created, by using
         */

        var sObjectLiteralDataType =
          (element.getAttribute("datatype") !== null)
            ? element.getAttribute("datatype")
            : (
              (element.getAttribute("content") || element.innerHTML.indexOf("<") == -1)
                ? ""
                : "_rdf:XMLLiteral"
            );

        if (sObjectLiteralDataType != "") {
          sObjectLiteralDataType = curieToUri(sObjectLiteralDataType, oContext.uriMappings);
        }

        var sObjectLiteral =
          element.getAttribute("content")
          ||
          (
            (sObjectLiteralDataType == "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral")
              ? element.innerHTML
              : (element.textContent || element.innerText)
          );

      /*
       * Now that we have all the subjects and objects, we can generate some triples.
       * First use @property.
       */

        graph.add(
          sThisSubject,
          curieToUri(element.getAttribute('property'), oContext.uriMappings),
          {
            content: sObjectLiteral,
            datatype: sObjectLiteralDataType
          },
          true,
          oUser
        );
        bRet = true;

        /*
         * We stop recursing if we're processing an XML literal.
         */

        if (sObjectLiteralDataType == "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral") {
          bRecurse = false;
        }
      }//if (there is a @property)

      /*
       * Next use @rel.
       */

      if (sThisObject && !bCreateBNode)
      {
        if (element.getAttribute("rel") !== null)
        {
          sPred = element.getAttribute('rel');
          arrPred = sPred.split(/[\s]/);

          for (i = 0; i < arrPred.length; i++)
          {
            graph.add(
              sThisSubject,
              curieToUri(arrPred[i], oContext.uriMappings),
              sThisObject,
              false,
              oUser
            );
            bRet = true;
          }//for (each predicate)
        }//if (there is a @rel)


        /*
         * Next use @rev.
         */

        if (element.getAttribute("rev") !== null)
        {
          sPred = element.getAttribute('rev');
          arrPred = sPred.split(/[\s]/);

          for (i = 0; i < arrPred.length; i++)
          {
            graph.add(
              sThisObject,
              curieToUri(arrPred[i], oContext.uriMappings),
              sThisSubject,
              false,
              oUser
            );
            bRet = true;
          }
        }//if (there is a @rev)
      }//if ( the is an object )
    }//if ( the node is an element )

    if (bRecurse)
    {
      var children = element.childNodes;
      var bWorthCompletingTriples = false;

      for (i = 0; i < children.length; i++) {
          bWorthCompletingTriples = this.traverse(
            children[i],
            bSkip ?
                {
                  base: oContext.base,
                  graph: graph,
                  parentSubject: oContext.parentSubject,
                  parentObject: oContext.parentObject,
                  uriMappings: uriMappings,
                  incompleteTriples: oContext.incompleteTriples,
                  language: language
                }
              :
                {
                  base: oContext.base,
                  graph: graph,
                  parentSubject: sThisSubject || oContext.parentSubject,
                  parentObject: sThisObject || sThisSubject || oContext.parentSubject,
                  uriMappings: uriMappings,
                  incompleteTriples: incompleteTriples,
                  language: language
                }
          )
          || bWorthCompletingTriples;
      }
      bRet = bRet || bWorthCompletingTriples;
    }//if ( recurse )

    if (!bSkip && sThisSubject /*((sThisSubject && !bCreateBNode) || bRet)*/)
    {

      /*
       * ...complete any incomplete triples...
       */

      if (oContext.incompleteTriples.length)
      {
        for (i = 0; i < oContext.incompleteTriples.length; i++)
        {
          graph.add(
            (oContext.incompleteTriples[i].rel) ? oContext.parentSubject : sThisSubject,
            oContext.incompleteTriples[i].predicate,
            (oContext.incompleteTriples[i].rel) ? sThisSubject : oContext.parentSubject,
            false,
            oContext.incompleteTriples[i].user
          );
        }
        //oContext.incompleteTriples.length = 0;
        bRet = true;
      }
    }

    return bRet;
};//traverse
