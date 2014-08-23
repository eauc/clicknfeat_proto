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
