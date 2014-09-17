'use strict';

angular.module('vassalApp.services')
  .factory('common_mode', [
    'command',
    function(command) {
      return function(modes) {
        var common_mode = {
          name: 'Common',
          enter: function() {},
          leave: function() {},
          'Escape': function(scope) {
            scope.modes.goTo('default', scope);
          },
          'Ctrl F': function(scope) {
            scope.game.board.zoom.flipped = !scope.game.board.zoom.flipped;
          },
          'Ctrl Z': function(scope) {
            if(!scope.game.id) return;
            scope.game.undoLastCommand();
            modes.goTo('default', scope);
          },
          'Ctrl Shift Z': function(scope) {
            if(!scope.game.id) return;
            modes.goTo('default', scope);
            scope.game.undoAllCommands();
          },
          'Ctrl Y': function(scope) {
            if(!scope.game.id) return;
            scope.game.replayNextCommand();
            modes.goTo('default', scope);
          },
          'Ctrl Shift Y': function(scope) {
            if(!scope.game.id) return;
            modes.goTo('default', scope);
            scope.game.replayAllCommands();
          },
          'Alt Z': function(scope) {
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
