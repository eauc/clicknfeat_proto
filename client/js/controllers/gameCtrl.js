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
    'modes',
    function($scope,
             $state,
             $stateParams,
             $http,
             $q,
             $window,
             game,
             command,
             message,
             factions,
             modes) {
      console.log('init gameCtrl');

      $scope.modes = modes;

      $scope.doToggleLosMode = function() {
        $scope.modes.send('Shift L', $scope);
      };
      $scope.doToggleRulerMode = function() {
        $scope.modes.send('Shift R', $scope);
      };

      $scope.drag = {
        start_x: 0, start_y: 0,
      };

      if(!$stateParams.id || $stateParams.id.length <= 0) $state.go('start');

      $http.get('/api/games/'+$stateParams.id).then(function(response) {
        // console.log('search game success');
        return factions.then(function() {
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
          if(event.shiftKey) key = 'Shift ' + key;
          if(event.ctrlKey) key = 'Ctrl ' + key;
          if(event.altKey) key = 'Alt ' + key;
          // console.log(key);
          
          if('Escape' === key) {
            console.log(key+' -> Reset mode');
            event.preventDefault();
            $scope.modes.goTo('default', $scope);
            return;
          }
          $scope.modes.send(key, $scope, event)
            .then(function() {
              event.preventDefault();
            })
        };
        $scope.stopKeyPropagation = function(event) {
          // console.log('test', event);
          event.stopPropagation();
        };

        $scope.onModelMouseDown = function(event, model) {
          // console.log('mmd');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor*480/800;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor*480/800;

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
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor*480/800;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor*480/800;

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
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor*480/800;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor*480/800;
          $scope.drag.state = 'starting';
          $scope.drag.start_x = user_x;
          $scope.drag.start_y = user_y;
          $scope.drag.event = 'Board';
        };
        $scope.doSelectMove = function(event) {
          // console.log('mm');
          // console.log(event);
          var elem_rect = canvas.getBoundingClientRect();
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor*480/800;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor*480/800;

          if($scope.drag.state === 'draging' ||
             $scope.drag.state === 'starting') {
            var dx = user_x - $scope.drag.start_x;
            var dy = user_y - $scope.drag.start_y;
            if($scope.drag.state === 'starting' &&
               (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
              // console.log('starting -> draging');
              $scope.drag.state = 'draging';
              console.log('DragStart', $scope.drag);
              $scope.modes.send('DragStart', $scope, event, $scope.drag, dx, dy);
            }
            else if($scope.drag.state === 'draging') {
              // console.log('draging');
              console.log('Drag', $scope.drag);
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
          var user_x = (event.clientX-elem_rect.left)/$scope.game.board.zoom.factor*480/800;
          var user_y = (event.clientY-elem_rect.top)/$scope.game.board.zoom.factor*480/800;

          var drag_state = $scope.drag.state;
          $scope.drag.state = null;
          if(drag_state === 'draging') {
            var dx = user_x - $scope.drag.start_x;
            var dy = user_y - $scope.drag.start_y;
            console.log('DragEnd', $scope.drag);
            $scope.modes.send('DragEnd', $scope, event, $scope.drag,
                              user_x, user_y, dx, dy);
          }
          else {
            console.log('Click', $scope.drag);
            $scope.modes.send('Click', $scope, event, $scope.drag,
                              user_x, user_y);
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

        $scope.model = {
          faction: null,
          type: null,
          unit: null,
          unit_entry: null,
          id: null,
          size: 1,
          info: [],
        };
        $scope.$watch('model', function(val, old) {
          if($scope.modes.current === modes['model_create']) {
            $scope.modes.current = default_mode;
          }
        }, true);
        $scope.doToggleCreateModel = function() {
          $scope.modes.current = ($scope.modes.current === modes['model_create']) ?
            default_mode : modes['model_create'];
          if($scope.modes.current !== modes['model_create']) return;

          modes['model_create'].info = [];
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
            modes['model_create'].info.push({
              info: $scope.model.id,
              offset_x: offset_x,
              offset_y: offset_y
            });
          });
        };

        $scope.modelShow = function(type) {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state['show_'+type]; }) : [];
        };
        $scope.showCenteredAoE = function() {
          return $scope.game ? 
            _.filter($scope.game.models, function(model) { return model.state.show_aoe > 0; }) : [];
        };

        $scope.fk_read_result = [];
        $scope.fk_read_string = '';
        function importFKList(data) {
          // console.log(data);
          var lines = data.match(/[^\r\n]+/g);
          modes['model_create'].info = [];
          // console.log(lines);
          var i = 0;
          var global_offset_x = 0;
          var global_offset_y = 0;
          _.each(lines, function(line) {
            if(line.match(/^(System:|Faction:|Casters:|Points:|Tiers:)/)) {
              return;
            }
            line = line.replace(/^\s*/,'');
            if(line.length === 0) return;
            line = line.replace(/^\*+ /,'');
            var size = 1;
            var match = line.match(/^(\d+) /);
            if(match) {
              size = match[1] >> 0;
              line = line.replace(/^\d+ /,'');
            }                
            match = line.match(/\((\d+)\s.+?\)/i);
            if(match) {
              size = (match[1] >> 0);
            }                
            match = line.match(/\(leader and (\d+) grunts?\)/i);
            if(match) {
              size = (match[1] >> 0) + 1;
            }                
            line = line.replace(/\s*\(.+\)\s*$/,'');
            // console.log(line);
            if(_.isArray($scope.factions.fk_keys[line]) &&
               $scope.factions.fk_keys[line].length > 0) {
              // console.log(size);

              if($scope.factions.fk_keys[line].length > 1) {
                _.each($scope.factions.fk_keys[line], function(id) {
                  modes['model_create'].info.push({
                    info: id,
                    offset_x: global_offset_x + 1.25*$scope.factions.fk_keys[line][0].r,
                    offset_y: global_offset_y
                  });
                  global_offset_x += 2.5*$scope.factions.fk_keys[line][0].r;
                  if(global_offset_x > 360) {
                    global_offset_x = 0;
                    global_offset_y = 55;
                  }
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
                    offset_y = global_offset_y;
                  }
                  else {
                    offset_x = (i%mid_size)*unit_step+unit_step/2;
                    offset_y = global_offset_y + ((n >= mid_size) ? unit_step : 0);
                  }
                  max_offset_x = Math.max(max_offset_x, offset_x);
                  modes['model_create'].info.push({
                    info: $scope.factions.fk_keys[line][0],
                    offset_x: global_offset_x + offset_x,
                    offset_y: offset_y,
                    show_leader: (size > 1 && n === 0)
                  });
                  i++;
                });
                global_offset_x += max_offset_x + unit_step/2;
                if(global_offset_x > 360) {
                  global_offset_x = 0;
                  global_offset_y = 55;
                }
              }
            }
            else {
              $scope.fk_read_result.push('!!! unknown model \"'+line+'\"');
            }
          });
          // console.log(modes['model_create'].info);
          if(i > 0) $scope.modes.goTo('model_create', $scope);
        }
        $scope.readFKFile = function(file) {
          $scope.modes.goTo('default', $scope);
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
          $scope.modes.goTo('default', $scope);
          $scope.fk_read_result = [];
          importFKList($scope.fk_read_string);
        };

        $scope.doSetLabel = function() {
          $scope.game.newCommand(command('onSelection', 'setLabel', $scope.model_label));
          $scope.model_label = '';
        };
        $scope.doResetAllModelDamage = function() {
          $scope.game.newCommand(command('onSelection', 'resetAllDamage'));
        };


        $scope.doCreateTemplate = function(type, size) {
          modes['template_create'].type = type;
          modes['template_create'].size = size;
          modes['template_create'].x = 240;
          modes['template_create'].y = 240;
          $scope.modes.goTo('template_create', $scope);
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

        $scope.hideLos = function() {
          if($scope.game.los.state.active) {
            $scope.game.newCommand(command('onLos', 'setActive', false));
          }
        };
      });
    }
  ]);
