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
          'Ctrl A': function(scope) {
            var ids = _.filter(scope.game.models, function(model) {
              return model.state.user === scope.user.name;
            }).map(function(model) {
              return model.state.id;
            });
            scope.game.newCommand(command('setSelection', ids));
            modes.goTo('model_selected', scope);
          },
          'Shift L': function(scope) {
            modes.goTo('los', scope);
          },
          'Shift R': function(scope) {
            modes.goTo('ruler', scope);
          },
          // ------------------------------------------------------------------
          'DragStart': function(scope, event, drag, dx, dy) {
            if(!scope.game.id) return;
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
                if(0 > _.indexOf(scope.game.selection, drag.target.state.id)) {
                  if(drag.target.state.show_charge) break;
                  scope.game.newCommand(command('setSelection', [drag.target.state.id]));
                  scope.model_view.label = scope.game.models[scope.game.selection[0]].state.label;
                  scope.model_view.unit = scope.game.models[scope.game.selection[0]].state.unit;
                }
                scope.game.onSelection('startDraging');
                modes['model_drag'].length = 0;

                modes['model_drag'].start_x = drag.target.state.x;
                modes['model_drag'].start_y = drag.target.state.y;
                modes['model_drag'].end_x = drag.target.state.x;
                modes['model_drag'].end_y = drag.target.state.y;
                modes['model_drag'].length = '';
                modes.goTo('model_drag', scope);
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
                if(event.ctrlKey || scope.force.ctrl) {
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
                scope.model_view.label = null;
                scope.model_view.unit = null;
                if(scope.game.selection.length === 1) {
                  scope.model_view.unit = scope.game.models[scope.game.selection[0]].state.unit;
                  if(scope.game.models[scope.game.selection[0]].state.show_charge) {
                    modes.goTo('model_charge', scope);
                    break;
                  }
                  if(scope.game.models[scope.game.selection[0]].state.show_place) {
                    modes.goTo('model_place', scope);
                    break;
                  }
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
      };
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
          template: 'model_selected.html',
          enter: function(scope) {
            if(scope.game.selection.length <= 0) {
              modes.goTo('default', scope);
              return;
            }
          },
          'Escape': function(scope) {
            scope.game.newCommand(command('setSelection', []));
            scope.modes.goTo('default', scope);
          },
          'Alt B': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_blind;
            scope.game.newCommand(command('onSelection', 'toggle', 'blind', new_val));
          },
          'C': function(scope) {
            if(!scope.game.id || 1 !== scope.game.selection.length) return;
            scope.game.newCommand(command('onSelection', 'startCharge'));
            modes.goTo('model_charge', scope);
          },
          'Alt C': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_corrosion;
            scope.game.newCommand(command('onSelection', 'toggle', 'corrosion', new_val));
          },
          'Ctrl C': function(scope) {
            if(!scope.game.id) return;
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
                offset_y: offset_y,
                show_leader: scope.game.models[id].state.show_leader,
                unit: scope.game.models[id].state.unit
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
          'Alt D': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_disrupt;
            scope.game.newCommand(command('onSelection', 'toggle', 'disrupt', new_val));
          },
          'Alt F': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_fire;
            scope.game.newCommand(command('onSelection', 'toggle', 'fire', new_val));
          },
          'I': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggle', 'image'));
          },
          'Alt I': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_incorporeal;
            scope.game.newCommand(command('onSelection', 'toggle', 'incorporeal', new_val));
          },
          'Alt K': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_kd;
            scope.game.newCommand(command('onSelection', 'toggle', 'kd', new_val));
          },
          'Alt L': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_leader;
            scope.game.newCommand(command('onSelection', 'toggle', 'leader', new_val));
          },
          'Ctrl L': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'clearAllLabel'));
          },
          'M': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_melee;
            scope.game.newCommand(command('onSelection', 'toggle', 'melee', new_val));
          },
          'N': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_counter;
            scope.game.newCommand(command('onSelection', 'toggle', 'counter', new_val));
          },
          'P': function(scope) {
            if(!scope.game.id || 1 !== scope.game.selection.length) return;
            scope.game.newCommand(command('onSelection', 'startPlace'));
            modes.goTo('model_place', scope);
          },
          'R': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_reach;
            scope.game.newCommand(command('onSelection', 'toggle' ,'reach', new_val));
          },
          'Alt R': function(scope) {
            scope.game.newCommand(command('onSelection', 'resetShow'));
          },
          'S': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_strike;
            scope.game.newCommand(command('onSelection', 'toggle' ,'strike', new_val));
          },
          'Alt S': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_stationary;
            scope.game.newCommand(command('onSelection', 'toggle', 'stationary', new_val));
          },
          'Shift S': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_souls;
            scope.game.newCommand(command('onSelection', 'toggle', 'souls', new_val));
          },
          'T': function(scope) {
            if(!scope.game.id) return;
            modes.goTo('model_target', scope);
          },
          'Alt T': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_fleeing;
            scope.game.newCommand(command('onSelection', 'toggle', 'fleeing', new_val));
          },
          'U': function(scope) {
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_unit;
            scope.game.newCommand(command('onSelection', 'toggle' ,'unit', new_val));
          },
          'Ctrl U': function(scope) {
            var unit = scope.game.models[scope.game.selection[0]].state.unit;
            var user = scope.game.models[scope.game.selection[0]].state.user;
            var selection = _.filter(scope.game.models, function(model) {
              return (model.state.unit === unit &&
                      model.state.user === user);
            }).map(function(model) { return model.state.id; });
            scope.game.newCommand(command('setSelection', selection));
          },
          'Alt W': function(scope) {
            if(!scope.game.id) return;
            var new_val = !scope.game.models[scope.game.selection[0]].state.show_wreck;
            scope.game.newCommand(command('onSelection', 'toggle', 'wreck', new_val));
          },
          'Alt 0': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 10 ? 0 : 10;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 0': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 20 ? 0 : 20;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt 1': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 1 ? 0 : 1;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 1': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 11 ? 0 : 11;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Ctrl 1': function(scope) {
            if(!scope.game.id) return;
            var new_val = scope.game.models[scope.game.selection[0]].state.show_color === '#0FF' ?
              false : '#0FF';
            scope.game.newCommand(command('onSelection', 'toggleColor', new_val));
          },
          'Alt 2': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 2 ? 0 : 2;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 2': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 12 ? 0 : 12;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Ctrl 2': function(scope) {
            if(!scope.game.id) return;
            var new_val = scope.game.models[scope.game.selection[0]].state.show_color === '#F0F' ?
              false : '#F0F';
            scope.game.newCommand(command('onSelection', 'toggleColor', new_val));
          },
          '3': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggleAoe', 3));
          },
          'Alt 3': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 3 ? 0 : 3;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 3': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 13 ? 0 : 13;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Ctrl 3': function(scope) {
            if(!scope.game.id) return;
            var new_val = scope.game.models[scope.game.selection[0]].state.show_color === '#FF0' ?
              false : '#FF0';
            scope.game.newCommand(command('onSelection', 'toggleColor', new_val));
          },
          '4': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggleAoe', 4));
          },
          'Alt 4': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 4 ? 0 : 4;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 4': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 14 ? 0 : 14;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Ctrl 4': function(scope) {
            if(!scope.game.id) return;
            var new_val = scope.game.models[scope.game.selection[0]].state.show_color === '#00F' ?
              false : '#00F';
            scope.game.newCommand(command('onSelection', 'toggleColor', new_val));
          },
          '5': function(scope) {
            scope.game.newCommand(command('onSelection', 'toggleAoe', 5));
          },
          'Alt 5': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 5 ? 0 : 5;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 5': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 15 ? 0 : 15;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Ctrl 5': function(scope) {
            if(!scope.game.id) return;
            var new_val = scope.game.models[scope.game.selection[0]].state.show_color === '#0F0' ?
              false : '#0F0';
            scope.game.newCommand(command('onSelection', 'toggleColor', new_val));
          },
          'Alt 6': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 6 ? 0 : 6;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 6': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 16 ? 0 : 16;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Ctrl 6': function(scope) {
            if(!scope.game.id) return;
            var new_val = scope.game.models[scope.game.selection[0]].state.show_color === '#F00' ?
              false : '#F00';
            scope.game.newCommand(command('onSelection', 'toggleColor', new_val));
          },
          'Alt 7': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 7 ? 0 : 7;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 7': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 17 ? 0 : 17;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt 8': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 8 ? 0 : 8;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 8': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 18 ? 0 : 18;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt 9': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 9 ? 0 : 9;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Alt Shift 9': function(scope) {
            var new_val = scope.game.models[scope.game.selection[0]].state.show_area === 19 ? 0 : 19;
            scope.game.newCommand(command('onSelection', 'toggle', 'area', new_val));
          },
          'Delete': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('dropSelection'));
            modes.goTo('default', scope);
          },
          'Add': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'incrementCounter'));
          },
          'Ctrl Add': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.selection.length !== 1) return;
            var model = scope.game.models[scope.game.selection[0]];
            if(model.info.damage.type !== 'warrior') return;
            var n = model.state.damage.n;
            var new_n = Math.min(n+1, model.info.damage.n);
            if(new_n === n) return;
            scope.game.newCommand(command('onSelection', 'toggleDamage', new_n));
          },
          'Shift Add': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'incrementSouls'));
          },
          'Substract': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'decrementCounter'));
          },
          'Ctrl Substract': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.selection.length !== 1) return;
            var model = scope.game.models[scope.game.selection[0]];
            if(model.info.damage.type !== 'warrior') return;
            var n = model.state.damage.n;
            var new_n = Math.max(n-1, 0);
            if(new_n === n) return;
            scope.game.newCommand(command('onSelection', 'toggleDamage', new_n));
          },
          'Shift Substract': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'decrementSouls'));
          },
          'PageUp': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'setRotation', 
                                          scope.game.board.zoom.flipped ? 180 : 0));
          },
          'PageDown': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'setRotation', 
                                          scope.game.board.zoom.flipped ? 0 : 180));
          },
          'Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'rotateLeft', false));
          },
          'Shift Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'rotateLeft', true));
          },
          'Ctrl Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 
                                          scope.game.board.zoom.flipped ? 'moveRight' : 'moveLeft',
                                          true));
          },
          'Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'moveBack', false));
          },
          'Shift Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'moveBack', true));
          },
          'Ctrl Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 
                                          scope.game.board.zoom.flipped ? 'moveUp' : 'moveDown',
                                          true));
          },
          'Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'rotateRight', false));
          },
          'Shift Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'rotateRight', true));
          },
          'Ctrl Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 
                                          scope.game.board.zoom.flipped ? 'moveLeft' : 'moveRight',
                                          true));
          },
          'Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'moveFront', false));
          },
          'Shift Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 'moveFront', true));
          },
          'Ctrl Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onSelection', 
                                          scope.game.board.zoom.flipped ? 'moveDown' : 'moveUp',
                                          true));
          },
        });
        return model_selected_mode;
      };
    }
  ]);
