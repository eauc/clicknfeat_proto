'use strict';

angular.module('vassalApp.services')
  .factory('template_aoe', [
    function() {
      var aoe_base = {
        refresh: function(game) {
          this.x = Math.max(0, this.x);
          this.x = Math.min(game.board.width,
                                  this.x);
          this.y = Math.max(0, this.y);
          this.y = Math.min(game.board.height,
                                  this.y);
        },
        set: function(game, x, y, rot) {
          this.x = x;
          this.y = y;
          this.rot = rot;
          this.refresh(game);
        },
        moveFront: function(game, small) {
          var dl = small ? 1 : 10;
          var dx = dl * Math.sin(this.rot * Math.PI / 180);
          var dy = -dl * Math.cos(this.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.x += dx;
          this.y += dy;
          this.refresh(game);
        },
        moveBack: function(game, small) {
          var dl = small ? 1 : 10;
          var dx = -dl * Math.sin(this.rot * Math.PI / 180);
          var dy = dl * Math.cos(this.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.x += dx;
          this.y += dy;
          this.refresh(game);
        },
        rotateLeft: function(game, small) {
          var dr = small ? 10 : 60;
          this.rot = this.rot - dr;
        },
        moveLeft: function(game, small) {
          var dl = small ? 1 : 10;
          this.x -= dl;
          this.refresh(game);
        },
        moveUp: function(game, small) {
          var dl = small ? 1 : 10;
          this.y -= dl;
          this.refresh(game);
        },
        rotateRight: function(game, small) {
          var dr = small ? 10 : 60;
          this.rot = this.rot + dr;
        },
        moveRight: function(game, small) {
          var dl = small ? 1 : 10;
          this.x += dl;
          this.refresh(game);
        },
        moveDown: function(game, small) {
          var dl = small ? 1 : 10;
          this.y += dl;
          this.refresh(game);
        },
        toggleLocked: function(game) {
          this.locked = !this.locked;
        },
        toggleSize: function(game, size) {
          this.r = size * 5;
        },
        startDraging: function(game) {
          this.startDraging.ref = _.deepCopy(this);
        },
        draging: function(game, dx, dy) {
          this.x = this.startDraging.ref.x + dx;
          this.y = this.startDraging.ref.y + dy;
          this.refresh(game);
        }
      };
      var factory = function(data) {
        _.extend(data, aoe_base);
        if(undefined === data.stamp) {
          data.stamp = Date.now();
        }
        return data;
      };
      return factory;
    }
  ])
  .factory('template', [
    'template_aoe',
    function(template_aoe) {
      var factories = {
        aoe: template_aoe,
      };
      var factory = function(options) {
        if(_.isFunction(factories[options.type])) {
          return factories[options.type](options);
        }
      };
      return factory;
    }
  ]);
