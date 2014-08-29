'use strict';

angular.module('vassalApp.services')
  .factory('ruler_mode', [
    'command',
    function(command) {
      return function(modes) {
        var ruler_mode = {
          name: 'Ruler',
          'O': function(scope) {
            modes['ruler_origin'].origin = this.origin;
            modes['ruler_origin'].target = this.target;
            scope.current_mode = modes['ruler_origin'];
          },
          'Shift R': function(scope) {
            scope.current_mode = modes['default'];
          },
          'T': function(scope) {
            modes['ruler_target'].origin = this.origin;
            modes['ruler_target'].target = this.target;
            scope.current_mode = modes['ruler_target'];
          },
          'DragStart': function(scope, event, drag) {
            this.origin = null;
            this.target = null;
            scope.game.ruler.startDraging(drag.start_x, drag.start_y);
            scope.show_ruler = true;
            scope.current_mode = modes['ruler_drag'];
          },
        };
        return ruler_mode;
      }
    }
  ])
  .factory('ruler_drag_mode', [
    'command',
    function(command) {
      return function(modes) {
        var ruler_drag_mode = {
          name: 'Ruler Drag',
          'Drag': function(scope, event, drag, user_x, user_y, dx, dy) {
            var length = Math.sqrt(dx*dx + dy*dy);
            var display_length = length;
            if(scope.game.ruler.state.range > 0) {
              display_length = Math.min(scope.game.ruler.state.range*10, length);
            }
            var x = scope.game.ruler.state.x1 +
                (user_x - scope.game.ruler.state.x1) * display_length / length;
            var y = scope.game.ruler.state.y1 +
                (user_y - scope.game.ruler.state.y1) * display_length / length;
            scope.game.ruler.setEnd(x, y);
          },
          'DragEnd': function(scope, event, drag, user_x, user_y, dx, dy) {
            var length = Math.sqrt(dx*dx + dy*dy);
            var display_length = length;
            if(scope.game.ruler.state.range > 0) {
              display_length = Math.min(scope.game.ruler.state.range*10, length);
            }
            var x = scope.game.ruler.state.x1 +
                (user_x - scope.game.ruler.state.x1) * display_length / length;
            var y = scope.game.ruler.state.y1 +
                (user_y - scope.game.ruler.state.y1) * display_length / length;
            scope.game.ruler.endDraging(x, y);

            scope.current_mode = modes['ruler'];
          },
        };      
        return ruler_drag_mode;
      }
    }
  ])
  .factory('ruler_origin_mode', [
    'command',
    function(command) {
      return function(modes) {
        var ruler_origin_mode = {
          name: 'Ruler Origin',
          'Click': function(scope, event, drag) {
            if(drag.event !== 'Model') return;
            var model = drag.target;
            modes['ruler'].origin = model;
            scope.game.ruler.setStart(model.state.x, model.state.y);
            scope.game.ruler.state.active = false;
            modes['ruler'].target = null;
            scope.game.ruler.sendStateCmd();

            scope.current_mode = modes['ruler'];
          },
        };
        return ruler_origin_mode;
      }
    }
  ])
  .factory('ruler_target_mode', [
    'command',
    function(command) {
      return function(modes) {
        var ruler_target_mode = {
          name: 'Ruler Target',
          'Click': function(scope, event, drag) {
            if(drag.event !== 'Model') return;
            var model = drag.target;

            if(modes['ruler'].origin === model) return;

            modes['ruler'].target = model;
            var ruler = scope.game.ruler;
            var start_x = ruler.state.x1;
            var start_y = ruler.state.y1;
            var end_x = model.state.x;
            var end_y = model.state.y;
            if(modes['ruler'].origin) {
              start_x = modes['ruler'].origin.state.x;
              start_y = modes['ruler'].origin.state.y;
            }
            var angle = Math.atan2(end_x-start_x, start_y-end_y);
            if(modes['ruler'].origin) {
              start_x += modes['ruler'].origin.info.r * Math.sin(angle);
              start_y -= modes['ruler'].origin.info.r * Math.cos(angle);
            }
            end_x -= model.info.r * Math.sin(angle);
            end_y += model.info.r * Math.cos(angle);
            var dx = end_x - start_x;
            var dy = end_y - start_y;
            var length = Math.sqrt(dx*dx + dy*dy);
            var display_length = length;
            if(scope.game.ruler.state.range > 0) {
              display_length = Math.min(scope.game.ruler.state.range*10, length);
            }
            end_x = start_x + (end_x - start_x) * display_length / length;
            end_y = start_y + (end_y - start_y) * display_length / length;
            scope.game.ruler.setStart(start_x, start_y);
            scope.game.ruler.setEnd(end_x, end_y);
            scope.game.ruler.refresh();
            scope.game.ruler.state.active = true;
            scope.game.ruler.sendStateCmd();

            scope.current_mode = modes['ruler'];
          },
        };
        return ruler_target_mode;
      }
    }
  ]);
