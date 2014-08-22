'use strict';

angular.module('vassalApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$rootScope',
    '$http',
    'factions',
    function($scope,
             $rootScope,
             $http,
             factions) {
      console.log('init mainCtrl');
      factions.then(function(list) {
        $rootScope.factions = list;
        $scope.model = {
          faction: 'cygnar',
          type: 'solos',
          info: $scope.factions.cygnar.models.solos.stormwall_pod
        };
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
