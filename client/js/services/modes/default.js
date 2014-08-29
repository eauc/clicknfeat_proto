'use strict';

angular.module('vassalApp.services')
  .factory('default_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var default_mode = _.deepCopy(common);
        _.deepExtend(default_mode, {
          name: 'Default',
          group: 'Default',
          enter: function(scope) {
            scope.game.templates.active = null;
            if(scope.game.selection.length > 0) {
              modes.goTo('model_selected', scope);
            }
          },
          'Shift L': function(scope) {
            modes.goTo('los', scope);
          },
          'Shift R': function(scope) {
            modes.goTo('ruler', scope);
          },
          // ------------------------------------------------------------------
          'DragStart': function(scope, event, drag, dx, dy) {
            switch(drag.event)
            {
            case 'Template':
              {
                scope.game.templates.active = drag.target;
                drag.target.startDraging();

                modes.goTo('template_drag', scope);
                break;
              }
            case 'Model':
              {
                // si la selection est vide, ajouter le model a la selection
                if(0 <= _.indexOf(scope.game.selection, drag.target.state.id)) {
                  scope.game.onSelection('startDraging');
                  modes['model_drag'].length = 0;

                  modes['model_drag'].start_x = drag.target.state.x;
                  modes['model_drag'].start_y = drag.target.state.y;
                  modes['model_drag'].end_x = drag.target.state.x;
                  modes['model_drag'].end_y = drag.target.state.y;
                  modes['model_drag'].length = '';
                  modes.goTo('model_drag', scope);
                }
                break;
              }
            case 'Board':
              {
                modes.selection_drag.width = 0;
                modes.selection_drag.height = 0;

                modes.goTo('selection_drag', scope);
                break;
              }
            }
          },
          'Click': function(scope, event, drag, user_x, user_y, dx, dy) {
            switch(drag.event)
            {
            case 'Model':
              {
                if(event.ctrlKey || scope.force_ctrl) {
                  if(0 <= _.indexOf(scope.game.selection, drag.target.state.id)) {
                    scope.game.newCommand(command('removeFromSelection', [drag.target.state.id]));
                  }
                  else {
                    scope.game.newCommand(command('addToSelection', [drag.target.state.id]));
                  }
                }
                else {
                  scope.game.newCommand(command('setSelection', [drag.target.state.id]));
                }
                if(scope.game.selection.length > 0) {
                  scope.model_view.label = scope.game.models[scope.game.selection[0]].state.label;
                }
                modes.goTo('default', scope);
                break;
              }
            case 'Template':
              {
                scope.game.templates.active = drag.target;
                modes.goTo('template', scope);
                break;
              }
            }
          },
        });
        return default_mode;
      }
    }
  ])
  .factory('model_selected_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var model_selected_mode = _.deepCopy(modes['default']);
        _.deepExtend(model_selected_mode, {
          name: 'Model Selected',
          group: 'Default',
          enter: function(scope) {
            if(scope.game.selection.length <= 0) {
              modes.goTo('default', scope);
            }
          },
          'Alt B': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_blind;
            scope.game.newCommand(command('onSelection', 'toggle', 'blind', new_val));
          },
          'Alt C': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_corrosion;
            scope.game.newCommand(command('onSelection', 'toggle', 'corrosion', new_val));
          },
          'Ctrl C': function(scope) {
            modes['model_create'].info = [];
            var x_ref = scope.game.models[scope.game.selection[0]].state.x;
            var y_ref = scope.game.models[scope.game.selection[0]].state.y;
            modes['model_create'].x = x_ref+10;
            modes['model_create'].y = y_ref+10;
            _.each(scope.game.selection, function(id) {
              var offset_x = scope.game.models[id].state.x - x_ref;
              var offset_y = scope.game.models[id].state.y - y_ref;
              modes['model_create'].info.push({
                info: scope.game.models[id].info,
                offset_x: offset_x,
                offset_y: offset_y
              });
            });
            modes.goTo('model_create', scope);
          },
          'Shift C': function(scope) {
            if(scope.game.selection.length === 1 &&
               (scope.game.models[scope.game.selection[0]].info.focus ||
                scope.game.models[scope.game.selection[0]].info.fury)) {
              scope.game.newCommand(command('onSelection', 'toggleControl'));
            }
          },
          'Ctrl E': function(scope) {
            scope.game.newCommand(command('onSelection', 'setRotation', 90));
          },
          'F': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'focus'));
          },
          'Alt F': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_fire;
            scope.game.newCommand(command('onSelection', 'toggle', 'fire', new_val));
          },
          'I': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'image'));
          },
          'Alt I': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_incorporeal;
            scope.game.newCommand(command('onSelection', 'toggle', 'incorporeal', new_val));
          },
          'Alt K': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_kd;
            scope.game.newCommand(command('onSelection', 'toggle', 'kd', new_val));
          },
          'M': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_melee;
            scope.game.newCommand(command('onSelection', 'toggle', 'melee', new_val));
          },
          'Ctrl N': function(scope) {
            scope.game.newCommand(command('onSelection', 'setRotation', 0));
          },
          'Alt P': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_leader;
            scope.game.newCommand(command('onSelection', 'toggle', 'leader', new_val));
          },
          'R': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_reach;
            scope.game.newCommand(command('onSelection', 'toggle' ,'reach', new_val));
          },
          'Alt S': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_stationary;
            scope.game.newCommand(command('onSelection', 'toggle', 'stationary', new_val));
          },
          'Ctrl S': function(scope) {
            scope.game.newCommand(command('onSelection', 'setRotation', 180));
          },
          'T': function(scope) {
            modes.goTo('model_target', scope);
          },
          'U': function(scope) {
            scope.game.newCommand(command('setSelection', []));
            modes.goTo('default', scope);
          },
          'Ctrl W': function(scope) {
            scope.game.newCommand(command('onSelection', 'setRotation', 270));
          },
          'Ctrl 0': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', false));
          },
          'Ctrl 1': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', '#0FF'));
          },
          'Ctrl 2': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', '#F0F'));
          },
          '3': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggleAoe', 3));
          },
          'Ctrl 3': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', '#FF0'));
          },
          '4': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggleAoe', 4));
          },
          'Ctrl 4': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', '#00F'));
          },
          '5': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggleAoe', 5));
          },
          'Ctrl 5': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', '#0F0'));
          },
          'Ctrl 6': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'color', '#F00'));
          },
          'Delete': function(scope) {
            scope.game.newCommand(command('dropSelection'));
            modes.goTo('default', scope);
          },
          'Add': function(scope) {
            scope.game.newCommand(command('onSelection', 'incrementFocus'));
          },
          'Substract': function(scope) {
            scope.game.newCommand(command('onSelection', 'decrementFocus'));
          },
          'Left': function(scope) {
            scope.game.newCommand(command('onSelection', 'rotateLeft', false));
          },
          'Shift Left': function(scope) {
            scope.game.newCommand(command('onSelection', 'rotateLeft', true));
          },
          'Ctrl Left': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveLeft', false));
          },
          'Ctrl Shift Left': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveLeft', true));
          },
          'Down': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveBack', false));
          },
          'Shift Down': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveBack', true));
          },
          'Ctrl Down': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveDown', false));
          },
          'Ctrl Shift Down': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveDown', true));
          },
          'Right': function(scope) {
            scope.game.newCommand(command('onSelection', 'rotateRight', false));
          },
          'Shift Right': function(scope) {
            scope.game.newCommand(command('onSelection', 'rotateRight', true));
          },
          'Ctrl Right': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveRight', false));
          },
          'Ctrl Shift Right': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveRight', true));
          },
          'Up': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveFront', false));
          },
          'Shift Up': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveFront', true));
          },
          'Ctrl Up': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveUp', false));
          },
          'Ctrl Shift Up': function(scope) {
            scope.game.newCommand(command('onSelection', 'moveUp', true));
          },
        });
        return model_selected_mode;
      }
    }
  ]);
