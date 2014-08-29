'use strict';

angular.module('vassalApp.controllers')
  .controller('chatBoxCtrl', [
    '$scope',
    'message',
    function($scope,
             message) {
      console.log('init chatBoxCtrl');

      $scope.chat_msg = '';
      $scope.doSendMessage = function() {
        if(0 >= $scope.chat_msg.length) return;

        var msg = message('chat', $scope.chat_msg);
        $scope.game.newMessage(msg);
        $scope.chat_msg = '';
      };
    }
  ]);
