'use strict';

angular.module('vassalApp.services')
  .factory('scenarios', [
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
      var scenarios = {};
      return $http.get('/data/scenarios.json')
        .then(function(response) {
          scenarios.list = response.data;
          console.log('scenarios', scenarios);
          return scenarios;
        }, function(response) {
          console.log('get scenarios list error');
          console.log(response);
          return $q.reject(response);
        });
    }
  ]);
