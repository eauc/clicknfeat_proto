'use strict';

angular.module('vassalApp.controllers')
  .controller('templateViewBoxCtrl', [
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
      console.log('init templateViewBoxCtrl');

      $scope.doSetLabel = function() {
        $scope.game.newCommand(command('onActiveTemplate', 'setLabel', $scope.template_view.new_label));
        $scope.template_view.new_label = null;
      };
      $scope.doClearLabel = function(index) {
        $scope.game.newCommand(command('onActiveTemplate', 'clearLabel', index));
      };
      $scope.doClearAllLabel = function() {
        $scope.game.newCommand(command('onActiveTemplate', 'clearAllLabel'));
      };
    }
  ]);
