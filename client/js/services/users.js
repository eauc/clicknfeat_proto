'use strict';

angular.module('vassalApp.services')
  .factory('users', [
    '$http',
    '$rootScope',
    'user',
    function($http,
             $rootScope,
             user) {
      var url = '/api/users/subscribe';
      var users = { list: [] };

      function openSource() {

        var source_url = url;
        if(user.wall) {
          source_url += '?close=true';
        }
        console.log('open users source', source_url);
        users.source = new EventSource(source_url);
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
            users.list = [];
            window.setTimeout(openSource, 5000);
            $rootScope.$apply();
            return;
          }
          users.source.close();
          openSource();
        };

      }
      openSource();
      return users;
    }
  ]);
