'use strict';

angular.module('vassalApp.controllers')
  .controller('commandBoxCtrl', [
    '$scope',
    function($scope,
             message) {
      console.log('init commandBoxCtrl');

      $scope.$watch('game.replay_commands.length', function() {
        var div = document.getElementById('replay-commands');
        div.scrollTop = div.scrollHeight;
      });
    }
  ]);
