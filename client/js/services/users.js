'use strict';

angular.module('vassalApp.services')
  .factory('users', [
    '$http',
    '$rootScope',
    function($http,
             $rootScope) {
      var url = '/api/users/subscribe';
      var users = { list: [] };

      function openSource() {

        console.log('open users source', url);
        users.source = new EventSource(url);
        users.source.onmessage = function(e) {
          // console.log('cmd event');
          // console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          users.list = data;
          $rootScope.$apply();
        };
        users.source.onerror = function(e) {
          if(e.target.readyState === e.target.CLOSED) {
            console.log('users source error', e);
            setTimeout(openSource, 5000);
            return;
          }
        };

      }
      openSource();
      return users;
    }
  ]);
