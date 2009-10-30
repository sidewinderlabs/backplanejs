/*
 
  File:transitions.js
 
 Abstract: Creates transition functionality for the Simple 
		   Browser sample. Allows to create a set of transitions
		   that can be grouped and performed together.
  
 Version: 1.0
 
 Disclaimer: IMPORTANT:  This Apple software is supplied to you by 
 Apple Inc. ("Apple") in consideration of your agreement to the
 following terms, and your use, installation, modification or
 redistribution of this Apple software constitutes acceptance of these
 terms.  If you do not agree with these terms, please do not use,
 install, modify or redistribute this Apple software.
 
 In consideration of your agreement to abide by the following terms, and
 subject to these terms, Apple grants you a personal, non-exclusive
 license, under Apple's copyrights in this original Apple software (the
 "Apple Software"), to use, reproduce, modify and redistribute the Apple
 Software, with or without modifications, in source and/or binary forms;
 provided that if you redistribute the Apple Software in its entirety and
 without modifications, you must retain this notice and the following
 text and disclaimers in all such redistributions of the Apple Software. 
 Neither the name, trademarks, service marks or logos of Apple Inc. 
 may be used to endorse or promote products derived from the Apple
 Software without specific prior written permission from Apple.  Except
 as expressly stated in this notice, no other rights or licenses, express
 or implied, are granted by Apple herein, including but not limited to
 any patent rights that may be infringed by your derivative works or by
 other works in which the Apple Software may be incorporated.
 
 The Apple Software is provided by Apple on an "AS IS" basis.  APPLE
 MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
 THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND
 OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
 
 IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION,
 MODIFICATION AND/OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED
 AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE),
 STRICT LIABILITY OR OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 
 Copyright (C) 2008 Apple Inc. All Rights Reserved.
 
 */

function Transitions () {
  // callback for the first batch of operation, where we set the default properties
  // for the transition (transition-property and transition-duration) as well as 
  // the "from" property value if explicitely passed as a param to .add()
  this.instantOperations = new Function (); 
  // callback for the second batch of operation, where we set the "to" property value
  this.deferredOperations = new Function (); 
};

// Core defaults for the transitions, you can update these members so that all
// calls to .add() from that point on use this duration and set of properties
Transitions.DEFAULTS = {
  duration : 1,    // default to 1 second
  properties : []
};


/*
 Adds a CSS transition, parameters are :
 
 element:     target element for transition
 duration:    duration for all transitions in seconds
 properties:  the properties that are transitioned (will be fed to '-webkit-transition-property')
 from:        optional list of initial property values to match properties passed as .properties
 to:          list of final property values to match properties passed as .properties
 
 The .duration and .properties parameters are optional and can be defined once for
 all upcoming transitions by over-riding the Transition.DEFAULTS properties

 Some operations need to be deferred so that the styles are currently set for the from state
 of from / to operations 

 */

Transitions.prototype.add = function (params) {
  var style = params.element.style;
  // set up properties
  var properties = (params.properties) ? params.properties : Transitions.DEFAULTS.properties;
  // set up durations
  var duration = ((params.duration) ? params.duration : Transitions.DEFAULTS.duration) + 's';
  var durations = [];
  for (var i = 0; i < properties.length; i++) {
    durations.push(duration);
  }
  // from/to animation
  if (params.from) {
    this.addInstantOperation(function () {
      style.webkitTransitionProperty = 'none';
      for (var i = 0; i < properties.length; i++) {
        style.setProperty(properties[i], params.from[i], '');
      }
    });
    this.addDeferredOperation(function () {
      style.webkitTransitionProperty = properties.join(', ');
      style.webkitTransitionDuration = durations.join(', ');
      for (var i = 0; i < properties.length; i++) {
        style.setProperty(properties[i], params.to[i], '');
      }
    });
  }
  // to-only animation
  else {
    this.addDeferredOperation(function () {
      style.webkitTransitionProperty = properties.join(', ');
      style.webkitTransitionDuration = durations.join(', ');
      for (var i = 0; i < properties.length; i++) {
        style.setProperty(properties[i], params.to[i], '');
      }
    });
  }
};

// adds a new operation to the set of instant operations
Transitions.prototype.addInstantOperation = function (new_operation) {
  var previousInstantOperations = this.instantOperations;
  this.instantOperations = function () {
    previousInstantOperations();
    new_operation();
  };
};

// adds a new operation to the set of deferred operations
Transitions.prototype.addDeferredOperation = function (new_operation) {
  var previousDeferredOperations = this.deferredOperations;
  this.deferredOperations = function () {
    previousDeferredOperations();
    new_operation();
  };
};

// called in order to launch the current group of transitions
Transitions.prototype.apply = function () {
  this.instantOperations();
  var _this = this;
  setTimeout(_this.deferredOperations, 0);
};
