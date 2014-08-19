'use strict';

angular.module('vassalApp.controllers')
  .controller('startCtrl', [
    '$scope',
    '$state',
    '$http',
    function($scope,
             $state,
             $http) {
      console.log('init startCtrl');

      $scope.doCreateGame = function() {
        $http.post('/api/games').then(function(response) {
          console.log('create game success');
          $scope.game = response.data;
          console.log($scope.game);

          $state.go('game', { id: $scope.game.id });
        }, function(response) {
          console.log('create game error');
          console.log(response);
        });
      };

      $scope.doSearchGame = function() {
        $state.go('game', { id: $scope.search_id });
      };

    }
  ]);
