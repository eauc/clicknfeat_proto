'use strict';

angular.module('vassalApp.services')
  .factory('boards', [
    '$http',
    '$q',
    function($http,
             $q) {
      var boards = {};
      return $http.get('/data/boards.json')
        .then(function(response) {
          boards.list = response.data;
          console.log('boards', boards);
          return boards;
        }, function(response) {
          console.log('get boards list error');
          console.log(response);
          return $q.reject(response);
        });
    }
  ]);
