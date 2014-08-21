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
        moveFront: function(game, small) {
          var dl = small ? 1 : 10;
          var dx = dl * Math.sin(this.state.rot * Math.PI / 180);
          var dy = -dl * Math.cos(this.state.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
        },
        moveBack: function(game, small) {
          var dl = small ? 1 : 10;
          var dx = -dl * Math.sin(this.state.rot * Math.PI / 180);
          var dy = dl * Math.cos(this.state.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
        },
        rotateLeft: function(game, small) {
          var dr = small ? 5 : 30;
          this.state.rot = this.state.rot - dr;
        },
        moveLeft: function(game, small) {
          var dl = small ? 1 : 10;
          this.state.x -= dl;
          this.refresh(game);
        },
        moveUp: function(game, small) {
          var dl = small ? 1 : 10;
          this.state.y -= dl;
          this.refresh(game);
        },
        rotateRight: function(game, small) {
          var dr = small ? 5 : 30;
          this.state.rot = this.state.rot + dr;
        },
        moveRight: function(game, small) {
          var dl = small ? 1 : 10;
          this.state.x += dl;
          this.refresh(game);
        },
        moveDown: function(game, small) {
          var dl = small ? 1 : 10;
          this.state.y += dl;
          this.refresh(game);
        },
        toggleMelee: function() {
          this.state.show.melee = !this.state.show.melee;
        },
        toggleReach: function() {
          this.state.show.reach = !this.state.show.reach;
        },
        startDraging: function(game) {
          this.state_before_drag = _.extend({}, this.state);
        },
        draging: function(game, dx, dy) {
          this.state.x = this.state_before_drag.x + dx;
          this.state.y = this.state_before_drag.y + dy;
          this.refresh(game);
        },
        endDraging: function(game, dx, dy) {
          this.state.x = this.state_before_drag.x + dx;
          this.state.y = this.state_before_drag.y + dy;
          this.refresh(game);
        }
      };

      var factory = function(data) {
        
        return _.extend(data, model_base);

      };
      return factory;
    }
  ]);
