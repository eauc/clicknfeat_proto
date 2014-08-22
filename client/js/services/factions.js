'use strict';

angular.module('vassalApp.services')
  .factory('factions', [
    '$http',
    '$q',
    function($http,
             $q) {
      var factions;
      return $http.get('/data/factions.js')
        .then(function(response) {
          factions = response.data;
          console.log(factions);
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
