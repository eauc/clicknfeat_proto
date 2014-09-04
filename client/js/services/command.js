'use strict';

angular.module('vassalApp.services')
  .factory('command_setScenario', [
    'template',
    function(template) {
      var factory = function(data) {
        var instance = {
          type: 'setScenario',
          stamp: Date.now(),
          arg: null,
          before: null,
          after: null,
          execute: function(game) {
            this.before = game.scenario ? _.deepCopy(game.scenario) : null;
            game.scenario = this.arg;
            this.after = _.deepCopy(game.scenario);
          },
          redo: function(game) {
            game.scenario = _.deepCopy(this.after);
          },
          undo: function(game) {
            game.scenario = _.deepCopy(this.before);
          },
          desc: function(game) {
            return this.type+'('+this.arg.name+')';
          }
        };
        if(_.isNumber(data.stamp)) {
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
  .factory('command_createTemplate', [
    'template',
    function(template) {
      var factory = function(data) {
        var instance = {
          type: 'createTemplate',
          stamp: Date.now(),
          options: null,
          after: null,
          execute: function(game) {
            var new_template = game.createTemplate(this.options);
            this.after = _.deepCopy(new_template);
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            game.templates[this.after.type][this.after.stamp] = _.deepCopy(this.after);
            // game.templates.active = game.templates[this.after.type][this.after.stamp];
          },
          undo: function(game) {
            if(game.templates.active === game.templates[this.after.type][this.after.stamp]) {
              game.templates.active = null;
            }
            delete game.templates[this.after.type][this.after.stamp];
          },
          desc: function(game) {
            return this.type+'('+this.options.type+')';
          }
        };
        if(_.isNumber(data.stamp)) {
          _.extend(instance, data);
          template(instance.after);
        }
        else {
          instance.options = _.deepCopy(data);
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_deleteActiveTemplate', [
    'template',
    function(template) {
      var factory = function(data) {
        var instance = {
          type: 'deleteActiveTemplate',
          stamp: Date.now(),
          before: null,
          execute: function(game) {
            this.before = _.deepCopy(game.templates.active);
            game.templates.active = null;
            delete game.templates[this.before.type][this.before.stamp];
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            if(game.templates.active === game.templates[this.before.type][this.before.stamp]) {
              game.templates.active = null;
            }
            delete game.templates[this.before.type][this.before.stamp];
          },
          undo: function(game) {
            game.templates[this.before.type][this.before.stamp] = _.deepCopy(this.before);
            // game.templates.active = game.templates[this.before.type][this.before.stamp];
          },
          desc: function(game) {
            return this.type+'('+this.before.type+')';
          }
        };
        if(data) {
          _.extend(instance, data);
          template(instance.before);
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_onActiveTemplate', [
    function() {
      var factory = function() {
        var instance = {
          type: 'onActiveTemplate',
          stamp: Date.now(),
          method: null,
          args: null,
          before: null,
          after: null,
          execute: function(game) {
            var args = [game].concat(this.args);
            this.before = _.deepCopy(game.templates.active);
            game.templates.active[this.method].apply(game.templates.active, args);
            this.after = _.deepCopy(game.templates.active);
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.deepExtend(game.templates[this.after.type][this.after.stamp], this.after);
            // game.templates.active = game.templates[this.after.type][this.after.stamp];
          },
          undo: function(game) {
            _.deepExtend(game.templates[this.before.type][this.before.stamp], this.before);
            // game.templates.active = game.templates[this.after.type][this.after.stamp];
          },
          desc: function(game) {
            return this.type+'('+this.method+')';
          }
        };
        var args = Array.prototype.slice.call(arguments, 0);
        if(args.length == 1 &&
           _.isObject(args[0])) {
          _.extend(instance, args[0]);
        }
        else {
          instance.method = args[0];
          instance.args = args.slice(1);
        }
        return instance;
      };
      return factory;
    }
  ])
  .factory('command_dragActiveTemplate', [
    function() {
      var factory = function() {
        var instance = {
          type: 'dragActiveTemplate',
          stamp: Date.now(),
          args: null,
          before: null,
          after: null,
          execute: function(game) {
            var args = [game].concat(this.args);
            this.before = _.deepCopy(game.templates.active.startDraging.ref);
            game.templates.active.draging.apply(game.templates.active, args);
            this.after = _.deepCopy(game.templates.active);
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.deepExtend(game.templates[this.after.type][this.after.stamp], this.after);
            // game.templates.active = game.templates[this.after.type][this.after.stamp];
          },
          undo: function(game) {
            _.deepExtend(game.templates[this.before.type][this.before.stamp], this.before);
            // game.templates.active = game.templates[this.after.type][this.after.stamp];
          },
          desc: function(game) {
            return this.type+'('+this.method+')';
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
  .factory('command_createModel', [
    'model',
    function(model) {
      var factory = function(data) {
        var instance = {
          type: 'createModel',
          stamp: Date.now(),
          args: null,
          before: null,
          after: null,
          execute: function(game) {
            var new_models = game.createModel(this.args);
            this.after = new_models;
            // console.log(this.before);
            // console.log(this.after);
          },
          redo: function(game) {
            _.each(this.after, function(new_mod) {
              game.models[new_mod.state.id] = new_mod;
            });
            game.update_selection = _.map(this.after, function(mod) { return mod.state.id; });
          },
          undo: function(game) {
            var ids = _.map(this.after, function(mod) { return mod.state.id; });
            game.selection = _.without.apply(_, [game.selection].concat(ids));
            game.update_selection = _.without.apply(_, [game.update_selection].concat(ids));
            _.each(this.after, function(new_mod) { 
              delete game.models[new_mod.state.id];
            });
          },
          desc: function(game) {
            return this.type;
          }
        };
        if(!_.isArray(data)) {
          _.extend(instance, data);
          _.each(instance.after, function(new_mod) {
              model(new_mod);
          });
        }
        else {
          instance.args = data;
        }
        return instance;
      };
      return factory;
    }
  ])
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
  .factory('command_onLos', [
    function() {
      var factory = function(data) {
        var instance = {
          type: 'onLos',
          stamp: Date.now(),
          method: null,
          args: null,
          before: null,
          after: null,
          execute: function(game) {
            this.before = _.deepCopy(game.los.state);
            game.los[this.method].apply(game.los, this.args);
            this.after = _.deepCopy(game.los.state);
          },
          redo: function(game) {
            _.extend(game.los.state, this.after);
          },
          undo: function(game) {
            _.extend(game.los.state, this.before);
          },
          desc: function(game) {
            return this.type+'('+this.method+')';
          }
        };
        if(_.isNumber(data.stamp)) {
          _.extend(instance, data);
        }
        else {
          var args = Array.prototype.slice.call(arguments, 1);
          instance.method = data;
          instance.args = args;
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
            game.update_selection = _.map(this.after, function(st) { return st.id; });
          },
          undo: function(game) {
            // console.log(this.before);
            _.each(this.before, function(state) {
              game.models[state.id].state = _.deepCopy(state);
            });
            game.update_selection = _.map(this.before, function(st) { return st.id; });
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
            game.update_selection = _.map(this.after, function(st) { return st.id; });
          },
          undo: function(game) {
            // console.log(this.before);
            _.each(this.before, function(state) {
              game.models[state.id].state = _.deepCopy(state);
            });
            game.update_selection = _.map(this.before, function(st) { return st.id; });
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
            game.dropModels(this.before);
          },
          redo: function(game) {
            game.dropModels(this.before);
          },
          undo: function(game) {
            // console.log(this.before);
            game.restoreFromDropBin(this.before);
            game.update_selection = this.before;
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
            game.update_selection = this.args;
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
            game.update_selection = this.after;
          },
          undo: function(game) {
            // console.log(this.before);
            game.update_selection = this.before;
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
            game.update_selection = this.after;
          },
          undo: function(game) {
            game.update_selection = this.before;
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
  .factory('command_removeFromSelection', [
    function() {
      var factory = function(options) {
        var instance = {
          type: 'removeFromSelection',
          stamp: Date.now(),
          model_ids: [],
          before: null,
          after: null,
          execute: function(game) {
            this.before = [].concat(game.selection);
            game.removeFromSelection(this.model_ids);
            this.after = [].concat(game.selection);
          },
          redo: function(game) {
            game.update_selection = this.after;
          },
          undo: function(game) {
            game.update_selection = this.before;
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
    'command_setScenario',
    'command_createTemplate',
    'command_deleteActiveTemplate',
    'command_onActiveTemplate',
    'command_dragActiveTemplate',
    'command_createModel',
    'command_setLayer',
    'command_setRuler',
    'command_onLos',
    'command_onSelection',
    'command_endDragingSelection',
    'command_dropSelection',
    'command_restoreFromDropBin',
    'command_setSelection',
    'command_addToSelection',
    'command_removeFromSelection',
    function(command_setScenario,
             command_createTemplate,
             command_deleteActiveTemplate,
             command_onActiveTemplate,
             command_dragActiveTemplate,
             command_createModel,
             command_setLayer,
             command_setRuler,
             command_onLos,
             command_onSelection,
             command_endDragingSelection,
             command_dropSelection,
             command_restoreFromDropBin,
             command_setSelection,
             command_addToSelection,
             command_removeFromSelection
            ) {
      var factories = {
        setScenario: command_setScenario,
        createTemplate: command_createTemplate,
        deleteActiveTemplate: command_deleteActiveTemplate,
        onActiveTemplate: command_onActiveTemplate,
        dragActiveTemplate: command_dragActiveTemplate,
        createModel: command_createModel,
        setLayer: command_setLayer,
        setRuler: command_setRuler,
        onLos: command_onLos,
        onSelection: command_onSelection,
        endDragingSelection: command_endDragingSelection,
        dropSelection: command_dropSelection,
        restoreFromDropBin: command_restoreFromDropBin,
        setSelection: command_setSelection,
        addToSelection: command_addToSelection,
        removeFromSelection: command_removeFromSelection,
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
