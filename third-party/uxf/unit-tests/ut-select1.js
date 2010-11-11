(function() {

	var retval = new YAHOO.tool.TestSuite({
		name: "Test Select1",
		setUp: function() {},
		tearDown: function() {}
	});

	var caseMultimap = new YAHOO.tool.TestCase({
		name: "Test Multimap",
		setUp: function() {},
		tearDown: function() {},

		testAddNewItem: function() {
			var m = new Multimap();
			var obj = {
				someProp: "hello"
			};
			m.addItem(obj, "someKey");
			YAHOO.util.Assert.areSame(m.getItem("someKey"), obj);
		},

		testRemoveItem: function() {
			var m = new Multimap();
			var obj = {
				someProp: "hello"
			};
			m.addItem(obj, "someKey");
			YAHOO.util.Assert.areSame(m.removeItem(obj, "someKey"), true);
			YAHOO.util.Assert.isUndefined(m.getItem("someKey"));
		},

		testAddNewItemWithDefaultKey: function() {
			var m = new Multimap();
			var obj = {
				getValue: function() {
					return "hello";
				}
			};
			m.addItem(obj);
			YAHOO.util.Assert.areSame(m.getItem(obj.getValue()), obj);
		},

		testAddItemWithSameKeyAsExistingItem: function() {
			var m = new Multimap();
			var obj0 = {
				someProp: "hello"
			};
			var obj1 = {
				someProp: "goodbye"
			};
			m.addItem(obj0, "someKey");
			m.addItem(obj1, "someKey");
			YAHOO.util.Assert.areNotSame(obj0, obj1);
			YAHOO.util.Assert.areSame(m.getItem("someKey"), obj0);
			YAHOO.util.Assert.areSame(m.getItem("someKey", 0), obj0);
			YAHOO.util.Assert.areSame(m.getItem("someKey", 1), obj1);
			YAHOO.util.Assert.isUndefined(m.getItem("someKey", 2));
		},

		testRemoveItemWithSameKeyAsExistingItem: function() {
			var m = new Multimap();
			var obj0 = {
				someProp: "hello"
			};
			var obj1 = {
				someProp: "goodbye"
			};
			m.addItem(obj0, "someKey");
			m.addItem(obj1, "someKey");
			m.removeItem(obj0, "someKey");
			YAHOO.util.Assert.areSame(m.getItem("someKey"), obj1);
			YAHOO.util.Assert.areSame(m.getItem("someKey", 0), obj1);
		},
		testRemoveExistingItemWithIncorrectKey: function() {
			var m = new Multimap();
			var obj0 = {
				someProp: "hello"
			};
			var obj1 = {
				someProp: "goodbye"
			};
			m.addItem(obj0, "someKey");
			m.addItem(obj1, "someOtherKey");
			YAHOO.util.Assert.areSame(m.removeItem(obj1, "someKey"), false);
		},
		testRemoveExistingMultiItemWithIncorrectKey: function() {
			var m = new Multimap();
			var obj0 = {
				someProp: "hello"
			};
			var obj1 = {
				someProp: "goodbye"
			};
			m.addItem(obj0, "someKey");
			m.addItem(obj1, "someKey");
			YAHOO.util.Assert.areSame(m.removeItem(obj1, "someOtherKey"), false);
		}
	});

	var caseCommonSelect = new YAHOO.tool.TestCase({
		name: "Test CommonSelect",
		setUp: function() {},
		tearDown: function() {},

		testItemValueChanged: function() {
			var select = new CommonSelect();
			var obj0 = {
				someProp: "hello"
			};
			var obj1 = {
				someProp: "goodbye"
			};
			select.addItem(obj0, "someKey");
			select.addItem(obj1, "someOtherKey");
			//shift an item to a new key
			YAHOO.util.Assert.areSame(select.getItem("someKey"), obj0);
			select.itemValueChanged(obj0, "someKey", "yetAnotherKey");
			YAHOO.util.Assert.isUndefined(select.getItem("someKey"));
			YAHOO.util.Assert.areSame(select.getItem("yetAnotherKey"), obj0);

			//shift an item to an already populated key
			select.itemValueChanged(obj1, "someOtherKey", "yetAnotherKey");
			YAHOO.util.Assert.areSame(select.getItem("yetAnotherKey"), obj0);
			YAHOO.util.Assert.areSame(select.getItem("yetAnotherKey", 1), obj1);

			//shift an item from an otherwise populated key
			select.itemValueChanged(obj0, "yetAnotherKey", "Quay");
			YAHOO.util.Assert.areSame(select.getItem("yetAnotherKey"), obj1);
			YAHOO.util.Assert.areSame(select.getItem("Quay"), obj0);

		},

		testDisplayValue: function() {
			var select = new CommonSelect();
			var obj0 = {
				getLabel: function() {
					return "hello";
				},
				getValue: function() {
					return "entering";
				}
			};
			var obj1 = {
				getLabel: function() {
					return "goodbye";
				},
				getValue: function() {
					return "leaving";
				}
			};
			select.addItem(obj0);
			select.addItem(obj1);
			YAHOO.util.Assert.areSame(select.getSingleDisplayValue("entering"), "hello");
			YAHOO.util.Assert.areSame(select.getSingleDisplayValue("leaving"), "goodbye");
			YAHOO.util.Assert.isNull(select.getSingleDisplayValue("staying"));
		}
	});

	var caseSelect1 = new YAHOO.tool.TestCase({
		name: "Test XFormsSelect1",

		setUp: function() {
			this.select1 = this.createElement("xf:select1", "http://www.w3.org/2002/xforms", document.body);
			if(UX.isIE) UX.extend(this.select1, new EventTarget(this.select1));
			this.select1Object = new XFormsSelect1(this.select1);
			DECORATOR.addBehaviour(this.select1, this.select1Object);
			if (!this.select1Object.m_value) {
				this.select1Object.m_value = this.createElement("input", null, this.select1);
				var value = new XFormsSelect1Value(this.select1Object.m_value);
				DECORATOR.addBehaviour(this.select1Object.m_value, value);
			}
			this.select1Object.createChoicesPseudoElement();

			if (!this.select1Object.m_proxy) {
				this.select1Object.m_proxy = {};
				this.select1Object.m_proxy.enabled = {
					getValue: function() {
						return true;
					}
				};
			}
		},

		tearDown: function() {
			document.body.removeChild(this.select1);
			this.select1 = null;
			delete this.select1Object;
		},

		testGiveFocus: function() {
			this.select1Object.m_value.blur();
			YAHOO.util.Assert.isFalse(this.select1 === document.activeElement || this.select1.contains(document.activeElement));
			this.select1Object.giveFocus();
			YAHOO.util.Assert.isTrue(this.select1 === document.activeElement || this.select1.contains(document.activeElement));
			this.select1Object.m_value.blur();
		},

		createElement: function(name, ns, parent) {
			var element;

			if (ns) {
				element = document.createElementNS(ns, name);
			} else {
				element = document.createElement(name);
			}

			if (parent) {
				element = parent.appendChild(element);
			}

			return element;
		}
	});

	retval.add(caseMultimap);
	retval.add(caseCommonSelect);
	retval.add(caseSelect1);
	YAHOO.tool.TestRunner.add(retval);
})();
