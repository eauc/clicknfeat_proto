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

      $http.get('/api/games/'+$stateParams.id).then(function(response) {
        console.log('search game success');
        $scope.game = response.data;
        $scope.models= $scope.game.models;
        console.log($scope.game);
        
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
        var selected_model;
        $scope.onKey = function(event) {
          console.log(event);
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
                if(event.ctrlKey) {
                  selected_model.state.rot = selected_model.state.rot - 30;
                }
                else {
                  selected_model.state.x = Math.max(-(selected_model.img.height/2)+selected_model.img.r,
                                                    selected_model.state.x - 10);
                }
                break;
              }
            case 38: // upArrow
              {
                selected_model.state.y = Math.max(-(selected_model.img.height/2)+selected_model.img.r,
                                                  selected_model.state.y - 10);
                break;
              }
            case 39: // rightArrow
              {
                if(event.ctrlKey) {
                  selected_model.state.rot = selected_model.state.rot + 30;
                }
                else {
                  selected_model.state.x = Math.min($scope.board.width
                                                    -(selected_model.img.height/2)
                                                    -selected_model.img.r,
                                                    selected_model.state.x + 10);
                }
                break;
              }
            case 40: // downArrow
              {
                selected_model.state.y = Math.min($scope.board.height
                                                  -(selected_model.img.width/2)
                                                  -selected_model.img.r,
                                                  selected_model.state.y + 10);
                break;
              }
            }
            console.log(selected_model.state);
            $http.put('/api/games/'+$scope.game.id+
                      '/models/'+selected_model.state.id,
                      selected_model.state)
              .then(function(response) {
                console.log('put model '+selected_model.state.id+' success')
              }, function(response) {
                console.log('put model '+selected_model.state.id+' error '+response.status)
              });
          }
        };
        $scope.onModelClick = function(event, model) {
          console.log(event);
          console.log(model);
          if(selected_model) {
            selected_model.state.active = false;
            $http.put('/api/games/'+$scope.game.id+
                      '/models/'+selected_model.state.id,
                      selected_model.state)
              .then(function(response) {
                console.log('put model '+selected_model.state.id+' success')
              }, function(response) {
                console.log('get model '+selected_model.state.id+' error '+response.status)
              });
          }
          selected_model = model;
          selected_model.state.active = true;
          $http.put('/api/games/'+$scope.game.id+
                    '/models/'+selected_model.state.id,
                    selected_model.state)
            .then(function(response) {
              console.log('put model '+selected_model.state.id+' success')
            }, function(response) {
              console.log('get model '+selected_model.state.id+' error '+response.status)
            });
        };

      });
    }
  ]);
