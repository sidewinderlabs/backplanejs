/**
 * The Knowledge-base Module provides utilities for reasoning.
 *
 * @module Knowledge-base
 * @title Knowledge-base Module
 * @requires core
 */

/**
 * @class KnowledgeBase
 */

function KnowledgeBase() {
	this.factList = [ ];
	this.ruleList = [ ];
}

KnowledgeBase.prototype.createCondition = function(cond, fact) {
	// Condition
	//
	function Condition(cond, fact) {
		this.fact = fact;
		this.cond = cond;
		this.truth = null;

		fact.addCondition(this);
	}

	Condition.prototype.check = function() {
		if (this.fact.value === null) {
			this.truth = null;
		} else {
			this.truth = this.cond.test(this.fact.value);
		}
		return this.truth;
	};//check()

	return function(cond, factName) {
		return new Condition(cond, this.getFact( factName ));
	};
}();//createCondition()

KnowledgeBase.prototype.createConclusion = function( /* this function is called automatically on load */ ) {
	// Conclusion
	//
	function Conclusion(fact, value) {
		this.fact = fact;
		this.value = value;

		fact.addConclusion(this);
	}

	Conclusion.prototype.addRuleRef = function(rule) {
		this.ruleRef = rule;
		return;
	};

	Conclusion.prototype.getRule = function() {
		return this.ruleRef;
	};//getRule()

	return function(factName, value) {
		return new Conclusion(this.getFact( factName ), value);
	};
}();//createConclusion()

KnowledgeBase.prototype.createEqualCondition = function(factName, condition) {
	// EqualCondition
	//
	function EqualCondition(condition) {
		this.condition = condition;
	}

	EqualCondition.prototype.test = function(value) {
		// Note that we use "==" rather than "===" so that
		// conversions can take place.
		//
		return (this.condition == value);
	};

	return function(factName, condition) {
		return this.createCondition(new EqualCondition(condition), factName);
	};
}();//createEqualCondition()

KnowledgeBase.prototype.createPresentCondition = function(factName) {
	// PresentCondition
	//
	function PresentCondition() {
	}

	PresentCondition.prototype.test = function(value) {
		return (value !== null);
	};

	return function(factName, condition) {
		return this.createCondition(new PresentCondition(), factName);
	};
}();//createPresentCondition()

KnowledgeBase.prototype.addRule = function( /* this creates a function */ ) {
	// Rule
	//
	function Rule(kb, rule) {
		var condition, conditions, i;

		this.kb = kb;

		// Set the rule name.
		//
		this.name = rule.name;

		// Set the conditions for the rule.
		//
		this.conditions = [ ];

		for (conditions = rule.conditions, i = 0; i < conditions.length; i++) {
			if (conditions[ i ].value) {
				condition = kb.createEqualCondition(
					conditions[ i ].name,
					conditions[ i ].value
				);
			} else {
				condition = kb.createPresentCondition( conditions[ i ].name );
			}
			this.conditions.push( condition );
		}

		// Make the conclusion refer to this rule.
		//
		rule.conclusion.addRuleRef(this);
	}


	Rule.prototype.backChain = function( defaults ) {
		var condition, i;

		for (i = 0; i < this.conditions.length; i++) {
			condition = this.conditions[ i ];

			// If there is no indication of whether the condition
			// is true or false, then we'll need to backward chain
			// on the fact to see if we can find its value.
			//
			if (condition.truth === null) {
				this.kb.backChain( condition.fact.name );
			}

			// If we still don't have a value, then see if the
			// defaults object can help.
			//
			if (condition.truth === null) {
				this.kb.setFactValue(condition.fact.name, defaults[ condition.fact.name ]);
			}

			// If we have obtained a value but it's not true,
			// then there is no point in testing the other conditions.
			//
			if (!condition.truth) {
				return false;
			}
		}

		// If we looped through all of the conditions, and they
		// are all true, then return true.
		//
		return true;
	};//backChain()

	return function( rule ) {
		var i;

		if (!rule.length) {
			rule = [ rule ];
		}
		for (i = 0; i < rule.length; i++) {
			this.ruleList.push(
				new Rule(
					this,
					{
						name: rule[ i ].name || "ANONYMOUS",
						conditions: rule[ i ].conditions,
						conclusion: this.createConclusion(rule[ i ].conclusion.name, rule[ i ].conclusion.value)
					}
				)
			);
		}// for ( each rule )
		return i;
	};
}();//addRule()

KnowledgeBase.prototype.backChain = function(goalFactName, defaults) {
	var
		goalConclusion,
		goalConclusions,
		goalRule,
		goalFact,
		i,
		ruleTruth
		;

	goalFact = this.getFact( goalFactName );
	goalConclusions = goalFact.conclusions;

	for (i = 0; i < goalConclusions.length; i++) {
		goalConclusion = goalConclusions[ i ];

		// Ascertain whether the rule is true or not.
		//
		goalRule = goalConclusion.getRule();
		ruleTruth = goalRule.backChain( defaults );

		if (ruleTruth === null) {
			// We get here if there is no corresponding rule.
			//
			//alert( "Rule " + goalRule.name + " is null, can't determine truth value." );
		} else if (ruleTruth) {
			goalFact.setValue(goalConclusion.value);
		} else {
			// We get here if the rule evaluates to false, and therefore we can't
			// reach a conclusion.
			//
			//alert( "Rule " + goalRule.name + " is false, can't set " + goalFact.name );
		}
	}//for ( each goalCondition )

	// If goalFact.value === null then there is no solution.
	//
	return goalFact;
};

KnowledgeBase.prototype.prove = function(conclusion, defaults) {
	var goalValue = this.backChain(conclusion.name, defaults).getValue();

	if (conclusion.value) {
		return goalValue == conclusion.value;
	} else {
		return goalValue !== null;
	}
};

KnowledgeBase.prototype.addFact = function(fact) {
	this.factList[ fact.name ] = fact;
	return;
};

KnowledgeBase.prototype.getFact = function(factName) {
	var fact = this.factList[ factName ];

	if (!fact) {
		fact = new Fact(this, factName);
	}
	return fact;
};

KnowledgeBase.prototype.getFactValue = function(factName) {
	return this.getFact( factName ).getValue();
};

KnowledgeBase.prototype.setFactValue = function(factName, value) {
	this.getFact( factName ).setValue(value);
	return;
};

/**
 * @class Fact
 */

function Fact(kb, name) {
	this.kb = kb;
	this.name = name;
	this.value = null;
	this.conditions = [ ];
	this.conclusions = [ ];

	kb.addFact(this);
}

Fact.prototype.addConclusion = function(conclusion) {
	this.conclusions.push(conclusion);
	return;
};

Fact.prototype.addCondition = function(condition) {
	this.conditions.push(condition);
	return;
};

Fact.prototype.getValue = function() {
	return this.value;
};

Fact.prototype.setValue = function(value) {
	this.value = value;
	this.updateConditions();
	return;
};

Fact.prototype.setRuleName = function(ruleName) {
	this.ruleName = ruleName;
	return;
};

Fact.prototype.updateConditions = function() {
	var i;

	for (i = 0; i < this.conditions.length; i++) {
		this.conditions[ i ].check();
	}
	return;
};
