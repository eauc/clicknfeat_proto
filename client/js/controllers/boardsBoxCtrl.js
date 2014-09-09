'use strict';

angular.module('vassalApp.controllers')
  .controller('boardsBoxCtrl', [
    '$scope',
    'command',
    function($scope,
             command) {
      console.log('init boardsBoxCtrl');
      function updateScope() {
        $scope.new_board = $scope.game.board.info ? _.find($scope.boards.list, function(brd) {
          return brd.name === $scope.game.board.info.name;
        }) : null;
      }
      $scope.$watch('game.board.info', updateScope);
      updateScope();

      $scope.doSetBoard = function() {
        $scope.game.newCommand(command('setBoard', $scope.new_board));
      };
    }
  ]);
