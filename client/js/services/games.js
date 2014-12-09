'use strict';

angular.module('vassalApp.services')
  .factory('games', [
    '$http',
    '$rootScope',
    'user',
    function($http,
             $rootScope,
             user) {
      var url = '/api/games/subscribe';
      var games = { list: [] };

      function openSource() {

        var source_url = url;
        if(user.wall) {
          source_url += '?close=true';
        }
        console.log('open games source', source_url);
        games.source = new EventSource(source_url);
        games.source.onmessage = function(e) {
          // console.log('cmd event');
          // console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          games.list = data;
          $rootScope.$apply();
        };
        games.source.onerror = function(e) {
          if(e.target.readyState === e.target.CLOSED) {
            console.log('games source error', e);
            games.list = [];
            window.setTimeout(openSource, 5000);
            $rootScope.$apply();
            return;
          }
          games.source.close();
          openSource();
        };

      }
      openSource();
      return games;
    }
  ]);
