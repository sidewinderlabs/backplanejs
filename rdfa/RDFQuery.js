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

function RDFQuery(store) {
    this.store = store;
}//RDFQuery()


// ASK simply returns a true of false indicator as to whether
// there is a result set.
//
RDFQuery.prototype.ask = function(q) {
	var r = this.query2( q );

  return {
    head: { },
    "boolean": Boolean(r.results.bindings.length)
  };
}//ask


RDFQuery.prototype.serialiseObject = function(oAction, subject, context) {
  var obj = this.store.createObject("", subject);
  var icon = null;

  if (oAction.icon)
  {
    var icon = context.document.createElement('img');

    icon.setAttribute("src", oAction.icon);
    context.appendChild(icon);
  }//if ( there is an icon for this object definition )

  if (oAction.tooltip)
  {
    new YAHOO.widget.Tooltip(
      "anon" + this.somenum++,
      {
        context: icon ? icon : context,
        text: oAction.tooltip(obj)
      }
    );
  }//if ( there is a tooltip definition )

  return;
};

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
        new YAHOO.widget.Tooltip(
          "anon" + this.somenum++,
          {
            context: icon,
            text: eval(
              "'" +
              oAction.tooltip.content.replace(/\"/g, "\'").replace(/\n/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") +
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


/*
 * Walk the tree and do stuff.
 */

RDFQuery.prototype.walk = function(oAction) {
    var bRet = true;
    var obj;
    var resources = this.store.getGraph( "" ).resources;

    for (var i = 0, len = resources.length; i < len; i++)
    {
        var s = resources[i];

        for (var j = 0; j < s.triples.length; j++)
        {
            var t = this.store.getGraph( "" ).triples[ s.triples[j] ];

            if (oAction)
            {
              if (!oAction.predicate || (t.predicate == oAction.predicate))
              {
                if (!oAction.object || (t.object == oAction.object))
                {
                  if (oAction.pipesdata)
                  {
                    var pThis = this;
                    var rq = oAction.pipesdata(s);

                    var requestId = document.submissionJSON.run(
                      rq.url,
                      rq.params,
                      { subject: s, context: t.user },
                      function(data, userData)
                      {
                        if (oAction.adddata)
                          oAction.adddata(rq.url, data, userData.subject);

                        pThis.serialiseObject(oAction, userData.subject, userData.context);
                        return;
                      }//callback from Pipes
                    );
                  }//if ( we need to retrieve more data )
                  else
                  {
                    this.serialiseObject(oAction, s, t.user);
                  }
                }//if ( the predicate and object match )
              }
            }//if ( there is a registered action )
        }//for (each triple)
    }//for (each subject)

    return bRet;
};//walk()

RDFQuery.prototype.walk2 = function(sparql, oAction) {
    var bindings = sparql.results.bindings;

    for (var i = 0, len = bindings.length; i < len; i++)
    {
      var obj = bindings[i];

      this.processObject(oAction, obj);
    }//for (each object)

    return;
};//walk2()


RDFQuery.prototype.query = function(q) {
  var oRet =
    {
      head:
        {
          vars: [ ]
        },
      results:
        {
          ordered: false,
          distinct: false,
          bindings: [ ]
        }
    };

  var resources = this.store.getGraph( "" ).resources;
  var triples = this.store.getGraph( "" ).triples;


  /*
   * First collect a set of graphs based on the where clauses.
   */

  var graphList = [ ];
 
  for (var i = 0; i < q.where.length; i++)
  {
    var pattern = q.where[i];
    var graph =
      {
        pattern: pattern,
        triples: [ ]
      }

    for (var j = 0, len = resources.len(); j < len; j++)
    {
        var s = resources[j];

        if (pattern.subject.charAt(0) == "?" || pattern.subject.charAt(0) == "$" || (pattern.subject == s.resource))
        {
          for (var k = 0; k < s.triples.length; k++)
          {
              var t = triples[ s.triples[k] ];
  
              if (
                (pattern.predicate.charAt(0) == "?" || pattern.predicate.charAt(0) == "$" || (pattern.predicate == t.predicate))
                &&
                (!(pattern.objectUri) || pattern.objectUri.charAt(0) == "?" || pattern.objectUri.charAt(0) == "$" || ((pattern.objectUri == t.object) && !t.object_literal_p))
                &&
                (!(pattern.objectLiteral) || pattern.objectLiteral.charAt(0) == "?" || pattern.objectLiteral.charAt(0) == "$" || ((pattern.objectLiteral == t.object) && t.object_literal_p))
              )
                graph.triples.push( t );
          }//for ( each of triple tied to this resource )
        }//if ( the subjects match )
    }//for ( each resource )

    graphList.push( graph );

  }//for ( each pattern )


  /*
   * We now have a list of result-sets; we need to go through them and merge.
   */

  var y = [ ];
 
  for (i = 0; i < graphList.length; i++)
  {
    var graph = graphList[i];

    for (var j = 0; j < graph.triples.length; j++)
    {
      var o = this.store.serialiseResult(graph.graphURI, graph.triples[j], graph.pattern);

      /*
       * First we create an object.
       */

      var x = [ ];

      for (var k = 0; k < 4; k++)
      {
        /*
         * If there is a named value, then use it as a property.
         */
  
        x[k] = (o.bindings[k].name)
          ? { name: o.bindings[k].name, value: o.bindings[k].uri || o.bindings[k].literal }
          : null;
      }

      /*
       * Now we need to see if we already have a matching object.
       *
       * Note that first time through we always push onto the stack.
       */
  
      if (!i)
      {
        var z = { matches: true, failed: false, values: [ ] };

        for (k = 0; k < 4; k++)
        {
          if (x[k])
            z.values[x[k].name] = x[k].value;
        }
        y.push( z );
      }
      else
      {
        for (k = 0; k < y.length; k++)
        {
          var toMerge = y[k];
          if (toMerge.failed)
            continue;

          var merge = true;

          /*
           * If there is a full match, then we add the additional properties, if there is no match we can ignore it,
           * and if there is a partial match, we remove the stored value unless the pattern is optional.
           */

          for (m = 0; m < 4; m++)
          {
            if (x[m] && toMerge.values[x[m].name] && (x[m].value != toMerge.values[x[m].name]))
            {
              merge = false;
              break;
            }
          }
  
          if (merge)
          {
            for (m = 0; m < 4; m++)
            {
              if (x[m])
                toMerge.values[x[m].name] = x[m].value;
            }
            toMerge.matches = true;
          }
        }//for ( each item already found )
      }//if ( this is the first time through )
    }

    /*
     * Now we have to go back through the list again to see if any objects failed to get a match. If they
     * did then we remove them.
     */

    for (k = 0; k < y.length; k++)
    {
      var o = y[k];

      if (o.matches || graph.pattern.optional)
        o.matches = false;
      else
        o.failed = true;
    }
  }//for ( each graph )

  /*
   * Finally, find all the good matches.
   */

  for (i = 0; i < y.length; i++)
  {
    var o = y[i];
    var r = { };

    /*
     * If we have a good match...
     */

    if (!o.failed)
    {

      /*
       * ... copy all of requested properties.
       */

      for (var j = 0; j < q.select.length; j++)
      {
        var variable = q.select[j].substring(1);

        r[variable] = o.values[variable];
      }
      r.context = o.values["context"];
      oRet.results.bindings.push( r );
    }//if ( the item passed all of where clauses )
  }//for ( each result )
  return oRet;
}//query()

RDFQuery.prototype.query2 = function(q) {
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


  this.addGraphs(q.from ? q.from : "", q.where, results, graphList);

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

  return oRet;
}//query2()

RDFQuery.prototype.getSingleValue = function(where) {
	var r = document.meta.query2({
		select: [ "result" ],
		where: where
	});

	return (r && r.results.bindings[0] && r.results.bindings[0]["result"])
		? r.results.bindings[0]["result"].content
		: null;
}//getSingleValue()


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
        this.mergeResultSets(results, subresults, pattern.optional);
      }
    }
    else if (pattern.pattern)
    {
			if (typeof(pattern.pattern) === "string") {
				var arPattern = pattern.pattern.split("<");
				debugger;

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
        }
  
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
}//addGraphs


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
     * did then we can mark them as having failed, and they won't feature any further operations. Note that if the current
     * pattern is optional, then it always counts as a match.
     */

    for (k = 0; k < results.length; k++)
    {
      var temp = results[k];

      if (temp.matches || graph.pattern.optional)
        temp.matches = false;
      else
        temp.failed = true;
    }
  }//for ( each graph )


  /*
   * Now clear the graph-list.
   */

  graphList.length = 0;

  return;
}//mergeGraphs


/*
 * Merge two result-sets.
 */

RDFQuery.prototype.mergeResultSets = function(results, subresults, optional) {
  for (i = 0; i < subresults.length; i++)
  {
    var subresult = subresults[i];

    if (!subresult.failed)
    {

      /*
       * Now we need to see if we already have an object in our results list to merge with.
       *
       * Note that first time through we always push onto the stack, since the first result
       * 'always matches'.
       */
  
      if (!results.length)
      {
        results.push( subresult );
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

          for (var m in subresult.values)
          {
            if (subresult.values[m] && toMerge.values[m] && (subresult.values[m] != toMerge.values[m]))
            {
              merge = false;
              break;
            }
          }
  
          if (merge)
          {
            for (m in subresult.values)
            {
              if (subresult.values[m])
                toMerge.values[m] = subresult.values[m];
            }
            toMerge.matches = true;
          }
        }//for ( each item already found )
      }//if ( this is the first time through )
    }//for ( each graph in the results set )


    /*
     * Now we have to go back through the list of candidate objects and see if any of them failed to get a match. If they
     * did then we can mark them as having failed, and they won't feature any further operations. Note that if the current
     * pattern is optional, then it always counts as a match.
     */

    for (k = 0; k < results.length; k++)
    {
      var temp = results[k];

      if (temp.matches || optional)
        temp.matches = false;
      else
        temp.failed = true;
    }
  }//for ( each graph )

  return results;
}//mergeResultSets

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
	var expanded = f.replace(
		/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
		function (m) { return getPropertyFromVar(context.obj, m); }
	);

	try {
	  eval( expanded );
	} catch(e) {
		throw "Failed to execute '" + name + "' (" + (e.message ? e.message : e.description) + ")";
	}
	return;
}

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
				try {
					q = classobj.q.content.replace(
						/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
						function (m) { return getPropertyFromVar(obj, m); }
					);
				} catch(e) {
				  debugger;
				}

        var r = document.meta.query2( eval( "({" + q + "})" ) );

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
        format.pipesdata.content.replace(/[\n\r]/g, "").replace(/\"/g, "'").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "obj.$1") +
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
				t = format.embedInit.content.replace(
					/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
					function (m) { return getPropertyFromVar(obj, m); }
				);
        eval( t );
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
