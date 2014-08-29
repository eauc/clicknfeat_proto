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

      var default_mode = {
        name: 'Default',
        'Alt B': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_blind;
            $scope.game.newCommand(command('onSelection', 'toggle', 'blind', new_val));
          }
        },
        'Alt C': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_corrosion;
            $scope.game.newCommand(command('onSelection', 'toggle', 'corrosion', new_val));
          }
        },
        'Ctrl C': function() {
          if($scope.game.selection.length > 0) {
            $scope.create_model_preview.info = [];
            var x_ref = $scope.game.models[$scope.game.selection[0]].state.x;
            var y_ref = $scope.game.models[$scope.game.selection[0]].state.y;
            $scope.create_model_preview.x = x_ref+10;
            $scope.create_model_preview.y = y_ref+10;
            _.each($scope.game.selection, function(id) {
              var offset_x = $scope.game.models[id].state.x - x_ref;
              var offset_y = $scope.game.models[id].state.y - y_ref;
              $scope.create_model_preview.info.push({
                info: $scope.game.models[id].info,
                offset_x: offset_x,
                offset_y: offset_y
              });
            });
            $scope.current_mode = model_create_mode;
          }
        },
        'Shift C': function() {
          if($scope.game.selection.length === 1 &&
             ($scope.game.models[$scope.game.selection[0]].info.focus ||
              $scope.game.models[$scope.game.selection[0]].info.fury)) {
            $scope.game.newCommand(command('onSelection', 'toggleControl'));
          }
        },
        'Ctrl E': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'setRotation', 90));
          }
        },
        'F': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'focus'));
          }
        },
        'Alt F': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_fire;
            $scope.game.newCommand(command('onSelection', 'toggle', 'fire', new_val));
          }
        },
        'I': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'image'));
          }
        },
        'Alt I': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_incorporeal;
            $scope.game.newCommand(command('onSelection', 'toggle', 'incorporeal', new_val));
          }
        },
        'Alt K': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_kd;
            $scope.game.newCommand(command('onSelection', 'toggle', 'kd', new_val));
          }
        },
        'Shift L': function() {
          $scope.current_mode = los_mode;
        },
        'M': function() {
          if($scope.game.selection.length > 0) {
              var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_melee;
              $scope.game.newCommand(command('onSelection', 'toggle', 'melee', new_val));
          }
        },
        'Ctrl N': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'setRotation', 0));
          }
        },
        'Alt P': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_leader;
            $scope.game.newCommand(command('onSelection', 'toggle', 'leader', new_val));
          }
        },
        'R': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_reach;
            $scope.game.newCommand(command('onSelection', 'toggle' ,'reach', new_val));
          }
        },
        'Shift R': function() {
          $scope.current_mode = ruler_mode;
        },
        'Alt S': function() {
          if($scope.game.selection.length > 0) {
            var new_val = !$scope.game.models[$scope.game.selection[0]].state.show_stationary;
            $scope.game.newCommand(command('onSelection', 'toggle', 'stationary', new_val));
          }
        },
        'Ctrl S': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'setRotation', 180));
          }
        },
        'T': function() {
          $scope.current_mode = model_target_mode;
        },
        'U': function() {
          $scope.game.newCommand(command('setSelection', []));
        },
        'Ctrl W': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'setRotation', 270));
          }
        },
        'Ctrl Z': function() {
          $scope.game.undoLastCommand();
        },
        'Alt 0': function() {
          $scope.game.board.reset();
        },
        'Ctrl 0': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', false));
          }
        },
        'Ctrl 1': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', '#0FF'));
          }
        },
        'Ctrl 2': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', '#F0F'));
          }
        },
        '3': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggleAoe', 3));
          }
        },
        'Ctrl 3': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', '#FF0'));
          }
        },
        '4': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggleAoe', 4));
          }
        },
        'Ctrl 4': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', '#00F'));
          }
        },
        '5': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggleAoe', 5));
          }
        },
        'Ctrl 5': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', '#0F0'));
          }
        },
        'Ctrl 6': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'toggle', 'color', '#F00'));
          }
        },
        'Delete': function() {
          $scope.game.newCommand(command('dropSelection'));
        },
        'Add': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'incrementFocus'));
          }
        },
        'Alt Add': function() {
          $scope.game.board.zoomIn();
        },
        'Substract': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'decrementFocus'));
          }
        },
        'Alt Substract': function() {
          $scope.game.board.zoomOut();
        },
        'Left': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'rotateLeft', false));
          }
        },
        'Shift Left': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'rotateLeft', true));
          }
        },
        'Alt Left': function() {
          $scope.game.board.moveLeft();
        },
        'Ctrl Left': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveLeft', false));
          }
        },
        'Ctrl Shift Left': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveLeft', true));
          }
        },
        'Down': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveBack', false));
          }
        },
        'Shift Down': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveBack', true));
          }
        },
        'Alt Down': function() {
          $scope.game.board.moveDown();
        },
        'Ctrl Down': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveDown', false));
          }
        },
        'Ctrl Shift Down': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveDown', true));
          }
        },
        'Right': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'rotateRight', false));
          }
        },
        'Shift Right': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'rotateRight', true));
          }
        },
        'Alt Right': function() {
          $scope.game.board.moveRight();
        },
        'Ctrl Right': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveRight', false));
          }
        },
        'Ctrl Shift Right': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveRight', true));
          }
        },
        'Up': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveFront', false));
          }
        },
        'Shift Up': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveFront', true));
          }
        },
        'Alt Up': function() {
          $scope.game.board.moveUp();
        },
        'Ctrl Up': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveUp', false));
          }
        },
        'Ctrl Shift Up': function() {
          if($scope.game.selection.length > 0) {
            $scope.game.newCommand(command('onSelection', 'moveUp', true));
          }
        },
        // ------------------------------------------------------------------
        'DragStart': function(event, drag, dx, dy) {
          switch(drag.event)
          {
          case 'Template':
            {
              $scope.game.templates.active = drag.target;
              drag.target.startDraging();

              $scope.current_mode = template_drag_mode;
              break;
            }
          case 'Model':
            {
              // si la selection est vide, ajouter le model a la selection
              if(0 <= _.indexOf($scope.game.selection, drag.target.state.id)) {
                $scope.game.onSelection('startDraging');
                model_drag_mode.length = 0;

                model_drag_mode.start_x = drag.target.state.x;
                model_drag_mode.start_y = drag.target.state.y;
                model_drag_mode.end_x = drag.target.state.x;
                model_drag_mode.end_y = drag.target.state.y;
                model_drag_mode.length = '';
                $scope.current_mode = model_drag_mode;
              }
              break;
            }
          case 'Board':
            {
              $scope.selection.width = 0;
              $scope.selection.height = 0;

              $scope.current_mode = selection_drag_mode;
              break;
            }
          }
        },
        'Click': function(event, drag, user_x, user_y, dx, dy) {
          switch(drag.event)
          {
          case 'Model':
            {
              if(event.ctrlKey) {
                if(0 <= _.indexOf($scope.game.selection, drag.target.state.id)) {
                  $scope.game.newCommand(command('removeFromSelection', [drag.target.state.id]));
                }
                else {
                  $scope.game.newCommand(command('addToSelection', [drag.target.state.id]));
                }
              }
              else {
                $scope.game.newCommand(command('setSelection', [drag.target.state.id]));
              }
              if($scope.game.selection.length > 0) {
                $scope.model_label = $scope.game.models[$scope.game.selection[0]].state.label;
              }
              break;
            }
          case 'Template':
            {
              $scope.game.templates.active = drag.target;
              $scope.current_mode = template_mode;
              break;
            }
          }
        },
      };
      ////////////////////////////////////////////////////////////////////
      var selection_drag_mode = {
        name: 'Selection Drag',
        'Drag': function(event, drag, user_x, user_y, dx, dy) {
          $scope.selection.x = drag.start_x;
          $scope.selection.width = dx;
          if($scope.selection.width < 0) {
            $scope.selection.width = -$scope.selection.width;
            $scope.selection.x = $scope.selection.x - $scope.selection.width;
          }
          $scope.selection.y = drag.start_y;
          $scope.selection.height = dy;
          if($scope.selection.height < 0) {
            $scope.selection.height = -$scope.selection.height;
            $scope.selection.y = $scope.selection.y - $scope.selection.height;
          }
        },
        'DragEnd': function(event, drag, user_x, user_y, dx, dy) {
          this['Drag'].apply(this, Array.prototype.slice.call(arguments));

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
            if(event.ctrlKey) {
              $scope.game.newCommand(command('addToSelection', models_selected));
              if($scope.game.selection.length > 0) {
                $scope.model_label = $scope.game.models[$scope.game.selection[0]].state.label;
              }
            }
            else {
              $scope.game.newCommand(command('setSelection', models_selected));
              if($scope.game.selection.length > 0) {
                $scope.model_label = $scope.game.models[$scope.game.selection[0]].state.label;
              }
            }
          }
          $scope.selection.width = 0;
          $scope.selection.height = 0;

          $scope.current_mode = default_mode;
        },
      };
      ////////////////////////////////////////////////////////////////////
      var model_create_mode = {
        name: 'Model Create',
        'MouseMove': function(event, user_x, user_y) {
          $scope.create_model_preview.x = user_x;
          $scope.create_model_preview.y = user_y;
        },
        'Click': function(event, drag, user_x, user_y) {
          var create_options = [];
          _.each($scope.create_model_preview.info, function(info) {
            create_options.push({
              info: info.info,
              x: user_x+info.offset_x,
              y: user_y+info.offset_y,
              show_leader: info.show_leader
            });
          });
          $scope.game.newCommand(command('createModel',
                                         create_options));

          $scope.current_mode = default_mode;
        },
      };
      var model_drag_mode = {
        name: 'Model Drag',
        'Drag': function(event, drag, user_x, user_y, dx, dy) {
          $scope.game.onSelection('draging', dx, dy);
          this.end_x = this.start_x + dx;
          this.end_y = this.start_y + dy;
          this.length = ((Math.sqrt(dx*dx+dy*dy) * 10) >> 0) / 100;
        },
        'DragEnd': function(event, drag, user_x, user_y, dx, dy) {
          $scope.game.newCommand(command('endDragingSelection', dx, dy));

          $scope.current_mode = default_mode;
        },
      };
      var model_target_mode = {
        name: 'Model Target',
        'Click': function(event, drag) {
          if(drag.event === 'Model' &&
             0 > _.indexOf($scope.game.selection, drag.target.state.id)) {
            $scope.game.newCommand(command('onSelection', 'alignWith',
                                           drag.target.state.x, drag.target.state.y));
            $scope.current_mode = default_mode;
          }
        },
      };
      ////////////////////////////////////////////////////////////////////
      var template_mode = {
        name: 'Template',
        'D': function() {
          if($scope.game.templates.active.type === 'aoe' &&
             !$scope.game.templates.active.locked) {
            $scope.doAoEDeviation();
          }
        },
        'L': function() {
          $scope.game.newCommand(command('onActiveTemplate', 'toggleLocked'));
        },
        'O': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.current_mode = template_origin_mode;
          }
        },
        'R': function() {
          if($scope.game.ruler.state.active &&
             !$scope.game.templates.active.locked) {
            var x = $scope.game.ruler.model_end ? 
                $scope.game.ruler.model_end.state.x : $scope.game.ruler.state.x2;
            var y = $scope.game.ruler.model_end ? 
                $scope.game.ruler.model_end.state.y : $scope.game.ruler.state.y2;
            // console.log($scope.game.ruler.state);
            var rot = Math.atan2($scope.game.ruler.state.x2-$scope.game.ruler.state.x1,
                                 -($scope.game.ruler.state.y2-$scope.game.ruler.state.y1)) *
                180 / Math.PI;
            $scope.game.newCommand(command('onActiveTemplate', 'set', x, y, rot));
          }
        },
        'T': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.current_mode = template_target_mode;
          }
        },
        '0': function() {
          if($scope.game.templates.active.type === 'spray' &&
             !$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 10));
          }
        },
        '3': function() {
          if($scope.game.templates.active.type === 'aoe' &&
             !$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 3));
          }
        },
        '4': function() {
          if($scope.game.templates.active.type === 'aoe' &&
             !$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 4));
          }
        },
        '5': function() {
          if($scope.game.templates.active.type === 'aoe' &&
             !$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 5));
          }
        },
        '6': function() {
          if($scope.game.templates.active.type === 'spray' &&
             !$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 6));
          }
        },
        '8': function() {
          if($scope.game.templates.active.type === 'spray' &&
             !$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'toggleSize', 8));
          }
        },
        'Delete': function() {
          $scope.game.newCommand(command('deleteActiveTemplate'));
        },
        'Up': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveFront', false));
          }
        },
        'Shift Up': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveFront', true));
          }
        },
        'Ctrl Up': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveUp', false));
          }
        },
        'Ctrl Shift Up': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveUp', true));
          }
        },
        'Left': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'rotateLeft', false));
          }
        },
        'Shift Left': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'rotateLeft', true));
          }
        },
        'Ctrl Left': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveLeft', false));
          }
        },
        'Ctrl Shift Left': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveLeft', true));
          }
        },
        'Right': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'rotateRight', false));
          }
        },
        'Shift Right': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'rotateRight', true));
          }
        },
        'Ctrl Right': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveRight', false));
          }
        },
        'Ctrl Shift Right': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveRight', true));
          }
        },
        'Down': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveBack', false));
          }
        },
        'Shift Down': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveBack', true));
          }
        },
        'Ctrl Down': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveDown', false));
          }
        },
        'Ctrl Shift Down': function() {
          if(!$scope.game.templates.active.locked) {
            $scope.game.newCommand(command('onActiveTemplate', 'moveDown', true));
          }
        },
        // ------------------------------------------------------------------
        'DragStart': function(event, drag, dx, dy) {
          if(drag.event === 'Template') {
            $scope.game.templates.active = drag.target;
            drag.target.startDraging();

            $scope.current_mode = template_drag_mode;
          }
        },
        'Click': function(event, drag, dx, dy) {
          switch(drag.event)
          {
          case 'Template': 
            {
              if($scope.game.templates.active === drag.target) {
                $scope.game.templates.active = null;
                $scope.current_mode = default_mode;
              }
              else {
                $scope.game.templates.active = drag.target;
              }
              break;
            }
          case 'Model':
            {
              $scope.game.templates.active = null;
              default_mode['Click'].apply(default_mode,
                                          Array.prototype.slice.call(arguments));
              $scope.current_mode = default_mode;
            }
          }
        },
      };
      var template_drag_mode = {
        name: 'Template Drag',
        'Drag': function(event, drag, user_x, user_y, dx, dy) {
          $scope.game.templates.active.draging($scope.game, dx, dy);
        },
        'DragEnd': function(event, drag, user_x, user_y, dx, dy) {
          $scope.game.newCommand(command('dragActiveTemplate', dx, dy));

          $scope.game.templates.active = drag.target;
          $scope.current_mode = template_mode;
        },
      };
      var template_origin_mode = {
        name: 'Template Origin',
        'Click': function(event, drag) {
          if(drag.event === 'Model') {
            var model = drag.target;
            var active = $scope.game.templates.active;
            if(active.type === 'aoe') {
              var x1 = model.state.x;
              var y1 = model.state.y;
              var x2 = active.x;
              var y2 = active.y;
              var angle = Math.atan2(x2-x1, y1-y2)*180/Math.PI;
              $scope.game.newCommand(command('onActiveTemplate', 'set',
                                             active.x, active.y, angle));
            }
            else {
              active.origin = model;
              var x = model.state.x +
                  model.info.r * Math.sin(active.rot*Math.PI/180);
              var y = model.state.y -
                  model.info.r * Math.cos(active.rot*Math.PI/180);
              $scope.game.newCommand(command('onActiveTemplate', 'set',
                                             x, y, active.rot));
            }
            $scope.current_mode = template_mode;
          }
        },
      };
      var template_target_mode = {
        name: 'Template Target',
        'Click': function(event, drag) {
          if(drag.event === 'Model') {
            var model = drag.target;
            var active = $scope.game.templates.active;
            var x;
            var y;
            if(active.type === 'aoe') {
              x = model.state.x;
              y = model.state.y;
              $scope.game.newCommand(command('onActiveTemplate', 'set',
                                             x, y, $scope.game.templates.active.rot));
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
              $scope.game.newCommand(command('onActiveTemplate', 'set',
                                             x, y, angle));
            }
            $scope.current_mode = template_mode;
          }
        },
      };
      var template_create_mode = {
        name: 'Template Create',
        'MouseMove': function(event, user_x, user_y) {
          $scope.create_template_preview.x = user_x;
          $scope.create_template_preview.y = user_y;
        },
        'Click': function(event, click, user_x, user_y) {
          $scope.create_template_preview.x = user_x;
          $scope.create_template_preview.y = user_y;
          $scope.game.newCommand(command('createTemplate', $scope.create_template_preview));

          $scope.current_mode = template_mode;
        },
      };
      ////////////////////////////////////////////////////////////////////
      $scope.doToggleLosMode = function() {
        if(_.has($scope.current_mode, 'Shift L')) {
          $scope.current_mode['Shift L']();
        }
      };
      var los_mode = {
        name: 'LoS',
        'Shift L': function() {
          if($scope.game.los.state.active) {
            $scope.game.newCommand(command('onLos', 'setActive', false));
          }
          $scope.current_mode = default_mode;
        },
        'DragStart': function(event, drag, user_x, user_y) {
          $scope.game.los.startDraging(drag.start_x, drag.start_y);
          $scope.current_mode = los_drag_mode;
        },
      };
      var los_drag_mode = {
        name: 'LoS Drag',
        'Drag': function(event, drag, user_x, user_y) {
          $scope.game.los.setEnd(user_x, user_y);
        },
        'DragEnd': function(event, drag, user_x, user_y) {
          $scope.game.newCommand(command('onLos', 'endDraging', user_x, user_y));
          $scope.current_mode = los_mode;
        },
      };
      ////////////////////////////////////////////////////////////////////
      $scope.doToggleRulerMode = function() {
        if(_.has($scope.current_mode, 'Shift R')) {
          $scope.current_mode['Shift R']();
        }
      };
      var ruler_mode = {
        name: 'Ruler',
        'O': function() {
          ruler_origin_mode.origin = this.origin;
          ruler_origin_mode.target = this.target;
          $scope.current_mode = ruler_origin_mode;
        },
        'Shift R': function() {
          $scope.current_mode = default_mode;
        },
        'T': function() {
          ruler_target_mode.origin = this.origin;
          ruler_target_mode.target = this.target;
          $scope.current_mode = ruler_target_mode;
        },
        'DragStart': function(event, drag) {
          this.origin = null;
          this.target = null;
          $scope.game.ruler.startDraging(drag.start_x, drag.start_y);
          $scope.show_ruler = true;
          $scope.current_mode = ruler_drag_mode;
        },
      };
      var ruler_drag_mode = {
        name: 'Ruler Drag',
        'Drag': function(event, drag, user_x, user_y, dx, dy) {
          var length = Math.sqrt(dx*dx + dy*dy);
          var display_length = length;
          if($scope.game.ruler.state.range > 0) {
            display_length = Math.min($scope.game.ruler.state.range*10, length);
          }
          var x = $scope.game.ruler.state.x1 +
              (user_x - $scope.game.ruler.state.x1) * display_length / length;
          var y = $scope.game.ruler.state.y1 +
              (user_y - $scope.game.ruler.state.y1) * display_length / length;
          $scope.game.ruler.setEnd(x, y);
        },
        'DragEnd': function(event, drag, user_x, user_y, dx, dy) {
          var length = Math.sqrt(dx*dx + dy*dy);
          var display_length = length;
          if($scope.game.ruler.state.range > 0) {
            display_length = Math.min($scope.game.ruler.state.range*10, length);
          }
          var x = $scope.game.ruler.state.x1 +
              (user_x - $scope.game.ruler.state.x1) * display_length / length;
          var y = $scope.game.ruler.state.y1 +
              (user_y - $scope.game.ruler.state.y1) * display_length / length;
          $scope.game.ruler.endDraging(x, y);

          $scope.current_mode = ruler_mode;
        },
      };      
      var ruler_origin_mode = {
        name: 'Ruler Origin',
        'Click': function(event, drag) {
          if(drag.event !== 'Model') return;
          var model = drag.target;
          ruler_mode.origin = model;
          $scope.game.ruler.setStart(model.state.x, model.state.y);
          $scope.game.ruler.state.active = false;
          ruler_mode.target = null;
          $scope.game.ruler.sendStateCmd();

          $scope.current_mode = ruler_mode;
        },
      };
      var ruler_target_mode = {
        name: 'Ruler Target',
        'Click': function(event, drag) {
          if(drag.event !== 'Model') return;
          var model = drag.target;

          if(ruler_mode.origin === model) return;

          ruler_mode.target = model;
          var ruler = $scope.game.ruler;
          var start_x = ruler.state.x1;
          var start_y = ruler.state.y1;
          var end_x = model.state.x;
          var end_y = model.state.y;
          if(ruler_mode.origin) {
            start_x = ruler_mode.origin.state.x;
            start_y = ruler_mode.origin.state.y;
          }
          var angle = Math.atan2(end_x-start_x, start_y-end_y);
          if(ruler_mode.origin) {
            start_x += ruler_mode.origin.info.r * Math.sin(angle);
            start_y -= ruler_mode.origin.info.r * Math.cos(angle);
          }
          end_x -= model.info.r * Math.sin(angle);
          end_y += model.info.r * Math.cos(angle);
          var dx = end_x - start_x;
          var dy = end_y - start_y;
          var length = Math.sqrt(dx*dx + dy*dy);
          var display_length = length;
          if($scope.game.ruler.state.range > 0) {
            display_length = Math.min($scope.game.ruler.state.range*10, length);
          }
          end_x = start_x + (end_x - start_x) * display_length / length;
          end_y = start_y + (end_y - start_y) * display_length / length;
          $scope.game.ruler.setStart(start_x, start_y);
          $scope.game.ruler.setEnd(end_x, end_y);
          $scope.game.ruler.refresh();
          $scope.game.ruler.state.active = true;
          $scope.game.ruler.sendStateCmd();

          $scope.current_mode = ruler_mode;
        },
      };
      ////////////////////////////////////////////////////////////////////

      $scope.current_mode = default_mode;

      $scope.selection = {
        active: false,
        x: 10, y: 10,
        start_x: 10, start_y: 10,
        width: 0, height: 0,
      };
      $scope.drag = {
        start_x: 0, start_y: 0,
      };
      // $scope.ruler_drag = {
      //   active: false,
      //   start_x: 0, start_y: 0,
      //   origin: null,
      //   target: null,
      // };
      // $scope.los_drag = {
      //   active: false,
      //   start_x: 0, start_y: 0,
      // };
      // $scope.model_drag = {
      //   active: false,
      //   start: {
      //     x: null,
      //     y: null,
      //   },
      //   end: {
      //     x: null,
      //     y: null,
      //   },
      //   length: 0,
      // };
      // $scope.template_drag = {
      //   active: false,
      //   start: {
      //     x: null,
      //     y: null,
      //   },
      //   ref: {
      //     x: null,
      //     y: null,
      //   }
      // };
      // $scope.mode_model_target = false;
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
          console.log(key);
          
          if('Escape' === key) {
            console.log(key+' -> Reset mode');
            event.preventDefault();
            $scope.current_mode = default_mode;
            return;
          }
          if(_.has($scope.current_mode, key)) {
            console.log(key);
            event.preventDefault();
            $scope.current_mode[key](event);
            return;
          }
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
              if(_.has($scope.current_mode, 'DragStart')) {
                $scope.current_mode['DragStart'](event, $scope.drag, dx, dy);
              }
            }
            else if($scope.drag.state === 'draging') {
              // console.log('draging');
              console.log('Drag', $scope.drag);
              if(_.has($scope.current_mode, 'Drag')) {
                $scope.current_mode['Drag'](event, $scope.drag,
                                            user_x, user_y,
                                            dx, dy);
              }
            }
            return;
          }
          // console.log('MouseMove', $scope.drag);
          if(_.has($scope.current_mode, 'MouseMove')) {
            $scope.current_mode['MouseMove'](event, user_x, user_y);
          }
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
            if(_.has($scope.current_mode, 'DragEnd')) {
              $scope.current_mode['DragEnd'](event, $scope.drag,
                                             user_x, user_y, dx, dy);
            }
          }
          else {
            console.log('Click', $scope.drag);
            if(_.has($scope.current_mode, 'Click')) {
              $scope.current_mode['Click'](event, $scope.drag,
                                           user_x, user_y);
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

        $scope.model = {
          faction: null,
          type: null,
          unit: null,
          unit_entry: null,
          id: null,
          size: 1,
          info: [],
        };
        $scope.create_model_preview = {
          x: 0,
          y: 0,
          info: null,
        };
        $scope.$watch('model', function(val, old) {
          if($scope.current_mode === model_create_mode) {
            $scope.current_mode = default_mode;
          }
        }, true);
        $scope.doToggleCreateModel = function() {
          $scope.current_mode = ($scope.current_mode === model_create_mode) ?
            default_mode : model_create_mode;
          if($scope.current_mode !== model_create_mode) return;

          $scope.create_model_preview.info = [];
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
            $scope.create_model_preview.info.push({
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
          $scope.create_model_preview.info = [];
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
                  $scope.create_model_preview.info.push({
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
                  $scope.create_model_preview.info.push({
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
          // console.log($scope.create_model_preview.info);
          if(i > 0) $scope.current_mode = model_create_mode;
        }
        $scope.readFKFile = function(file) {
          $scope.current_mode = default_mode;
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
          $scope.current_mode = default_mode;
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

        $scope.create_template_mode = false;
        $scope.mode_template_origin = false;
        $scope.mode_template_target = false;
        $scope.create_template_preview = {
          type: null,
          size: 0,
          origin: null,
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
          $scope.current_mode = template_create_mode;
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
