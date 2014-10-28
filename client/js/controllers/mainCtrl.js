'use strict';

angular.module('vassalApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'factions',
    'netdeck',
    'scenarios',
    'boards',
    'games',
    'users',
    'user',
    function($scope,
             $rootScope,
             $state,
             $http,
             factions,
             netdeck,
             scenarios,
             boards,
             games,
             users,
             user) {
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

      $scope.user = user;
      $scope.users = users;
      $scope.games = games;
      $scope.netdeck = netdeck;

      $scope.doGoHome = function() {
        $state.go('start');
      };
    }
  ]);
