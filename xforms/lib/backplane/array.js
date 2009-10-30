/*
 * Needs moving somewhere else...but not sure where yet.
 *
 * Note that there are umpteen implementations of this in libraries like prototype, so we
 * don't need another one here. But since we are only relying on YUI at the moment, we'll
 * need something.
 */

function ubArray() {
	this._list = [ ];
}

ubArray.prototype.add = function(key, obj, bLock) {
	var found = false,
	    i;

	for (i = 0; i < this._list.length; i++) {
		if (this._list[i].name === key) {
			found = true;
			break;
		}
	}

	if (found && !this._list[i].locked) {
		this._list[i].item = obj;
	} else {
		this._list.push(
			{
				name: key,
				item: obj,
				locked: bLock
			}
		);
		i = this._list.length - 1;
	}
	return this._list[i].item;
}//add()

ubArray.prototype.get = function(key) {
	var oRet = null,
	    i;
	
	if (typeof(key) === "number" && (key >= 0 && key < this._list.length)) {
		oRet = this._list[key].item;
	} else {
		for (i = 0; i < this._list.length; i++) {
			if (this._list[i].name === key) {
				oRet = this._list[i].item;
				break;
			}
		}
	}//if ( key is an index ) ... else ...
	return oRet;
}//get()
