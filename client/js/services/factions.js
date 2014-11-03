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
      var factions = {};
      function updateModelInfo(key, model, faction) {
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
        if(model.type === 'jack') {
          model.img.wreck = faction.wreck ? faction.wreck[model.base] : null;
        }
        switch(model.damage.type) {
        case 'jack':
        case 'beast':
        case 'gargantuan':
          {
            model.damage.total = totalJackDamage(model.damage,
                                                 ['1', '2', '3', '4', '5', '6']);
            model.damage.depth = model.damage['1'].length;
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
        if(_.isArray(model.fk_name)) {
          _.each(model.fk_name, function(name) {
            if(_.isString(name)) {
              factions.fk_keys[name] = factions.fk_keys[name] || {};
              factions.fk_keys[name][key] = model;
            }
          });
        }
        if(_.isString(model.fk_name)) {
          factions.fk_keys[model.fk_name] = factions.fk_keys[model.fk_name] || {};
          factions.fk_keys[model.fk_name][key] = model;
        }
      }
      return $http.get('/data/factions.json')
        .then(function(response) {
          factions.list = response.data;
          // console.log(factions);
          var promises = _.map(factions.list, function(val) {
            return $http.get(val);
          });
          return $q.all(promises);
        }, function(response) {
          console.log('get factions list error');
          console.log(response);
          return $q.reject(response);
        })
        .then(function(responses) {
          var keys = _.invert(factions.list);
          _.each(responses, function(response) {
            factions.list[keys[response.config.url]] = response.data;
            factions.fk_keys = {};
            _.each(factions.list, function(faction) {
              _.each(faction.models, function(type) {
                _.each(type, function(unit, key) {
                  if(unit.entries) {
                    _.each(unit.entries, function(entry) {
                      _.each(entry, function(model, key) {
                        updateModelInfo(key, model, faction);
                        model.unit = unit.name;
                      });
                    });
                  }
                  else {
                    updateModelInfo(key, unit, faction);
                  }
                });
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
