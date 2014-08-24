'use strict';

angular.module('vassalApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$q',
    '$window',
    'game',
    'command',
    'message',
    'factions',
    function($scope,
             $state,
             $stateParams,
             $http,
             $q,
             $window,
             game,
             command,
             message,
             factions) {
      console.log('init gameCtrl');
      if(!$stateParams.id || $stateParams.id.length <= 0) $state.go('start');

      $http.get('/api/games/'+$stateParams.id).then(function(response) {
        // console.log('search game success');
        factions.then(function() {
          $scope.game = game(response.data);
          console.log($scope.game);
        });
        // console.log($scope.game);
      }, function(response) {
        console.log('search game error');
        console.log(response);
        $state.go('start');
        return $q.reject();
      }).then(function() {

        var canvas = document.getElementById('canvas');
        // console.log(canvas_rect);

        $scope.drag_mode = 'selection';
        $scope.onDragModeChange = function() {
          if($scope.drag_mode === 'selection') {
            $scope.game.ruler.setActive(false);
          }
        };

        $scope.onKeyDown = function(event) {
          // console.log(event);
          if($scope.create_mode) return;
          switch(event.keyCode) {
          case 107: // +
            {
              if(event.altKey) {
                $scope.game.board.zoomIn();
              }
              else {
                $scope.game.newCommand(command('onSelection', 'incrementFocus'));
              }
              return;
            }
          case 109: // -
            {
              if(event.altKey) {
                $scope.game.board.zoomOut();
              }
              else {
                $scope.game.newCommand(command('onSelection', 'decrementFocus'));
              }
              return;
            }
          }
          if(event.keyCode === 68) { // d
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'aoe') {
              $scope.doAoEDeviation();
              return;
            }
            else {
              if($scope.game.ruler.state.active !== 'draging') {
                $scope.drag_mode = ($scope.drag_mode === 'ruler') ? 'selection' : 'ruler';
                if($scope.drag_mode === 'selection') {
                  $scope.game.ruler.setActive(false);
                }
                return;
              }
            }
          }
          if(event.keyCode === 70) { // f
            $scope.game.newCommand(command('onSelection', 'toggleFocus'));
            return;
          }
          if(event.keyCode === 73) { // i
            $scope.game.newCommand(command('onSelection', 'toggleImage'));
            return;
          }
          if(event.keyCode === 76) { // l
            if($scope.game.templates.active) {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleLocked'));
            }
            return;
          }
          if(event.keyCode === 77) { // m
            $scope.game.newCommand(command('onSelection', 'toggleMelee'));
            return;
          }
          if(event.keyCode === 82) { // r
            if($scope.game.templates.active &&
               $scope.game.ruler.state.active) {
              var x = $scope.game.ruler.model_end ? 
                  $scope.game.ruler.model_end.state.x : $scope.game.ruler.state.x2;
              var y = $scope.game.ruler.model_end ? 
                  $scope.game.ruler.model_end.state.y : $scope.game.ruler.state.y2;
              console.log($scope.game.ruler.state);
              var rot = Math.atan2($scope.game.ruler.state.x2-$scope.game.ruler.state.x1,
                                   -($scope.game.ruler.state.y2-$scope.game.ruler.state.y1))
                  * 180 / Math.PI;
              $scope.game.newCommand(command('onActiveTemplate', 'set', x, y, rot));
            }
            else {
              $scope.game.newCommand(command('onSelection', 'toggleReach'));
            }
            return;
          }
          if(event.keyCode === 99 ||
             event.keyCode === 51) { // 3
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'aoe') {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 3));
            }
            else {
              $scope.game.newCommand(command('onSelection', 'toggleAoe', 3));
            }
            return;
          }
          if(event.keyCode === 100 ||
             event.keyCode === 52) { // 4
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'aoe') {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 4));
            }
            else {
              $scope.game.newCommand(command('onSelection', 'toggleAoe', 4));
            }
            return;
          }
          if(event.keyCode === 101 ||
             event.keyCode === 53) { // 5
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'aoe') {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 5));
            }
            else {
              $scope.game.newCommand(command('onSelection', 'toggleAoe', 5));
            }
            return;
          }
          if(event.keyCode === 102 ||
             event.keyCode === 54) { // 6
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'spray') {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 6));
              return;
            }
          }
          if(event.keyCode === 104 ||
             event.keyCode === 56) { // 8
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'spray') {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 8));
              return;
            }
          }
          if(event.keyCode === 96 ||
             event.keyCode === 48) { // 0
            if($scope.game.templates.active &&
               $scope.game.templates.active.type === 'spray') {
              $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 10));
              return;
            }
          }
          if(event.keyCode === 46) { // Suppr
            if($scope.game.templates.active) {
              $scope.game.newCommand(command('deleteActiveTemplate'));
            }
            else {
              $scope.game.newCommand(command('dropSelection'));
            }
            return;
          }
          if(event.keyCode === 90 &&
             event.ctrlKey) { // Shift+z
            $scope.game.undoLastCommand();
            return;
          }
          if(event.keyCode === 67) { //c
            if(event.shiftKey) { // Shift+c
              if($scope.game.selection.length === 1 &&
                 $scope.game.models[$scope.game.selection[0]].info.focus) {
                $scope.game.newCommand(command('onSelection', 'toggleControl'));
              }
              return;
            }
            if(event.ctrlKey) { // Ctrl+c
              if($scope.game.selection.length > 0) {
                $scope.create_preview.info = [];
                var x_ref = $scope.game.models[$scope.game.selection[0]].state.x;
                var y_ref = $scope.game.models[$scope.game.selection[0]].state.y;
                $scope.create_preview.x = x_ref+10;
                $scope.create_preview.y = y_ref+10;
                _.each($scope.game.selection, function(id) {
                  var offset_x = $scope.game.models[id].state.x - x_ref;
                  var offset_y = $scope.game.models[id].state.y - y_ref;
                  $scope.create_preview.info.push({
                    info: $scope.game.models[id].info,
                    offset_x: offset_x,
                    offset_y: offset_y
                  });
                });
                $scope.create_mode = true;
              }
              return;
            }
          }
          if(event.keyCode === 27) { // Esc
            $scope.create_mode = false;
            $scope.create_template_mode = false;
            return;
          }
          if(37 > event.keyCode ||
             40 < event.keyCode) return;
          event.preventDefault();
          switch(event.keyCode) {
          case 37: // leftArrow
            {
              // $scope.game.onSelection('moveLeft', event.ctrlKey);
              if(event.altKey) {
                $scope.game.board.moveLeft();
              }
              else if($scope.game.templates.active) {
                $scope.game.newCommand(command('onActiveTemplate', 
                                               event.ctrlKey ? 'moveLeft' : 'rotateLeft',
                                               event.shiftKey));
              }
              else if(event.ctrlKey) {
                $scope.game.newCommand(command('onSelection', 'moveLeft', event.shiftKey));
              }
              else {
                $scope.game.newCommand(command('onSelection', 'rotateLeft', event.shiftKey));
              }
              break;
            }
          case 38: // upArrow
            {
              if(event.altKey) {
                $scope.game.board.moveUp();
              }
              else if($scope.game.templates.active) {
                $scope.game.newCommand(command('onActiveTemplate', 
                                               event.ctrlKey ? 'moveUp' : 'moveFront',
                                               event.shiftKey));
              }
              else if(event.ctrlKey) {
                $scope.game.newCommand(command('onSelection', 'moveUp', event.shiftKey));
              }
              else {
                $scope.game.newCommand(command('onSelection', 'moveFront', event.shiftKey));
              }
              break;
            }
          case 39: // rightArrow
            {
              if(event.altKey) {
                $scope.game.board.moveRight();
              }
              else if($scope.game.templates.active) {
                $scope.game.newCommand(command('onActiveTemplate', 
                                               event.ctrlKey ? 'moveRight' : 'rotateRight',
                                               event.shiftKey));
              }
              else if(event.ctrlKey) {
                $scope.game.newCommand(command('onSelection', 'moveRight', event.shiftKey));
              }
              else {
                $scope.game.newCommand(command('onSelection', 'rotateRight', event.shiftKey));
              }
              break;
            }
          case 40: // downArrow
            {
              if(event.altKey) {
                $scope.game.board.moveDown();
              }
              else if($scope.game.templates.active) {
                $scope.game.newCommand(command('onActiveTemplate', 
                                               event.ctrlKey ? 'moveDown' : 'moveBack',
                                               event.shiftKey));
              }
              else if(event.ctrlKey) {
                $scope.game.newCommand(command('onSelection', 'moveDown', event.shiftKey));
              }
              else {
                $scope.game.newCommand(command('onSelection', 'moveBack', event.shiftKey));
              }
              break;
            }
          }
        };

        var skip_model_click = false;
        $scope.model_drag = {
          active: false,
          start: {
            x: null,
            y: null,
          },
          end: {
            x: null,
            y: null,
          },
          length: 0,
        };
        $scope.onModelMouseDown = function(event, model) {
          // console.log('mmd');
          console.log(event);
          skip_model_click = false;
          if($scope.create_template_mode && event.shiftKey) {
            $scope.create_template_preview.x = model.state.x;
            $scope.create_template_preview.y = model.state.y;
          }
          if($scope.create_mode) return;
          if($scope.game.templates.active) return;
          if(!($scope.drag_mode === 'ruler') &&
             0 <= _.indexOf($scope.game.selection, model.state.id)) {
            $scope.model_drag.active = true;
            $scope.model_drag.start_x = event.screenX;
            $scope.model_drag.start_y = event.screenY;
            $scope.game.onSelection('startDraging');
            $scope.model_drag.start.x = model.state_before_drag.x;
            $scope.model_drag.start.y = model.state_before_drag.y;
            $scope.model_drag.end.x = $scope.model_drag.start.x;
            $scope.model_drag.end.y = $scope.model_drag.start.y;
            $scope.model_drag.length = 0;
            event.stopPropagation();
          }
        };
        $scope.template_drag = {
          active: false,
          start: {
            x: null,
            y: null,
          },
          ref: {
            x: null,
            y: null,
          }
        };
        var template_active_before_down;
        $scope.onTemplateMouseDown = function(event, temp) {
          // console.log('mmd');
          // console.log(event);
          if($scope.create_mode) return;
          if($scope.create_template_mode) return;
          // if($scope.drag_mode === 'ruler') return;

          template_active_before_down = $scope.game.templates.active;
          $scope.game.templates.active = temp;

          $scope.template_drag.active = true;
          $scope.template_drag.start.x = event.screenX;
          $scope.template_drag.start.y = event.screenY;
          temp.startDraging();
          // console.log($scope.template_drag);
          event.stopPropagation();
        };
        $scope.onTemplateClick = function(event, temp) {
          // console.log('mmd');
          // console.log(event);
          if($scope.create_mode) return;
          if($scope.create_template_mode) return;
          if($scope.drag_mode === 'ruler') return;
          if((Math.abs(temp.startDraging.ref.x-temp.x) < 0.05 &&
              Math.abs(temp.startDraging.ref.y-temp.y) < 0.05)) {
            $scope.game.templates.active = (temp === template_active_before_down) ? null : temp;
          }
          else {
            var dx = event.screenX - $scope.template_drag.start.x;
            var dy = event.screenY - $scope.template_drag.start.y;
            dx *= ($scope.game.board.view.width / 800);
            dy *= ($scope.game.board.view.height / 800);
            // console.log(dx+' '+dy);
            $scope.game.newCommand(command('dragActiveTemplate', dx, dy));
            // $scope.game.onSelection('endDraging', dx, dy);
            $scope.template_drag.start.x = 0;
            $scope.template_drag.start.y = 0;
          }
          $scope.template_drag.active = false;
        };
        $scope.onModelClick = function(event, model) {
          // console.log(event);
          // console.log(model);
          if(skip_model_click) {
            skip_model_click = false;
            return;
          }
          if($scope.drag_mode === 'ruler' &&
             $scope.game.selection.length > 0) {
            var model_start = $scope.game.models[$scope.game.selection[0]];
            var model_end = model;
            $scope.game.ruler.model_end = model;
            if(model_start != model_end) {
              var center_start = {
                x: model_start.state.x,
                y: model_start.state.y,
              };
              // console.log('center start '+JSON.stringify(center_start));
              var center_end = {
                x: model_end.state.x,
                y: model_end.state.y,
              };
              var angle = Math.atan2(center_end.y-center_start.y, center_end.x-center_start.x);
              var start = {
                x: center_start.x + model_start.info.r * Math.cos(angle),
                y: center_start.y + model_start.info.r * Math.sin(angle),
              };
              var end = {
                x: center_end.x - model_end.info.r * Math.cos(angle),
                y: center_end.y - model_end.info.r * Math.sin(angle),
              };
              $scope.game.ruler.startDraging(start.x, start.y);
              $scope.game.ruler.endDraging(end.x, end.y);
            }
            return;
          }
          if(event.ctrlKey) {
            $scope.game.newCommand(command('addToSelection', [model.state.id]));
          }
          else {
            $scope.game.newCommand(command('setSelection', [model.state.id]));
          }
        };

        $scope.selection = {
          active: false,
          x: 10, y: 10,
          start_x: 10, start_y: 10,
          width: 0, height: 0,
        };
        $scope.doSelectStart = function(event) {
          // console.log('smd');
          // console.log(event);
          // console.log($scope.drag_mode);
          if($scope.create_mode) return;
          var elem_rect = canvas.getBoundingClientRect();
          // console.log(elem_rect);
          var dom_x = event.clientX - elem_rect.left;
          var dom_y = event.clientY - elem_rect.top;
          // console.log('dom ' + dom_x + ' ' + dom_y);
          var user_x = dom_x * $scope.game.board.width / elem_rect.width;
          var user_y = dom_y * $scope.game.board.height / elem_rect.height;
          // console.log('user ' + user_x + ' ' + user_y);
          if('selection' === $scope.drag_mode) {
            $scope.selection.active = true;
            $scope.selection.start_x = user_x;
            $scope.selection.start_y = user_y;
            $scope.selection.width = 0;
            $scope.selection.height = 0;
          }
          if('ruler' === $scope.drag_mode) {
            $scope.game.ruler.startDraging(user_x, user_y);
          }
        };
        $scope.doSelectMove = function(event) {
          if($scope.create_template_mode) {
            // console.log('-------------');
            // console.log(event);
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.left;
            var dom_y = event.clientY - elem_rect.top;
            // console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.game.board.width / elem_rect.width;
            var user_y = dom_y * $scope.game.board.height / elem_rect.height;
            // console.log('user ' + user_x + ' ' + user_y);
            $scope.create_template_preview.x = user_x;
            $scope.create_template_preview.y = user_y;
          }
          if($scope.create_mode) {
            // console.log(event);
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.left;
            var dom_y = event.clientY - elem_rect.top;
            // console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.game.board.width / elem_rect.width;
            var user_y = dom_y * $scope.game.board.height / elem_rect.height;
            $scope.create_preview.x = user_x;
            $scope.create_preview.y = user_y;
          }
          if($scope.template_drag.active) {
            // console.log(event);
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dx = event.screenX - $scope.template_drag.start.x;
            var dy = event.screenY - $scope.template_drag.start.y;
            dx *= ($scope.game.board.view.width / 800);
            dy *= ($scope.game.board.view.height / 800);
            // console.log(dx+' '+dy);
            $scope.game.templates.active.draging($scope.game, dx, dy);
            return;
          }
          if($scope.model_drag.active) {
            // console.log(event);
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dx = event.screenX - $scope.model_drag.start_x;
            var dy = event.screenY - $scope.model_drag.start_y;
            dx *= ($scope.game.board.view.width / 800);
            dy *= ($scope.game.board.view.height / 800);
            // console.log(dx+' '+dy);
            $scope.game.onSelection('draging', dx, dy);
            $scope.model_drag.end.x = $scope.model_drag.start.x + dx;
            $scope.model_drag.end.y = $scope.model_drag.start.y + dy;
            $scope.model_drag.length = ((Math.sqrt(dx*dx+dy*dy) * 10) >> 0) / 100;
            return;
          }
          if( ('selection' === $scope.drag_mode &&
               $scope.selection.active) ||
              ('ruler' === $scope.drag_mode &&
               $scope.game.ruler.state.active === 'draging') ) {
            // console.log(event);
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.left;
            var dom_y = event.clientY - elem_rect.top;
            // console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.game.board.width / elem_rect.width;
            var user_y = dom_y * $scope.game.board.height / elem_rect.height;
            // console.log('user ' + user_x + ' ' + user_y);
            if('selection' === $scope.drag_mode) {
              $scope.selection.x = $scope.selection.start_x;
              $scope.selection.width = user_x - $scope.selection.start_x;
              if($scope.selection.width < 0) {
                $scope.selection.width = -$scope.selection.width;
                $scope.selection.x = $scope.selection.x - $scope.selection.width;
              }
              if($scope.selection.width < 1) {
                $scope.selection.width = 0;
              }
              $scope.selection.y = $scope.selection.start_y;
              $scope.selection.height = user_y - $scope.selection.start_y;
              if($scope.selection.height < 0) {
                $scope.selection.height = -$scope.selection.height;
                $scope.selection.y = $scope.selection.y - $scope.selection.height;
              }
              if($scope.selection.height < 1) {
                $scope.selection.height = 0;
              }
              // console.log($scope.selection.x + ' ' +
              //             $scope.selection.y + ' ' +
              //             $scope.selection.width + ' ' +
              //             $scope.selection.height);
            }
            if('ruler' === $scope.drag_mode) {
              $scope.game.ruler.setEnd(user_x, user_y);
            }
          }
        };
        $scope.doSelectStop = function(event) {
          // console.log(event);
          if($scope.create_template_mode) {
            $scope.game.newCommand(command('createTemplate', $scope.create_template_preview));
            $scope.create_template_mode = false;
            skip_model_click = true;
          }
          if($scope.create_mode) {
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.left;
            var dom_y = event.clientY - elem_rect.top;
            // console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.game.board.width / elem_rect.width;
            var user_y = dom_y * $scope.game.board.height / elem_rect.height;
            var create_options = [];
            _.each($scope.create_preview.info, function(info) {
              create_options.push({
                info: info.info,
                x: user_x+info.offset_x,
                y: user_y+info.offset_y
              });
            });
            $scope.game.newCommand(command('createModel',
                                           create_options));
            $scope.create_mode = false;
            skip_model_click = true;
          }
          if($scope.template_drag.active) return;
          if($scope.model_drag.active) {
            var dx = event.screenX - $scope.model_drag.start_x;
            var dy = event.screenY - $scope.model_drag.start_y;
            dx *= ($scope.game.board.view.width / 800);
            dy *= ($scope.game.board.view.height / 800);
            // console.log(dx+' '+dy);
            $scope.game.newCommand(command('endDragingSelection', dx, dy));
            // $scope.game.onSelection('endDraging', dx, dy);
            skip_model_click = true;
            $scope.model_drag.start.x = 0;
            $scope.model_drag.start.y = 0;
            $scope.model_drag.end.x = 0;
            $scope.model_drag.end.y = 0;
            $scope.model_drag.active = false;
            return;
          }
          if( ('selection' === $scope.drag_mode &&
               $scope.selection.active) ||
              ('ruler' === $scope.drag_mode &&
               $scope.game.ruler.state.active) ) {
            var elem_rect = canvas.getBoundingClientRect();
            // console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.left;
            var dom_y = event.clientY - elem_rect.top;
            // console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.game.board.width / elem_rect.width;
            var user_y = dom_y * $scope.game.board.height / elem_rect.height;
            // console.log('user ' + user_x + ' ' + user_y);
            if('selection' === $scope.drag_mode) {
              $scope.selection.active = false;
              $scope.selection.x = $scope.selection.start_x;
              $scope.selection.width = user_x - $scope.selection.start_x;
              if($scope.selection.width < 0) {
                $scope.selection.width = -$scope.selection.width;
                $scope.selection.x = $scope.selection.x - $scope.selection.width;
              }
              if($scope.selection.width < 1) {
                $scope.selection.width = 0;
              }
              $scope.selection.y = $scope.selection.start_y;
              $scope.selection.height = user_y - $scope.selection.start_y;
              if($scope.selection.height < 0) {
                $scope.selection.height = -$scope.selection.height;
                $scope.selection.y = $scope.selection.y - $scope.selection.height;
              }
              if($scope.selection.height < 1) {
                $scope.selection.height = 0;
              }
              // console.log($scope.selection.x + ' ' +
              //             $scope.selection.y + ' ' +
              //             $scope.selection.width + ' ' +
              //             $scope.selection.height);
              if($scope.selection.width > 0 &&
                 $scope.selection.height > 0) {
                var models_selected = [];
                _.each($scope.game.models, function(model) {
                  var cx = model.state.x;
                  var cy = model.state.y;
                  if( $scope.selection.x <= cx && cx <= ($scope.selection.x+$scope.selection.width ) &&
                      $scope.selection.y <= cy && cy <= ($scope.selection.y+$scope.selection.height) ) {
                    models_selected.push(model.state.id);
                  }
                });
                $scope.game.newCommand(command('setSelection', models_selected));

                $scope.selection.width = 0;
                $scope.selection.height = 0;
              }
            }
            if('ruler' === $scope.drag_mode) {
              $scope.game.ruler.model_end = null;
              $scope.game.ruler.endDraging(user_x, user_y);
            }
          }
        };

        $scope.chat_msg = '';
        $scope.doSendMessage = function() {
          if(0 >= $scope.chat_msg.length) return;
          // console.log('do send msg '+$scope.chat_msg);
          var msg = message('chat', $scope.chat_msg);
          $scope.game.newMessage(msg);
          $scope.chat_msg = '';
        };

        $scope.onLayerChange = function(layer) {
          $scope.game.newCommand(command('setLayer', layer));
        };

        $scope.doModelDamage = function(model, col, line) {
          $scope.game.newCommand(command('onSelection', 'toggleDamage', col, line));
        };

        $scope.restore_selection = {};
        $scope.isRestoreSelectionEmpty = function() {
          return _.keys($scope.restore_selection).length === 0;
        };
        $scope.doToggleRestoreSelection = function(id) {
          if($scope.restore_selection[id]) {
            delete $scope.restore_selection[id];
          }
          else {
            $scope.restore_selection[id] = true;
          }
        };
        $scope.doRestoreSelection = function() {
          $scope.game.newCommand(command('restoreFromDropBin', _.keys($scope.restore_selection)));
        };
        $scope.doRestoreAll = function() {
          $scope.game.newCommand(command('restoreFromDropBin',
                                         _.map($scope.game.drop_bin, function(mod) {
                                           return mod.state.id;
                                        })
                                        ));
        };

        $scope.create_mode = false;
        $scope.model = {
          faction: null,
          type: null,
          unit: null,
          unit_entry: null,
          id: null,
          size: 1,
          info: [],
        };
        $scope.create_preview = {
          x: 0,
          y: 0,
          info: null,
        };
        $scope.$watch('model', function(val, old) {
          $scope.create_mode = null;
        }, true);
        $scope.doToggleCreateModel = function() {
          $scope.create_mode = !$scope.create_mode;
          if(!$scope.create_mode) return;

          $scope.create_preview.info = [];
          var mid_size = Math.ceil($scope.model.size/2);
          var unit_step = 3*$scope.model.id.r;
          _.times($scope.model.size, function(i) {
            var offset_x = 0;
            var offset_y = 0;
            if($scope.model.size <= 5) {
              offset_x = i*unit_step-($scope.model.size-1)*unit_step/2;
              offset_y = 0;
            }
            else {
              offset_x = (i%mid_size)*unit_step-(mid_size-1)*unit_step/2;
              offset_y = (i >= mid_size) ? unit_step : 0;
            }
            $scope.create_preview.info.push({
              info: $scope.model.id,
              offset_x: offset_x,
              offset_y: offset_y
            });
          });
        };

        $scope.modelShow = function(type) {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state['show_'+type] }) : [];
        };
        $scope.showCenteredAoE = function() {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state.show_aoe > 0 }) : [];
        };

        $scope.fk_read_result = [];
        $scope.fk_read_string = '';
        function importFKList(data) {
          // console.log(data);
          var lines = data.match(/[^\r\n]+/g);
          $scope.create_preview.info = [];
          // console.log(lines);
          var i = 0;
          var global_offset_x = 0;
          _.each(lines, function(line) {
            if(line.match(/^(System:|Faction:|Casters:|Points:|Tiers:)/)) {
              return;
            }
            line = line.replace(/^\s*/,'');
            if(line.length === 0) return;
            line = line.replace(/^\* /,'');
            var size = 1;
            var match = line.match(/^(\d+) /);
            if(match) {
              size = match[1] >> 0;
              line = line.replace(/^\d+ /,'');
            }                
            match = line.match(/\(leader and (\d+) grunts?\)/i);
            if(match) {
              size = (match[1] >> 0) + 1;
              line = line.replace(/\(leader and (\d+) grunts?\)/gi,'');
            }                
            line = line.replace(/\s*\(.+\)\s*$/,'');
            // console.log(line);
            if(_.isArray($scope.factions.fk_keys[line]) &&
               $scope.factions.fk_keys[line].length > 0) {
              // console.log(size);

              if($scope.factions.fk_keys[line].length > 1) {
                _.each($scope.factions.fk_keys[line], function(id) {
                  $scope.create_preview.info.push({
                    info: id,
                    offset_x: global_offset_x + 1.25*$scope.factions.fk_keys[line][0].r,
                    offset_y: 0
                  });
                  global_offset_x += 2.5*$scope.factions.fk_keys[line][0].r;
                  i++;
                });
              }
              else {
                var mid_size = Math.ceil(size/2);
                var unit_step = 2.5*$scope.factions.fk_keys[line][0].r;
                var max_offset_x = 0;
                _.times(size, function(n) {
                  var offset_x = 0;
                  var offset_y = 0;
                  if(size <= 5) {
                    offset_x = n*unit_step+unit_step/2;
                    offset_y = 0;
                  }
                  else {
                    offset_x = (i%mid_size)*unit_step+unit_step/2;
                    offset_y = (n >= mid_size) ? unit_step : 0;
                  }
                  max_offset_x = Math.max(max_offset_x, offset_x);
                  $scope.create_preview.info.push({
                    info: $scope.factions.fk_keys[line][0],
                    offset_x: global_offset_x + offset_x,
                    offset_y: offset_y
                  });
                  i++;
                });
                global_offset_x += max_offset_x + unit_step/2;
              }
            }
            else {
              $scope.fk_read_result.push('!!! unknown model \"'+line+'\"');
            }
          });
          // console.log($scope.create_preview.info);
          if(i > 0) $scope.create_mode = true;
        }
        $scope.readFKFile = function(file) {
          $scope.create_mode = false;
          $scope.fk_read_result = [];
          var reader = new $window.FileReader();
          reader.onload = function(e) {
            $scope.fk_read_result.push('loaded file');
            var data = e.target.result;
            importFKList(data);
            $scope.$apply();
          };
          reader.onerror = function(e) {
            $scope.fk_read_result = ['error reading file'];
            $scope.$apply();
          };
          reader.onabort = function(e) {
            $scope.fk_read_result = ['abort reading file'];
            $scope.$apply();
          };
          reader.readAsText(file);
        };
        $scope.readFKString = function(file) {
          importFKList($scope.fk_read_string);
        };

        $scope.doResetAllModelDamage = function() {
          $scope.game.newCommand(command('onSelection', 'resetAllDamage'));
        };

        $scope.create_template_mode = false;
        $scope.create_template_preview = {
          type: null,
          size: 0,
          x: 0,
          y: 0,
          rot: 0,
          locked: false,
        };
        $scope.doCreateTemplate = function(type, size) {
          $scope.create_template_preview.type = type;
          $scope.create_template_preview.size = size;
          $scope.create_template_preview.x = 240;
          $scope.create_template_preview.y = 240;
          $scope.create_template_mode = true;
        };
        $scope.aoe_max_deviation = 6;
        $scope.doAoEDeviation = function() {
          var aoe = $scope.game.templates.active;
          var deviation = $scope.game.rollDeviation($scope.aoe_max_deviation);
          var angle = 60 * (deviation.direction-1) + aoe.rot;
          var new_x = aoe.x + deviation.distance * Math.sin(angle*Math.PI/180);
          var new_y = aoe.y - deviation.distance * Math.cos(angle*Math.PI/180);
          // console.log(deviation, new_x, new_y, angle);
          $scope.game.newCommand(command('onActiveTemplate', 'set', new_x, new_y, angle));
        };
        $scope.templateShowLocked = function(type) {
          return $scope.game ? 
            _.filter($scope.game.templates[type],
                     function(temp) { return temp.locked; }) : [];
        };
        $scope.templateShowUnlocked = function(type) {
          return $scope.game ? 
            _.filter($scope.game.templates[type],
                     function(temp) { return !temp.locked; }) : [];
        };
      });
    }
  ]);
