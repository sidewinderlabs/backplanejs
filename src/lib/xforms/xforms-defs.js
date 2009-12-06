/*
 * Copyright (c) 2008-2009 Backplane Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Add XForms decoration rules
DECORATOR.addDecorationRules({
    "namespaceURI" : "http://www.w3.org/2002/xforms",
    "rules" : {
        // model decorations
        "model" : [
        {
            "name" : "model-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Model]);
            }
        }
        ],

        "instance" : [
        {
            "name" : "instance-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Instance, LoadExternalMixin]);
            }
        }
        ],

        "submission" : [
        {
            "name" : "submission-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Context, Submission]);
            }
        }
        ],
		
        "header" : [
        {
            "name" : "header-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Context, Header]);
            }
        }
        ],

		"name" : [
		{
			"name" : "name-element",
			apply : function(arrBehavious) {
				return arrBehavious.concat([EventTarget, MIPHandler, Context, Control, Value]);
			}
		}
		],
        // end model decorations

        // begin container form control decorations
        "group" : [
        {
            "name" : "group-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Container, OptionalIfUnspecifiedBinding, Group]);
            }
        }
        ],

        "switch" : [
        {
            "name" : "switch-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, OptionalBinding, Switch]);
            }
        }
        ],

        "case" : [
        {
            "name" : "case-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Context, Container, XFormsCase]);
            }
        }
        ],

        "repeat" : [
        {
            "name" : "repeat-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Context, Repeat]);
            }
        }
        ],
        // end container form control decorations

        // begin core form control decorations
        "submit" : [
        {
            "name" : "submit-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl, OptionalBinding, Submit]);
            }
        }
        ],

        "trigger" : [
        {
            "name" : "trigger-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl, OptionalBinding]);
            }
        }
        ],

        "input": [
        {
            "name" : "input-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl]);
            }
        }
        ],

        "output" : [
        {
            "name" : "output-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl, OptionalIfUnspecifiedBinding]);
            }
        }
        ],

        "range" : [
        {
            "name" : "range-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl, FiniteControl]);
            }
        }
        ],

        "textarea" : [
        {
            "name" : "textarea-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl]);
            }
        }
        ],

        "secret" : [
        {
            "name" : "secret-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl]);
            }
        }
        ],

        "select" : [
        {
            "name" : "select-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl, XFormsCommonSelect,  ElementWithChoices, XFormsSelect, FiniteControl]);
            }
        }
        ],

        "select1" : [
        {
            "name" : "select1-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, MIPEventTarget, Context, Control, NavigableControl, XFormsCommonSelect, ElementWithChoices, XFormsSelect1, FiniteControl]);
            }
        }
        ],
        
        "mediatype" : [
        {
            "name" : "mediatype-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, Context, Control]);
            }
        }
        ],
        // end core form control decorations

        // begin common support decorations
        "label" : [
        {
            "name" : "label-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, Context, SrcMixin, Control, OptionalBinding, LoadExternalMixin]);
            }
        }
        ],

        "alert" : [
        {
            "name" : "alert-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, Context, SrcMixin, Control, OptionalBinding, LoadExternalMixin]);
            }
        }
        ],

        "hint" : [
			// NOTE: Having two rules for hint like this is not ideal because, if we add further
			//       implementations, it would require an extra condition in the match functions
			//       for each one (see r2903 for discussion about this). When we get to that
			//       point, we should refactor this so that the hint implementations accumulate,
			//       each over-riding its predecessors.
            {
                "name": "hint-element",
                "match" : function(element) {
				///not a geolocation
                    if (!element.parentNode.className || element.parentNode.className.indexOf('geolocation') === -1) {
                        return true;
                    }
                    return false;
                },
                "apply" : function(arrBehaviours) {
                    return arrBehaviours.concat([Listener, EventTarget, MIPHandler, Context, SrcMixin, Control, OptionalBinding, Message, HintMixin, LoadExternalMixin]);
                }
            },
            {
                "name": "hint-map",
                "match" : function(element) {
            	///matches a geolocation
                    if (element.parentNode.className && element.parentNode.className.indexOf('geolocation') !== -1) {
                        return true;
                    }
                    return false;
                },
                "apply" : function(arrBehaviours) {
                    return arrBehaviours.concat([Listener, EventTarget, MIPHandler, Context, Control, OptionalBinding, HintGMap]);
                }
            }
        ],
        // end common support decorations

        // begin common markup for selection controls decorations
        "item" : [
        {
            "name" : "item-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Context, Item]);
            }
        }
        ],

        "itemset" : [
        {
            "name" : "item-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Context, Itemset]);
            }
        }
        ],
        
        "value" : [
        {
            "name" : "value-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, MIPHandler, Context, Control, OptionalBinding, Value]);
            }
        }
        ],
        
        "copy" : [
        {
            "name" : "copy-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, Context, Control, OptionalBinding, Copy]);
            }
        }
        ],
        // end common markup for selection controls decorations

        // begin action decorations
        "action" : [
        {
            "name" : "action-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, XFAction]);
            }
        }
        ],

				// Help is a type of message.
				//
				"help" : [
					{
						"name": "help-element",
						"apply" : function(arrBehaviours) {
							return arrBehaviours.concat([
								/* It's a Message ... */ Listener, EventTarget, MIPHandler, Context, SrcMixin ,Control, OptionalBinding, Message,
								/* ... and a Help.    */ HelpMixin , LoadExternalMixin
							]);
						}
	        }
        ],

        "load" : [
        {
            "name" : "setvalue-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, EventTarget, Context, OptionalBinding, Load]);
            }
        }
        ],
        
        "message" : [
        {
            "name" : "message-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, EventTarget, MIPHandler, Context, SrcMixin, Control, OptionalBinding, Message, LoadExternalMixin]);
            }
        }
        ],

        "setindex" : [
        {
            "name" : "setindex-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, SetIndex]);
            }
        }
        ],
        
        "setvalue" : [
        {
            "name" : "setvalue-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, SetValue]);
            }
        }
        ],

        "setfocus" : [
        {
            "name" : "setfocus-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, SetFocus]);
            }
        }
        ],

        "insert" : [
        {
            "name" : "insert-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, OptionalBinding, Insert]);
            }
        }
        ],

        "delete" : [
        {
            "name" : "delete-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, Delete]);
            }
        }
        ],

        "send" : [
        {
            "name" : "send-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Send]);
            }
        }
        ],
        
        "dispatch" : [
        {
            "name" : "dispatch-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Dispatch]);
            }
        }
        ],

        "toggle" : [
        {
            "name" : "toggle-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Context, Toggle]);
            }
        }
        ],

        "rebuild" : [
        {
            "name" : "rebuild-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Rebuild]);
            }
        }
        ],

        "recalculate" : [
        {
            "name" : "recalculate-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Recalculate]);
            }
        }
        ],

        "revalidate" : [
        {
            "name" : "revalidate-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Revalidate]);
            }
        }
        ],

        "refresh" : [
        {
            "name" : "refresh-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Refresh]);
            }
        }
        ],

        "reset" : [
        {
            "name" : "reset-element",
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([Listener, Reset]);
            }
        }
        ],
        // end action decorations

        // begin pseudo element value decorations
        "pe-value" : [
        {
            "name" : "value-pevalue",
            "match" : function(element) {
                return NamespaceManager.compareFullName(element.parentNode,"value","http://www.w3.org/2002/xforms");
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget]);
            }
        },
        {
            "name" : "output-pevalue",
            "match" : function(element) {
                return NamespaceManager.compareFullName(element.parentNode,"output","http://www.w3.org/2002/xforms") ||
                	   NamespaceManager.compareFullName(element.parentNode,"label","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"alert","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"help","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"hint","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"message","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"mediatype","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"name","http://www.w3.org/2002/xforms");
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, XFormsOutputValue]);
            }
        },
        {
            "name" : "input-pevalue",
            "match" : function(element) {
                return NamespaceManager.compareFullName(element.parentNode,"input","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"secret","http://www.w3.org/2002/xforms") ||
                       NamespaceManager.compareFullName(element.parentNode,"textarea","http://www.w3.org/2002/xforms");
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, PeValue, XFormsInputValue]);
            }
        },
        {
            "name" : "select-pevalue",
            "match" : function(element) {
                return NamespaceManager.compareFullName(element.parentNode,"select","http://www.w3.org/2002/xforms");
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, XFormsSelectValue]);
            }
        },
        {
            "name" : "select1-pevalue",
            "match" : function(element) {
                return NamespaceManager.compareFullName(element.parentNode,"select1","http://www.w3.org/2002/xforms");
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, XFormsSelect1Value]);
            }
        },
        {
            "name" : "range-pevalue",
            "match" : function(element) {
                return NamespaceManager.compareFullName(element.parentNode,"range","http://www.w3.org/2002/xforms");
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat([EventTarget, RangeValue]);
            }
        },
        // custom control pe-values below
        {
            "name" : "inputcalendar-pevalue",
            "match" : function(element) {
                var parent = element.parentNode,
                    datatype = parent.getAttribute("datatype"),
                    appearance = parent.getAttribute("appearance"),
                    xf4hdatatype = XF4HProcessor.getAttribute(parent, "datatype"),
                    prefixes = [],
                    prefix = "",
                    isDate = false,
                    match = false;
                if (NamespaceManager.compareFullName(parent,"input","http://www.w3.org/2002/xforms")) {
                    prefixes = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms");
                    prefix = prefixes[prefixes.length-1];
                    isDate = (datatype === "xsd:date" || datatype === (prefix + ":date") || xf4hdatatype === "date");
                    if (isDate && appearance !== "minimal") {
                        match = true;
                    }
                }
                return match;
            },
            "apply" : function(arrBehaviours) {
                UX.replaceArrayElement(arrBehaviours,XFormsInputValue,InputValueCalendar);
                return arrBehaviours;
            }
        },
        {
            "name" : "inputcolor-pevalue",
            "match" : function(element) {
                var parent = element.parentNode,
                    datatype = parent.getAttribute("datatype"),
                    appearance = parent.getAttribute("appearance"),
                    match = false;
                if (NamespaceManager.compareFullName(parent,"input","http://www.w3.org/2002/xforms") &&
                    datatype === "xhd:color") {
                        match = true;
                }
                return match;
            },
            "apply" : function(arrBehaviours) {
                UX.replaceArrayElement(arrBehaviours,XFormsInputValue,InputValueColor);
                return arrBehaviours;
            }
        },
        {
            "name" : "inputboolean-pevalue",
            "match" : function(element) {
                var parent = element.parentNode,
                    datatype = parent.getAttribute("datatype"),
                    prefixes = [],
                    prefix = "",
                    match = false;
                if (NamespaceManager.compareFullName(parent,"input","http://www.w3.org/2002/xforms")) {
                    prefixes = NamespaceManager.getOutputPrefixesFromURI("http://www.w3.org/2002/xforms");
                    prefix = prefixes[prefixes.length-1];
                    if (datatype === "xsd:boolean" || datatype === (prefix + ":boolean")) {
                        match = true;
                    }
                }
                return match;
            },
            "apply" : function(arrBehaviours) {
                UX.replaceArrayElement(arrBehaviours,XFormsInputValue,XFormsBooleanValue);
                return arrBehaviours;
            }
        },
        {
            "name" : "rangemap-pevalue",
            "match" : function(element) {
                var parent = element.parentNode,
                    rangeClass = parent.className,
                    match = false;
                if (NamespaceManager.compareFullName(parent,"range","http://www.w3.org/2002/xforms") &&
                    rangeClass && rangeClass.indexOf("geolocation") !== -1) {
                        match = true;
                }
                return match;
            },
            "apply" : function(arrBehaviours) {
                UX.replaceArrayElement(arrBehaviours,RangeValue,RangeValueGMAP);
                UX.insertArrayElement(arrBehaviours, GMapControl, RangeValueGMAP);
                return arrBehaviours;
            }
        },
        {
            "name" : "outputmap-pevalue",
            "match" : function(element) {
                var parent = element.parentNode,
                    outputClass = parent.className,
                    match = false;
                if (NamespaceManager.compareFullName(parent,"output","http://www.w3.org/2002/xforms") &&
                    outputClass && outputClass.indexOf("geolocation") !== -1) {
                        match = true;
                }
                return match;
            },
            "apply" : function(arrBehaviours) {
                UX.replaceArrayElement(arrBehaviours,XFormsOutputValue,XFormsOutputValueGMap);
                UX.insertArrayElement(arrBehaviours, GMapControl, XFormsOutputValueGMap);
                return arrBehaviours;
            }
        },
        {
            "name" : "trigger-minimal",
            "match" : function(element) {
                var grandParent = element.parentNode.parentNode,
                    grandParentIsTrigger = NamespaceManager.compareFullName(grandParent, "trigger", "http://www.w3.org/2002/xforms"),
                    grandParentIsSubmit = NamespaceManager.compareFullName(grandParent, "submit", "http://www.w3.org/2002/xforms");
                if ((grandParentIsTrigger || grandParentIsSubmit) && grandParent.getAttribute("appearance") === "minimal") {
                    return true;
                }
                return false;
            },
            "apply" : function(arrBehaviours) {
                return arrBehaviours.concat(TriggerMinimalMixin);
            }
        }
        ],
        // end pseudo element value decorations

        // wildcard decorations (applied irrespective of element name)
        "*" : [
        ]
        // end wildcard decorations
	}
});

UX.replaceArrayElement = function (array,remove,add) {
    var counter;
    for (counter = 0; counter < array.length; counter++) {
        if (array[counter] === remove) {
            array[counter] = add;
            break;
        }
    }
};

UX.insertArrayElement = function (array, insertItem, indexItem) {
    var i, lastItem, swap;

    for (var i = 0; i < array.length; ++i) {
        if (array[i] === indexItem) {
            lastItem = array[i];
            array[i] = insertItem;
        } else if (lastItem) {
            swap = array[i];
            array[i] = lastItem;
            lastItem = swap;
        }
    }

    if (lastItem) {
        array[i] = lastItem;
    }
};

//[ISSUE 52] IE6 does not allow CSS attribute selectors. This means those
//  selectors that require attribute selection must conditionally leave
//  those out when the user agent is IE6 and use the mechanism specified in
//  ie6-css-selectors-fixer.js instead.

// UX.selectors below (initial value) must not contain any attribute selectors
UX.selectors = {
    input : {
        color : {
            value : "xf|input.yui-widget-color > pe-value",
            labelvalue : "xf|input.yui-widget-color > xf|label > pe-value"
        },
        date : {
            value : "xf|input.yui-widget-calendar > pe-value",
            labelvalue : "xf|input.yui-widget-calendar > xf|label > pe-value"
        },
        dateminimal : {
            value : "xf|input.minimal-date > pe-value",
            labelvalue : "xf|input.minimal-date > xf|label > pe-value"
        }
    },
     itemset : {
        repeatReady : "xf|itemset.repeat-ready > xf|item"     
    },
    repeat : {
        repeatReady : "xf|repeat.repeat-ready > xf|group"     
    },
	header : {
		headerReady : "xf|header.header-ready > *"
	}
	
};

// Attribute selectors are added if the user agent supports them
if (!UX.isIE6) {
    UX.selectors.input.color.value += ", xf|input[datatype='xhd:color'] > pe-value";
    UX.selectors.input.color.labelvalue += ", xf|input[datatype='xhd:color'] > xf| label > pe-value";
    UX.selectors.input.date.value += ", xf|input[datatype='xsd:date'] > pe-value, xf|input[datatype='xf:date'] > pe-value";
    UX.selectors.input.date.labelvalue += ", xf|input[datatype='xsd:date'] > xf|label > pe-value, xf|input[datatype='xf:date'] > xf|label > pe-value";
    UX.selectors.input.dateminimal.value += ", xf|input[datatype='xsd:date'][appearance='minimal'] > pe-value, xf|input[datatype='xf:date'][appearance='minimal'] > pe-value";
    UX.selectors.input.dateminimal.labelvalue += ", xf|input[datatype='xsd:date'][appearance='minimal'] > xf|label > pe-value, xf|input[datatype='xf:date'][appearance='minimal'] > xf|label > pe-value";
    UX.selectors.repeat.repeatReady += ", xf|repeat[class~='repeat-ready'] > xf|group";
    UX.selectors.itemset.repeatReady += ", xf|itemset[class~='repeat-ready'] > xf|item";
	UX.selectors.header.headerReady += ", xf|header[class~='header-ready'] > *";
}
// else, we delegate selection to ie6-css-selectors-fixer.js

//[ISSUE 8] IE does not natively support child selectors, but will ignore ">"
//	if found in css, making a selector such as "x > y", behave as a descendent
//	selector "x y".  This means that the order of occurrence of some of these
//	definitions is critical.  Specifically, the "common child" elements *must*
//	come after any controls that might use them, as (at present, anyway) label
//	is implemented as a control.

NamespaceManager.addSelectionNamespace("xf","http://www.w3.org/2002/xforms");	

DECORATOR.setupDecorator(
	[

    /* Model */

		{
			selector:"xf|instance",
			objects:[]
		},

		{
			selector:"xf|model",
			objects:[]
		},


		{
			selector:"xf|submission",
			objects:[]
		},
		{
			selector:"xf|header",
			objects:[]
		},
		
		{
			selector: "xf|name",
			objects:[]
		},

    /* Container Controls */
        {
            selector:"xf|repeat",
            objects:[]
        },

        {
            selector:"xf|group",
            objects:[]
        },

        {
            selector:"xf|switch",
            objects:[]
        },

        {
            selector:"xf|case",
            objects:[]
        },

    /* Controls */
        {
			selector:"xf|submit",
			objects:[]
		},

        {
			selector:"xf|trigger",
			objects:[]
		},
		
		{
			selector:"xf|output >  pe-value",
			objects:[]
		},
/*
		{
			selector:"pe-value",
			objects:[EventTarget]
		},
    */
		{
			selector:"xf|input",
			objects:[]
		},

		{
			selector:"xf|range",
			objects:[]
		},

    	{
			selector:"xf|output",
			objects:[]
		},

		{
			selector:"xf|textarea",
			objects:[]
		},
		
		{
			selector:"xf|secret",
			objects:[]
		},
		{
			selector:"xf|label",
			objects:[]
		},
		{
			selector:"xf|alert",
			objects:[]
		},
		{
			selector:"xf|value",
			objects:[]
		},
		{
			selector:"xf|copy",
			objects:[]
		},

		{
			selector:"xf|input > pe-value",
			objects:[]
		},
		{
			selector:"xf|secret  > pe-value",
			objects:[]
		},
		{
			selector:"xf|textarea  > pe-value",
			objects:[]
		},
	
		{
			selector:"xf|select > pe-value",
			objects:[]
		},
		{
			selector:"xf|select1 >  pe-value ",
			objects:[]
		},
		{
			selector:"xf|range > pe-value",
			objects:[]
		},
		{
			selector:" xf|alert > pe-value",
			objects:[]
		},
		{
			selector:" xf|hint > pe-value",
			objects:[]
		},
		{
			selector:" xf|message > pe-value",
			objects:[]
		},
		{
			selector:" xf|help > pe-value",
			objects:[]
		},

		{
			selector:"xf|label",
			objects:[]
		},
		{
            selector:"xf|mediatype",
            objects:[]
        },
        
		{
			selector:"xf|value > pe-value",
			objects:[]
		},
		{
			selector:"xf|item",
			objects:[]
		},
		{
			selector:"xf|itemset",
			objects:[]
		},
		{
			selector:"xf|range.geolocation > pe-value",
			objects:[]
		},
		//HACK: re-override the value binding for rangemap/label, because IE does not support child selectors.
		{
			selector:"xf|range.geolocation > xf|label > pe-value",
			objects:[]
		},
		{
			selector:"xf|output.geolocation > pe-value",
			objects:[]
		},
		{
			selector:"xf|output.geolocation > xf|label > pe-value",
			objects:[]
		},

        // YUI ColorPicker as <xf:input>
        {
            selector: UX.selectors.input.color.value,
            objects:[]
        },
        //HACK: IE does not support child selectors.
        {
            selector: UX.selectors.input.color.labelvalue,
            objects:[]
        },

		// YUI Calendar as <xf:input>
		{
			selector: UX.selectors.input.date.value,
			objects:[]
		},
		//HACK: IE does not support child selectors.
		{
			selector: UX.selectors.input.date.labelvalue,
			objects:[]
		},
		// Calendar with "minimal" appearance resorts to regular xf:input appearance
		{
			selector: UX.selectors.input.dateminimal.value,
			objects:[]
		},
		//HACK: IE does not support child selectors.
		{
			selector: UX.selectors.input.dateminimal.labelvalue,
			objects:[]
		},

		{
			selector:"xf|select",
			objects:[]
		},				
		
		{
			selector:"xf|select1",
			objects:[]
		},

    /* Actions */

		{
			selector:"xf|action",
			objects:[]
		},

		{
    		selector:"xf|hint",
    		objects:[]
		},

		{
    		selector:"xf|load",
    		objects:[]
		},
		{
    		selector:"xf|message",
    		objects:[]
		},
		{
    		selector:"xf|help",
    		objects:[]
		},

		{
			selector:"xf|setindex",
			objects:[]
		},
		
		{
			selector:"xf|setvalue",
			objects:[]
		},

		{
			selector:"xf|setfocus",
			objects:[]
		},

        {
            selector:"xf|insert",
            objects:[]
        },

        {
            selector:"xf|delete",
            objects:[]
        },

		{
			selector:"xf|send",
			objects:[]
		},
		
		{
			selector:"xf|dispatch",
			objects:[]
		},

		{
			selector:"xf|toggle",
			objects:[]
		},

		{
			selector:"xf|rebuild",
			objects:[]
		},
		{
			selector:"xf|recalculate",
			objects:[]
		},
		{
			selector:"xf|revalidate",
			objects:[]
		},
		{
			selector:"xf|refresh",
			objects:[]
		},
		{
			selector:"xf|reset",
			objects:[]
		},
	//Common child elements
		{
			selector:"xf|label >  pe-value",
			objects:[],
			important:true
		},       
        {
            selector:"xf|mediatype >  pe-value",
            objects:[]
        }, 
        {
            selector:"xf|name >  pe-value",
            objects:[]
        },   
    
        
    //Switch off bindings within repeat, during load-time (FF )
        {
            selector:"xf|repeat > *,  xf|itemset > *, xf|header > *",
            cssText:"-moz-binding:url();"
        },
        {
            selector: UX.selectors.itemset.repeatReady,
            objects:[]
        }, 
        
    //Switch bindings repeat back on within repeat.  (FF )
        {
            selector: UX.selectors.repeat.repeatReady,
            objects:[]
        }, 
	// Switch header bindings back on (FF)
		{
			selector: UX.selectors.header.headerReady,
			objects:[]
		},
            
	//Switch off bindings within repeat, itemset, header during load-time (IE )
		{
			selector:"xf|repeat *, xf|itemset *, xf|header *", 
			cssText:"-binding-ignore:true;"
		},

		{
			selector:"xf|repeat.repeat-ready xf|repeat.repeat-ready *", 
			cssText:"-binding-ignore:false;"
		},
		{
			selector:"xf|repeat.repeat-ready xf|repeat *", 
			cssText:"-binding-ignore:true;"
		},
   	//Switch bindings repeat back on within repeat.  (IE )
         {
            selector:"xf|repeat.repeat-ready *",
            cssText:"-binding-ignore:false;"
        },
    //Switch bindings itemset back on within itemset.  (IE )        
        {
            selector:"xf|itemset.repeat-ready *",
            cssText:"-binding-ignore:false;"
        },
	//Switch bindings header back on within header. (IE )
		{
			selector:"xf|header.header-ready *",
			cssText:"-binding-ignore:false;"
		}
	],
	"http://www.w3.org/2002/xforms"); //to tell the decorator so that it doesn't need to write these definitions again
