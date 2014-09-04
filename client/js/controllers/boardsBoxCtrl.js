'use strict';

angular.module('vassalApp.controllers')
  .controller('boardsBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init boardsBoxCtrl');
      $scope.new_board = $scope.game.board.info ? _.find($scope.boards.list, function(brd) {
        return brd.name === $scope.game.board.info.name;
      }) : null;
      $scope.doSetBoard = function() {
        $scope.game.newCommand(command('setBoard', $scope.new_board));
      };
    }
  ]);
