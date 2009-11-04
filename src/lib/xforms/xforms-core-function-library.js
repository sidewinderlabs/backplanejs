// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
//
// Copyright (c) 2008-2009 Backplane Ltd.
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

/**@fileoverview
	implements the xforms-core function library as defined in http://www.w3.org/TR/xforms11/#expr-lib
	for Ubiquity XForms using the Google AJAXSLT XPath processor
	@requires FunctionCallExpr  defined in ajaxslt/xpath.js
*/


/**@addon
	trim is required by some of these XPath functions to produce a correct response.
*/
String.prototype.trim=function() {
    return this.replace(/^\s*|\s*$/g,'');
};

Date.prototype.setTimeInSeconds = function( seconds ) {
  this.setTime( seconds * 1000 );
}

Date.prototype.setTimeInMinutes = function( minutes ) {
  this.setTimeInSeconds( minutes * 60 );
}

Date.prototype.setTimeInHours = function( hours ) {
  this.setTimeInMinutes( hours * 60 );
}

Date.prototype.setTimeInDays = function( days ) {
  this.setTimeInHours( days * 24 );
}

function ThrowNotImpl(ctx) {
	throw "Not Implemented";
}

/**
	Retrieves the current date and time.
	
	@param {Object} oDate, a Javascript Date object.
	@param {boolean} bUTC, if true use UTC time; otherwise, local time.
	@returns {string} Date and time in xsd:dateTime format.
*/
function getDateTime(oDate, bUTC) {
	var s = "";
	var year, month, day, hours, minutes, seconds;

    if (bUTC) {
        year = oDate.getUTCFullYear();
        month = oDate.getUTCMonth() + 1;
        day = oDate.getUTCDate();
        hours = oDate.getUTCHours();
        minutes = oDate.getUTCMinutes();
        seconds = oDate.getUTCSeconds();
    } else {
        year = oDate.getFullYear();
        month = oDate.getMonth() + 1;
        day = oDate.getDate();
        hours = oDate.getHours();
        minutes = oDate.getMinutes();
        seconds = oDate.getSeconds();
    }

    /*
	 * Put the year first.
	 */
	s += year + "-";

	// If the month is less than ten give it a leading zero.	
	if (month < 10)
		month = "0" + month;
	s += month + "-";

	// Similarly, if the date is less than ten give it a leading zero.
	if (day < 10)
		day = "0" + day;
	s += day;
	
	// The date is separate from the time with a 'T'.
	
	s += "T"

	// Get the hours, minutes, and seconds, again adding leading zeros if necessary.	 
	if (hours < 10) {
		hours = "0" + hours;
	}
	s += hours + ":";

	if (minutes < 10){
		minutes = "0" + minutes;
	}
	s += minutes + ":";

	if (seconds < 10){
		seconds = "0" + seconds;
	}
	s += seconds;

    if (bUTC) {
        s += "Z";
    }

    return s;
}

/**
	Calculates the local time zone offset from UTC time.
	
	@param {Object} oDate, a Javascript Date object.
	@returns {string} Time zone offset in (('+' | '-') hh ':' mm) format.
*/
function getTZOffset(oDate) {
    var s = "";
    var tz = oDate.getTimezoneOffset();

    if (tz < 0) {
        s += "+";
        tz *= -1;
    } else {
        s += "-";
    }

    var hours = tz / 60;
    if (hours < 10) {
        hours = "0" + hours;
    }
    s += hours + ":";

    var minutes = tz % 60;
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    s += minutes;

    return s;
}

//	http://www.w3.org/TR/xforms11/#expr-lib-bool

/**@addon
	http://www.w3.org/TR/xforms11/#fn-boolean-from-string
*/
FunctionCallExpr.prototype.xpathfunctions["boolean-from-string"] = function(ctx) {
	var s = this.args[0].evaluate(ctx).stringValue();

	s = s.trim();
	return new BooleanValue((s.toLowerCase() === "true") || (s === "1"));
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-is-card-number
*/
FunctionCallExpr.prototype.xpathfunctions["is-card-number"] = function(ctx) {
    var sCardNum = "";
    if (!this.args || this.args.length == 0) {
        // default to the string value of the current context node.
        sCardNum = xmlValue(ctx.node);
    } else {
        sCardNum = this.args[0].evaluate(ctx).stringValue();
    }
    sCardNum = sCardNum.trim();

    // Check if the card number is a valid Luhn number.
    var sum = 0;
    var alt = false;

    for (var i = sCardNum.length - 1; i >= 0; --i) {
      var currentChar = sCardNum.charAt(i);
      if (currentChar < '0' || currentChar > '9') {
          return new BooleanValue(false);
      }
      var digit = currentChar - '0';

      if (alt) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      alt = !alt;
    }

    return new BooleanValue(sum % 10 == 0);
};

//	http://www.w3.org/TR/xforms11/#expr-lib-num

/**@addon
	http://www.w3.org/TR/xforms11/#fn-avg
*/
FunctionCallExpr.prototype.xpathfunctions["avg"] = function(ctx) {
    if (!this.args || this.args.length == 0) {
        return new NumberValue(NaN);
    }

    var n = this.args[0].evaluate(ctx).nodeSetValue();
    if (n.length == 0) {
        // Empty nodeset.
        return new NumberValue(NaN);
    }

    var sum = 0;
    for (var i = 0; i < n.length; ++i) {
        // Note that an empty string evaluates to zero.
        var num = xmlValue(n[i]) - 0;
        // If any node evaluates to NaN, the result is NaN.
        if (isNaN(num)) {
            return new NumberValue(NaN);
        }
        sum += num;
    }
    return new NumberValue(sum / n.length);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-min
*/
FunctionCallExpr.prototype.xpathfunctions["min"] = function(ctx) {
    if (!this.args || this.args.length == 0) {
        return new NumberValue(NaN);
    }

    var n = this.args[0].evaluate(ctx).nodeSetValue();
    if (n.length == 0) {
        // Empty nodeset.
        return new NumberValue(NaN);
    }

    var min = xmlValue(n[0]) - 0;
    for (var i = 0; i < n.length; ++i) {
        // Note that an empty string evaluates to zero.
        var num = xmlValue(n[i]) - 0;
        // If any node evaluates to NaN, the result is NaN.
        if (isNaN(num)) {
            return new NumberValue(NaN);
        }

        if (num < min) {
            min = num;
        }
    }
    return new NumberValue(min);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-max
*/
FunctionCallExpr.prototype.xpathfunctions["max"] = function(ctx) {
    if (!this.args || this.args.length == 0) {
        return new NumberValue(NaN);
    }

    var n = this.args[0].evaluate(ctx).nodeSetValue();
    if (n.length == 0) {
        // Empty nodeset.
        return new NumberValue(NaN);
    }

    var max = xmlValue(n[0]) - 0;
    for (var i = 0; i < n.length; ++i) {
        // Note that an empty string evaluates to zero.
        var num = xmlValue(n[i]) - 0;
        // If any node evaluates to NaN, the result is NaN.
        if (isNaN(num)) {
            return new NumberValue(NaN);
        }

        if (max < num) {
            max = num;
        }
    }
    return new NumberValue(max);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-count-non-empty
*/
FunctionCallExpr.prototype.xpathfunctions["count-non-empty"] = function(ctx) {
    if (!this.args || this.args.length == 0) {
        return new NumberValue(0);
    }

    var n = this.args[0].evaluate(ctx).nodeSetValue();
    if (n.length == 0) {
        // Empty nodeset.
        return new NumberValue(0);
    }

    var count = 0;
    for (var i = 0; i < n.length; ++i) {
        // A node is considered non-empty if it is convertible into a string
        // with a greater-than zero length. 
        var value = xmlValue(n[i]);
        if (value.length > 0) {
            count++;
        }
    }

    return new NumberValue(count);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-index
*/
FunctionCallExpr.prototype.xpathfunctions["index"] = function(ctx) {
    var s =  this.args[0].evaluate(ctx).stringValue();
    var oRpt = FormsProcessor.getElementById(s, ctx.resolverElement);
    if (oRpt && oRpt.getIndex) {
        return new NumberValue(oRpt.getIndex());
    }

    return new NumberValue(NaN);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-power
*/
FunctionCallExpr.prototype.xpathfunctions["power"] = function(ctx) {
  if (!this.args || (this.args.length != 2)) {
    return new NumberValue(NaN);
  }

  return new NumberValue(
    Math.pow(
      this.args[0].evaluate(ctx).numberValue(),
      this.args[1].evaluate(ctx).numberValue()
    )
  );
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-random
*/
FunctionCallExpr.prototype.xpathfunctions["random"] = function(ctx) {
    // Random() takes an optional boolean to specify whether or not the
    // random number generator should be seeded first, but javascript
    // will always seed the random number generator and doesn't allow one
    // to specify a seed.
    return new NumberValue(Math.random());
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-compare
*/
FunctionCallExpr.prototype.xpathfunctions["compare"] = function(ctx) {
    var result = NaN;
    if (this.args.length == 2) {
        var s1 = this.args[0].evaluate(ctx).stringValue();
        var s2 = this.args[1].evaluate(ctx).stringValue();

        if (s1 == s2) {
            result = 0;
        } else if (s1 > s2) {
            result = 1;
        } else {
            result = -1;
        }
    }
    return new NumberValue(result);
};

//	http://www.w3.org/TR/xforms11/#expr-lib-string

/**@addon
	http://www.w3.org/TR/xforms11/#fn-if
*/
FunctionCallExpr.prototype.xpathfunctions["if"] = function(ctx) {
	var bIf = this.args[0].evaluate(ctx).booleanValue();
	if (bIf)	{
		return new StringValue(this.args[1].evaluate(ctx).stringValue());
	}	else {
		return new StringValue(this.args[2].evaluate(ctx).stringValue());
	}
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-property
*/
FunctionCallExpr.prototype.xpathfunctions["property"] = function(ctx) {
	// This function can only have 1 parameter.
	if (!this.args || (this.args.length != 1)) {
    	return new StringValue("");
	}
	
	var property = this.args[0].evaluate(ctx).stringValue();

	// Check for common properties.
    var ret = "";
	if(property == "version") {
		ret = "1.1";
    } else if(property == "conformance-level") {
		ret = "basic";
    } else {
        // If the property is a valid NCName other than the common properties above we throw an exception.
        // NCName           ::=    NCNameStartChar NCNameChar* /* An XML Name, minus the ":" */ 
        // NCNameChar       ::=    NameChar - ':' 
        // NCNameStartChar  ::=    Letter | '_'  
        // NameChar         ::=    Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender  

        var match = property.match(/^[_a-z][\w\.\-]*/i);
        if (match && match[0] == property && document.defaultModel) {
            // Matched the whole property string so it is a valid NCName.
            this.dispatchExceptionEvent(ctx);
        }
    }

	return new StringValue(ret);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-digest
*/
FunctionCallExpr.prototype.xpathfunctions["digest"] = function(ctx) {
    if (!this.args || this.args.length < 2 || this.args.length > 3) {
        return new StringValue("");
    }

    var digest = "", shaCrypt;
    var data = this.args[0].evaluate(ctx).stringValue();
    var algorithm = this.args[1].evaluate(ctx).stringValue();
    var encoding = (this.args.length === 3) ? this.args[2].evaluate(ctx).stringValue() : "base64";

    if (encoding === "hex" || encoding === "base64") {
        switch (algorithm) {
            case "MD5":
                if (encoding === "base64") {
                    digest = MD5.b64_md5(data);
                } else if (encoding === "hex") {
                    digest = MD5.hex_md5(data);
                }
                break;
            case "SHA-1":
            case "SHA-256":
            case "SHA-384":
            case "SHA-512":
                shaCrypt = new jsSHA(data);
                digest = shaCrypt.getHash(algorithm, encoding === "hex" ? "HEX" : "B64");
                break;
            default:
                this.dispatchExceptionEvent(ctx);
                break;
        }
    } else {
        this.dispatchExceptionEvent(ctx);
    }

    return new StringValue(digest);
};

//	http://www.w3.org/TR/xforms11/#expr-lib-date

/**@addon
	http://www.w3.org/TR/xforms11/#fn-local-date
*/
FunctionCallExpr.prototype.xpathfunctions["local-date"] = function(ctx) {
    var d = new Date();
    var s = getDateTime(d, false);

    // Strip off the time information and add the time zone offset to the date.
    s = s.substring(0, 10);
    s += getTZOffset(d);

	// Return the result as a string.
    return new StringValue(s);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-local-dateTime
*/
FunctionCallExpr.prototype.xpathfunctions["local-dateTime"] = function(ctx) {
    var d = new Date();
    var s = getDateTime(d, false);

    // Add the time zone offset to the dateTime.
    s += getTZOffset(d);

	// Return the result as a string.
    return new StringValue(s);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-now
*/
FunctionCallExpr.prototype.xpathfunctions["now"] = function(ctx) {
    var d = new Date();
    var s = getDateTime(d, true);

    // Return the result as a string.
    return new StringValue(s);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-days-from-date
*/
// The return value is equal to the number of days difference between the specified date
// or dateTime (normalized to UTC) and 1970-01-01. Hour, minute, and second components
// are ignored after normalization.
//
FunctionCallExpr.prototype.xpathfunctions["days-from-date"] = function(ctx) {
  var dDate, dBase;
  var dOrigin;

  if (!this.args || (this.args.length != 1)) {
    	return new NumberValue(NaN);
	}

  // Create an array based on parsing the input. First try parsing an xsd:dateTime
  // and if that fails try parsing an xsd:date.
  //
	var res = FunctionCallExpr.prototype.xpathfunctions.expr.xsdDateTime.exec(
	  this.args[0].evaluate(ctx).stringValue()
	);

  if (!res) {
  	res = FunctionCallExpr.prototype.xpathfunctions.expr.xsdDate.exec(
  	  this.args[0].evaluate(ctx).stringValue()
  	);
  	if (!res) {
    	return new NumberValue(NaN);
    }
  }

  // Create a JS Date from the parsed input, normalised to UTC.
  //
  dDate = new Date(res[1], res[2] - 1, res[3]);

  // Now that we have a timezone offset (in minutes), we can adjust the date.
  //
  dDate.setMinutes( dDate.getMinutes() + dDate.getTimezoneOffset() );

  // Return the number of days since 1970-01-01. The problem with simply using getTime() on its
  // own is that any timezone information will show up as an error. So we get a version of the
  // base date in our own timezone, and normalise it, before using that.
  //
  dBase = new Date(1970, 0, 1);
  dBase.setMinutes( dBase.getMinutes() + dBase.getTimezoneOffset() );

  return new NumberValue( Math.round( (dDate.getTime() - dBase.getTime()) / (1000 * 60 * 60 * 24) ) );
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-days-to-date
*/
FunctionCallExpr.prototype.xpathfunctions["days-to-date"] = function(ctx) {
  var month;
  var date;
	var days;
	var d;

  // This function can only have 1 parameter.
	if (!this.args || (this.args.length != 1)) {
    	return new StringValue("");
	}

	// The parameter must be a number.
	//
	var number = this.args[0].evaluate(ctx).numberValue();

  if( isNaN(number) )
		return new StringValue("");

  // Set up the date.
  //
  d = new Date( );
  d.setTimeInDays( Math.round( number ) );

  // Make sure the date is displayed correctly.
  //
  month = d.getUTCMonth() + 1;
	if (month < 10)
		month = "0" + month;

  date = d.getUTCDate();
  if (date < 10)
    date = "0" + date;
	
	// Return the date as an xsd:date string.
	return new StringValue(d.getUTCFullYear() + "-" + month + "-" + date);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-seconds-from-dateTime
*/
FunctionCallExpr.prototype.xpathfunctions["seconds-from-dateTime"] = function(ctx) {
  var dDate;
  var dBase;
  var tzOffset;
  var seconds;

  if (!this.args || (this.args.length != 1)) {
    	return new NumberValue(NaN);
	}

  // Create an array based on parsing the input as an xsd:dateTime.
  //
	var res = FunctionCallExpr.prototype.xpathfunctions.expr.xsdDateTime.exec(
	  this.args[0].evaluate(ctx).stringValue()
	);

  if (!res) {
    return new NumberValue(NaN);
  }

  // Create a JS Date from the parsed input, normalised to UTC.
  //
  dDate = new Date(Date.UTC(res[1], res[2] - 1, res[3], res[4], res[5], res[6]));
  //tzOffset = dDate.getTimezoneOffset();

  // If no timezone information was provided, then there is no further adjustment
  // necessary.
  //
  if (!res[8] || (res[8] === "Z")) {
    tzOffset = 0;
  } else {
    // Any other offset gives us a number of hours and minutes by which the time
    // need to be adjusted.
    //
    tzOffset = ((Number(res[11]) * 60) + Number(res[12])) * /* number of minutes */
      ((res[10] === "-") ? -1 : 1); /* take into account the sign of the timezone */
  }

  // Now that we have a timezone offset (in minutes), we can adjust the date.
  //
  dDate.setUTCMinutes( dDate.getUTCMinutes() + tzOffset );

  // Return the number of days since 1970-01-01. The problem with simply using getTime() on its
  // own is that any timezone information will show up as an error. So we get a version of the
  // base date in our own timezone, and normalise it, before using that.
  //
  dBase = new Date(Date.UTC(1970, 0, 1));
  //dBase.setMinutes( dBase.getMinutes() + dBase.getTimezoneOffset() );

  seconds = Math.round( (dDate.getTime() - dBase.getTime()) / (1000) );
  // If there were fractional seconds, add them to the result.
  if (res[7]) {
      seconds += res[7] - 0;
  }
  return new NumberValue(seconds);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-seconds-to-dateTime
*/
FunctionCallExpr.prototype.xpathfunctions["seconds-to-dateTime"] = function(ctx) {
	var d, number;

  // This function can only have 1 parameter.
  //
	if (!this.args || (this.args.length != 1)) {
    	return new StringValue("");
	}

	// The parameter must be a number.
	//
	number = this.args[0].evaluate(ctx).numberValue();

  if( isNaN(number) )
		return new StringValue("");

	d = new Date( );
  d.setTimeInSeconds( number );

	// Return the result as a UTC string.
	//
	return new StringValue(getDateTime(d, true));
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-adjust-dateTime-to-timezone
*/
FunctionCallExpr.prototype.xpathfunctions["expr"] = {
  xsdDate: /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})(((([+-])([0-9]{2})\:([0-9]{2}))|(\Z))?)$/,
  xsdDateTime: /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})\T([0-9]{2})\:([0-9]{2})\:([0-9]{2}(\.[0-9]*)?)((([+-])([0-9]{2})\:([0-9]{2}))|(\Z)?)$/
};

FunctionCallExpr.prototype.xpathfunctions["adjust-dateTime-to-timezone"] = function(ctx) {
	// This function can only have 1 parameter.
	//
	if (!this.args || (this.args.length != 1)) {
    	return new StringValue("");
	}

  // Create an array based on parsing the input.
  //
	var res = FunctionCallExpr.prototype.xpathfunctions.expr.xsdDateTime.exec(
	  this.args[0].evaluate(ctx).stringValue()
	);

  if (!res) {
    return new StringValue("");
  }

  // Create a JS Date from the xsd:dateTime.
  //
  var dDate = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6]);

  // Get the local timezone offset from the passed in dateTime.
  var localDate = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6]);
  var tzOffset;

  // If no timezone information was provided, then use the local timezone.
  //
  if (!res[8]) {
    tzOffset = 0;
  } else {
    // Remove the effect of the local timezone, before adding on whatever
    // offset we need.
    //
    tzOffset = -localDate.getTimezoneOffset();

    // If the provided timezone was 'Z', then it's UTC, which has an offset of zero.
    //
    if (res[8] === "Z") {
      tzOffset += 0;
    } else {

      // Any other offset gives us a number of hours and minutes by which the time
      // need to be adjusted.
      //
      tzOffset += ((Number(res[11]) * 60) + Number(res[12])) * /* number of minutes */
        ((res[10] === "-") ? 1 : -1); /* take into account the sign of the timezone */
    }
  }

  // Now that we have a timezone offset (in minutes), we can adjust the date.
  //
  dDate.setMinutes( dDate.getMinutes() + tzOffset );

  // Convert the JavaScript date to xsd:dateTime format.
  //
  var s = getDateTime(dDate, false);

  // Add the time zone offset string for the local time zone to the xsd:dateTime.
  //
  s += getTZOffset(localDate);

	// Return the result as a string.
	return new StringValue(s);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-seconds
*/
FunctionCallExpr.prototype.xpathfunctions["seconds"] = function(ctx) {
	// This function can only have 1 parameter.
	if (!this.args || (this.args.length != 1)) {
    	return new NumberValue(NaN);
	}

	// Initialize variables.
	var duration = this.args[0].evaluate(ctx).stringValue();
	var totalSeconds = 0;
	var index = 0;
	var endingIndex = 0;
	var length = 0;
	var durationIsNegative = false;
	
	// A valid duration begins with 'P' or '-P'.
	if (!duration.match(/^P|\-P/)) {
		return new NumberValue(NaN);
	}
	// If the duration is negative, turn the durationIsNegative flag on and skip the "-" sign.
	if (duration.match(/^\-/)) {
		durationIsNegative = true;
		index++;
	}
	// If the duration has some days in it, ...
	if (duration.match(/D/)) {
		// If the duration has some years in it, ignore the years.
		if (duration.indexOf("Y") > 0 && duration.indexOf("Y") < duration.indexOf("D"))
			index = duration.indexOf("Y");
		// If the duration has some months in it, ignore the months.
		if (duration.indexOf("M") > 0 && duration.indexOf("M") < duration.indexOf("D"))
			index = duration.indexOf("M");
		// Calculate the number of days.
		endingIndex = duration.indexOf("D");
		length = endingIndex - index - 1;
		var days = duration.substr(index + 1, length);
		// Add the days to the totalSeconds and move to the next index.
		totalSeconds = totalSeconds + 60 * 60 * 24 * parseFloat(days);
		index = endingIndex;
	}
	// If the duration has some time in it, make the duration string only contain the time information,
	// so the M now stands for minutes (not months).
	if (duration.indexOf("T") != -1) {
		index = 0;
		duration = duration.substr(duration.indexOf("T"));
	}
	// If the duration has some hours in it, calculate the number of hours,
	// add them to the totalSeconds, and move to the next index.
	if (duration.match(/H/)) {
		endingIndex = duration.indexOf("H");
		length = endingIndex - index - 1;
		var hours = duration.substr(index + 1, length);
		totalSeconds = totalSeconds + 60 * 60 * parseFloat(hours);
		index = endingIndex;
	}
	// If the duration has some minutes in it, calculate the number of minutes,
	// add them to the totalSeconds, and move to the next index.
	if (duration.match(/M/) && duration.indexOf("T") == 0) {
		endingIndex = duration.indexOf("M");
		length = endingIndex - index - 1;
		var minutes = duration.substr(index + 1, length);
		totalSeconds = totalSeconds + 60 * parseFloat(minutes);
		index = endingIndex;
	}
	// If the duration has some seconds in it, calculate the number of seconds,
	// add them to the totalSeconds.
	if (duration.match(/S/)) {
		endingIndex = duration.indexOf("S");
		length = endingIndex - index - 1;
		var seconds = duration.substr(index + 1, length);
		totalSeconds = totalSeconds + parseFloat(seconds);
		index = endingIndex;
	}
	// If the durationIsNegative flag is on, make the totalSeconds negative.
	if (durationIsNegative) {
		totalSeconds = totalSeconds * -1;
	}
	
	// Return the total number of seconds.
	return new NumberValue(totalSeconds);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-months
*/
FunctionCallExpr.prototype.xpathfunctions["months"] = function(ctx) {
	// This function can only have 1 parameter.
	if (!this.args || (this.args.length != 1)) {
    	return new NumberValue(NaN);
	}

	// Initialize variables.
	var duration = this.args[0].evaluate(ctx).stringValue();
	var totalMonths = 0;
	var index = 0;
	var endingIndex = 0;
	var length = 0;
	var durationIsNegative = false;
	
	// A valid duration begins with 'P' or '-P'.
	if (!duration.match(/^P|\-P/)) {
		return new NumberValue(NaN);
	}
	// If the duration is negative, turn the durationIsNegative flag on and skip the "-" sign.
	if (duration.match(/^\-/)) {
		durationIsNegative = true;
		index++;
	}
	// If the duration has some years in it, calculate the number of years,
	// add them to the totalMonths, and move to the next index.
	if (duration.match(/Y/)) {
		endingIndex = duration.indexOf("Y");
		length = endingIndex - index - 1;
		var years = duration.substr(index + 1, length);
		totalMonths = totalMonths + 12 * parseFloat(years);
		index = endingIndex;
	}
	// If the duration has some months in it, calculate the number of months,
	// add them to the totalMonths.
	if (duration.match(/M/)) {
		endingIndex = duration.indexOf("M");
		length = endingIndex - index - 1;
		var months = duration.substr(index + 1, length);
		if(duration.indexOf("T") < 0 || duration.indexOf("T") > endingIndex)
			totalMonths = totalMonths + parseFloat(months);
		index = endingIndex;
	}
	// If the durationIsNegative flag is on, make the totalMonths negative.
	if (durationIsNegative) {
		totalMonths = totalMonths * -1;
	}
	
	// Return the total number of months.
	return new NumberValue(totalMonths);
};

//	http://www.w3.org/TR/xforms11/#expr-lib-nodeset

/**
@addon
	http://www.w3.org/TR/xforms11/#fn-instance
	@throws String if the first instance with the given id in document order is not inside the context model. 
*/
FunctionCallExpr.prototype.xpathfunctions["instance"] = function(ctx) {
	var ret = null;
                
	if(ctx.currentModel) {
		try {
    	    var sInstance = "";
            if (this.args[0]) {
                sInstance = this.args[0].evaluate(ctx).stringValue();
            }
			var oDom = ctx.currentModel.getInstanceDocument(sInstance);
			var oDE = oDom.documentElement;
			ret = new Array(oDE);
		} catch(e) {
			throw("XPath function: instance("+sInstance+") is not a member of  model " + ctx.currentModel.id );
		}
	}	else {
		throw("instance() executed without a current model");
	}

	if (this.args[1])	{
		alert(this.args.join('\n'));
	}

	return new NodeSetValue(ret);
};		

/**@addon
	http://www.w3.org/TR/xforms11/#fn-current
*/  

FunctionCallExpr.prototype.xpathfunctions["current"] = function(ctx) {
    return new NodeSetValue([ctx.outermostContextNode]);
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-id
*/  
FunctionCallExpr.prototype.xpathfunctions["id"] = function(ctx) {
    var evalCtx;
    var ret = [];
    var ids;
    var nodeSet; 
    var nodeValue;
    var oNodes;
    var ctxNodes = [];
    var i, j, k;

    if (!this.args || (this.args.length === 0) || (this.args.length > 2)) {
        return new NodeSetValue([]);
    }   
 
    evalCtx = this.args[0].evaluate(ctx);
 
    //
    // This function returns the in-scope evaluation context node of the
    // nearest ancestor element of the node containing the XPath expression
    // that invokes this function.
    //    
    if (evalCtx.type === 'node-set') {
        ids = [];
        nodeSet = evalCtx.nodeSetValue();
        for (i = 0; i < nodeSet.length; ++i) {
            nodeValue = xmlValue(nodeSet[i]).split(/\s+/);
            for (j = 0; j < nodeValue.length; ++j) {
                ids.push(nodeValue[j]);
            }
        }
    } else {
        ids = evalCtx.stringValue().split(/\s+/);
    }
	    	    
    ctxNodes.push(ctx.resolverElement ? ctx.resolverElement.getEvaluationContext().node : ctx.node);
    
    //
    // Look at second parameter, and evaluate.  Use default context above if arg 2 is not specified or is empty
    //    
    if (this.args.length === 2) {        
	    evalCtx = this.args[1].evaluate(ctx);	   
	
	    if ((evalCtx.type === 'node-set') && (evalCtx.nodeSetValue().length > 0)) {		    
	        ctxNodes = evalCtx.nodeSetValue();
        }		    
    }
    
    for (j = 0; j < ctxNodes.length; ++j) {
	    for (k = 0; k < ids.length; ++k) {
	        oNodes = ctxNodes[j].getElementsById(ids[k]);
	        if (oNodes) {
		        for (i = 0; i < oNodes.length; ++i) {		                
		            ret.push(oNodes[i]);
		        }
	        }
	    }
    }
	
    return new NodeSetValue(ret);    
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-context
*/
FunctionCallExpr.prototype.xpathfunctions["context"] = function(ctx) {
    // This function returns the in-scope evaluation context node of the
    // nearest ancestor element of the node containing the XPath expression
    // that invokes this function.
    var ctxNode = ctx.resolverElement ?
        ctx.resolverElement.getEvaluationContext().node : ctx.node;

    return new NodeSetValue([ctxNode]);
};

//	http://www.w3.org/TR/xforms11/#expr-lib-object

/**@addon
	http://www.w3.org/TR/xforms11/#fn-choose
*/
FunctionCallExpr.prototype.xpathfunctions["choose"] = function(ctx) {
  // All parameters of an XPath function are evaluated, so the parameter that
  // is not returned by this function is still evaluated, and its result is
  // discarded by this function.
  if (!this.args || this.args.length != 3) {
      return null;
  }

  var p1 = this.args[1].evaluate(ctx);
  var p2 = this.args[2].evaluate(ctx);
  var result = (this.args[0].evaluate(ctx).booleanValue()) ? p1 : p2;
  var ret;

  switch (result.type) {
    case "string":
      ret =  new StringValue(result.stringValue());
      break;

    case "number":
      ret =  new NumberValue(result.numberValue());
      break;

    case "boolean":
      ret =  new BooleanValue(result.booleanValue());
      break;

    case "node-set":
      ret =  new NodeSetValue(result.nodeSetValue());
      break;

    default:
      throw "Unrecognised type in choose()";
      break;
  }
  return ret;
};

/**@addon
	http://www.w3.org/TR/xforms11/#fn-event
*/
FunctionCallExpr.prototype.xpathfunctions["event"] = function(ctx) {
    var sProperty = this.args[0].evaluate(ctx).stringValue();
    var oEvent = FormsProcessor.getCurrentEvent();
    var contextInfo, ret;

    if (oEvent && oEvent.context) {
        contextInfo = oEvent.context[sProperty];

        switch (typeof contextInfo) {
          case "string":
            ret =  new StringValue(contextInfo);
            break;

          case "number":
            ret =  new NumberValue(contextInfo);
            break;

          case "boolean":
            ret =  new BooleanValue(contextInfo);
            break;

          // Array
          case "object": 
            ret =  new NodeSetValue(contextInfo);
            break;

          case "undefined":
            ret =  new NodeSetValue([]);
            break;

          default:
            throw "Unrecognised type in event()";
            break;
        }
    } else {
        // If we don't have a current event or the event does not have context info,
        // the result is an empty string. The current event could be null if event()
        // was invoked outside of an xf:action.
        ret = new StringValue("");
    }
    return ret;
}

/**
	This is a formsPlayer specific function to return any instance, regardless of the in-scope model,
	not part of the core function library
@addon*/
FunctionCallExpr.prototype.xpathfunctions["globalInstance"] = function(ctx) {
	var sInstance = this.args[0].evaluate(ctx).stringValue();
	var oInst = FormsProcessor.getElementById(sInstance, ctx.resolverElement);
	var ret = null;
	if (oInst)	{
		ret = new Array(oInst.getDocument().documentElement);
	}
	return new NodeSetValue(ret);
};

FunctionCallExpr.prototype.dispatchExceptionEvent = function (context) {
	if (NamespaceManager.compareFullName(context.resolverElement, "bind", "http://www.w3.org/2002/xforms")) {
		UX.dispatchEvent(context.currentModel || document.defaultModel, "xforms-compute-exception", true, false, false);
	} else {
		UX.dispatchEvent(context.resolverElement, "xforms-binding-exception", true, false, false);
	}
};
