'use strict';

angular.module('vassalApp.controllers')
  .controller('scenariosBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init scenariosBoxCtrl');
      function updateScope() {
        $scope.new_scenario = $scope.game.scenario ? _.find($scope.scenarios.list, function(sce) {
          return sce.name === $scope.game.scenario.name;
        }) : null;
      }
      $scope.$watch('game.scenario', updateScope);
      updateScope();

      $scope.doSetScenario = function() {
        $scope.game.newCommand(command('setScenario', $scope.new_scenario));
      };
      $scope.doSetRandomScenario = function() {
        var index = Math.floor(Math.random() * $scope.scenarios.list.length);
        $scope.new_scenario = $scope.scenarios.list[index];
        $scope.doSetScenario();
      };
      $scope.doGenerateObjectives = function() {
        if(!$scope.game.scenario) return;

        var objs_ids = _.filter($scope.game.models, function(mod) {
          return mod.info.type === "objective" ||
            mod.info.type === "flag";
        }).map(function(mod) { return mod.state.id; });
        if(objs_ids.length > 0) {
          $scope.game.newCommand(command('setSelection', objs_ids));
          $scope.game.newCommand(command('dropSelection'));
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
        $scope.game.newCommand(command('createModel', info));
      };
    }
  ]);
