'use strict';

angular.module('vassalApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$q',
    'game',
    'command',
    'message',
    'factions',
    function($scope,
             $state,
             $stateParams,
             $http,
             $q,
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
          if(event.keyCode == 68 &&
             $scope.game.ruler.state.active !== 'draging') { // d
            $scope.drag_mode = ($scope.drag_mode === 'ruler') ? 'selection' : 'ruler';
            if($scope.drag_mode === 'selection') {
              $scope.game.ruler.setActive(false);
            }
            return;
          }
          switch(event.keyCode) {
          case 107: // +
            {
              $scope.game.board.zoomIn();
              event.preventDefault();
              event.preventDefault();
              return;
            }
          case 109: // -
            {
              $scope.game.board.zoomOut();
              event.preventDefault();
              return;
            }
          }
          if(event.keyCode === 77) { // m
            $scope.game.newCommand(command('onSelection', 'toggleMelee'));
            return;
          }
          if(event.keyCode === 82) { // r
            $scope.game.newCommand(command('onSelection', 'toggleReach'));
            return;
          }
          if(event.keyCode === 99 ||
             event.keyCode === 51) { // 3
            $scope.game.newCommand(command('onSelection', 'toggleAoe', 3));
            return;
          }
          if(event.keyCode === 100 ||
             event.keyCode === 52) { // 4
            $scope.game.newCommand(command('onSelection', 'toggleAoe', 4));
            return;
          }
          if(event.keyCode === 101 ||
             event.keyCode === 53) { // 5
            $scope.game.newCommand(command('onSelection', 'toggleAoe', 5));
            return;
          }
          if(event.keyCode === 46) { // 5
            $scope.game.newCommand(command('dropSelection'));
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
          // console.log(event);
          skip_model_click = false;
          if(!($scope.drag_mode === 'ruler') &&
             0 <= _.indexOf($scope.game.selection, model.state.id)) {
            $scope.model_drag.active = true;
            $scope.model_drag.start_x = event.screenX;
            $scope.model_drag.start_y = event.screenY;
            $scope.game.onSelection('startDraging');
            $scope.model_drag.start.x = model.state_before_drag.x + model.info.width/2;
            $scope.model_drag.start.y = model.state_before_drag.y + model.info.height/2;
            $scope.model_drag.end.x = $scope.model_drag.start.x;
            $scope.model_drag.end.y = $scope.model_drag.start.y;
            $scope.model_drag.length = 0;
            event.stopPropagation();
          }
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
            if(model_start != model_end) {
              var center_start = {
                x: model_start.state.x + model_start.info.width /2,
                y: model_start.state.y + model_start.info.height /2,
              };
              // console.log('center start '+JSON.stringify(center_start));
              var center_end = {
                x: model_end.state.x + model_end.info.width /2,
                y: model_end.state.y + model_end.info.height /2,
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
                  var cx = model.state.x + model.info.width/2;
                  var cy = model.state.y + model.info.height/2;
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
      });
    }
  ]);
