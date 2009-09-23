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
      "$": "http://ubiquity-rdfa.googlecode.com/svn/branches/0.7/test/formats/ebay.html",
      "a": "http://www.w3.org/2004/09/fresnel#Group"
    },
    {
      "http://www.w3.org/2004/09/fresnel#group": "http://ubiquity-rdfa.googlecode.com/svn/trunk/test/formats/ebay.html",
      "http://argot-hub.googlecode.com/constructor":
        'document.Yowl.register(' +
        '    "ebay",' +
        '    [ "Found an item" ],' +
        '    [ "Found an item" ],' +
        '    "http://www.ebay.com/favicon.ico"' +
        '  );'
    },
    {
      "a": "http://www.w3.org/2004/09/fresnel#Format",
      "http://www.w3.org/2004/09/fresnel#group": "http://ubiquity-rdfa.googlecode.com/svn/trunk/test/formats/ebay.html",
      "http://www.w3.org/2004/09/fresnel#instanceFormatDomain": 'select: [ "s", "item" ], where: [ { pattern: [ "?s", "http://ebay.com/item", "?item" ], setUserData: true } ]',  
      "http://www.w3.org/2004/09/fresnel#resourceStyle": "ebay-item",
      "http://argot-hub.googlecode.com/yowl":
        '   document.Yowl.notify(' +
        '     "Found an item",' +
        '     "Found eBay item " + ${item.content},' +
        '     "About to retrieve more information from eBays API",' +
        '     "ebay",' +
        '     "http://www.ebay.com/favicon.ico",' +
        '     false,' +
        '     0' +
        '   );',
      "http://argot-hub.googlecode.com/tooltip": {
        "http://argot-hub.googlecode.com/icon": "http://www.ebay.com/favicon.ico",
        "http://argot-hub.googlecode.com/template":
          '<object width="355" height="300">' +
          '    <param name="movie" value="http://togo.ebay.com/togo/togo.swf?2008013100" />' +
          '    <param name="flashvars" value="base=http://togo.ebay.com/togo/&amp;lang=en-us&amp;mode=normal&amp;itemid=${item.content}&amp;query=track%20bike" />' +
          '    <embed src="http://togo.ebay.com/togo/togo.swf?2008013100" type="application/x-shockwave-flash" width="355" height="300"' +
          '      flashvars="base=http://togo.ebay.com/togo/&amp;lang=en-us&amp;mode=normal&amp;itemid=${item.content}&amp;query=track%20bike"></embed>' +
          '  </object>'
      }
    }
  ]
);
