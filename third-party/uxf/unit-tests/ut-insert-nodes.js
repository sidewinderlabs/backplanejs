(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name : "Test insert nodes functionality",

		setUp : function() {
		
			this.testDIV = document.createElement( "div" );
			this.testInstance = new Instance( this.testDIV );
            this.testInstance.replaceDocument(
                xmlParse(
                    "<po xmlns=''> \
                         <order> \
                             <item> \
                                <product>P1</product> \
                                <unitcost>1.99</unitcost> \
                                <qty>10</qty> \
                                <itemtotal>19.90</itemtotal> \
                             </item> \
                         </order> \
                         <prototype> \
                             <item> \
                                <product></product> \
                                <unitcost>0</unitcost> \
                                <qty>0</qty> \
                                <itemtotal>0</itemtotal> \
                             </item> \
                         </prototype> \
                         <subtotal>19.90</subtotal> \
                         <tax>1.00</tax> \
                         <total>20.99</total> \
                    </po>"
                )
            );
            
			this.originDIV = document.createElement( "div" );
			this.originInstance = new Instance( this.originDIV );
            this.originInstance.replaceDocument(
                xmlParse(
                    "<po xmlns=''> \
                         <prototype> \
                             <item> \
                                <product></product> \
                                <unitcost>0</unitcost> \
                                <qty>0</qty> \
                                <itemtotal>0</itemtotal> \
                             </item> \
                         </prototype> \
                    </po>"
                )
            );
			return;
		},// setUp()

		tearDown : function() {
			delete this.testDIV;
			this.testDIV = null;

			delete this.testInstance;
			this.testInstance = null;
			
			delete this.originDIV;
			this.originDIV = null;

			delete this.originInstance;
			this.originInstance = null;
			return;
		}// tearDown()
		
	});

	// Add test for insert nodes.
	//
	suite.add(
		new YAHOO.tool.TestCase({
			name : "Test insert nodes",

			setUp : function() {
				// Check that the initial data is correct.
				//
				Assert.areEqual(2, suite.testInstance.evalXPath('count(*/item)').numberValue(),
					"Instance not initialised correctly");
				Assert.areEqual(1, suite.originInstance.evalXPath('count(*/item)').numberValue(),
					"Origin instance not initialised correctly");
				return;
			}, // setUp()

			tearDown : function() {
				suite.testInstance.reset();
				return;
			}, // tearDown()

            // Test for insertion after a sibling in a non-empty list
            // This tests the main "add" button use case.
            //
            testInsertElementPrototypeIntoList: function() {
            
                Assert.isTrue(suite.testInstance.insertNodes(
                    suite.testInstance.evalXPath('order').nodeSetValue()[0],  
                    "item", "1", "after", 
                    // "/po/prototype/item"), 
                    suite.originInstance.evalXPath('/po/prototype/item').nodeSetValue()),  
                    "Insert did not insert any nodes");

                Assert.areEqual(2, suite.testInstance.evalXPath('count(order/item)').numberValue());
                Assert.isTrue(suite.testInstance.evalXPath('order/item[1]/product = "P1"').booleanValue());
                Assert.isTrue(suite.testInstance.evalXPath('order/item[2]/product = ""').booleanValue());
                
                Assert.areEqual(1, 
                    suite.testInstance.evalXPath(
                        'count(/po/order)',
                        suite.testInstance.evalXPath('order/item[2]/product').nodeSetValue()[0] 
                    ).numberValue(), 
                    "XPath failed because owner document is not correctly set in subtree of inserted node");
                    
                Assert.isTrue(
                    suite.testInstance.evalXPath('order/item[1]').nodeSetValue()[0].ownerDocument
                    &&
                    suite.testInstance.evalXPath('order/item[1]').nodeSetValue()[0].ownerDocument
                    ===
                    suite.testInstance.evalXPath('order/item[2]').nodeSetValue()[0].ownerDocument,
                    "Owner document of inserted node is not correctly set"                    
                );
                
                return;
            },

            // Given a data element intended to be a list, test that we can insert a 
            // child element when we know the list is empty, i.e. using nulls for
            // the nodeset, at and position parameters.
            // This is the main operation that would be needed by a "delete" button 
            // that is also intended to ensure that the user has a new empty prototype
            // to work on if the deletion caused the list to become empty.
            //
            testInsertElementPrototypeIntoEmptyList: function() {
                // This deletion reflects the use case, but more importantly is needed
                // to adjust the testInstance, relative to the setUp(), so that it has
                // the desired property of having an empty list for us to insert within
                // 
                Assert.isTrue(suite.testInstance.deleteNodes(null, "order/child::node()"));
                
                // Ensure we have the correct starting property of an empty list, 
                // i.e. ensure the P1 product item is in fact gone now  
                //
                Assert.areEqual(0, suite.testInstance.evalXPath('count(order/item)').numberValue(), 
                                "The delete failed to set up the precondition for the insert test");

                // Insert into the empty list
                //
                Assert.isTrue(suite.testInstance.insertNodes(
                    { 
                       node: suite.testInstance.evalXPath('order').nodeSetValue()[0],
                       initialContext : suite.testInstance.evalXPath('.').nodeSetValue()[0]
                    },  
                    null, null, null, 
                    // "/po/prototype/item"), 
                    suite.originInstance.evalXPath('/po/prototype/item').nodeSetValue()),  
                    "Insert did not insert any nodes");

                // Ensure we got from zero elements above to one element
                //
                Assert.areEqual(1, suite.testInstance.evalXPath('count(order/item)').numberValue());
                
                // Now ensure that the one element is in fact the *empty* prototype, not the original P1 product
                //
                Assert.isTrue(suite.testInstance.evalXPath('order/item[1]/product = ""').booleanValue());

                // The absolute XPath uses the owner document of the context node to 
                // get to the document element, so this assertion ensures that the 
                // newly appended node belongs to the right document.
                // 
                Assert.areEqual(1, 
                    suite.testInstance.evalXPath(
                        'count(/po/order)',
                        suite.testInstance.evalXPath('order/item[1]/product').nodeSetValue()[0] 
                    ).numberValue(), 
                    "XPath failed because owner document is not correctly set in subtree of inserted node");

                // Ensure that newly appended node belongs to the same document as its parent
                // The above assertion already makes sure, but this was added first and it's
                // still a valid assertion worth testing in case the xpath engine ever stops
                // using ownerDocument as a short circuit on absolute URIs 
                // 
                Assert.isTrue(
                    suite.testInstance.evalXPath('order/item[1]').nodeSetValue()[0].ownerDocument
                    &&
                    suite.testInstance.evalXPath('order/item[1]').nodeSetValue()[0].ownerDocument
                    ===
                    suite.testInstance.evalXPath('order').nodeSetValue()[0].ownerDocument,
                    "Owner document of inserted node is not correctly set"                    
                );
                
                // Nodes in the subtree of the newly inserted node should also have the 
                // correct ownerDocument
                //
                Assert.isTrue(
                    suite.testInstance.evalXPath('order/item[1]/product').nodeSetValue()[0].ownerDocument
                    &&
                    suite.testInstance.evalXPath('order/item[1]/product').nodeSetValue()[0].ownerDocument
                    ===
                    suite.testInstance.evalXPath('order').nodeSetValue()[0].ownerDocument,
                    "Owner document of descendants of inserted node is not correctly set"                    
                );
                return;
            },
            
            // Test that we can insert into a possibly empty list element.
            // This is the main operation that would be needed by a "delete" button 
            // that is also intended to ensure that the user has a new empty prototype
            // to work on if the deletion caused the list to become empty.
            //
            testInsertElementPrototypeIntoPossiblyEmptyList: function() {
                // This deletion initializes the testInstance, relative to the setUp(), so that it 
                // has the desired property of being empty
                // 
                Assert.isTrue(suite.testInstance.deleteNodes(null, "order/item", "1"));
                
                // Ensure we have the correct starting property of an empty list, 
                // i.e. ensure the P1 product item is in fact gone now  
                //
                Assert.areEqual(0, suite.testInstance.evalXPath('count(order/item)').numberValue(), 
                                "The delete failed to set up the precondition for the insert test");

                // Insert into a list which happens to be empty
                //
                Assert.isTrue(suite.testInstance.insertNodes(
                    { 
                       node: suite.testInstance.evalXPath('order').nodeSetValue()[0],
                       initialContext : suite.testInstance.evalXPath('.').nodeSetValue()[0]
                    },  
                    "item", "1", "after", 
                    "/po/prototype/item"), 
                    "Insert did not insert any nodes");

                // Ensure we got from zero elements above to one element
                //
                Assert.areEqual(1, suite.testInstance.evalXPath('count(order/item)').numberValue());
                
                // Now ensure that the one element is in fact the *empty* prototype, not the original P1 product
                //
                Assert.isTrue(suite.testInstance.evalXPath('order/item[1]/product = ""').booleanValue());

                return;
            },

            // Test that last() can be used in atExpr in insertion.
            //
            testInsertAtLast: function() {
                // Insert an extra copy of item P1 so that last() will be 2 when we test it
                Assert.isTrue(suite.testInstance.insertNodes(
                    suite.testInstance.evalXPath('order').nodeSetValue()[0],  
                    "item", "1", "after"), 
                    "Insert did not insert any nodes");

                // Ensure we got from one element above to two elements
                //
                Assert.areEqual(2, suite.testInstance.evalXPath('count(order/item)').numberValue(), "Expected 2 item elements");
                
                // Now insert a prototypical product after the last element
                Assert.isTrue(suite.testInstance.insertNodes(
                    { 
                       node: suite.testInstance.evalXPath('order').nodeSetValue()[0],
                       size: 2
                    },  
                    "item", "last()", "after", "/po/prototype/item"), 
                    "Insert did not insert any nodes");
                    
                // Ensure that we got a copy of the prototypical product after the last element.
                //
                Assert.areEqual(3, suite.testInstance.evalXPath('count(order/item)').numberValue(), "Expected 3 item elements");
                Assert.isTrue(suite.testInstance.evalXPath('order/item[3]/product = ""').booleanValue(), "Wrong product name");

                return;
            },

            // Test insertion of the root (document) element of an instance.
            //
            testInsertRootElement: function() {
                Assert.isTrue(suite.testInstance.insertNodes(
                        suite.testInstance.evalXPath('.').nodeSetValue()[0],  
                        ".", "1", "after", "/po/prototype"), 
                        "Insert instance subtree at the instance root failed");

                Assert.areEqual(1, suite.testInstance.evalXPath('count(item)').numberValue());
                   
                return;
            },
            
            // Test insertion of root when position is set to "before". Will cause failure if
            // insertBeforeNode is not nulled before calling insertBefore().
            //
            testInsertAtRootWithBeforePositionParameter: function() {
            	var root = suite.testInstance.evalXPath('.').nodeSetValue()[0];
            	Assert.isTrue(suite.testInstance.insertNodeset(
                        root,  
                        [root], "1", "before", "/po/prototype"), 
                        "Insert instance subtree at the instance root failed");
                
                Assert.areEqual("prototype", suite.testInstance.evalXPath('.').nodeSetValue()[0].nodeName);
            }

		})//new TestCase
	); //suite.add( ... )

	YAHOO.tool.TestRunner.add(suite);
}());
