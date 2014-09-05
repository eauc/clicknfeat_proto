'use strict';

angular.module('vassalApp.controllers')
  .controller('backupBoxCtrl', [
    '$scope',
    '$window',
    function($scope,
             $window) {
      console.log('init backupBoxCtrl');

      $scope.selection_save_url = null;
      $scope.generateSelectionBackup = function() {
        if($scope.game.selection.length <= 0) return;

        var old_url = $scope.selection_save_url;
        $scope.selection_save_url = null;
        if (old_url !== null) {
          $window.URL.revokeObjectURL(old_url);
        }
        var ref_x = $scope.game.models[$scope.game.selection[0]].state.x;
        var ref_y = $scope.game.models[$scope.game.selection[0]].state.y;
        var models = _.map($scope.game.selection, function(id) {
          var model = $scope.game.models[id];
          var model_info = _.omit(model.state, 'id', 'x', 'y');
          model_info.offset_x = model.state.x - ref_x;
          model_info.offset_y = model.state.y - ref_y;
          model_info.info = model.info;
          return model_info;
        });
        var string = JSON.stringify(models);
        var blob = new $window.Blob([string], {type: 'text/plain'});
        var url = $window.URL.createObjectURL(blob);
        var today = Date.now();
        $scope.selection_save_name = 'models_' + today + '.txt';
        $scope.selection_save_url = url;
      };
    }
  ]);
