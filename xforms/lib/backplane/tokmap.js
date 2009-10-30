function mappings() {
	this._list = new ubArray();
}

mappings.prototype.add = function(prefix, uri) {
	return this._list.add(prefix, uri);
}

mappings.prototype.get = function(prefix) {
	return this._list.get(prefix);
}

mappings.prototype.addFromElement = function(element) {

		/*
     * In IE, any namespaces that are placed on the HTML element
     * get parsed out and treated specially, which means that we
     * won't see them when we process the actual <html> element.
     * Therefore we need to ensure that we process them on the
     * document object itself.
     */

    if (element.nodeType === 9) {
        var oNamespaces = null;

        try
        {
            oNamespaces = element.namespaces;
        }
        catch(e)
        {
        }

        if (oNamespaces)
        {
            var oNamespace;

            for (var i = 0; i < oNamespaces.length; i++)
            {
                oNamespace = oNamespaces[i];

                this._list.add(oNamespace.name, oNamespace.urn);
            }
        }//if (there is a namespaces collection)
    }
    else
    {
        // Iterate through the attributes
        var attributes = element.attributes;

        if (attributes)
        {
            var sName;

            for (var i = 0; i < attributes.length; i++)
            {
                /*
                 * [TODO] Should use a regular expression to crack this
                 * open.
                 */

                if (attributes[i].name.substring(0, 5) == "xmlns")
                {
                    if (attributes[i].name.length == 5)
                        this._list.add("", attributes[i].value);

                    if (attributes[i].name.substring(5, 6) != ':')
                        continue;

                    var prefix = attributes[i].name.substring(6);
                    var uri = attributes[i].value;

                    this._list.add(prefix, uri);
                }
            }
        }//if (there are attributes)
    }
    return;
}//addFromElement
