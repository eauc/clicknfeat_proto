'use strict';

angular.module('vassalApp.controllers')
  .controller('chatBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init chatBoxCtrl');

      $scope.chat_msg = '';
      $scope.doSendMessage = function() {
        if(0 >= $scope.chat_msg.length) return;

        $scope.game.newCommand(command('sendMsg', 'chat', $scope.chat_msg));
        $scope.chat_msg = '';
      };
      $scope.showMsgCommands = function(list) {
        console.log('showMsgCommands', list);
        var msg = _.filter(list, function(cmd) {
          return cmd.type === 'sendMsg';
        });
        return msg;
      };
    }
  ]);
