'use strict';

angular.module('vassalApp.controllers')
  .controller('dropBinBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init gameCtrl');

      $scope.restore_selection = {};
      $scope.isRestoreSelectionEmpty = function() {
        return _.keys($scope.restore_selection).length === 0;
      };
      $scope.doToggleRestoreSelection = function(id, $event) {
        var set = !$event.ctrlKey;
        if(set) {
          $scope.restore_selection = {};
          $scope.restore_selection[id] = true;
          return;
        }
        if($scope.restore_selection[id]) {
          delete $scope.restore_selection[id];
        }
        else {
          $scope.restore_selection[id] = true;
        }
      };
      $scope.doEmptySelection = function() {
        $scope.restore_selection = {};
      };
      $scope.doRestoreSelection = function() {
        $scope.game.newCommand(command('restoreFromDropBin', _.keys($scope.restore_selection)));
      };
      $scope.doRestoreAll = function() {
        $scope.game.newCommand(command('restoreFromDropBin',
                                       _.map($scope.game.drop_bin, function(mod) {
                                         return mod.state.id;
                                       })
                                      ));
      };
    }
  ]);
