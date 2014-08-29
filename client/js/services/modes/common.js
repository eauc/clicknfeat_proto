'use strict';

angular.module('vassalApp.services')
  .factory('common_mode', [
    'command',
    function(command) {
      return function(modes) {
        var common_mode = {
          name: 'Common',
          'Ctrl Z': function(scope) {
            scope.game.undoLastCommand();
            modes.current = modes['default'];
          },
          'Alt 0': function(scope) {
            scope.game.board.reset();
          },
          'Alt Add': function(scope) {
            scope.game.board.zoomIn();
          },
          'Alt Substract': function(scope) {
            scope.game.board.zoomOut();
          },
          'Alt Left': function(scope) {
            scope.game.board.moveLeft();
          },
          'Alt Down': function(scope) {
            scope.game.board.moveDown();
          },
          'Alt Right': function(scope) {
            scope.game.board.moveRight();
          },
          'Alt Up': function(scope) {
            scope.game.board.moveUp();
          },
        };
        return common_mode;
      }
    }
  ]);
