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
          template: 'template.html',
          'Drag': function(scope, event, drag, user_x, user_y, dx, dy) {
            if(!scope.game.id) return;
            scope.game.templates.active.draging(scope.game, dx, dy);
          },
          'DragEnd': function(scope, event, drag, user_x, user_y, dx, dy) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('dragActiveTemplate', dx, dy));

            scope.game.templates.active = drag.target;
            modes.goTo('template', scope);
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
          template: 'template_origin.html',
          'Click': function(scope, event, drag) {
            if(!scope.game.id) return;
            if(drag.event === 'Model') {
              var model = drag.target;
              var active = scope.game.templates.active;
              active.origin = model;
              if(active.type === 'aoe') {
                scope.game.newCommand(command('onActiveTemplate', 'refresh'));
              }
              else {
                scope.game.newCommand(command('onActiveTemplate', 'refresh'));
              }
              modes.goTo('template', scope);
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
          template: 'template_target.html',
          'Click': function(scope, event, drag) {
            if(!scope.game.id) return;
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
                if(active.origin &&
                   active.origin.state.id === model.state.id) return;
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
              modes.goTo('template', scope);
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
          template: 'template_create.html',
          'MouseMove': function(scope, event, user_x, user_y) {
            if(!scope.game.id) return;
            template_create_mode.x = user_x;
            template_create_mode.y = user_y;
          },
          'Click': function(scope, event, click, user_x, user_y) {
            if(!scope.game.id) return;
            template_create_mode.x = user_x;
            template_create_mode.y = user_y;
            template_create_mode.rot = 0;
            scope.game.newCommand(command('createTemplate', template_create_mode));

            modes.goTo('template', scope);
          },
        });
        return template_create_mode;
      }
    }
  ])
  .factory('template_locked_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_mode = _.deepCopy(common);
        _.deepExtend(template_mode, {
          name: 'Template Locked',
          group: 'Template',
          template: 'template_locked.html',
          enter: function(scope) {
            if(!scope.game.templates.active.locked) {
              modes.goTo('template', scope);
            }
          },
          'L': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'toggleLocked'));
            modes.goTo('template', scope);
          },
          'Delete': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('deleteActiveTemplate'));
            modes.goTo('default', scope);
          },
          // ------------------------------------------------------------------
          'Click': function(scope, event, drag, dx, dy) {
            switch(drag.event)
            {
            case 'Template': 
              {
                if(scope.game.templates.active === drag.target) {
                  scope.game.templates.active = null;
                  modes.goTo('default', scope);
                }
                else {
                  scope.game.templates.active = drag.target;
                  modes.goTo('template', scope);
                }
                break;
              }
            case 'Model':
              {
                scope.game.templates.active = null;
                modes['default']['Click'].apply(modes['default'],
                                            Array.prototype.slice.call(arguments));
                modes.goTo('default', scope);
              }
            }
          },
        });
        return template_mode;
      }
    }
  ])
  .factory('template_mode', [
    'command',
    function(command) {
      return function(modes, common) {
        var template_mode = _.deepCopy(modes['template_locked']);
        _.deepExtend(template_mode, {
          name: 'Template',
          group: 'Template',
          template: 'template.html',
          enter: function(scope) {
            if(scope.game.templates.active.locked) {
              modes.goTo('template_locked', scope);
            }
          },
          'D': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'aoe') {
              var aoe = scope.game.templates.active;
              var deviation = scope.game.rollDeviation(aoe.max_deviation);
              var angle = 60 * (deviation.direction-1) + aoe.rot;
              var new_x = aoe.x + deviation.distance * Math.sin(angle*Math.PI/180);
              var new_y = aoe.y - deviation.distance * Math.cos(angle*Math.PI/180);
              scope.game.newCommand(command('onActiveTemplate', 'reset',
                                            new_x, new_y, angle, aoe.max_deviation));
            }
          },
          'O': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'wall') return;
            modes.goTo('template_origin', scope);
          },
          'R': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'wall') return;
            if(scope.game.ruler.state.active) {
              var x = scope.game.ruler.model_end ? 
                  scope.game.ruler.model_end.state.x : scope.game.ruler.state.x2;
              var y = scope.game.ruler.model_end ? 
                  scope.game.ruler.model_end.state.y : scope.game.ruler.state.y2;
              var rot = Math.atan2(scope.game.ruler.state.x2-scope.game.ruler.state.x1,
                                   -(scope.game.ruler.state.y2-scope.game.ruler.state.y1)) *
                  180 / Math.PI;
              scope.game.newCommand(command('onActiveTemplate', 'reset',
                                            x, y, rot, scope.game.ruler.state.length / 2));
            }
          },
          'T': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'wall') return;
            modes.goTo('template_target', scope);
          },
          '0': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'spray') {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 10));
            }
          },
          '3': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'aoe') {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 3));
            }
          },
          '4': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'aoe') {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 4));
            }
          },
          '5': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'aoe') {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 5));
            }
          },
          '6': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'spray') {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 6));
            }
          },
          '8': function(scope) {
            if(!scope.game.id) return;
            if(scope.game.templates.active.type === 'spray') {
              scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 8));
            }
          },
          'Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'moveFront', false));
          },
          'Shift Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'moveFront', true));
          },
          'Ctrl Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveDown' : 'moveUp',
                                          false));
          },
          'Ctrl Shift Up': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveDown' : 'moveUp',
                                          true));
          },
          'Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'rotateLeft', false));
          },
          'Shift Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'rotateLeft', true));
          },
          'Ctrl Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveRight' : 'moveLeft',
                                          false));
          },
          'Ctrl Shift Left': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveRight' : 'moveLeft',
                                          true));
          },
          'Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'rotateRight', false));
          },
          'Shift Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'rotateRight', true));
          },
          'Ctrl Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveLeft' : 'moveRight',
                                          false));
          },
          'Ctrl Shift Right': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveLeft' : 'moveRight',
                                          true));
          },
          'Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'moveBack', false));
          },
          'Shift Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 'moveBack', true));
          },
          'Ctrl Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveUp' : 'moveDown',
                                          false));
          },
          'Ctrl Shift Down': function(scope) {
            if(!scope.game.id) return;
            scope.game.newCommand(command('onActiveTemplate', 
                                          scope.game.board.zoom.flipped ? 'moveUp' : 'moveDown',
                                          true));
          },
          // ------------------------------------------------------------------
          'DragStart': function(scope, event, drag, dx, dy) {
            if(!scope.game.id) return;
            if(drag.event === 'Template') {
              scope.game.templates.active = drag.target;
              drag.target.startDraging();

              modes.goTo('template_drag', scope);
            }
          },
          'Click': function(scope, event, drag) {
            if(!scope.game.id) return;
            switch(drag.event)
            {
            case 'Template': 
              {
                if(scope.game.templates.active === drag.target) {
                  scope.game.templates.active = null;
                  modes.goTo('default', scope);
                }
                else {
                  scope.game.templates.active = drag.target;
                  modes.goTo('template', scope);
                }
                break;
              }
            case 'Model': 
              {
                if(scope.game.templates.active.type === 'wall') return;
                var model = drag.target;
                var active = scope.game.templates.active;
                if(active.type === 'aoe') {
                  x = model.state.x;
                  y = model.state.y;
                  scope.game.newCommand(command('onActiveTemplate', 'set',
                                                x, y, scope.game.templates.active.rot));
                  return;
                }
                // spray
                if(!active.origin) {
                  active.origin = model;
                  scope.game.newCommand(command('onActiveTemplate', 'refresh'));
                  return;
                }
                var x;
                var y;
                if(active.origin.state.id === model.state.id) return;
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
            }
          },
        });
        return template_mode;
      }
    }
  ]);
