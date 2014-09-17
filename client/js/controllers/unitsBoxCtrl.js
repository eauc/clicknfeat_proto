'use strict';

angular.module('vassalApp.controllers')
  .controller('unitsBoxCtrl', [
    '$scope',
    function($scope) {
      console.log('init unitsBoxCtrl');
      $scope.units = {};
      _.each($scope.game.models, function(model) {
        if(!model.state.unit) return;
        $scope.units[model.state.unit] = $scope.units[model.state.unit] || [];
        $scope.units[model.state.unit].push(model);
      });
    }
  ]);
