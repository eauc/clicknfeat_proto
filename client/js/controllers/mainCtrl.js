'use strict';

angular.module('vassalApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$http',
    function($scope,
             $http) {
      console.log('init mainCtrl');

      var LARGE_BASE_RADIUS = 9.842;
      var MEDIUM_BASE_RADIUS = 7.874;
      var SMALL_BASE_RADIUS = 5.905;

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
      $scope.models = [
        {
          img: {
            width: 60,
            height: 60,
            x: 0.2,
            y: -0.2,
            r: LARGE_BASE_RADIUS,
            link: 'data/cygnar/jacks/Hammersmith.png'
          },
          state: {
            x: 150,
            y: 210,
            rot: 30,
            active: false
          }
        },
        {
          img: {
            width: 60,
            height: 60,
            x: 0.2,
            y: -0.2,
            r: MEDIUM_BASE_RADIUS,
            link: 'data/cygnar/jacks/Grenadier.png'
          },
          state: {
            x: 170,
            y: 210,
            rot: 0,
            active: false
          }
        },
        {
          img: {
            width: 60,
            height: 60,
            x: 0.2,
            y: -0.5,
            r: SMALL_BASE_RADIUS,
            link: 'data/cygnar/jacks/Stormwall_Pod.png'
          },
          state: {
            x: 190,
            y: 210,
            rot: -30,
            active: false
          }
        }
      ];
      _.each($scope.models, function(model, i) {
        model.state.id = i;
      });

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
          $http.put('/api/models/'+selected_model.state.id, selected_model.state)
            .then(function(response) {
              console.log('put model '+selected_model.state.id+' success')
            }, function(response) {
              console.log('get model '+selected_model.state.id+' error '+response.status)
            });
        }
      };
      $scope.onModelClick = function(event, model) {
        console.log(event);
        console.log(model);
        if(selected_model) {
          selected_model.state.active = false;
          $http.put('/api/models/'+selected_model.state.id, selected_model.state)
            .then(function(response) {
              console.log('put model '+selected_model.state.id+' success')
            }, function(response) {
              console.log('get model '+selected_model.state.id+' error '+response.status)
            });
        }
        selected_model = model;
        selected_model.state.active = true;
        $http.put('/api/models/'+selected_model.state.id, selected_model.state)
          .then(function(response) {
            console.log('put model '+selected_model.state.id+' success')
          }, function(response) {
            console.log('get model '+selected_model.state.id+' error '+response.status)
          });
      };

      $http.get('/api/models').then(function(response) {
        console.log('get models success')
        console.log(response);
        _.each(response.data, function(state) {
          console.log(state);
          $scope.models[state.id].state = state;
        });
      }, function(response) {
        console.log('get models error '+response.status)
      });
      var evt_source = new EventSource("/api/models/subscribe");
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
    }
  ]);
