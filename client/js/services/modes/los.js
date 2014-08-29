'use strict';

angular.module('vassalApp.services')
  .factory('los_mode', [
    'command',
    function(command) {
      return function(modes) {
        var los_mode = {
          name: 'LoS',
          'Shift L': function(scope) {
            if(scope.game.los.state.active) {
              scope.game.newCommand(command('onLos', 'setActive', false));
            }
            scope.current_mode = modes['default'];
          },
          'DragStart': function(scope, event, drag, user_x, user_y) {
            scope.game.los.startDraging(drag.start_x, drag.start_y);
            scope.current_mode = modes['los_drag'];
          },
        };
        return los_mode;
      }
    }
  ])
  .factory('los_drag_mode', [
    'command',
    function(command) {
      return function(modes) {
        var los_drag_mode = {
          name: 'LoS Drag',
          'Drag': function(scope, event, drag, user_x, user_y) {
            scope.game.los.setEnd(user_x, user_y);
          },
          'DragEnd': function(scope, event, drag, user_x, user_y) {
            scope.game.newCommand(command('onLos', 'endDraging', user_x, user_y));
            scope.current_mode = modes['los'];
          },
        };
        return los_drag_mode;
      }
    }
  ]);
