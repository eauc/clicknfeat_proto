'use strict';

angular.module('vassalApp.controllers')
  .controller('modelViewBoxCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$q',
    '$window',
    'game',
    'command',
    'factions',
    'modes',
    function($scope,
             $state,
             $stateParams,
             $http,
             $q,
             $window,
             game,
             command,
             factions,
             modes) {
      console.log('init modelViewBoxCtrl');

      $scope.doSetLabel = function() {
        $scope.game.newCommand(command('onSelection', 'setLabel', $scope.model_view.label));
      };
      $scope.doModelDamage = function(model, col, line) {
        $scope.game.newCommand(command('onSelection', 'toggleDamage', col, line));
      };
      $scope.doResetAllModelDamage = function() {
        $scope.game.newCommand(command('onSelection', 'resetAllDamage'));
      };
    }
  ]);
