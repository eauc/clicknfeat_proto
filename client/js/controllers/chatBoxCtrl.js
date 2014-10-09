'use strict';

angular.module('vassalApp.controllers')
  .controller('diceBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init chatBoxCtrl');

      $scope.showDiceCommands = function(list) {
        // console.log('showMsgCommands', list);
        var msg = _.filter(list, function(cmd) {
          return cmd.type === 'sendMsg' &&
            cmd.msg_type === 'dice';
        });
        return msg;
      };
    }
  ])
  .controller('chatBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init chatBoxCtrl');

      $scope.chat_msg = '';
      $scope.doSendMessage = function() {
        if(0 >= $scope.chat_msg.length) return;

        $scope.game.newChat($scope.chat_msg);
        $scope.chat_msg = '';
      };
      $scope.showChatCommands = function(list) {
        // console.log('showMsgCommands', list);
        var msg = _.filter(list, function(cmd) {
          return cmd.type === 'sendMsg' &&
            cmd.msg_type === 'chat';
        });
        return msg;
      };
    }
  ]);
