'use strict';

angular.module('vassalApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$rootScope',
    '$http',
    'factions',
    'scenarios',
    'boards',
    function($scope,
             $rootScope,
             $http,
             factions,
             scenarios,
             boards) {
      console.log('init mainCtrl');
      factions.then(function(list) {
        $rootScope.factions = list;
      });
      scenarios.then(function(list) {
        $rootScope.scenarios = list;
      });
      boards.then(function(list) {
        $rootScope.boards = list;
      });
      $scope.range = function(n) {
        var ret = [];
        if(_.isNumber(n)) {
          _.times(n, function(i) { ret.push(i); });
        }
        return ret;
      };
    }
  ]);
