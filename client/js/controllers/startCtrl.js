'use strict';

angular.module('vassalApp.controllers')
  .controller('startCtrl', [
    '$scope',
    '$state',
    '$window',
    '$http',
    function($scope,
             $state,
             $window,
             $http) {
      console.log('init startCtrl');

      var audio = document.getElementById('you-got-mail');
      $scope.$on('user_chat', function(event, msg) {
        console.log('user_chat', event, msg);
        audio.currentTime = 0;
        audio.play();
      });

      $scope.doCreateGame = function() {
        $scope.creating = true;
        $http.post('/api/games', { player1: $scope.user })
          .then(function(response) {
            // console.log('create game success');
            // $scope.game = response.data;
            // console.log($scope.game);
            
            $state.go('game', { visibility: 'private', id: response.data.id });
          }, function(response) {
            console.log('create game error');
            console.log(response);
          })
          .finally(function() {
            $scope.creating = false;
          });
      };

      $scope.doSearchGame = function() {
        $state.go('game', { visibility: 'private', id: $scope.search_id });
      };
      
      $scope.read_result = '';
      $scope.readBackup = function(file) {
        $scope.read_result = null;
        $scope.creating = true;
        var reader = new $window.FileReader();
        reader.onload = function(e) {
          var data;
          try {
            data = JSON.parse(e.target.result);
            $scope.read_result = 'file valid, uploading to server...';
            // success_cbk_(data);
            // console.log(data);
            var game_data = _.pick(data,
                                   'clock',
                                   'models',
                                   'commands',
                                   'replay_commands');
            if(game_data.clock) {
              _.extend(game_data.clock, {
                state: 'stopped'
              });
            }
            game_data.player1 = $scope.user;
            // console.log(data);
            $http.post('/api/games', game_data)
              .then(function(response) {
                // console.log('upload game success');
                // console.log(response.data);
                $state.go('game', { visibility: 'private', id: response.data.id });
              }, function(response) {
                console.log('upload game error');
                console.log(response);
              })
              .finally(function() {
                $scope.creating = false;
              });
          }
          catch (event) {
            $scope.read_result = 'invalid file';
            $scope.creating = false;
          }
          $scope.$apply();
        };
        reader.onerror = function(e) {
          $scope.read_result = 'error reading file';
          $scope.creating = false;
          $scope.$apply();
        };
        reader.onabort = function(e) {
          $scope.read_result = 'abort reading file';
          $scope.creating = false;
          $scope.$apply();
        };
        reader.readAsText(file);
      };

      $scope.doCreateUser = function() {
        if(!$scope.user.id) {
          $scope.user.create();
        }
        else {
          $scope.user.refresh();
        }
      };
    }
  ]);
