'use strict';

angular.module('vassalApp.services')
  .factory('selection_drag_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var selection_drag_mode = _.deepCopy(common);
        _.deepExtend(selection_drag_mode, {
          name: 'Selection Drag',
          template: 'selection_drag.html',
          'Drag': function(scope, event, drag, user_x, user_y, dx, dy) {
            this.x = drag.start_x;
            this.width = dx;
            if(this.width < 0) {
              this.width = -this.width;
              this.x = this.x - this.width;
            }
            this.y = drag.start_y;
            this.height = dy;
            if(this.height < 0) {
              this.height = -this.height;
              this.y = this.y - this.height;
            }
          },
          'DragEnd': function(scope, event, drag, user_x, user_y, dx, dy) {
            this['Drag'].apply(this, Array.prototype.slice.call(arguments));

            if(this.width > 0 &&
               this.height > 0) {
              var models_selected = [];
              _.each(scope.game.models, function(model) {
                var cx = model.state.x;
                var cy = model.state.y;
                if( selection_drag_mode.x <= cx &&
                    cx <= (selection_drag_mode.x+selection_drag_mode.width ) &&
                    selection_drag_mode.y <= cy &&
                    cy <= (selection_drag_mode.y+selection_drag_mode.height) ) {
                  models_selected.push(model.state.id);
                }
              });
              if(event.ctrlKey || scope.force.ctrl) {
                scope.game.newCommand(command('addToSelection', models_selected));
                scope.model_view.label = null;
                scope.model_view.unit = null;
                if(scope.game.selection.length === 1) {
                  scope.model_view.label = scope.game.models[scope.game.selection[0]].state.label;
                  scope.model_view.unit = scope.game.models[scope.game.selection[0]].state.unit;
                }
              }
              else {
                scope.game.newCommand(command('setSelection', models_selected));
                scope.model_view.label = null;
                scope.model_view.unit = null;
                if(scope.game.selection.length === 1) {
                  scope.model_view.label = scope.game.models[scope.game.selection[0]].state.label;
                  scope.model_view.unit = scope.game.models[scope.game.selection[0]].state.unit;
                }
              }
            }
            this.width = 0;
            this.height = 0;

            modes.goTo('default', scope);
          },
        });
        return selection_drag_mode;
      }
    }
  ]);
