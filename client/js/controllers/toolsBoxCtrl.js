'use strict';

angular.module('vassalApp.controllers')
  .controller('toolsBoxCtrl', [
    '$scope',
    function($scope) {
      console.log('init toolsBoxCtrl');

      $scope.doToggleMode = function(new_mode) {
        if($scope.modes.current.group === $scope.modes[new_mode].group) {
          $scope.modes.goTo('default', $scope);
        }
        else {
          $scope.modes.goTo(new_mode, $scope);
        }
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
