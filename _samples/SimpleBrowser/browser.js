/*
 
 File:browser.js
 
 Abstract: JavaScript functionality for the Simple Browser sample code.
		   Dynamically creates all lists on the screen. Fetches XML data remotely 
		   and populates the lists with these data.Handles touch event, orientation
		   changes, and navigation between screens. Hides the status bar when the page
		   loads. Uses the Transitions object to perform transitions between screens.	   
	    
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


/* ============================== INIT ============================== */

// relative path to the directory where the data is held
const ROOT_DIRECTORY = 'data/';

// root of the DOM data document that will be populated dynamically as we navigate
var catalog = null;

// object that will hold points to DOM element in the document
var elements;

// holds the computed width of the button currently on-screen or about to enter the screen
var current_button_width = 0;

// holds the computed x position of the title currently on-screen or about to enter the screen
var current_title_x = 0;

// flag to identify screen orientation
var is_portrait = false;

// current width of the screen
var screen_width;

// this function is called when the document has finished loading,
// see the end of this file to see how we register for the event
function init () {

  // listen to screen orientation changes
  window.addEventListener('orientationchange', orientation_changed, false);
  // set up vars based on orientation
  orientation_changed();

  // now let's hold onto the pieces of markup that will be dynamically updated with content
  // as the user interacts with the browser
  elements = {
    buttons : [document.getElementById('first_button'), document.getElementById('second_button')],
    titles : [document.getElementById('first_title'), document.getElementById('second_title')],
    pages : [document.getElementById('first_page'), document.getElementById('second_page')]
  };

  // make all back buttons appear off screen
  elements.buttons[0].style.webkitTransform = get_header_transform_for_x(screen_width);
  elements.buttons[1].style.webkitTransform = get_header_transform_for_x(screen_width);

  // send the other page off screen
  elements.pages[1].style.webkitTransform = get_page_transform_for_x(screen_width);

  // setup back interactions by adding UI events to buttons
  elements.buttons[0].addEventListener('touchend', go_back, false);
  elements.buttons[1].addEventListener('touchend', go_back, false);

  // pre-load touched images to avoid delay on first touch
  (new Image()).src = 'images/chevron_touched.png';
  (new Image()).src = 'images/item_background_touched.png';
  (new Image()).src = 'images/back_button_touched.png';

  // add an event listener to be notified of the end of transitions on one of the pages
  // so that we can perform post-flight operations
  elements.pages[0].addEventListener('webkitTransitionEnd', transition_ended, false);

  // all transitions will be using the same duration
  Transitions.DEFAULTS.duration = 0.35;

  // retrieve the top level element for data
  catalog = get_data_in_file('data.xml', init_data_loaded);

  // hide the address bar
  setTimeout(hide_address_bar, 500);
};

// called upon successful data retrieval following initial setup
function init_data_loaded (data) {

  // get a pointer to the retrieved base DOM data, the catalog DOM tree will
  // be built as we retrieve more data so that things are cached
  catalog = data;

  // now we need to set the basic states of elements that appear or will appear on screen,
  // this includes some global variables to hold metrics of components in the header for dynamic layout
  current_title_x = set_title_and_get_x(0, get_name(catalog), current_button_width);
  // position the first page's title
  elements.titles[0].style.webkitTransform = get_header_transform_for_x(current_title_x);
  // populate the first page
  elements.pages[0].appendChild(create_list_with_elements(get_items(catalog)));

  // track which is the currently active page
  active_index = 0;
  // also track which is the currently active element in the data source
  active_element = catalog;

};

/* ============================== DATA POPULATION ============================== */

// retrieves a remote file and returns its root element
function get_data_in_file (file_name, success_callback, success_callback_context_args) {
  // get the document asynchronously
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    // when the document has fully loaded, the .readyState is 4
    // and 200 is the HTTP code for a smooth operation
    if (request.readyState == 4) {
      // call callback with root element of the document as parameter
      success_callback(request.responseXML.documentElement, success_callback_context_args);
    }
    // note that in real life, we would implement some error-handling behavior in case something
    // goes wrong on the network, as things ALWAYS go wrong at some point, but this is beyond the
    // point of this example
  };
  request.open('GET', ROOT_DIRECTORY + file_name, true);
  request.send();
};

// returns the direct children of an element in the data file
function get_items (element) {
  // find all direct children of the element
  var element_children = [];
  for (var child = element.firstChild; child; child = child.nextSibling) {
    // check the node here is an element and not a text node in case of white space
    if (child.nodeType == 1) {
      element_children.push(child);
    }
  }
  return element_children;
};

// creates a <ul> HTML element with an item for each element passed as arguments
function create_list_with_elements (elements) {
  // create an empty <ul> element
  var container = document.createElement('ul');
  // now create an <li> element for each data element passed as parameter
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var li = document.createElement('li');
    // record what the child index of the element is so that we can
    // get to the original data element from the <li> when clicked
    li._index = i;
    // set the class to be the type of element so we can style accordingly
    li.className = element.localName;
    li.textContent = get_name(element);
    // register UI events for elements that can be drilled into
    if (element.localName == 'group') {
      li.addEventListener('touchstart', touch_started, false);
      li.addEventListener('touchmove', touch_moved, false);
      li.addEventListener('touchend', element_selected, false);
    }
    container.appendChild(li);
  }
  // hand back the <ul> with all its contents
  return container;
};

// shorthand method to retrieve an element's name attribute value
function get_name (element) {
  return element.getAttribute('name');
};

// sets a button element the contents of the label
// and returns the new width of the button
function set_button_label_and_get_width (button_index, label) {
  var button = elements.buttons[button_index];
  button.textContent = label;
  return button.offsetWidth;
};

// some metrics constants
const BUTTON_MARGIN_LEFT = 5;
const BUTTON_MARGIN_RIGHT = 10;

// sets a title element the contents of a screen title and
// returns the x position for this element
function set_title_and_get_x (title_index, label, button_width) {
  // first get a pointer to the title element
  var title = elements.titles[title_index];
  // set the max width based on the space left on screen by the button
  var max_width = screen_width - BUTTON_MARGIN_LEFT - button_width - (BUTTON_MARGIN_RIGHT * 2);
  title.style.maxWidth = to_px(max_width);
  // now set the title text content and get the resulting width
  title.textContent = label;
  var width = title.offsetWidth;
  // titles have to be laid out at a minimum to the right of the button with a margin
  var min_x = BUTTON_MARGIN_LEFT + button_width + BUTTON_MARGIN_RIGHT;
  // by default titles are centered
  var x = (screen_width - width) / 2;
  // but in case there is cropping involved, or text would display in front of the button,
  // we position the title to the right of the button,
  if (width > max_width || x < min_x) {
    x = min_x;
  }
  // hand back the resulting position of the title
  return x;
};

/* ============================== TRANSITIONS ============================== */

// index of the page currently on display
var active_index;

// currently active element in the data source
var active_element = null;

// is there an animation in progress?
var transitions_in_progress = false;

// performs the required animation to transition to the next page,
// new_element is the data source, going_forward indicates the direction
// and the event is required to cancel default behavior and detect demo mode
function transition_to_new_element (new_element, going_forward, event) {

  // ensure we prevent default interaction in case we act on a tap
  event.preventDefault();
  // mark that a transition is now in progress
  transitions_in_progress = true;

  // first, let's figure which page in the DOM is the from-page and which is the to-page
  var from_index = active_index;
  var to_index = (active_index == 1) ? 0 : 1;

  // we will be animating both opacity and transforms for the header transitions
  Transitions.DEFAULTS.properties = ['opacity', '-webkit-transform'];

  // let's get all the data and populate the to-page
  var new_items = get_items(new_element);
  var new_list = create_list_with_elements(new_items);

  // make sure that element replacement happening later will not lead
  // to an incorrect reference by ensuring that new_element _is_ the
  // parent of the new items and not some old reference to an element
  // that had no children (yet)
  new_element = new_items[0].parentNode;

  // figure out if we have or will have back buttons on screen
  var has_back_button = (!going_forward || active_element !== catalog);
  var will_have_back_button = (going_forward || new_element !== catalog);

  // figure out the metrics of the back button and title of the to-page
  var parent_page_name = (new_element !== catalog) ? get_name(new_element.parentNode) : '';
  var next_button_label = (going_forward) ? get_name(active_element) : parent_page_name;
  next_button_width = set_button_label_and_get_width(to_index, next_button_label);
  next_title_x = set_title_and_get_x(to_index, get_name(new_element), (will_have_back_button) ? next_button_width : 0);

  // create an empty transition set
  var transitions = new Transitions();
  
  // add transition for the button entering the screen: the new button will fade in and slide
  // from the current position of the title or the left of the screen if going backwards
  var to_button_start_x = (going_forward) ? current_title_x : (-next_button_width - BUTTON_MARGIN_LEFT);
  if (will_have_back_button) {
    transitions.add({
      element : elements.buttons[to_index],
      from : [0, get_header_transform_for_x(to_button_start_x)],
      to : [1, get_header_transform_for_x(BUTTON_MARGIN_LEFT)]
    });
  }

  // add transition for the button leaving the screen: the old button will fade out
  // and slide to the left of the screen or to where the new title is if going backwards
  var from_buttom_end_x = (going_forward) ? (-current_button_width - BUTTON_MARGIN_LEFT) : next_title_x;
  if (has_back_button) {
    transitions.add({
      element : elements.buttons[from_index],
      to : [0, get_header_transform_for_x(from_buttom_end_x)],
    });
  }

  // add transition for the title entering the screen: the new title will fade in and slide
  // from the right of the screen or where the previous button was located if going backwards
  var to_title_start_x = (going_forward) ? screen_width : BUTTON_MARGIN_LEFT;
  transitions.add({
    element : elements.titles[to_index],
    from : [0, get_header_transform_for_x(to_title_start_x)],
    to : [1, get_header_transform_for_x(next_title_x)]
  });

  // add transition for the title leaving the screen: the old title will fade out and slide
  // to where the next button is located or to the right of the screen if going backwards
  var from_title_end_x = (going_forward) ? BUTTON_MARGIN_LEFT : screen_width;
  transitions.add({
    element : elements.titles[from_index],
    to : [0, get_header_transform_for_x(from_title_end_x)]
  });

  // add transition for the content pages leaving and entering the screen
  var from_page_start_x = 0;
  var from_page_end_x = (going_forward) ? -screen_width : screen_width;
  var to_page_start_x = (going_forward) ? screen_width : -screen_width;
  var to_page_end_x = 0;

  // we only change the transform for the page transitions
  Transitions.DEFAULTS.properties = ['-webkit-transform'];

  transitions.add({
    element : elements.pages[from_index],
    from : [get_page_transform_for_x(from_page_start_x)],
    to : [get_page_transform_for_x(from_page_end_x)]
  });
  transitions.add({
    element : elements.pages[to_index],
    from : [get_page_transform_for_x(to_page_start_x)],
    to : [get_page_transform_for_x(to_page_end_x)]
  });

  // add contents to destination page
  elements.pages[to_index].textContent = '';
  elements.pages[to_index].appendChild(new_list);
  
  // make new metrics the current metrics, ready to be used in the next transition
  current_button_width = next_button_width;
  current_title_x = next_title_x;

  // track what page and data source is active
  active_index = to_index;
  active_element = new_element;

  // finally, run the transitions and animations
  transitions.apply();
};

// called upon end of a transition
function transition_ended (event) {
  // track that no animations are currently in progress
  transitions_in_progress = false;
};

/* ============================== NAVIGATION ============================== */

// called when a drillable element in the list is activated
function element_selected (event) {
  // do nothing if an animation is already running or if we have
  // moved our finger and thus panned the page (see touch_started)
  if (moved_after_touch || transitions_in_progress) {
    return;
  }
  // get the selected element in the children of the current data source
  var selected_element = get_items(active_element)[event.currentTarget._index];
  // load additional data if we don't already have the information we'll
  // display next in the data source DOM tree
  if (selected_element.childNodes.length == 0) {
    get_data_in_file(selected_element.getAttribute('href'), element_selected_data_loaded, [selected_element, event]);
  }
  // if we do have the data, start an animation that drills down for more content
  else {
    transition_to_new_element(selected_element, true, event);
  }
};

// called upon successful data retrieval following an element activation
function element_selected_data_loaded (data, context_args) {
  var selected_element = context_args[0];
  // import a copy of the node into the catalog DOM document
  new_element = catalog.ownerDocument.importNode(data, true);
  // replace the previous element with the new one that has the children
  // data available, thus caching the data
  selected_element.parentNode.replaceChild(new_element, selected_element);
  // start an animation that drills down for more content
  transition_to_new_element(new_element, true, context_args[1]);
};

// called when a back button is activated
function go_back () {
  // do nothing if an animation is already running
  if (transitions_in_progress) {
    return;
  }
  // start an animation that goes back up to the parent of the current data source
  transition_to_new_element(active_element.parentNode, false, event);
};

/* ============================== TOUCH TRACKING ============================== */

// track if we moved following a touchstart
var moved_after_touch = false;

// called for touch move events on groups
function touch_started (event) {
  moved_after_touch = false;
};

// called for touch move events on groups
function touch_moved (event) {
  moved_after_touch = true;
};

/* ============================== SCREEN ORIENTIATION ============================== */

// called when orientation changes
function orientation_changed () {
  // update the global variable for tracking current orientation
  is_portrait = (window.orientation == 0 || window.orientation == null);
  // update the styles
  document.body.className = is_portrait ? 'portrait' : 'landscape';
  // update the screen width
  screen_width = is_portrait ? 320 : 480;
  // now update positions of elements if we are intitalized
  if (catalog != null) {
    // figure out the inactive index
    var inactive_index = (active_index == 0) ? 1 : 0;
    // are we showing a back button currently?
    var has_back_button = (active_element !== catalog);
    // update position of the "active" button if we are displaying the root
    // and that button actually should be invisible
    if (!has_back_button) {
      elements.buttons[active_index].style.webkitTransitionProperty = 'none';
      elements.buttons[active_index].style.webkitTransform = get_header_transform_for_x(screen_width);
    }
    // otherwise update the size of the back button on display
    else {
      current_button_width = elements.buttons[active_index].offsetWidth;
    }
    // update position of inactive button so that it's offscreen
    elements.buttons[inactive_index].style.webkitTransitionProperty = 'none';
    elements.buttons[inactive_index].style.webkitTransform = get_header_transform_for_x(screen_width);
    // update position of active title so that it's laid out accurately
    current_title_x = set_title_and_get_x(active_index, elements.titles[active_index].textContent, current_button_width);
    elements.titles[active_index].style.webkitTransitionProperty = 'none';
    elements.titles[active_index].style.webkitTransform = get_header_transform_for_x(current_title_x);
    // update position of inactive page so that it's offscreen
    elements.pages[inactive_index].style.webkitTransitionProperty = 'none';
    elements.pages[inactive_index].style.webkitTransform = get_page_transform_for_x(screen_width);
  }
  // ensure the canvas is positioned at top-left
  window.setTimeout(function() { window.scrollTo(0, 1); }, 0);
};

/* ============================== UTILS ============================== */

function hide_address_bar () {
  window.scrollTo(0, 1);
  setTimeout(function () {
    window.scrollTo(0, 0);
  }, 0);
};

function get_header_transform_for_x (x) {
  return 'translate(' + x + 'px, 5px)';
};

function get_page_transform_for_x (x) {
  return 'translateX(' + x + 'px)';
};

function to_px (value) {
  return value + 'px';
};

/* ============================== INIT ============================== */

// call init method once document is loaded
window.addEventListener('load', init, false);
