'use strict';

angular.module('vassalApp.services')
  .factory('los_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var los_mode = _.deepCopy(common);
        _.deepExtend(los_mode, {
          name: 'LoS',
          group: 'LoS',
          leave: function(scope, next) {
            if(next.group !== 'LoS' &&
               scope.game.los.state.active) {
              scope.game.newCommand(command('onLos', 'setActive', false));
            }
          },
          'Shift L': function(scope) {
            modes.goTo('default', scope);
          },
          'DragStart': function(scope, event, drag, user_x, user_y) {
            scope.game.los.startDraging(drag.start_x, drag.start_y);
            modes.goTo('los_drag', scope);
          },
        });
        return los_mode;
      };
    }
  ])
  .factory('los_drag_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var los_drag_mode = _.deepCopy(common);
        _.deepExtend(los_drag_mode, {
          name: 'LoS Drag',
          group: 'LoS',
          'Drag': function(scope, event, drag, user_x, user_y) {
            scope.game.los.setEnd(user_x, user_y);
          },
          'DragEnd': function(scope, event, drag, user_x, user_y) {
            scope.game.newCommand(command('onLos', 'endDraging', user_x, user_y));
            modes.goTo('los', scope);
          },
        });
        return los_drag_mode;
      }
    }
  ]);
