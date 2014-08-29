'use strict';

angular.module('vassalApp.services')
  .factory('template_drag_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_drag_mode = _.deepCopy(common);
        _.deepExtend(template_drag_mode, {
          name: 'Template Drag',
          group: 'Template',
          'Drag': function(scope, event, drag, user_x, user_y, dx, dy) {
            scope.game.templates.active.draging(scope.game, dx, dy);
          },
          'DragEnd': function(scope, event, drag, user_x, user_y, dx, dy) {
            scope.game.newCommand(command('dragActiveTemplate', dx, dy));

            scope.game.templates.active = drag.target;
            modes.goTo('template');
          },
        });
        return template_drag_mode;
      }
    }
  ])
  .factory('template_origin_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_origin_mode = _.deepCopy(common);
        _.deepExtend(template_origin_mode, {
          name: 'Template Origin',
          group: 'Template',
          'Click': function(scope, event, drag) {
            if(drag.event === 'Model') {
              var model = drag.target;
              var active = scope.game.templates.active;
              if(active.type === 'aoe') {
                var x1 = model.state.x;
                var y1 = model.state.y;
                var x2 = active.x;
                var y2 = active.y;
                var angle = Math.atan2(x2-x1, y1-y2)*180/Math.PI;
                scope.game.newCommand(command('onActiveTemplate', 'set',
                                              active.x, active.y, angle));
              }
              else {
                active.origin = model;
                var x = model.state.x +
                    model.info.r * Math.sin(active.rot*Math.PI/180);
                var y = model.state.y -
                    model.info.r * Math.cos(active.rot*Math.PI/180);
                scope.game.newCommand(command('onActiveTemplate', 'set',
                                              x, y, active.rot));
              }
              modes.goTo('template');
            }
          },
        });
        return template_origin_mode;
      }
    }
  ])
  .factory('template_target_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_target_mode = _.deepCopy(common);
        _.deepExtend(template_target_mode, {
          name: 'Template Target',
          group: 'Template',
          'Click': function(scope, event, drag) {
            if(drag.event === 'Model') {
              var model = drag.target;
              var active = scope.game.templates.active;
              var x;
              var y;
              if(active.type === 'aoe') {
                x = model.state.x;
                y = model.state.y;
                scope.game.newCommand(command('onActiveTemplate', 'set',
                                              x, y, scope.game.templates.active.rot));
              }
              else {
                if(active.origin === model) return;
                var x1 = active.origin ? active.origin.state.x : active.x;
                var y1 = active.origin ? active.origin.state.y : active.y;
                var x2 = model.state.x;
                var y2 = model.state.y;
                var angle = Math.atan2(x2-x1, y1-y2)*180/Math.PI;
                x = active.origin === null ? active.x : active.origin.state.x +
                  active.origin.info.r * Math.sin(angle*Math.PI/180);
                y = active.origin === null ? active.y : active.origin.state.y -
                  active.origin.info.r * Math.cos(angle*Math.PI/180);
                scope.game.newCommand(command('onActiveTemplate', 'set',
                                              x, y, angle));
              }
              modes.goTo('template');
            }
          },
        });
        return template_target_mode;
      }
    }
  ])
  .factory('template_create_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_create_mode = _.deepCopy(common);
        _.deepExtend(template_create_mode, {
          name: 'Template Create',
          'MouseMove': function(scope, event, user_x, user_y) {
            template_create_mode.x = user_x;
            template_create_mode.y = user_y;
          },
          'Click': function(scope, event, click, user_x, user_y) {
            template_create_mode.x = user_x;
            template_create_mode.y = user_y;
            template_create_mode.rot = 0;
            scope.game.newCommand(command('createTemplate', template_create_mode));

            modes.goTo('template');
          },
        });
        return template_create_mode;
      }
    }
  ])
  .factory('template_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_mode = _.deepCopy(common);
        _.deepExtend(template_mode, {
          name: 'Template',
          group: 'Template',
          'D': function(scope) {
            if(scope.game.templates.active.type === 'aoe' &&
               !scope.game.templates.active.locked) {
              scope.doAoEDeviation();
            }
          },
          'L': function(scope) {
            scope.game.newCommand(command('onActiveTemplate', 'toggleLocked'));
          },
          'O': function(scope) {
            if(!scope.game.templates.active.locked) {
              modes.goTo('template_origin');
            }
          },
          'R': function(scope) {
            if(scope.game.ruler.state.active &&
               !scope.game.templates.active.locked) {
              var x = scope.game.ruler.model_end ? 
                  scope.game.ruler.model_end.state.x : scope.game.ruler.state.x2;
              var y = scope.game.ruler.model_end ? 
                  scope.game.ruler.model_end.state.y : scope.game.ruler.state.y2;
              // console.log(scope.game.ruler.state);
              var rot = Math.atan2(scope.game.ruler.state.x2-scope.game.ruler.state.x1,
                                   -(scope.game.ruler.state.y2-scope.game.ruler.state.y1)) *
                  180 / Math.PI;
              scope.game.newCommand(command('onActiveTemplate', 'set', x, y, rot));
            }
          },
          'T': function(scope) {
            if(!scope.game.templates.active.locked) {
              modes.goTo('template_target');
            }
          },
          '0': function(scope) {
            if(scope.game.templates.active.type === 'spray' &&
               !scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 10));
            }
          },
          '3': function(scope) {
            if(scope.game.templates.active.type === 'aoe' &&
               !scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 3));
            }
          },
          '4': function(scope) {
            if(scope.game.templates.active.type === 'aoe' &&
               !scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 4));
            }
          },
          '5': function(scope) {
            if(scope.game.templates.active.type === 'aoe' &&
               !scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 5));
            }
          },
          '6': function(scope) {
            if(scope.game.templates.active.type === 'spray' &&
               !scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 6));
            }
          },
          '8': function(scope) {
            if(scope.game.templates.active.type === 'spray' &&
               !scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 8));
            }
          },
          'Delete': function(scope) {
            scope.game.newCommand(command('deleteActiveTemplate'));
            modes.goTo('default');
          },
          'Up': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveFront', false));
            }
          },
          'Shift Up': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveFront', true));
            }
          },
          'Ctrl Up': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveUp', false));
            }
          },
          'Ctrl Shift Up': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveUp', true));
            }
          },
          'Left': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'rotateLeft', false));
            }
          },
          'Shift Left': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'rotateLeft', true));
            }
          },
          'Ctrl Left': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveLeft', false));
            }
          },
          'Ctrl Shift Left': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveLeft', true));
            }
          },
          'Right': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'rotateRight', false));
            }
          },
          'Shift Right': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'rotateRight', true));
            }
          },
          'Ctrl Right': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveRight', false));
            }
          },
          'Ctrl Shift Right': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveRight', true));
            }
          },
          'Down': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveBack', false));
            }
          },
          'Shift Down': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveBack', true));
            }
          },
          'Ctrl Down': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveDown', false));
            }
          },
          'Ctrl Shift Down': function(scope) {
            if(!scope.game.templates.active.locked) {
              scope.game.newCommand(command('onActiveTemplate', 'moveDown', true));
            }
          },
          // ------------------------------------------------------------------
          'DragStart': function(scope, event, drag, dx, dy) {
            if(drag.event === 'Template') {
              scope.game.templates.active = drag.target;
              drag.target.startDraging();

              modes.goTo('template_drag');
            }
          },
          'Click': function(scope, event, drag, dx, dy) {
            switch(drag.event)
            {
            case 'Template': 
              {
                if(scope.game.templates.active === drag.target) {
                  scope.game.templates.active = null;
                  modes.goTo('default');
                }
                else {
                  scope.game.templates.active = drag.target;
                }
                break;
              }
            case 'Model':
              {
                scope.game.templates.active = null;
                modes['default']['Click'].apply(modes['default'],
                                            Array.prototype.slice.call(arguments));
                modes.goTo('default');
              }
            }
          },
        });
        return template_mode;
      }
    }
  ]);
