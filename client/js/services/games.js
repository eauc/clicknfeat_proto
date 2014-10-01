'use strict';

angular.module('vassalApp.services')
  .factory('games', [
    '$http',
    '$rootScope',
    function($http,
             $rootScope) {
      var url = '/api/games/subscribe';
      var games = { list: [] };

      function openSource() {

        console.log('open games source', url);
        games.source = new EventSource(url);
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
        };

      }
      openSource();
      return games;
    }
  ]);
