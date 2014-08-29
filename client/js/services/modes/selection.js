'use strict';

angular.module('vassalApp.services')
  .factory('selection_drag_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var selection_drag_mode = _.deepCopy(common);
        _.deepExtend(selection_drag_mode, {
          name: 'Selection Drag',
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
              if(event.ctrlKey) {
                scope.game.newCommand(command('addToSelection', models_selected));
                if(scope.game.selection.length > 0) {
                  scope.model_label = scope.game.models[scope.game.selection[0]].state.label;
                }
              }
              else {
                scope.game.newCommand(command('setSelection', models_selected));
                if(scope.game.selection.length > 0) {
                  scope.model_label = scope.game.models[scope.game.selection[0]].state.label;
                }
              }
            }
            this.width = 0;
            this.height = 0;

            modes.current = modes['default'];
          },
        });
        return selection_drag_mode;
      }
    }
  ]);
