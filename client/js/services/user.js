'use strict';

angular.module('vassalApp.services')
  .service('user', [
    '$http',
    '$rootScope',
    function($http,
             $rootScope) {
      var user = {
        chat: [],
        last_chat: null,
        create: function() {
          this.id = null;
          this.stamp = Date.now();
          $http.post('/api/users', this)
            .then(function(response) {
              console.log('create user success', response);
              _.extend(user, response.data);
              localStorage.setItem('vassal_user', JSON.stringify(user));
              openSource();
            }, function(response) {
              console.log('create user error', response);
            });
        }
      };
      var user_source;
      var last_chat_timeout;
      function openSource() {
        if(user_source) user_source.close();
        var url = '/api/users/'+user.id+'/subscribe';
        console.log('open user source', url);
        user_source = new EventSource(url);
        user_source.onmessage = function(e) {
          console.log('user event', e);
        };
        user_source.addEventListener('chat', function(e) {
          console.log('user chat event',e);
          var data = JSON.parse(e.data);
          user.chat.push(data);
          if(data.from !== user.id) {
            user.last_chat = data;
            if(last_chat_timeout) clearTimeout(last_chat_timeout);
            last_chat_timeout = setTimeout(function() {
              user.last_chat = null;
              last_chat_timeout = null;
              $rootScope.$apply();
            }, 2000);
          }
          $rootScope.$apply();
        });
        user_source.onerror = function(e) {
          if(e.target.readyState === e.target.CLOSED) {
            console.log('user source error', e);
            setTimeout(openSource, 5000);
            return;
          }
        };
      }

      var stored_user = null;
      try {
        stored_user = JSON.parse(localStorage.getItem('vassal_user'));
      }
      catch(err) {
        console.log('no stored user');
      }
      if(stored_user && stored_user.id) {
        $http.get('/api/users/'+stored_user.id)
          .then(function(response) {
            console.log('get stored user success', response);
            if(response.data.stamp === stored_user.stamp) {
              console.log('stored user validated !');
              _.extend(user, response.data);
              localStorage.setItem('vassal_user', JSON.stringify(user));
              openSource();
            }
            else {
              console.log('stored user invalid', response);
              localStorage.setItem('vassal_user', '');
            }
          }, function(response) {
            console.log('get stored user error', response);
            localStorage.setItem('vassal_user', '');
            if(response.status !== 404) return;
            _.extend(user, stored_user);
            user.create();
          });
      }
      return user;
    }
  ]);
