// constructor
var EventEmitter = function() {
  this.registeredCallbacks = {};
};

EventEmitter.prototype = {
  registeredCallbacks: {},
  on: function(event, callback) {
    // if there is no callback registered for this event yet,
    // create an array for this event
    if (!this.registeredCallbacks.hasOwnProperty(event)) {
      this.registeredCallbacks[event] = [];
    }

    // push the event callback to the handler registeredCallbacks
    this.registeredCallbacks[event].push(callback);
  },
  off: function(event, callback) {
    // if the event does not exist, return false
    if (!event in this.registeredCallbacks) return false;

    // iterate over handlers, remove the callback in question
    this.registeredCallbacks[event] = this.registeredCallbacks[event].filter(
      function(item) {
        if (item !== callback) {
          return item;
        }
      }
    );

    return true;
  },
  trigger: function(event, data) {
    // use an empty object if no data given
    var data = typeof data === "undefined" ? {} : data;

    // the event does not exist.
    if (!this.registeredCallbacks.hasOwnProperty(event)) return false;

    // iterate over all callbacks, run them as expected
    for (var i = 0; i < this.registeredCallbacks[event].length; i++) {
      // @TODO: the scope should maybe be modifyable, even though
      //        this would require to specify a scope parameter
      //        for every event trigger...
      this.registeredCallbacks[event][i].call(window, event, data);
    }

    return true;
  }
};
