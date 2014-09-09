'use strict';

angular.module('vassalApp.controllers')
  .controller('usersBoxCtrl', [
    '$scope',
    '$http',
    function($scope,
             $http) {
      console.log('init usersBoxCtrl');

      $scope.selection = {};
      $scope.toggleSelection = function(id) {
        if(id === $scope.user.id) return;
        $scope.selection[id] = !$scope.selection[id];
        if(!$scope.selection[id]) delete $scope.selection[id];
        $scope.selection_length = _.keys($scope.selection).length;
      };
      $scope.doSelectionFromMsg = function(chat) {
        var ids = [chat.from].concat(chat.to);
        ids = _.without(ids, $scope.user.id);
        $scope.selection = {};
        _.each(ids, function(id) {
          $scope.selection[id] = true;
        });
        $scope.selection_length = _.keys($scope.selection).length;
      };
      $scope.doSendChatMsg = function() {
        var to = _.keys($scope.selection)
          .map(function(i) { return i >> 0; });
        if(to.length === 0 ||
           $scope.chat_msg.length === 0) return;
        var msg = {
          from: $scope.user.id,
          to: to,
          text: $scope.chat_msg
        };
        console.log(msg);
        $http.post('/api/users/chat', msg)
          .then(function(response) {
            console.log('chat send success', response);
            // $scope.chat_msg = '';
          }, function(response) {
            console.log('chat send error', response);
          });
      };
    }
  ]);
