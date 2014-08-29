'use strict';

angular.module('vassalApp.controllers')
  .controller('createBoxCtrl', [
    '$scope',
    function($scope) {
      console.log('init createBoxCtrl');

      $scope.model = {
        faction: null,
        type: null,
        unit: null,
        unit_entry: null,
        id: null,
        size: 1,
        info: [],
      };
      $scope.$watch('model', function(val, old) {
        if($scope.modes.current === $scope.modes['model_create']) {
          $scope.modes.current = default_mode;
        }
      }, true);
      $scope.doToggleCreateModel = function() {
        $scope.modes.current = ($scope.modes.current === $scope.modes['model_create']) ?
          default_mode : $scope.modes['model_create'];
        if($scope.modes.current !== $scope.modes['model_create']) return;

        $scope.modes['model_create'].info = [];
        var mid_size = Math.ceil($scope.model.size/2);
        var unit_step = 3*$scope.model.id.r;
        _.times($scope.model.size, function(i) {
          var offset_x = 0;
          var offset_y = 0;
          if($scope.model.size <= 5) {
            offset_x = i*unit_step-($scope.model.size-1)*unit_step/2;
            offset_y = 0;
          }
          else {
            offset_x = (i%mid_size)*unit_step-(mid_size-1)*unit_step/2;
            offset_y = (i >= mid_size) ? unit_step : 0;
          }
          $scope.modes['model_create'].info.push({
            info: $scope.model.id,
            offset_x: offset_x,
            offset_y: offset_y
          });
        });
      };
    }
  ]);
