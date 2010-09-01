/*
 * Ubiquity provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 *
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

//= require <core>
//
/*
 * This triple store is very basic, and simply holds a list of triples. All resources are
 * placed in a list, and an index is used in the triple list.
 */

function RDFGraph() {
    this.resources = [ ];
    this.triples = [ ];
    this.somenum = 0;

    /*
     * Find the index for a resource.
     */

    this.resources.find = function(sURI)
    {
        for (var i = 0, len = this.length; i < len; i++)
        {
            if (this[i].resource == sURI) {
                return i;
            }
        }
        return -1;
    };//find


    /*
     * Add a resource to our list of resources, returning an index.
     * For each resource we keep a list of triples that make use
     * of it.
     */

    this.resources.add = function(sURI)
    {
        return this.push(
            {
                resource: sURI,
                triples: [ ]
            }
        );
    };//add

    this.resources.len = function() {
        return this.length;
    };
}//RDFStore()


/*
 * To empty a store, reset the list of triples and resources.
 */

RDFGraph.prototype.clear = function()
{
    this.triples.length = 0;
    this.resources.length = 0;
};


/*
 * Add a triple to the store.
 */

RDFGraph.prototype.add = function(sSubject, sPredicate, sObject, bObjectIsLiteral, oUser)
{
    var bRet = true;

    /*
     * We don't deal with resources directly, but use indexes. So the first
     * step is to work out the index, or create a new entry if one is needed.
     */

    var iURI = this.resources.find(sSubject);

    if (iURI == -1) {
        iURI = this.resources.add(sSubject) - 1;
    }

    /*
     * Next create a 'triple' using the ID of the element in the document,
     * and the three components of the triple itself.
     */

    if (!bObjectIsLiteral)
    {
      if (sPredicate == "a") {
        sPredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
      }
      else if (sPredicate === "stylesheet") {
        sPredicate = "http://www.w3.org/1999/xhtml/vocab#stylesheet";
      }
    }

    var t = {
        subject: iURI,
        predicate: sPredicate,
        object: sObject,
        object_literal_p: bObjectIsLiteral,
        user: oUser
    };


    /*
     * Save the triple into the master list of triples...
     */

    var iTriple = this.triples.push(t) - 1;

    /*
     * ... and then create an entry in the triple list for the
     * subject resource.
     */

    this.resources[iURI].triples.push( iTriple );

    /*
     * Notify any listeners.
     */

    this.tripleAdded( t );

    return bRet;
};//RDFStore.add()

RDFGraph.prototype.tripleAdded = function(triple) {
    return;
};

RDFGraph.prototype.createBindings = function(triple, pattern)
{
  var oRet = {
    bindings:
      [
        { uri: this.resources[ triple.subject ].resource },
        { uri: triple.predicate },
        (triple.object_literal_p) ? { literal: triple.object } : { uri: triple.object },

        /*
         * If the context flag is set, then set the context to be the context of the
         * current triple.
         */

        (pattern.setUserData) ? { name: "user", uri: triple.user } : { }
      ]
  };

  /*
   * If any of the pattern components are variable names then add the
   * name to the binding information.
   */

  if (pattern.pattern[0].charAt(0) == "?") {
    oRet.bindings[0].name = pattern.pattern[0].substring(1);
  }

  if (pattern.pattern[1].charAt(0) == "?") {
    oRet.bindings[1].name = pattern.pattern[1].substring(1);
  }

  if (pattern.pattern[2].charAt(0) == "?") {
    oRet.bindings[2].name = pattern.pattern[2].substring(1);
  }

  return oRet;
};


RDFGraph.prototype.serialiseResult = function(triple, pattern)
{
  var oRet = {
    bindings:
      [
        { uri: this.resources[ triple.subject ].resource },
        { uri: triple.predicate },
        { },
        { }
      ]
  };

  if (pattern.subject.charAt(0) == "?") {
    oRet.bindings[0].name = pattern.subject.substring(1);
  }

  if (pattern.predicate.charAt(0) == "?") {
    oRet.bindings[1].name = pattern.predicate.substring(1);
  }

  if (!triple.object_literal_p)
  {
    oRet.bindings[2].uri = triple.object;
    if (pattern.objectUri.charAt(0) == "?") {
      oRet.bindings[2].name = pattern.objectUri.substring(1);
    }
  }
  else
  {
    oRet.bindings[2].literal = triple.object;
    if (pattern.objectLiteral.charAt(0) == "?") {
      oRet.bindings[2].name = pattern.objectLiteral.substring(1);
    }
  }

  /*
   * If the context flag is set, then use the context of the current triple.
   */

  if (pattern.setContext)
  {
    oRet.bindings[3].uri = triple.user;
    oRet.bindings[3].name = "context";
  }
  return oRet;
};


RDFGraph.prototype.loadFormatters = function(oParser)
{
    var bRet = true;
    var obj;
    var resources = this.resources;
    var triples = this.triples;

    for (var i = 0, len = this.resources.length; i < len; i++)
    {
        var s = resources[i];

        for (var j = 0; j < s.triples.length; j++)
        {
            var t = triples[ s.triples[j] ];

            /*
             * An included document is just dropped straight in.
             */

            if (t.predicate === "http://argot-hub.googlecode.com/include" || t.predicate === "http://www.w3.org/2002/07/owl#imports") {
              oParser.parseExternal(t.object);
            }//if ( there is an 'included' document )
        }//for (each triple)
    }//for (each subject)
    return bRet;
};//loadFormatters()


RDFGraph.prototype.createObject = function(s)
{
    var oRet = new myList();
    var triples = this.triples;

    for (var i = 0; i < s.triples.length; i++)
    {
        var t = triples[ s.triples[i] ];

        if (t.object_literal_p) {
          oRet.add(t.predicate, t.object.content);
        } else {
          oRet.add(t.predicate, t.object);
        }
    }//for (each triple about this resource)
    return oRet;
};//createObject()
