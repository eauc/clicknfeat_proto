'use strict';

angular.module('vassalApp.services')
  .factory('model_create_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var model_create_mode = _.deepCopy(common);
        _.deepExtend(model_create_mode, {
          name: 'Model Create',
          'MouseMove': function(scope, event, user_x, user_y) {
            model_create_mode.x = user_x;
            model_create_mode.y = user_y;
          },
          'Click': function(scope, event, drag, user_x, user_y) {
            var create_options = [];
            _.each(model_create_mode.info, function(info) {
              create_options.push({
                info: info.info,
                x: user_x+info.offset_x,
                y: user_y+info.offset_y,
                show_leader: info.show_leader
              });
            });
            scope.game.newCommand(command('createModel',
                                          create_options));

            modes.goTo('default');
          },
        });
        return model_create_mode;
      }
    }
  ])
  .factory('model_drag_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var model_drag_mode = _.deepCopy(common);
        _.deepExtend(model_drag_mode, {
          name: 'Model Drag',
          'Drag': function(scope, event, drag, user_x, user_y, dx, dy) {
            scope.game.onSelection('draging', dx, dy);
            this.end_x = this.start_x + dx;
            this.end_y = this.start_y + dy;
            this.length = ((Math.sqrt(dx*dx+dy*dy) * 10) >> 0) / 100;
          },
          'DragEnd': function(scope, event, drag, user_x, user_y, dx, dy) {
            scope.game.newCommand(command('endDragingSelection', dx, dy));

            modes.goTo('default');
          },
        });
        return model_drag_mode;
      }
    }
  ])
  .factory('model_target_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var model_target_mode = _.deepCopy(common);
        _.deepExtend(model_target_mode, {
          name: 'Model Target',
          'Click': function(scope, event, drag) {
            if(drag.event === 'Model' &&
               0 > _.indexOf(scope.game.selection, drag.target.state.id)) {
              scope.game.newCommand(command('onSelection', 'alignWith',
                                            drag.target.state.x, drag.target.state.y));
              modes.goTo('default');
            }
          },
        });
        return model_target_mode;
      }
    }
  ]);
