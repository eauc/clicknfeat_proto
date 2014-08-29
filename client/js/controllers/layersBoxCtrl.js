'use strict';

angular.module('vassalApp.controllers')
  .controller('layersBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init layersBoxCtrl');

      $scope.onLayerChange = function(layer) {
        $scope.game.newCommand(command('setLayer', layer));
      };
    }
  ]);
