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
                _.each(unit.entries, function(entry) {
                  _.each(entry, function(model) {
                    model.r = BASE_RADIUS[model.base];
                  });
                })
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
        unit_entry: null,
        id: null,
        size: 1,
        info: [],
      };
    }
  ]);
