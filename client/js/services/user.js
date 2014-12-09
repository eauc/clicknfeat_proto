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
        },
        refresh: function() {
          if(!this.id) return;
          $http.put('/api/users/'+this.id, this)
            .then(function(response) {
              console.log('update user success', response);
              localStorage.setItem('vassal_user', JSON.stringify(user));
            }, function(response) {
              console.log('update user error', response);
            });
        },
        validate: function() {
          if(this.id) {
            $http.get('/api/users/'+this.id)
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
                  user.create();
                }
              }, function(response) {
                console.log('get stored user error', response);
                user.create();
              });
          }
        }
      };

      var user_source;
      function openSource() {
        if(user_source) user_source.close();
        var url = '/api/users/'+user.id+'/subscribe';
        if(user.wall) {
          url += '?close=true';
        }
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
            $rootScope.$broadcast('user_chat', data);
          }
          $rootScope.$apply();
        });
        user_source.onerror = function(e) {
          if(e.target.readyState === e.target.CLOSED) {
            console.log('user source error', e);
            user.id = null;
            $rootScope.$apply();
            return;
          }
          user_source.close();
          openSource();
        };
      }

      var stored_user = null;
      try {
        stored_user = JSON.parse(localStorage.getItem('vassal_user'));
        _.extend(user, stored_user);
      }
      catch(err) {
        console.log('no stored user');
      }
      user.validate();

      return user;
    }
  ]);
