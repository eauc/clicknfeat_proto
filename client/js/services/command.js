'use strict';

angular.module('vassalApp.services')
  .factory('command_setLayer', [
    function() {
      var factory = function(data) {
        var instance = {
          type: 'setLayer',
          stamp: Date.now(),
          arg: null,
          before: null,
          after: null,
          execute: function(game) {
            this.before = _.extend({}, game.layers);
            this.before[this.arg] = !this.before[this.arg];
            this.after = _.extend({}, game.layers);
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.extend(game.layers, this.after);
          },
          undo: function(game) {
            _.extend(game.layers, this.before);
          },
          desc: function(game) {
            return this.type+'('+this.arg+')';
          }
        };
        if(!_.isString(data)) {
          _.extend(instance, data);
        }
        else {
          instance.arg = data;
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_setRuler', [
    function() {
      var factory = function(data) {
        var instance = {
          type: 'setRuler',
          stamp: Date.now(),
          before: null,
          after: null,
          execute: function(game) {
            this.after = _.extend({}, game.ruler.state);
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.extend(game.ruler.state, this.after);
          },
          undo: function(game) {
            _.extend(game.ruler.state, this.before);
          },
          desc: function(game) {
            return this.type+'('+this.after.active+')';
          }
        };
        if(_.isNumber(data.stamp)) {
          _.extend(instance, data);
        }
        else {
          instance.before = _.extend({}, data);
        }
        return instance;
      };
      return factory;
    }
  ])
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
              return _.deepCopy(game.models[id].state);
            });
            game.onSelection.apply(game, this.args);
            this.after = _.map(game.selection, function(id) {
              return _.deepCopy(game.models[id].state);
            });
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.each(this.after, function(state) {
              game.models[state.id].state = _.deepCopy(state);
            });
          },
          undo: function(game) {
            // console.log(this.before);
            _.each(this.before, function(state) {
              game.models[state.id].state = _.deepCopy(state);
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
  .factory('command_endDragingSelection', [
    function() {
      var factory = function() {
        var instance = {
          type: 'endDragingSelection',
          stamp: Date.now(),
          args: null,
          before: null,
          after: null,
          execute: function(game) {
            this.before = _.map(game.selection, function(id) {
              return _.deepCopy(game.models[id].state_before_drag);
            });
            game.onSelection.apply(game, ['endDraging'].concat(this.args));
            this.after = _.map(game.selection, function(id) {
              return _.deepCopy(game.models[id].state);
            });
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.each(this.after, function(state) {
              game.models[state.id].state = _.deepCopy(state);
            });
          },
          undo: function(game) {
            // console.log(this.before);
            _.each(this.before, function(state) {
              game.models[state.id].state = _.deepCopy(state);
            });
          },
          desc: function(game) {
            return this.type;
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
  .factory('command_dropSelection', [
    function() {
      var factory = function() {
        var instance = {
          type: 'dropSelection',
          stamp: Date.now(),
          before: null,
          execute: function(game) {
            this.before = [].concat(game.selection);
            game.dropSelection();
          },
          redo: function(game) {
            game.setSelection(this.before);
            game.dropSelection();
          },
          undo: function(game) {
            // console.log(this.before);
            game.restoreFromDropBin(this.before);
            game.setSelection(this.before);
          },
          desc: function(game) {
            return this.type;
          }
        };
        var args = Array.prototype.slice.call(arguments, 0);
        if(args.length == 1) {
          _.extend(instance, args[0]);
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_restoreFromDropBin', [
    function() {
      var factory = function() {
        var instance = {
          type: 'restoreFromDropBin',
          stamp: Date.now(),
          args: null,
          execute: function(game) {
            game.restoreFromDropBin(this.args);
          },
          redo: function(game) {
            game.restoreFromDropBin(this.args);
          },
          undo: function(game) {
            game.dropModels(this.args);
          },
          desc: function(game) {
            return this.type;
          }
        };
        var args = Array.prototype.slice.call(arguments, 0);
        if(!_.isArray(args[0])) {
          _.extend(instance, args[0]);
        }
        else {
          instance.args = args[0];
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
    'command_setLayer',
    'command_setRuler',
    'command_onSelection',
    'command_endDragingSelection',
    'command_dropSelection',
    'command_restoreFromDropBin',
    'command_setSelection',
    'command_addToSelection',
    function(command_setLayer,
             command_setRuler,
             command_onSelection,
             command_endDragingSelection,
             command_dropSelection,
             command_restoreFromDropBin,
             command_setSelection,
             command_addToSelection) {
      var factories = {
        setLayer: command_setLayer,
        setRuler: command_setRuler,
        onSelection: command_onSelection,
        endDragingSelection: command_endDragingSelection,
        dropSelection: command_dropSelection,
        restoreFromDropBin: command_restoreFromDropBin,
        setSelection: command_setSelection,
        addToSelection: command_addToSelection,
      };
      var factory = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var type = '';
        if(args.length == 1 &&
           !_.isString(args[0])) {
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
