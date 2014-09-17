'use strict';

angular.module('vassalApp.controllers')
  .controller('gamesBoxCtrl', [
    '$scope',
    '$state',
    function($scope,
             $state) {
      console.log('init gameBoxCtrl');

      $scope.watch_game = {};
      $scope.doWatchGame = function() {
        $state.go('game', { visibility: 'public', id: $scope.watch_game.id });
      };
    }
  ]);
