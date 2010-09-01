// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa support to the Ubiquity library.
//
// Copyright (C) 2007-8 Mark Birbeck
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

// The aim of this module is to run SPARQL queries against the data store.
// The values returned are as defined in:
//
//		http://www.w3.org/TR/rdf-sparql-json-res/
//
//= require <core>
//= require "RDFParser"
//
function RDFQuery(store) {
    this.store = store;
}//RDFQuery()


// ASK simply returns a true or false indicator as to whether
// there is a result set.
//
RDFQuery.prototype.ask = function(q) {
	var r = this.query2( q );

  return {
    head: { },
    "boolean": Boolean(r.results.bindings.length)
  };
};//ask

RDFQuery.prototype.processObject = function(oAction, obj) {
  var context = obj.user;

  if (context)
  {
    var icon = null;

    if (oAction.icon)
    {
      icon = context.document.createElement('img');

      icon.setAttribute("src", oAction.icon);
      context.appendChild(icon);
    }//if ( there is an icon for this action definition )

    if (oAction.style)
    {
      //YAHOO.util.setStyle(context, "border", oAction.style.content);
      context.style["border"] = oAction.style.content;
    }//if ( there is a style for this action definition )

    if (obj.icon)
    {
      icon = context.document.createElement('img');

      icon.setAttribute("src", obj.icon);
      context.appendChild(icon);
    }//if ( there is an icon for this object definition )

    if (oAction.tooltip)
    {
      if (icon)
      {
        var x = new YAHOO.widget.Tooltip(
          "anon" + this.somenum++,
          {
            context: icon,
            text: eval(
              "'" +
              oAction.tooltip.content.replace(/\"/g, "\'").replace(/\r/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") +
              "'"
            )
            //text: oAction.tooltip(obj)
          }
        );
      }
      else
      {
        var el = context.document.createElement('span');

        el.innerHTML = eval("'" + oAction.tooltip.content.replace(/\n/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") + "'");
        context.appendChild(el);
      }
    }//if ( there is a tooltip definition in the action )

    if (obj.tooltip && icon)
    {
      new YAHOO.widget.Tooltip(
        "anon" + this.somenum++,
        {
          context: icon,
          text: eval("'" + obj.tooltip.content.replace(/\n/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") + "'")
          //text: eval("'" + obj.tooltip.content.replace(/\$\{(.*)\}/g, "$+"))
        }
      );
    }//if ( there is a tooltip definition from the triple store )
  }//if ( a context has been set )

  if (oAction.action)
  {
    oAction.action( obj );
  }//if ( there is an action )

  if (obj.imp)
  {
    var oParser = new RDFParser(this.store);

    oParser.parseExternal(obj.imp, oAction.onexternal);
  }//if ( there is an import instruction )

  return;
};//processObject()

RDFQuery.prototype.walk2 = function(sparql, oAction) {
    var bindings = sparql.results.bindings;

    for (var i = 0, len = bindings.length; i < len; i++)
    {
      var obj = bindings[i];

      this.processObject(oAction, obj);
    }//for (each object)

    return;
};//walk2()


RDFQuery.prototype.rawQuery = function(graphURI, q, callback) {
  var oRet =
    {
      head:
        {
          vars: [ ]
        },
      results:
        {
          ordered: false,
          distinct: (typeof q.distinct === "undefined") ? true : Boolean(q.distinct),
          bindings: [ ]
        }
    };

  var graphList = [ ];
  var results = [ ];
  var bindings, vars;
  var i, j, k, duplicate;
  var uuid = 0;

  this.addGraphs(graphURI, q.where, results, graphList);

  if (graphList.length)
    this.mergeGraphs(results, graphList);

  /*
   * Find all of the good matches, which simply means any match that hasn't failed.
   */

  for (i = 0; i < results.length; i++)
  {
    var temp = results[i];
    var result = { };

    /*
     * If we have a good match...
     */

    if (!temp.failed)
    {

      /*
       * ... copy all of requested properties.
       *
       * [TODO] A variable of '*' means copy everything.
       */

      if (q.select && (q.select[0] != "*"))
      {
        for (var j = 0; j < q.select.length; j++)
        {
          var variable = q.select[j];

          oRet.head.vars[j] = variable;
          result[variable] = temp.values[variable];
        }
      }
      else
      {
        for (j = 0; j < temp.values.length; j++)
        {
          throw "Not sure about whether this correctly gets the name of property or key. (This will have been set with a 'select * where ...')";

          var variable = temp.values[j].name;

          oRet.head.vars[j] = variable;
          result[variable] = temp.values[variable];
        }
      }
      result["uuid"] = uuid++;
      result.user = temp.values["user"];
      oRet.results.bindings.push( result );
    }//if ( the item passed all of the where clauses )
  }//for ( each result )

	// If there are any results, and 'distinct' is set true, then reduce our list.
	//
	if (oRet.results.bindings.length && oRet.results.distinct) {
		bindings = oRet.results.bindings;
		vars = oRet.head.vars;

		for (i = 0; i < bindings.length; i++) {
			bindings[i]["uuid"] = i;
			for (j = i + 1; j < bindings.length; j++) {
				duplicate = true;
				for (k = 0; k < vars.length; k++) {
					varname = vars[k];
					if (bindings[i][varname] !== bindings[j][varname]) {
						duplicate = false;
						break;
					}
				}
				// Note that if we remove an item we need to negate the increment
				// that is about to happen on our loop.
				//
				if (duplicate) {
					bindings.splice(j--, 1);
				}
			}
		}
	}

  if (typeof(callback) === "function") {
    callback.call(null, oRet);
  }

  return oRet;
};//rawQuery()


RDFQuery.prototype.query2 = function(q, callback) {
	var oRet;
  var graphProcessor;
	var graphURI = q.from ? q.from : "default";
  var that = this;

	if (graphURI === "default" || graphURI === "about-graphs") {
		oRet = this.rawQuery(graphURI, q, callback);
	} else {

		/*
		 * See if there is any information about how to handle this graph.
		 */

	  graphProcessor = document.meta.query2({
	    select: [ "uri", "matches", "params", "adddata" ],
	    from: "about-graphs",
	    where:
	      [
	        { pattern: [ "?s", "http://argot-hub.googlecode.com/uri", "?uri" ] },
	        {
	        	pattern: [ "?s", "http://argot-hub.googlecode.com/matches", "?matches" ],
	        	filter: function(o) { return o["matches"].content.exec( graphURI ); }
	        },
	        { pattern: [ "?s", "http://argot-hub.googlecode.com/params", "?params" ], optional: true },
	        { pattern: [ "?s", "http://argot-hub.googlecode.com/adddata", "?adddata" ] }
	      ]
	  });

		if ( !graphProcessor.results.bindings.length ) {
			oRet = this.rawQuery(graphURI, q, callback);
		} else {
   		var uri = graphProcessor.results.bindings[0].uri.content.replace(/%s/, graphURI.match(graphProcessor.results.bindings[0].matches.content)[1]);
	    var requestId = document.submissionJSON.run(
	      uri,
	      {
          callbackParamName: "callback",
          count: "2"
        },
	      null,
	      function(data, userData)
	      {
	        if (graphProcessor.results.bindings[0].adddata) {
	        	execFuncWithObj(graphProcessor.results.bindings[0].adddata.content, { data: data, obj: userData}, "adddata");
	        }
	        if (graphProcessor.results.bindings[0].afterpipesdata) {
	          processFresnelSelectors(graphProcessor.results.bindings[0].afterpipesdata, userData);
	        }
					oRet = that.rawQuery(graphURI, q, callback);
	        return;
	      }//callback from Pipes
	    );
		}
	}

  return oRet;
};//query2()

RDFQuery.prototype.getSingleValue = function(where) {
	var r = document.meta.query2({
		select: [ "result" ],
		where: where
	});

	return (r && r.results.bindings[0] && r.results.bindings[0]["result"])
		? r.results.bindings[0]["result"].content
		: null;
};//getSingleValue()


RDFQuery.prototype.addGraphs = function(graphURI, where, results, graphList) {

  /*
   * First collect a set of graphs based on the where clauses. A triple matches if all of its components
   * match the query triple, or the query triple has a variable in the position of a component that does
   * not match.
   */

  var resources = this.store.getGraph( graphURI ).resources;
  var triples = this.store.getGraph( graphURI ).triples;

  for (var i = 0; i < where.length; i++)
  {
    var pattern = where[i];

    if (pattern.where)
    {

      /*
       * First, complete the previous graph.
       */

      if (graphList.length)
        this.mergeGraphs(results, graphList);

      var subgraphList = [ ];
      var subresults = [ ];

      this.addGraphs(graphURI, pattern.where, subresults, subgraphList);
      if (subgraphList.length)
      {
        this.mergeGraphs(subresults, subgraphList);
      }
    }
    else if (pattern.pattern)
    {
			if (typeof(pattern.pattern) === "string") {
				var arPattern = pattern.pattern.split("<");

				if ((typeof(arPattern[0]) === "string") && (arPattern[0].indexOf('<') === 0) && (arPattern[0].lastIndexOf('>') === arPattern[0].length - 1)) {
					arPattern[0] = arPattern[0].substring(1, arPattern[0].length - 1);
				}
				if ((typeof(arPattern[1]) === "string") && (arPattern[1].indexOf('<') === 0) && (arPattern[1].lastIndexOf('>') === arPattern[1].length - 1)) {
					arPattern[1] = arPattern[1].substring(1, arPattern[1].length - 1);
				}
				if ((typeof(arPattern[2]) === "string") && (arPattern[2].indexOf('<') === 0) && (arPattern[2].lastIndexOf('>') === arPattern[2].length - 1)) {
					arPattern[2] = arPattern[2].substring(1, arPattern[2].length - 1);
				}
				if ((typeof(arPattern[2]) === "string") && (arPattern[2].indexOf('"') === 0) && (arPattern[2].lastIndexOf('"') === arPattern[2].length - 1)) {
					arPattern[2] = arPattern[2].substring(1, arPattern[2].length - 1);
				}
				pattern.pattern = arPattern;
			}


      /*
       * Map a predicate of "a" to rdf:type.
       */

      if (pattern.pattern[1] == "a")
        pattern.pattern[1] = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

      var graph =
        {
        	graphURI: graphURI,
          pattern: pattern,
          triples: [ ]
        };

      for (var j = 0, len = resources.length; j < len; j++)
      {
          var s = resources[j];

          if (pattern.pattern[0].charAt(0) == "?" || pattern.pattern[0].charAt(0) == "$" || (pattern.pattern[0] == s.resource))
          {
            for (var k = 0; k < s.triples.length; k++)
            {
                var t = triples[ s.triples[k] ];

                if (
                  (pattern.pattern[1].charAt(0) == "?" || pattern.pattern[1].charAt(0) == "$" || (pattern.pattern[1] == t.predicate))
                  &&
                  (pattern.pattern[2].charAt(0) == "?" || pattern.pattern[2].charAt(0) == "$" || ((pattern.pattern[2] == t.object) && !t.object_literal_p) || ((pattern.pattern[2] == t.object.content) && t.object_literal_p))
                )
                  graph.triples.push( t );
            }//for ( each triple tied to this resource )
          }//if ( the subjects match )
      }//for ( each resource )

      /*
       * Save the graph before moving on to the next where clause.
       */

      graphList.push( graph );
    }//if ( we have a basic pattern )
  }//for ( each pattern )

  return;
};//addGraphs


/*
 * Take a list of graphs and add them to a result-set.
 */

RDFQuery.prototype.mergeGraphs = function(results, graphList) {
  for (var i = 0; i < graphList.length; i++)
  {
    var graph = graphList[i];

    for (var j = 0; j < graph.triples.length; j++)
    {
      /*
       * For each triple create an object that contains the values plus any variable names.
       */

      var t = this.store.createBindings(graph.graphURI, graph.triples[j], graph.pattern);

      /*
       * Next go through each of the values, and if it has a variable name, copy it into
       * a temporary object.
       */

      var temp = [ ];

      for (var k = 0; k < 4; k++)
      {
        /*
         * If there is a named value, then use it as a property.
         */

        temp[k] = (t.bindings[k].name)
          ? { name: t.bindings[k].name, value: t.bindings[k].uri || t.bindings[k].literal }
          : null;
      }

      /*
       * Now we need to see if we already have an object in our results list to merge with.
       *
       * Note that first time through we always push onto the stack, since the first result
       * 'always matches'.
       */

      if (!i /*results.length*/)
      {
        var result = { matches: true, failed: false, values: [ ] };

        for (k = 0; k < 4; k++)
        {
          if (temp[k])
            result.values[temp[k].name] = temp[k].value;
        }
        results.push( result );
      }
      else
      {
        /*
         * If this is not the first time through, we need to see if there are any objects already
         * in the list of results that 'match' our object, and if so, merge the values.
         */

        for (k = 0; k < results.length; k++)
        {

          /*
           * Get the next object, and if it has previously been ruled out by failing a match then
           * we don't need to process it.
           */

          var toMerge = results[k];
          if (toMerge.failed)
            continue;


          /*
           * We're now looking to take any properties that are on the object to merge, and add them to any object
           * we already have that partially matches. The only reason not to do a merge is if there is a variable
           * that occurs in both objects but the value doesn't match.
           *
           * Note that if the two objects have nothing that matches then the match flag will be set to false. This
           * means that if the current search pattern is not optional, then the existing object will be marked as
           * failing to match, and be ignored.
           */

          var merge = true;

          for (var m = 0; m < 4; m++)
          {
            if (temp[m] && toMerge.values[temp[m].name] && (temp[m].value != toMerge.values[temp[m].name]))
            {
              merge = false;
              break;
            }
          }

          if (merge)
          {
            for (m = 0; m < 4; m++)
            {
              if (temp[m])
                toMerge.values[temp[m].name] = temp[m].value;
            }
            toMerge.matches = true;
          }
        }//for ( each item already found )
      }//if ( this is the first time through )
    }//for ( each graph in the results set )


    /*
     * Now we have to go back through the list of candidate objects and see if any of them failed to get a match. If they
     * did then we can mark them as having failed, and they won't feature in any further operations. Note that if the current
     * pattern is optional, then it always counts as a match.
     */

    for (k = 0; k < results.length; k++)
    {
      var temp = results[k];

      if (!(temp.matches || graph.pattern.optional) || (typeof(graph.pattern.filter) === "function" && !graph.pattern.filter.call(null, temp.values))) {
        temp.failed = true;
      } else {
        temp.matches = false;
      }
    }
  }//for ( each graph )


  /*
   * Now clear the graph-list.
   */

  graphList.length = 0;

  return;
};//mergeGraphs


function getPropertyFromVar(obj, m, errors) {
	var sRet;
	var propArr = m.match(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/);

	if ( propArr ) {
		sRet = (obj[ propArr[1] ])
			? ((obj[ propArr[1] ].content) ? obj[ propArr[1] ].content : obj[ propArr[1] ])
			: ((errors) ? "No value for '" + propArr[1] + "' (" + m + ")" : "");
	} else {
		sRet = (errors) ? "No key in '" + m + "'" : "";
	}
	return sRet;
}

function execFuncWithObj(f, context, name) {
	var expanded;

	try {
		if (typeof f === "string") {
			expanded = f.replace(
				/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
				function (m) { return getPropertyFromVar(context.obj, m); }
			);
		  eval( expanded );
		 } else {
		 	f.call(null, context);
		 }
	} catch(e) {
		throw "Failed to execute '" + name + "' (" + (e.message ? e.message : e.description) + ")";
	}
	return;
}
