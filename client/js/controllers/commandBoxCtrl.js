'use strict';

angular.module('vassalApp.controllers')
  .controller('commandBoxCtrl', [
    '$scope',
    function($scope) {
      console.log('init commandBoxCtrl');

      $scope.selected = {};

      $scope.$watch('game.replay_commands.length', function() {
        var div = document.getElementById('replay-commands');
        window.setTimeout(function() {
          div.scrollTop = div.scrollHeight;
        }, 10);
      });
      $scope.doUndoUpTo = function() {
        if(!$scope.selected.stamp) return;

        $scope.game.undoCommandUpTo($scope.selected.stamp);
        $scope.selected.stamp = null;
        $scope.selected.type = null;
      };
      $scope.doReplayUpTo = function() {
        if(!$scope.selected.stamp) return;

        $scope.game.replayCommandUpTo($scope.selected.stamp);
        $scope.selected.stamp = null;
        $scope.selected.type = null;
      };
    }
  ]);
