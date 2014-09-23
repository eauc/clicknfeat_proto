'use strict';

angular.module('vassalApp.controllers')
  .controller('clockBoxCtrl', [
    '$scope',
    '$window',
    'command',
    function($scope,
             $window,
             command) {
      console.log('init clockBoxCtrl');

      $scope.doSwitchPlayer = function() {
        $scope.game.newCommand(command('onClock', 'switchPlayer'));
      };
      $scope.doStart = function() {
        $scope.game.newCommand(command('onClock', 'start'));
      };
      $scope.doStop = function() {
        $scope.game.newCommand(command('onClock', 'stop'));
      };

    }
  ]);
