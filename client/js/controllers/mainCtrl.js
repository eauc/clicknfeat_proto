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
      var BASE_RADIUS = {
        huge: 24.605,
        large: 9.842,
        medium: 7.874,
        small: 5.905
      };
      console.log('init mainCtrl');
      factions.then(function(list) {
        $rootScope.factions = list;
        _.each($rootScope.factions, function(faction) {
          _.each(faction.models, function(type, key) {
            if(key === 'units') {
              _.each(type, function(unit) {
                console.log(unit);
                unit.grunt.r = BASE_RADIUS[unit.grunt.base];
                _.each(unit.ua, function(ua) {
                  ua.r = BASE_RADIUS[ua.base];
                });
                _.each(unit.wa, function(wa) {
                  wa.r = BASE_RADIUS[wa.base];
                });
              });
            }
            else {
              _.each(type, function(model) {
                model.r = BASE_RADIUS[model.base];
              });
            }
          });
        });
      });
      $scope.range = function(n) {
        var ret = [];
        if(_.isNumber(n)) {
          _.times(n, function(i) { ret.push(i); });
        }
        return ret;
      };
      $scope.model = {
        faction: null,
        type: null,
        unit: null,
        unit_type: null,
        id: null,
        size: null,
        info: [],
      };
    }
  ]);
