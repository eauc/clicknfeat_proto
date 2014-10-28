'use strict';

angular.module('vassalApp.services')
  .factory('netdeck', [
    '$http',
    '$q',
    function($http,
             $q) {
      var netdeck = {};
      $http.get('/data/netdeck.json')
        .then(function(response) {
          netdeck.list = response.data;
        }, function(response) {
          console.log('get netdeck list error');
          console.log(response);
        });
      return netdeck;
    }
  ]);
