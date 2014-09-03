'use strict';

angular.module('vassalApp.controllers')
  .controller('unitsBoxCtrl', [
    '$scope',
    function($scope) {
      console.log('init unitsBoxCtrl');
      $scope.units = [];
      _.each($scope.game.models, function(model) {
        if(!model.state.unit) return;
        $scope.units.push({
          number: model.state.unit,
          id: model.state.id,
          info: model.info
        });
      });
    }
  ]);
