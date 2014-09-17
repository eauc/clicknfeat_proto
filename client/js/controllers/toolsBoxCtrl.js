'use strict';

angular.module('vassalApp.controllers')
  .controller('toolsBoxCtrl', [
    '$scope',
    function($scope) {
      console.log('init toolsBoxCtrl');

      $scope.doToggleLosMode = function() {
        $scope.modes.send('Shift L', $scope);
      };
      $scope.doToggleRulerMode = function() {
        $scope.modes.send('Shift R', $scope);
      };

      $scope.doCreateTemplate = function(type, size) {
        $scope.modes['template_create'].type = type;
        $scope.modes['template_create'].size = size;
        $scope.modes['template_create'].x = 240;
        $scope.modes['template_create'].y = 240;
        $scope.modes.goTo('template_create', $scope);
      };
    }
  ]);
