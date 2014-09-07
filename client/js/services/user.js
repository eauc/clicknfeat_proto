'use strict';

angular.module('vassalApp.services')
  .service('user', [
    '$http',
    function($http) {
      var user = {
        create: function() {
          this.id = null;
          this.stamp = Date.now();
          $http.post('/api/users', this)
            .then(function(response) {
              console.log('create user success', response);
              _.extend(user, response.data);
              localStorage.setItem('vassal_user', JSON.stringify(user));
            }, function(response) {
              console.log('create user error', response);
            });
        }
      };

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
