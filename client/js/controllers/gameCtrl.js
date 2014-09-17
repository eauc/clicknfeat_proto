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
    'factions',
    'modes',
    function($scope,
             $state,
             $stateParams,
             $http,
             $q,
             $window,
             game,
             command,
             factions,
             modes) {
      console.log('init gameCtrl');

      $scope.modes = modes;

      $scope.auras = {
        '0': {
          color: 'none',
          name: 'Off',
        },
        '1': {
          color: '#0FF',
          name: 'Cyan',
        },
        '2': {
          color: '#F0F',
          name: 'Purple',
        },
        '3': {
          color: '#FF0',
          name: 'Yellow',
        },
        '4': {
          color: '#00F',
          name: 'Blue',
        },
        '5': {
          color: '#0F0',
          name: 'Green',
        },
        '6': {
          color: '#F00',
          name: 'Red',
        },
      };
      $scope.effects = {
        'B': {
          icon: '/data/icons/Blind.png',
          name: 'Blind'
        },
        'C': {
          icon: '/data/icons/Corrosion.png',
          name: 'Corrosion'
        },
        'D': {
          icon: '/data/icons/BoltBlue.png',
          name: 'Disrupt'
        },
        'F': {
          icon: '/data/icons/Fire.png',
          name: 'Fire'
        },
        'I': {
          desc: 'Incor- poreal',
          name: 'Incorporeal'
        },
        'K': {
          icon: '/data/icons/KD.png',
          name: 'KD'
        },
        'S': {
          icon: '/data/icons/Stationary.png',
          name: 'Stationary'
        },
        'T': {
          icon: '/data/icons/BoltYellow.png',
          name: 'Fleeing'
        },
      };
      $scope.model_selected_aura = '0';
      $scope.model_selected_aoe = '3';
      $scope.model_selected_melee = 'M';
      $scope.model_selected_area = 5;
      $scope.model_selected_effect = 'F';
      $scope.force = {};

      $scope.drag = {
        start_x: 0, start_y: 0,
      };
      $scope.model_view = {};
      $scope.aoe = {
        max_deviation: 6
      };

      if(!$stateParams.id || $stateParams.id.length <= 0) $state.go('start');
      if($stateParams.visibility !== 'private' &&
         $stateParams.visibility !== 'public') $state.go('start');

      $scope.menu_view = $stateParams.visibility === 'public' ? 'games' : 'main';

      factions.then(function() {
        return $http.get('/api/games/'
                         +($stateParams.visibility === 'public' ? 'public/' : '')
                         +$stateParams.id)
          .then(function(response) {
            $scope.game = game(response.data);
            console.log($scope.game);
          }, function(response) {
            console.log('search game error', response);
            $state.go('start');
            return $q.reject();
          });
      }, function() {
        $state.go('start');
        return $q.reject();
      }).then(function() {
        var defer = $q.defer();
        var promise = defer.promise;
        if($stateParams.visibility === 'private' &&
           $scope.game.player1.id !== $scope.user.id &&
           !$scope.game.player2.id) {
          promise = $http.put('/api/games/'+$scope.game.id+'/player2',
                              $scope.user)
            .then(function(response) {
              console.log('update game player2 success', response);
              $scope.game.player2 = response.data.player2;
            }, function(response) {
              console.log('update game player2 error', response);
              return $q.reject();
            });;
        }
        defer.resolve();
        return promise;
      }).then(function() {

        $scope.game.board.window.width = window.innerHeight-5;
        $scope.game.board.window.height = window.innerHeight-5;
        window.onresize = function() {
          $scope.game.board.window.width = window.innerHeight-5;
          $scope.game.board.window.height = window.innerHeight-5;
          $scope.$apply();
        };
        console.log($scope.game.board);
        var canvas = document.getElementById('canvas');
        // console.log(canvas_rect);
        $scope.show_ruler = $scope.game.ruler.state.active;

        var KEY_CODES = {
          8: 'Backspace',
          27: 'Escape',
          33: 'PageUp',
          34: 'PageDown',
          35: 'End',
          36: 'Home',
          37: 'Left',
          38: 'Up',
          39: 'Right',
          40: 'Down',
          45: 'Insert',
          46: 'Delete',
          106: 'Multiply',
          107: 'Add',
          109: 'Substract',
          110: 'Point',
          111: 'Divide',
          59: 'SemiColon',
          61: 'Equal',
          188: 'Comma',
          189: 'Dash',
          190: 'Period',
          191: 'ForwardSlash',
          219: 'OpenBracket',
          220: 'BackSlash',
          221: 'CloseBracket',
          222: 'SingleQuote',
        };
        function keyHandler(key, event) {
          $scope.modes.send(key, $scope, event)
            .then(function() {
              if(event) event.preventDefault();
              if($scope.force.ctrl !== 'lock') $scope.force.ctrl = false;
              if($scope.force.shift !== 'lock') $scope.force.shift = false;
              if($scope.force.alt !== 'lock') $scope.force.alt = false;
            })
        }
        $scope.onKeyDown = function(event) {
          // console.log(event);
          var key;
          if((event.keyCode >= 48 &&
              event.keyCode <= 57) ||
             (event.keyCode >= 65 &&
              event.keyCode <= 90)) {
            key = String.fromCharCode(event.keyCode);
          }
          else if(event.keyCode >= 96 &&
                  event.keyCode <= 105) {
            key = String.fromCharCode(event.keyCode - 48);
          }
          else if(event.keyCode >= 112 &&
                  event.keyCode <= 120) {
            key = 'F'+String.fromCharCode(event.keyCode - 63);
          }
          else if(event.keyCode >= 121 &&
                  event.keyCode <= 123) {
            key = 'F1'+String.fromCharCode(event.keyCode - 73);
          }
          else if(_.has(KEY_CODES, event.keyCode)) {
            key = KEY_CODES[event.keyCode];
          }
          else return;
          if(event.shiftKey || $scope.force.shift) key = 'Shift ' + key;
          if(event.ctrlKey || $scope.force.ctrl) key = 'Ctrl ' + key;
          if(event.altKey || $scope.force.alt) key = 'Alt ' + key;
          // console.log(key);
          
          keyHandler(key, event);
        };
        $scope.sendKey = function(key, event, meta_keys) {
          if(meta_keys) {
            if(event.shiftKey || $scope.force.shift) key = 'Shift ' + key;
            if(event.ctrlKey || $scope.force.ctrl) key = 'Ctrl ' + key;
            if(event.altKey || $scope.force.alt) key = 'Alt ' + key;
          }
          keyHandler(key, event);
        };
        $scope.stopKeyPropagation = function(event) {
          // console.log('test', event);
          event.stopPropagation();
        };

        $scope.onModelMouseDown = function(event, model) {
          // console.log('mmd');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.width;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.height;
          if($scope.game.board.zoom.flipped) {
            user_x = 480 - user_x;
            user_y = 480 - user_y;
          }

          $scope.drag.state = 'starting';
          $scope.drag.start_x = user_x;
          $scope.drag.start_y = user_y;
          $scope.drag.event = 'Model';
          $scope.drag.target = model;
          event.stopPropagation();
        };
        $scope.onTemplateMouseDown = function(event, temp) {
          // console.log('tmd');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.width;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.height;
          if($scope.game.board.zoom.flipped) {
            user_x = 480 - user_x;
            user_y = 480 - user_y;
          }

          $scope.drag.state = 'starting';
          $scope.drag.start_x = user_x;
          $scope.drag.start_y = user_y;
          $scope.drag.event = 'Template';
          $scope.drag.target = temp;
          event.stopPropagation();
        };
        $scope.onModelClick = function(event, model) {
          // console.log('mc');
          // console.log(event);
        };
        $scope.onTemplateClick = function(event, temp) {
          // console.log('tc');
          // console.log(event);
        };

        $scope.doSelectStart = function(event) {
          // console.log('md');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.width;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.height;
          if($scope.game.board.zoom.flipped) {
            user_x = 480 - user_x;
            user_y = 480 - user_y;
          }
          $scope.drag.state = 'starting';
          $scope.drag.start_x = user_x;
          $scope.drag.start_y = user_y;
          $scope.drag.event = 'Board';
        };
        $scope.doSelectMove = function(event) {
          // console.log('mm');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.width;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.height;
          if($scope.game.board.zoom.flipped) {
            user_x = 480 - user_x;
            user_y = 480 - user_y;
          }

          if($scope.drag.state === 'draging' ||
             $scope.drag.state === 'starting') {
            var dx = user_x - $scope.drag.start_x;
            var dy = user_y - $scope.drag.start_y;
            if($scope.drag.state === 'starting' &&
               (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2)) {
              // console.log('starting -> draging');
              $scope.drag.state = 'draging';
              // console.log('DragStart', $scope.drag);
              $scope.modes.send('DragStart', $scope, event, $scope.drag, dx, dy);
            }
            else if($scope.drag.state === 'draging') {
              // console.log('draging');
              // console.log('Drag', $scope.drag);
              $scope.modes.send('Drag', $scope, event, $scope.drag,
                                user_x, user_y,
                                dx, dy);
            }
            return;
          }
          // console.log('MouseMove', $scope.drag);
          $scope.modes.send('MouseMove', $scope, event, user_x, user_y);
        };
        $scope.doSelectStop = function(event) {
          // console.log('mu');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.width;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor
              *480/$scope.game.board.window.height;
          if($scope.game.board.zoom.flipped) {
            user_x = 480 - user_x;
            user_y = 480 - user_y;
          }

          var drag_state = $scope.drag.state;
          $scope.drag.state = null;
          if(drag_state === 'draging') {
            var dx = user_x - $scope.drag.start_x;
            var dy = user_y - $scope.drag.start_y;
            // console.log('DragEnd', $scope.drag);
            $scope.modes.send('DragEnd', $scope, event, $scope.drag,
                              user_x, user_y, dx, dy);
          }
          else {
            // console.log('Click', $scope.drag);
            $scope.modes.send('Click', $scope, event, $scope.drag,
                              user_x, user_y);
          }
        };

        $scope.modelShow = function(type) {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state['show_'+type]; }) : [];
        };
        $scope.showCenteredAoE = function() {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state.show_aoe > 0; }) : [];
        };
        $scope.showArea = function() {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state.show_area > 0; }) : [];
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

        $scope.doSetUnit = function() {
          $scope.game.newCommand(command('onSelection', 'setUnit', $scope.model_view.unit));
        };

        $scope.doSetRandomSetup = function() {
          var index = Math.floor(Math.random() * $scope.scenarios.list.length);
          var new_scenario = $scope.scenarios.list[index];
          $scope.game.newCommand(command('setScenario', new_scenario));

          index = Math.floor(Math.random() * $scope.boards.list.length);
          var new_board = $scope.boards.list[index];
          $scope.game.newCommand(command('setBoard', new_board));
        };
      });
    }
  ]);
