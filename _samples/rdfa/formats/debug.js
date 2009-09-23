//
// Reasons this is better than RDF/JSON:
//
// - makes use of bnodes, so you don't have to keep thinking of them. RDF/JSON is fine
//   because it is usually serialised from RDF. But for an author coding by hand, RDFj
//   is better;
//
// - uses Turtle strings, which mean that language is added with @en, for example. This
//   makes it very easy for authors familiar with Turtle or N3, and reduces the proliferation
//   of properties;
//
// RDF/JSON might be better because:
//
// - in RDFj, the subject is a predicate. (Is this a disadvantage? You can view RDF as
//   a collection of graphs, rather than a collection of triples. So each graph is a
//   a collection of name/value pairs, and one of those is the name of the graph.
//

document.meta.store.insert(
  [
    {
      "$": "<http://ubiquity-rdfa.googlecode.com/svn/trunk/_samples/formats/debug.html>",
	      "a": "<http://www.w3.org/2004/09/fresnel#Group>"
    },
    {
    	/* bnode */
	      "a": "<http://www.w3.org/2004/09/fresnel#Format>",
	      "http://www.w3.org/2004/09/fresnel#group": "<http://ubiquity-rdfa.googlecode.com/svn/trunk/_samples/formats/debug.html>",
	      "http://www.w3.org/2004/09/fresnel#instanceFormatDomain": 'select: [ "s" ], where: [ { pattern: [ "?s", "?p", "?o" ] } ]',

				"http://argot-hub.googlecode.com/action": function(obj) {
					var
						elTree = document.getElementById("tree"),
						elTable = document.getElementById("table"),
						tree, table, ds,
						labelStyle,
						rootNode,
						tmpNode,
						mode = "tree",
						subject = obj.s
						;

					if (mode === "table") {
						if (elTable["table"]) {
							table = elTable.table;
						} else {
							YAHOO.util.Dom.addClass(document.body, "yui-skin-sam");
							ds = new YAHOO.util.LocalDataSource([ ]);
							ds.responseType = YAHOO.util.XHRDataSource.TYPE_JSARRAY;
							ds.responseSchema = {fields:["subject", "predicate", "object"]};
							table = new YAHOO.widget.DataTable(
								"table",
								[
									{key:"subject", width: 300, sortable:true, resizeable:true},
									{key:"predicate", width: 300, sortable:true, resizeable:true},
									{key:"object", sortable:true, resizeable:true}
								],
								ds,
								{scrollable:true, height:"10em"}
							);
							elTable.table = table;
						}
					}
	
					if (mode === "tree") {
						if (elTree["tree"]) {
							tree = elTree.tree;
						} else {
							tree = new YAHOO.widget.TreeView("tree");
							elTree.tree = tree;
						}
	
						//get a reference to the root node; all
			    	//top level nodes are children of the root node:
			    	rootNode = tree.getRoot();
			    	
			    	//begin adding children
			    	var tmpNode = new YAHOO.widget.TextNode(subject, tree.getRoot(), false);
			    	
			    	//the tree won't show up until you draw (render) it:
			    	tree.draw();
			    }

					// See if there are any styling rules based on the type of the subject.
					//
					labelStyle = document.meta.getSingleValue(
						[
							{ pattern: [ subject, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "?type" ] },
							{ pattern: [ "?type", "http://www.w3.org/2004/09/fresnel#classFormatDomain", "?format" ] },
							{ pattern: [ "?format", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2004/09/fresnel#Format" ] },
							{ pattern: [ "?format", "http://www.w3.org/2004/09/fresnel#resourceStyle", "?result" ] }
						]
					);
					if (labelStyle) {
						tmpNode.labelStyle = labelStyle;
					}
		      
		      /*
		      * For each subject we get all of the triples associated with it.
		      */
		      
		      var properties = document.meta.query2({
	  	      select: [ "p", "o" ],
	  	      where:
	    	      [
	      	      { pattern: [ subject, "?p", "?o" ] }
	    	      ],
	    	     distinct: true
		      });
		      
		      /*
		      * Once again we walk the results, and this time output each triple.
		      */
		      
		      document.meta.walk2(
	  	      properties,
	  	      {
	    	      action: function(obj) {
			   	      var predicate = "&lt;" + obj.p + "&gt;", object;
			   	      var textNodeStyle;
	
	              if (obj.o) {
	                if (obj.o.content) {
	                	object = "\"" + obj.o.content + "\"";
	                  if (obj.o.datatype) {
	                  	object += "^^" + obj.o.datatype;
	                  }
	                } else {
										object = "&lt;" + obj.o + "&gt;";
	                }//if ( we have a string literal ) ... else ...
	              }
	
	              if (mode === "tree") {
									// See if there are any styling rules based on the predicate.
									//
									textNodeStyle = document.meta.getSingleValue(
										[
											{ pattern: [ obj.p, "http://www.w3.org/2004/09/fresnel#propertyFormatDomain", "?format" ] },
											{ pattern: [ "?format", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2004/09/fresnel#Format" ] },
											{ pattern: [ "?format", "http://www.w3.org/2004/09/fresnel#resourceStyle", "?result" ] }
										]
									);
		              new YAHOO.widget.HTMLNode(
		              	{
		              		html: predicate + " " + object,
		              		contentStyle: textNodeStyle ? textNodeStyle : "treeTextNode"
		              	},
		              	tmpNode,
		              	false
		              );
		            }
	
		            if (mode === "table") {
		            	table.addRow({ subject: subject, predicate: predicate, object: object });
		            }
		            return;
	        	  }
	    	    }
	    	  );
		    	return;
				}//action()
		}
	]
);
