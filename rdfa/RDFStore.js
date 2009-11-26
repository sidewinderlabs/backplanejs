/*
 * Ubiquity provides a standards-based suite of browser enhancements for
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
//= require "RDFGraph"
//
/*
 * The triple store holds a list of graphs.
 */

function RDFStore() {
	this.graphs = [ ];
	this.bnode_counter = 0;
}//RDFStore()


/*
 * To empty a store, clear all of the graphs.
 */

RDFStore.prototype.clear = function() {
	var name;

	for (name in this.graphs) {
		this.graphs[ name ].clear();
		delete this.graphs[ name ];
	}
	this.graphs.length = 0;
	return;
}//clear


RDFStore.prototype.getGraph = function( graphURI ) {
	// A null or empty graph URI means use the default graph.
	//
	graphURI = graphURI || "default";

	// If the graph we want doesn't exist, then create it.
	//
	if ( !this.graphs[ graphURI ] ) {
		this.graphs[ graphURI ] = new RDFGraph( graphURI );
	}
	return this.graphs[ graphURI ];
}//getGraph


/*
 * Add a triple to the store.
 */

RDFStore.prototype.add = function(graphURI, sSubject, sPredicate, sObject, bObjectIsLiteral, oUser) {
	// Add our triple:
	//
	var t = this.getGraph( graphURI ).add(sSubject, sPredicate, sObject, bObjectIsLiteral, oUser);

	// Notify any listeners:
	//
	this.tripleAdded( t );
	return t;
};//RDFStore.add()

RDFStore.prototype.tripleAdded = function(triple) {
    return;
}

RDFStore.prototype.insert = function(graph) {
  var graphName, i, isResource, k, triple, subgraph, subj, obj;

  //
  // Usually we have an array of graphs with no name. But there are two futher possibilities:
  //
  // - that we have a single graph, in which case we turn it into an array of one element;
  //
  // - that we have an object that contains a graph, plus some other stuff.
  //

  while (!graph.length) {
    if (graph.graph) {
      graph = graph.graph;
    }
    else
      graph = [ graph ];
  }

  for (i = 0; i < graph.length; i++) {
    subgraph = graph[i];
    graphName = subgraph.name || "";

    // If the subgraph has a 'pattern' property then use that as a complete set of triples.

    if (subgraph.pattern) {
      triple = graph[i].pattern;

      this.add(
      	graphName,
        triple[0],
        triple[1],
        triple[2],
        triple[3],
        null
      );
    }

    // Otherwise we have a RDF/JSON structure.

    else {
      // If there is no subject then create a bnode

      subj = subgraph["$"] || ("bnode:dummy" + this.bnode_counter++);
			if ((typeof(subj) === "string") && (subj.indexOf('<') === 0) && (subj.lastIndexOf('>') === subj.length - 1)) {
				subj = subj.substring(1, subj.length - 1);
			}

      // For each item in the graph we will create a triple that uses the main subject. Note that we don't want to
      // create a predicate from the subject itself.

      for (k in subgraph) {
        if (k !== "$") {
        	obj = subgraph[k];

					// If a string begins with '<' and ends with '>' then it's a full URI.
					//
					if ((typeof(obj) === "string") && (obj.indexOf('<') === 0) && (obj.lastIndexOf('>') === obj.length - 1)) {
						isResource = true;
						obj = obj.substring(1, obj.length - 1);
					} else {
	          isResource = (typeof(obj) === "object" && !obj.exec)
	          	|| (k === "http://xmlns.com/foaf/0.1/accountServiceHomepage") || (k === "http://argot-hub.googlecode.com/tooltip") || (k === "http://argot-hub.googlecode.com/icon");
	        }

          // Create a triple using:
          //
          //  - the subject set for the entire JSON object;
          //  - the property name as a predicate;
          //  - the property value as the RDF object.
          //
          // If the property value is another JSON object then we recurse, and use the subject from that
          // JSON object as the RDF object. (Note that a JavaScript regular expression object is unfortunately
          // just another object, so we need to test for a method.)

          this.add(
          	graphName,
            subj,
            k,
            (isResource)
              ? (
                (typeof obj == "object")
                  ? this.insert(obj, graphName)
                  : obj
              )
              : { content: obj },
            !isResource,
            null
          );
        }//if this is not the subject property
      }//for each predicate
    }//if this is a pattern...else...
  }//for each graph

  return subj;
}//insert


RDFStore.prototype.createBindings = function(graphURI, triple, pattern) {
	return this.getGraph( graphURI ).createBindings(triple, pattern);
}


RDFStore.prototype.serialiseResult = function(graphURI, triple, pattern) {
	return this.getGraph( graphURI ).serialiseResult(triple, pattern);
}


RDFStore.prototype.loadFormatters = function(graphURI, parser) {
	return this.getGraph( graphURI ).loadFormatters( parser );
};//loadFormatters()


RDFStore.prototype.createObject = function(graphURI, s) {
	return this.getGraph( graphURI ).createObject( s );
};//createObject()