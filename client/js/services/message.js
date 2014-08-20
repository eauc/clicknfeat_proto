'use strict';

angular.module('vassalApp.services')
  .factory('message', [
    function() {
      var factory = function() {
        var args = Array.prototype.slice.call(arguments);
        if(args.length === 1) {
          return _.extend({
            type: 'dice',
            stamp: Date.now(),
            text: ''
          }, args[0]);
        }
        else {
          return {
            type: args[0],
            stamp: Date.now(),
            text: args[1]
          };
        }
      };
      return factory;
    }
  ]);
