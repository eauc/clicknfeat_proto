'use strict';

angular.module('vassalApp.controllers')
  .controller('scenariosBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init scenariosBoxCtrl');
      $scope.doSetScenario = function() {
      };
      $scope.doGenerateObjectives = function() {
        if(!$scope.game.scenario) return;

        var objs_ids = _.filter($scope.game.models, function(mod) {
          return mod.info.type === "objective" ||
            mod.info.type === "flag";
        }).map(function(mod) { return mod.state.id; });
        if(objs_ids.length > 0) {
          $scope.game.newCommand(command('setSelection', objs_ids));
          var drop_cmd = command('dropSelection');
          drop_cmd.stamp++;
          $scope.game.newCommand(drop_cmd);
        }
        var info = [];
        _.each($scope.game.scenario.objectives, function(obj) {
          info.push({
            info: $scope.factions.list.scenario.models.objectives[obj.type],
            x: obj.x,
            y: obj.y
          });
        });
        _.each($scope.game.scenario.flags, function(flag) {
          info.push({
            info: $scope.factions.list.scenario.models.flags[flag.type],
            x: flag.x,
            y: flag.y
          });
        });
        var create_cmd = command('createModel', info);
        create_cmd.stamp++;
        $scope.game.newCommand(create_cmd);
      };
    }
  ]);
