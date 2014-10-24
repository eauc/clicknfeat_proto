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
          template: 'los.html',
          leave: function(scope, next) {
            if(next.group !== 'LoS') {
              scope.game.newCommand(command('onLos', 'setActive', false));
            }
          },
          'O': function(scope) {
            modes.goTo('los_origin', scope);
          },
          'T': function(scope) {
            modes.goTo('los_target', scope);
          },
          'Shift L': function(scope) {
            modes.goTo('default', scope);
          },
          'DragStart': function(scope, event, drag, user_x, user_y) {
            scope.game.los.startDraging(drag.start_x, drag.start_y);
            modes.goTo('los_drag', scope);
          },
          'Click': function(scope, event, drag) {
            switch(drag.event)
            {
            case 'Model': 
              {
                if(event.ctrlKey) {
                  scope.game.newCommand(command('onLos', 'setOrigin', drag.target));
                  return true;
                }
                if(event.shiftKey) {
                  scope.game.newCommand(command('onLos', 'setTarget', drag.target));
                  return true;
                }
                if(scope.game.los.state.origin &&
                   scope.game.los.state.target) {
                  scope.game.newCommand(command('onLos', 'toggleInterveningModel', drag.target));
                  return true;
                }
              }
            }
            return false;
          },
        });
        return los_mode;
      };
    }
  ])
  .factory('los_origin_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var los_origin_mode = _.deepCopy(common);
        _.deepExtend(los_origin_mode, {
          name: 'LoS Origin',
          group: 'LoS',
          template: 'los_origin.html',
          'Click': function(scope, event, drag) {
            if(drag.event === 'Model') {
              scope.game.newCommand(command('onLos', 'setOrigin', drag.target));
              modes.goTo('los', scope);
              return true;
            }
            return false;
          },
        });
        return los_origin_mode;
      };
    }
  ])
  .factory('los_target_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var los_target_mode = _.deepCopy(common);
        _.deepExtend(los_target_mode, {
          name: 'LoS Target',
          group: 'LoS',
          template: 'los_target.html',
          'Click': function(scope, event, drag) {
            if(drag.event === 'Model') {
              scope.game.newCommand(command('onLos', 'setTarget', drag.target));
              modes.goTo('los', scope);
              return true;
            }
            return false;
          },
        });
        return los_target_mode;
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
          template: 'los.html',
          'Drag': function(scope, event, drag, user_x, user_y) {
            scope.game.los.setEnd(user_x, user_y);
          },
          'DragEnd': function(scope, event, drag, user_x, user_y) {
            scope.game.newCommand(command('onLos', 'endDraging', user_x, user_y));
            modes.goTo('los', scope);
          },
        });
        return los_drag_mode;
      };
    }
  ]);
