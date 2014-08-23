'use strict';

angular.module('vassalApp.services')
  .factory('factions', [
    '$http',
    '$q',
    function($http,
             $q) {
      var BASE_RADIUS = {
        huge: 24.605,
        large: 9.842,
        medium: 7.874,
        small: 5.905
      };
      var factions;
      function updateModelInfo(model, faction) {
        model.r = BASE_RADIUS[model.base];
        model.color = faction.color;
        function totalJackDamage(damage, keys) {
          return _.reduce(keys,
                          function(tot, col) {
                            return tot + _.reduce(damage[col],
                                                  function(tot_col, val) {
                                                    return tot_col + (val ? 1 : 0);
                                                  }, 0);
                          }, 0);
        }
        switch(model.damage.type) {
        case 'jack':
          {
            model.damage.total = totalJackDamage(model.damage,
                                                 ['1', '2', '3', '4', '5', '6']);
            break;
          }
        case 'colossal':
          {
            model.damage.total = totalJackDamage(model.damage,
                                                 ['L1', 'L2', 'L3', 'L4', 'L5', 'L6',
                                                  'R1', 'R2', 'R3', 'R4', 'R5', 'R6']);
            break;
          }
        case 'warrior':
          {
            model.damage.total = model.damage.n;
            break;
          }
        }
        if(_.isString(model.fk_name)) {
          factions.fk_keys[model.fk_name] = factions.fk_keys[model.fk_name] || [];
          factions.fk_keys[model.fk_name].push(model);
        }
      }
      return $http.get('/data/factions.js')
        .then(function(response) {
          factions = response.data;
          // console.log(factions);
          var promises = _.map(factions, function(val) {
            return $http.get(val);
          });
          return $q.all(promises);
        }, function(response) {
          console.log('get factions list error');
          console.log(response);
          return $q.reject(responses);
        })
        .then(function(responses) {
          var keys = _.invert(factions);
          _.each(responses, function(response) {
            factions[keys[response.config.url]] = response.data;
            factions.fk_keys = {};
            _.each(factions, function(faction) {
              _.each(faction.models, function(type, key) {
                if(key === 'units') {
                  _.each(type, function(unit) {
                    _.each(unit.entries, function(entry) {
                      _.each(entry, function(model) {
                        updateModelInfo(model, faction);
                      });
                    })
                      });
                }
                else {
                  _.each(type, function(model) {
                    updateModelInfo(model, faction);
                  });
                }
              });
            });
          });
          console.log(factions);
          return factions;
        }, function(responses) {
          console.log('get factions error');
          console.log(responses);
          return $q.reject(responses);
        });
    }
  ]);
