'use strict';

angular.module('vassalApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'factions',
    'scenarios',
    'boards',
    'games',
    'user',
    function($scope,
             $rootScope,
             $state,
             $http,
             factions,
             scenarios,
             boards,
             games,
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
      $scope.users = [];
      function refreshUsers() {
        $http.get('/api/users')
          .then(function(response) {
            console.log('refresh users success', response);
            $scope.users = response.data;
          }, function(response) {
            console.log('refresh users error', response);
          }).then(function() {
            setTimeout(refreshUsers, 10000);
          });
      }
      refreshUsers();

      $scope.games = games;

      $scope.doGoHome = function() {
        $state.go('start');
      };
    }
  ]);
