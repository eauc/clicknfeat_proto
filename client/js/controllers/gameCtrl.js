'use strict';

angular.module('vassalApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$q',
    function($scope,
             $state,
             $stateParams,
             $http,
             $q) {
      console.log('init gameCtrl');
      if(!$stateParams.id || $stateParams.id.length <= 0) $state.go('start');

      var model_base = {
        moveLeft: function(rotate) {
          if(rotate) {
            this.state.rot = this.state.rot - 30;
          }
          else {
            this.state.x = Math.max(-(this.img.height/2)+this.img.r,
                                    this.state.x - 10);
          }
        },
        moveUp: function(rotate) {
          this.state.y = Math.max(-(this.img.height/2)+this.img.r,
                                  this.state.y - 10);
        },
        moveRight: function(rotate) {
          if(rotate) {
            this.state.rot = this.state.rot + 30;
          }
          else {
            this.state.x = Math.min($scope.board.width
                                    -(this.img.height/2)
                                    -this.img.r,
                                    this.state.x + 10);
          }
        },
        moveDown: function(rotate) {
          this.state.y = Math.min($scope.board.height
                                  -(this.img.width/2)
                                  -this.img.r,
                                  this.state.y + 10);
        }
      };

      var selected_model = [];
      $http.get('/api/games/'+$stateParams.id).then(function(response) {
        console.log('search game success');
        $scope.game = response.data;
        $scope.models= $scope.game.models;
        console.log($scope.game);
        
        _.each($scope.models, function(model) {
          _.extend(model, model_base);
          if(model.state.active) {
            selected_model.push(model);
          }
        });
      }, function(response) {
        console.log('search game error');
        console.log(response);
        $state.go('start');
        return $q.reject();
      }).then(function() {

        var evt_source = new EventSource('/api/games/'+$scope.game.id+
                                         '/models/subscribe');
        evt_source.onmessage = function(e) {
          var state = JSON.parse(e.data);
          console.log(state);
          $scope.models[state.id].state = state;
          $scope.$apply();
        }
        evt_source.onerror = function(e) {
          console.log('evtSource error');
          console.log(e);
        }

        $scope.board = {
          width:480,
          height: 480,
          zoom: {
            factor: 1.0,
            cx: 240,
            cy: 240
          },
          view: {
            x: 0,
            y: 0,
            width: 480,
            height: 480
          }
        };

        var canvas = document.getElementById('canvas');
        console.log(canvas);

        $scope.onKey = function(event) {
          // console.log(event);
          switch(event.keyCode) {
          case 33: // pageUp
            {
              $scope.board.zoom.factor *= 2;
              $scope.board.view.width = $scope.board.width / $scope.board.zoom.factor;
              $scope.board.view.height = $scope.board.height / $scope.board.zoom.factor;
              $scope.board.view.x = $scope.board.zoom.cx - $scope.board.view.width / 2;
              $scope.board.view.y = $scope.board.zoom.cy - $scope.board.view.height / 2;
              return;
            }
          case 34: // pageDown
            {
              $scope.board.zoom.factor /= 2;
              $scope.board.view.width = $scope.board.width / $scope.board.zoom.factor;
              $scope.board.view.height = $scope.board.height / $scope.board.zoom.factor;
              $scope.board.view.x = $scope.board.zoom.cx - $scope.board.view.width / 2;
              $scope.board.view.y = $scope.board.zoom.cy - $scope.board.view.height / 2;
              return;
            }
          }
          if(event.shiftKey) {
            switch(event.keyCode) {
            case 37: // leftArrow
              {
                $scope.board.zoom.cx = Math.max($scope.board.view.width/2,
                                                $scope.board.zoom.cx-10);
                $scope.board.view.width = $scope.board.width / $scope.board.zoom.factor;
                $scope.board.view.height = $scope.board.height / $scope.board.zoom.factor;
                $scope.board.view.x = $scope.board.zoom.cx - $scope.board.view.width / 2;
                $scope.board.view.y = $scope.board.zoom.cy - $scope.board.view.height / 2;
                return;
              }
            case 38: // upArrow
              {
                $scope.board.zoom.cy = Math.max($scope.board.view.height/2,
                                                $scope.board.zoom.cy-10);
                $scope.board.view.width = $scope.board.width / $scope.board.zoom.factor;
                $scope.board.view.height = $scope.board.height / $scope.board.zoom.factor;
                $scope.board.view.x = $scope.board.zoom.cx - $scope.board.view.width / 2;
                $scope.board.view.y = $scope.board.zoom.cy - $scope.board.view.height / 2;
                return;
              }
            case 39: // rightArrow
              {
                $scope.board.zoom.cx = Math.min($scope.board.width - $scope.board.view.width/2,
                                                $scope.board.zoom.cx+10);
                $scope.board.view.width = $scope.board.width / $scope.board.zoom.factor;
                $scope.board.view.height = $scope.board.height / $scope.board.zoom.factor;
                $scope.board.view.x = $scope.board.zoom.cx - $scope.board.view.width / 2;
                $scope.board.view.y = $scope.board.zoom.cy - $scope.board.view.height / 2;
                return;
              }
            case 40: // downArrow
              {
                $scope.board.zoom.cy = Math.min($scope.board.height - $scope.board.view.height/2,
                                                $scope.board.zoom.cy+10);
                $scope.board.view.width = $scope.board.width / $scope.board.zoom.factor;
                $scope.board.view.height = $scope.board.height / $scope.board.zoom.factor;
                $scope.board.view.x = $scope.board.zoom.cx - $scope.board.view.width / 2;
                $scope.board.view.y = $scope.board.zoom.cy - $scope.board.view.height / 2;
                return;
              }
            }
          }
          if(37 > event.keyCode ||
             40 < event.keyCode) return;
          if(undefined !== selected_model) {
            switch(event.keyCode) {
            case 37: // leftArrow
              {
                _.each(selected_model, function(model) {
                  model.moveLeft(event.ctrlKey);
                });
                break;
              }
            case 38: // upArrow
              {
                _.each(selected_model, function(model) {
                  model.moveUp(event.ctrlKey);
                });
                break;
              }
            case 39: // rightArrow
              {
                _.each(selected_model, function(model) {
                  model.moveRight(event.ctrlKey);
                });
                break;
              }
            case 40: // downArrow
              {
                _.each(selected_model, function(model) {
                  model.moveDown(event.ctrlKey);
                });
                break;
              }
            }
            _.each(selected_model, function(model) {
              console.log(model.state);
              $http.put('/api/games/'+$scope.game.id+
                        '/models/'+model.state.id,
                        model.state)
                .then(function(response) {
                  console.log('put model '+model.state.id+' success')
                }, function(response) {
                  console.log('put model '+model.state.id+' error '+response.status)
                });
            });
          }
        };
        $scope.onModelClick = function(event, model) {
          console.log(event);
          console.log(model);
          if(!event.ctrlKey) {
            _.each(selected_model, function(model) {
              model.state.active = false;
              $http.put('/api/games/'+$scope.game.id+
                        '/models/'+model.state.id,
                        model.state)
                .then(function(response) {
                  console.log('put model '+model.state.id+' success')
                }, function(response) {
                  console.log('get model '+model.state.id+' error '+response.status)
                });
            });
            selected_model.length = 0;
          }
          selected_model.push(model);
          model.state.active = true;
          $http.put('/api/games/'+$scope.game.id+
                    '/models/'+model.state.id,
                    model.state)
            .then(function(response) {
              console.log('put model '+model.state.id+' success')
            }, function(response) {
              console.log('get model '+model.state.id+' error '+response.status)
            });
        };

        $scope.selection = {
          active: false,
          x: 10, y: 10,
          start_x: 10, start_y: 10,
          width: 0, height: 0,
        };
        $scope.doSelectStart = function(event) {
          console.log(event);
          $scope.selection.active = true;
          var elem_rect = canvas.getBoundingClientRect();
          console.log(elem_rect);
          var dom_x = event.clientX - elem_rect.x;
          var dom_y = event.clientY - elem_rect.y;
          console.log('dom ' + dom_x + ' ' + dom_y);
          var user_x = dom_x * $scope.board.width / elem_rect.width;
          var user_y = dom_y * $scope.board.height / elem_rect.height;
          console.log('user ' + user_x + ' ' + user_y);
          $scope.selection.start_x = user_x;
          $scope.selection.start_y = user_y;
          $scope.selection.width = 0;
          $scope.selection.height = 0;
        };
        $scope.doSelectMove = function(event) {
          if($scope.selection.active) {
            console.log(event);
            var elem_rect = canvas.getBoundingClientRect();
            console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.x;
            var dom_y = event.clientY - elem_rect.y;
            console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.board.width / elem_rect.width;
            var user_y = dom_y * $scope.board.height / elem_rect.height;
            console.log('user ' + user_x + ' ' + user_y);
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
        };
        $scope.doSelectStop = function(event) {
          console.log(event);
          if($scope.selection.active) {
            $scope.selection.active = false;
            var elem_rect = canvas.getBoundingClientRect();
            console.log(elem_rect);
            var dom_x = event.clientX - elem_rect.x;
            var dom_y = event.clientY - elem_rect.y;
            console.log('dom ' + dom_x + ' ' + dom_y);
            var user_x = dom_x * $scope.board.width / elem_rect.width;
            var user_y = dom_y * $scope.board.height / elem_rect.height;
            console.log('user ' + user_x + ' ' + user_y);
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
            console.log($scope.selection.x + ' ' +
                        $scope.selection.y + ' ' +
                        $scope.selection.width + ' ' +
                        $scope.selection.height);
            if($scope.selection.width > 0 &&
               $scope.selection.height > 0) {
              _.each(selected_model, function(model) {
                model.state.active = false;
                $http.put('/api/games/'+$scope.game.id+
                          '/models/'+model.state.id,
                          model.state)
                  .then(function(response) {
                    console.log('put model '+model.state.id+' success')
                  }, function(response) {
                    console.log('get model '+model.state.id+' error '+response.status)
                  });
              });
              selected_model.length = 0;

              _.each($scope.models, function(model) {
                var cx = model.state.x + model.img.width/2;
                var cy = model.state.y + model.img.height/2;
                if( $scope.selection.x <= cx && cx <= ($scope.selection.x+$scope.selection.width ) &&
                    $scope.selection.y <= cy && cy <= ($scope.selection.y+$scope.selection.height) ) {
                  selected_model.push(model);
                  model.state.active = true;
                  $http.put('/api/games/'+$scope.game.id+
                            '/models/'+model.state.id,
                            model.state)
                    .then(function(response) {
                      console.log('put model '+model.state.id+' success')
                    }, function(response) {
                      console.log('get model '+model.state.id+' error '+response.status)
                    });
                }
              });
              $scope.selection.width = 0;
              $scope.selection.height = 0;
            }
          }
        };

      });
    }
  ]);
