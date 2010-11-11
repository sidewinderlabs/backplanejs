// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity XForms module adds XForms 1.1 support to the Ubiquity
// library.
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
// limitations under the License
(function() {

var Assert = YAHOO.util.Assert;

/*
 * Test case to test the addEventListener and removeEventListener of EventTarget object  
 */

var testValue = 0;

YAHOO.tool.TestRunner.add(new YAHOO.tool.TestCase({
	
	name: "EventTarget Listener Test",
	
	addOneCB: {
		handleEvent: function(evt) {
			testValue++;
		}
	},
	
	addTwoCB: {
		handleEvent: function(evt) {
			testValue += 2;
		}
	},
	
	subOneCB: {
		handleEvent: function(evt) {
			testValue--;
		}
	},
	
	subTwoCB: {
		handleEvent: function(evt) {
			testValue -= 2;
		}
	},
	
	setUp: function() {
		this.testContainer = document.createElement("div");
		this.testElement = document.createElement("div");
		this.testContainer.appendChild(this.testElement);
		document.body.appendChild(this.testContainer);
		UX.extend(this.testElement, new EventTarget(this.testElement));
		UX.extend(this.testContainer, new EventTarget(this.testContainer));
		this.aDOMInsertedEvent = document.createEvent("Events");
		this.aDOMInsertedEvent.initEvent("DOMNodeInserted", true, false);
		this.aDOMInsertedEventNonBubble = document.createEvent("Events");
		this.aDOMInsertedEventNonBubble.initEvent("DOMNodeInserted", false, false);
		this.aDOMRemovedEvent = document.createEvent("Events");
		this.aDOMRemovedEvent.initEvent("DOMNodeRemoved", true, false);
	},
	
	tearDown: function() {
		this.testContainer.removeChild(this.testElement);
		this.testElement = null;

		document.body.removeChild(this.testContainer);
		this.testContainer = null;
		return;
	},
	
	testEventTargetAddListenersEquals3: function() {
		testValue = 0;
		this.testElement.addEventListener("DOMNodeInserted", this.addOneCB, false);
		this.testElement.addEventListener("DOMNodeInserted", this.addTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(3, testValue, 0);
	},
	
	testEventTargetAddThenRemoveListenersEqual0: function() {
		testValue = 0;
		this.testElement.addEventListener("DOMNodeInserted", this.addOneCB, false);
		this.testElement.addEventListener("DOMNodeInserted", this.addTwoCB, false);
		this.testElement.removeEventListener("DOMNodeInserted", this.addOneCB, false);
		this.testElement.removeEventListener("DOMNodeInserted", this.addTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(0, testValue, 0);
	},
	
	testEventTargetAddListenersEqualsMinus3: function() {
		testValue = 0;
		this.testElement.addEventListener("DOMNodeRemoved", this.subOneCB, false);
		this.testElement.addEventListener("DOMNodeRemoved", this.subTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(-3, testValue, 0);
	},
	
	testEventTargetAddThenRemoveIndividualListenerEquals1: function() {
		testValue = 0;
		this.testElement.addEventListener("DOMNodeInserted", this.addTwoCB, false);
		this.testElement.addEventListener("DOMNodeRemoved", this.subOneCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(1, testValue, 0);
		this.testElement.removeEventListener("DOMNodeRemoved", this.subOneCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(1, testValue, 0);
		this.testElement.removeEventListener("DOMNodeInserted", this.addTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(1, testValue, 0);
	},
	
	testEventTargetListenerRemoveRemovedListenerEqualsMinus2: function() {
		testValue = 0;
		this.testElement.addEventListener("DOMNodeRemoved", this.subTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(-2, testValue, 0);
		this.testElement.removeEventListener("DOMNodeRemoved", this.subTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(-2, testValue, 0);
		this.testElement.removeEventListener("DOMNodeRemoved", this.subTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(-2, testValue, 0);
	},
	
	testEventTargetListenerAddNullListener: function() {
		testValue = 0;
		try {
			this.testElement.addEventListener("DOMNodeInserted", null, false);
		} catch(e) {
			// Add null listener on firefox result in exception
		}
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(0, testValue, 0);
	},
	
	testEventTargetListenerRemoveNullListener: function() {
		testValue = 0;
		this.testElement.removeEventListener("DOMNodeRemoved", null, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(0, testValue, 0);
	},
	
	testEventTargetListenerRemoveNonExistListener: function() {
		testValue = 0;
		this.testElement.removeEventListener("DOMNodeInserted", this.addOneCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(0, testValue, 0);
	},
	
	testEventTargetAddThenRemoveListenerEqualsMinus2: function() {
		testValue = 0;
		this.testElement.addEventListener("DOMNodeRemoved", this.subTwoCB, false);
		this.testElement.removeEventListener("DOMNodeInserted", this.addTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(-2, testValue, 0);
	},
	testEventTargetRemoveNonExistListenerTwice: function() {
		testValue = 0;
		this.testElement.removeEventListener("DOMNodeRemoved", this.subTwoCB, false);
		this.testElement.removeEventListener("DOMNodeRemoved", this.subOneCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(0, testValue, 0);
	},
	
	testEventTargetAddSameListenerTwice: function() {
		this.testElement.addEventListener("DOMNodeInserted", this.addOneCB, false);
		this.testElement.addEventListener("DOMNodeInserted", this.addOneCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(1, testValue, 0);
	},
	
	testEventTargetRemoveNonExistListenerTwice: function() {
		testValue = 0;
		this.testElement.removeEventListener("DOMNodeInserted", this.addOneCB, false);
		this.testElement.removeEventListener("DOMNodeInserted", this.addOneCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEvent);
		Assert.areEqual(0, testValue, 0);
	},
	
	testEventTargetAddCaptureListenerTwice: function() {
		testValue = 0;
		var ancestorNode = this.testElement.parentNode;
		ancestorNode.addEventListener("DOMNodeInserted", this.addOneCB, true);
		ancestorNode.addEventListener("DOMNodeInserted", this.addTwoCB, true);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEventNonBubble);
		Assert.areEqual(3, testValue, 0);
	},
	
	testEventTargetAddThenRemoveIndividualCaptureListenerTwice: function() {
		testValue = 0;
		var ancestorNode = this.testElement.parentNode;
		ancestorNode.addEventListener("DOMNodeInserted", this.addOneCB, true);
		ancestorNode.addEventListener("DOMNodeInserted", this.addTwoCB, true);
		ancestorNode.removeEventListener("DOMNodeInserted", this.addOneCB, false);
		ancestorNode.removeEventListener("DOMNodeInserted", this.addTwoCB, false);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEventNonBubble);
		ancestorNode.removeEventListener("DOMNodeInserted", this.addOneCB, true);
		ancestorNode.removeEventListener("DOMNodeInserted", this.addTwoCB, true);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMInsertedEventNonBubble);
		Assert.areEqual(3, testValue, 0);
	},
	
	testEventTargetAddandRemoveBubbleListenerThenCaptureListener: function() {
		testValue = 0;
		var ancestorNode = this.testElement.parentNode;
		ancestorNode.addEventListener("DOMNodeRemoved", this.subOneCB, true);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		ancestorNode.removeEventListener("DOMNodeRemoved", this.subOneCB, false);
		ancestorNode.removeEventListener("DOMNodeRemoved", this.subOneCB, true);
		FormsProcessor.dispatchEvent(this.testElement, this.aDOMRemovedEvent);
		Assert.areEqual(-1, testValue, 0);
	}
	
}));

})();
