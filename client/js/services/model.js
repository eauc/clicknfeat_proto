'use strict';

angular.module('vassalApp.services')
  .factory('model', [
    function() {
      var model_base = {
        refresh: function(game) {
          this.state.x = Math.max(-(this.img.height/2)+this.img.r,
                                  this.state.x);
          this.state.x = Math.min(game.board.width
                                  -(this.img.height/2)
                                  -this.img.r,
                                  this.state.x);
          this.state.y = Math.max(-(this.img.height/2)+this.img.r,
                                  this.state.y);
          this.state.y = Math.min(game.board.height
                                  -(this.img.width/2)
                                  -this.img.r,
                                  this.state.y);
        },
        moveFront: function(game) {
          var dx = 10 * Math.sin(this.state.rot * Math.PI / 180);
          var dy = -10 * Math.cos(this.state.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
        },
        moveBack: function(game) {
          var dx = -10 * Math.sin(this.state.rot * Math.PI / 180);
          var dy = 10 * Math.cos(this.state.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
        },
        rotateLeft: function(game) {
          this.state.rot = this.state.rot - 30;
        },
        moveLeft: function(game) {
          this.state.x -= 10;
          this.refresh(game);
        },
        moveUp: function(game) {
          this.state.y -= 10;
          this.refresh(game);
        },
        rotateRight: function(game) {
          this.state.rot = this.state.rot + 30;
        },
        moveRight: function(game) {
          this.state.x += 10;
          this.refresh(game);
        },
        moveDown: function(game) {
          this.state.y += 10;
          this.refresh(game);
        }
      };

      var factory = function(data) {
        
        return _.extend(data, model_base);

      };
      return factory;
    }
  ]);
