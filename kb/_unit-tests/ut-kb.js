// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa support to the Ubiquity
// library.
//
// Copyright (C) 2007-9 Mark Birbeck
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

(function() {
	var Assert = YAHOO.util.Assert;

	var suite = new YAHOO.tool.TestSuite({
		name: "Knowledge Base"
	});

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test Fact",

	    setUp : function () {
	    },

	    tearDown : function () {
	    },

	    // Tests.
	    //
			testFactCreate : function () {
				var kb = new KnowledgeBase();
				var vehicleType = new Fact(kb, "vehicleType");

				Assert.areEqual("vehicleType", vehicleType.name);
			},

			testFactSetValue : function () {
				var kb = new KnowledgeBase();
				var vehicleType = new Fact(kb, "vehicleType");

				vehicleType.setValue("automobile");

				Assert.areEqual("automobile", vehicleType.getValue());
			}
	  })//new TestCase
	);

	suite.add(
	  new YAHOO.tool.TestCase({
	    name: "Test KnowledgeBase",

	    setUp : function () {
	    },

	    tearDown : function () {
	    },

	    // Tests.
	    //
			testKnowledgeBaseSetFactValue : function () {
				var kb = new KnowledgeBase();

				kb.setFactValue("vehicleType", "automobile");

				Assert.areEqual("automobile", kb.getFactValue("vehicleType"));
			},

			testKnowledgeBaseBackwardChainingAutomobile : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					1,
					kb.addRule({
						conditions: [
							{ name: "wheels", value: 4 },
							{ name: "engine", value: true }
						],
						conclusion: { name: "vehicleType", value: "automobile" }
					})
				);

				kb.setFactValue("engine", true);
				kb.setFactValue("wheels", 4);

				Assert.isTrue(
					kb.prove({ name: "vehicleType", value: "automobile" })
				);
			},

			testKnowledgeBaseBackwardChainingAutomobileDefaultsFromObject : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					1,
					kb.addRule({
						conditions: [
							{ name: "wheels", value: 4 },
							{ name: "engine", value: true }
						],
						conclusion: { name: "vehicleType", value: "automobile" }
					})
				);

				Assert.isTrue(
					kb.prove(
						{ name: "vehicleType", value: "automobile" },
						{
							engine: true,
							wheels: 4
						}
					)
				);
			},

			testKnowledgeBaseBackwardChainingMiniVan : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					1,
					kb.addRule({
						conditions: [
							{ name: "wheels", value: 4 },
							{ name: "engine", value: true }
						],
						conclusion: { name: "vehicleType", value: "automobile" }
					})
				);

				Assert.areEqual(
					1,
					kb.addRule({
						conditions: [
							{ name: "vehicleType", value: "automobile" },
							{ name: "doors", value: 3 },
							{ name: "size", value: "medium" }
						],
						conclusion: { name: "vehicle", value: "mini-van" }
					})
				);

				kb.setFactValue("engine", true);
				kb.setFactValue("size", "medium");
				kb.setFactValue("doors", "3");
				kb.setFactValue("wheels", 4);

				Assert.isTrue(
					kb.prove({ name: "vehicle", value: "mini-van" })
				);
			},

			testKnowledgeBaseBackwardChainingMiniVanDefaultsFromObject : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					2,
					kb.addRule([
						{
							conditions: [
								{ name: "wheels", value: 4 },
								{ name: "engine", value: true }
							],
							conclusion: { name: "vehicleType", value: "automobile" }
						},
						{
							conditions: [
								{ name: "vehicleType", value: "automobile" },
								{ name: "doors", value: 3 },
								{ name: "size", value: "medium" }
							],
							conclusion: { name: "vehicle", value: "mini-van" }
						}
					])
				);

				Assert.isTrue(
					kb.prove(
						{ name: "vehicleType", value: "automobile" },
						{
							engine: true,
							wheels: 4
						}
					)
				);

				Assert.isTrue(
					kb.prove(
						{ name: "vehicle", value: "mini-van" },
						{
							size: "medium",
							doors: 3
						}
					)
				);
			},

			testKnowledgeBaseBackwardChainingNotFound : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					1,
					kb.addRule({
						name: "automobile",
						conditions: [
							{ name: "wheels", value: 4 },
							{ name: "engine", value: true }
						],
						conclusion: { name: "vehicleType", value: "automobile" }
					})
				);

				Assert.isFalse(
					kb.prove(
						{ name: "vehicleType" },
						{
							engine: true,
							wheels: 2
						}
					)
				);
			},

			testKnowledgeBaseBackwardChainingFoafPerson : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					1,
					kb.addRule({
						conditions: [
							{ name: "http://xmlns.com/foaf/0.1/workplaceHomepage" }
						],
						conclusion: { name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Person" }
					})
				);

				Assert.isTrue(
					kb.prove(
						{ name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Person" },
						{
							"http://xmlns.com/foaf/0.1/name": "Mark Birbeck",
							"http://xmlns.com/foaf/0.1/workplaceHomepage": "http://webBackplane.com"
						}
					)
				);
			},

			testKnowledgeBaseBackwardChainingFoafAgent : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					2,
					kb.addRule([
						{
							conditions: [
								{ name: "http://xmlns.com/foaf/0.1/workplaceHomepage" }
							],
							conclusion: { name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Person" }
						},
						{
							conditions: [
								{ name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Person" }
							],
							conclusion: { name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Agent" }
						}
					])
				);

				Assert.isTrue(
					kb.prove(
						{ name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Agent" },
						{
							"http://xmlns.com/foaf/0.1/name": "Mark Birbeck",
							"http://xmlns.com/foaf/0.1/workplaceHomepage": "http://webBackplane.com"
						}
					)
				);
			},

			testKnowledgeBaseBackwardChainingTypeVacancy : function () {
				var kb = new KnowledgeBase();

				Assert.areEqual(
					1,
					kb.addRule({
						conditions: [
							{ name: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", value: "http://xmlns.com/foaf/0.1/Document" },
							{ name: "http://purl.org/dc/terms/type", value: "http://purl.oclc.org/argot/Vacancy" },
							{ name: "http://purl.org/dc/terms/title" }
						],
						conclusion: { name: "valid", value: true }
					})
				);

				kb.setFactValue("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://xmlns.com/foaf/0.1/Document");
				kb.setFactValue("http://purl.org/dc/terms/type", "http://purl.oclc.org/argot/Vacancy");
				kb.setFactValue("http://purl.org/dc/terms/title", "Product manager Tridion");

				Assert.isTrue(
					kb.prove({ name: "valid", value: true })
				);
			}
	  })//new TestCase
	);

	YAHOO.tool.TestRunner.add(suite);
}());
