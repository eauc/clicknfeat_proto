'use strict';

angular.module('vassalApp.services')
  .factory('command_onSelection', [
    function() {
      var factory = function() {
        var instance = {
          type: 'onSelection',
          stamp: Date.now(),
          args: null,
          before: null,
          after: null,
          execute: function(game) {
            this.before = _.map(game.selection, function(id) {
              return _.extend({}, game.models[id].state);
            });
            game.onSelection.apply(game, this.args);
            this.after = _.map(game.selection, function(id) {
              return _.extend({}, game.models[id].state);
            });
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.each(this.after, function(state) {
              _.extend(game.models[state.id].state, state);
            });
          },
          undo: function(game) {
            // console.log(this.before);
            _.each(this.before, function(state) {
              _.extend(game.models[state.id].state, state);
            });
          },
          desc: function(game) {
            return this.type+'('+this.args[0]+')';
          }
        };
        var args = Array.prototype.slice.call(arguments, 0);
        if(args.length == 1 &&
           _.isObject(args[0])) {
          _.extend(instance, args[0]);
        }
        else {
          instance.args = args;
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_setSelection', [
    function() {
      var factory = function(options) {
        var instance = {
          type: 'setSelection',
          stamp: Date.now(),
          model_ids: [],
          before: null,
          after: null,
          execute: function(game) {
            this.before = [].concat(game.selection);
            game.setSelection(this.model_ids);
            this.after = [].concat(game.selection);
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            game.setSelection(this.after);
          },
          undo: function(game) {
            // console.log(this.before);
            game.setSelection(this.before);
          },
          desc: function(game) {
            return this.type;
          }
        };
        if(_.isArray(options)) {
          instance.model_ids = options;
        }
        else {
          _.extend(instance, options);
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_addToSelection', [
    function() {
      var factory = function(options) {
        var instance = {
          type: 'addToSelection',
          stamp: Date.now(),
          model_ids: [],
          before: null,
          after: null,
          execute: function(game) {
            this.before = [].concat(game.selection);
            game.addToSelection(this.model_ids);
            this.after = [].concat(game.selection);
          },
          redo: function(game) {
            game.setSelection(this.after);
          },
          undo: function(game) {
            game.setSelection(this.before);
          },
          desc: function(game) {
            return this.type;
          }
        };
        if(_.isArray(options)) {
          instance.model_ids = options;
        }
        else {
          _.extend(instance, options);
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command', [
    'command_onSelection',
    'command_setSelection',
    'command_addToSelection',
    function(command_onSelection,
             command_setSelection,
             command_addToSelection) {
      var factories = {
        onSelection: command_onSelection,
        setSelection: command_setSelection,
        addToSelection: command_addToSelection,
      };
      var factory = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var type = '';
        if(args.length == 1) {
          if( _.isObject(args[0]) &&
              _.isString(args[0].type) ) {
            type = args[0].type;
          }
          else return;
        }
        else {
          if(_.isString(args[0])) {
            type = args[0];
            args = args.slice(1);
          }
          else return;
        }
        if(_.isFunction(factories[type])) {
          return factories[type].apply(null, args);
        }
      };
      return factory;
    }
  ]);
