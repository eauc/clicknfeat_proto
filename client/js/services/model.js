'use strict';

angular.module('vassalApp.services')
  .factory('model', [
    function() {
      var BASE_RADIUS = {
        huge: 24.605,
        large: 9.842,
        medium: 7.874,
        small: 5.905
      };
      var model_base = {
        refresh: function(game) {
          this.state.x = Math.max(-(this.info.height/2)+this.info.r,
                                  this.state.x);
          this.state.x = Math.min(game.board.width
                                  -(this.info.height/2)
                                  -this.info.r,
                                  this.state.x);
          this.state.y = Math.max(-(this.info.height/2)+this.info.r,
                                  this.state.y);
          this.state.y = Math.min(game.board.height
                                  -(this.info.width/2)
                                  -this.info.r,
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
        toggleMelee: function(game) {
          this.state.show_melee = !this.state.show_melee;
        },
        toggleReach: function(game) {
          this.state.show_reach = !this.state.show_reach;
        },
        toggleAoe: function(game, size) {
          switch(size) {
          case 3:
            {
              this.state.show_aoe = (this.state.show_aoe === 15) ? 0 : 15;
              break;
            }
          case 4:
            {
              this.state.show_aoe = (this.state.show_aoe === 20) ? 0 : 20;
              break;
            }
          case 5:
            {
              this.state.show_aoe = (this.state.show_aoe === 25) ? 0 : 25;
              break;
            }
          }
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
        },
        toggleDamage: function(game, col, line) {
          switch(this.info.damage.type) {
          case 'jack':
          case 'colossal':
            {
              if(undefined === line) {
                var instance = this;
                var damage_in_col = _.reduce(this.state.damage[col], function(sum, n) {
                  return n + sum;
                }, 0);
                var new_val = damage_in_col === 6 ? 0 : 1;
                _.each(this.state.damage[col], function(val, i) {
                  instance.state.damage[col][i] = new_val;
                });
                break;
              }
              if(this.info.damage[col][line]) {
                this.state.damage[col][line] = 
                  this.state.damage[col][line] === 1 ? 0 : 1;
              }
              break;
            }
          case 'warrior':
            {
              this.state.damage.n = 
                this.state.damage.n === col ? 0 : col;
              break;
            }
          }
        }
      };
      var factory = function() {
        var args = Array.prototype.slice.call(arguments);
        if(args.length === 1) {
          return _.extend(args[0], model_base);
        }
        var instance = {
          info: args[1],
          state: args.length == 2 ? {
            id: args[0],
            x: 240,
            y: 240,
            rot: 0,
            show_melee: false,
            show_reach: false,
            show_aoe: 0,
            active: false
          } : _.extend({
            id: args[0],
            x: 240,
            y: 240,
            rot: 0,
            show_melee: false,
            show_reach: false,
            show_aoe: 0,
            active: false
          }, args[2])
        };
        instance.info.r = BASE_RADIUS[instance.info.base];
        switch(instance.info.damage.type) {
        case 'jack': 
          {
            instance.state.damage = {
              '1': [ 0, 0, 0, 0, 0, 0 ],
              '2': [ 0, 0, 0, 0, 0, 0 ],
              '3': [ 0, 0, 0, 0, 0, 0 ],
              '4': [ 0, 0, 0, 0, 0, 0 ],
              '5': [ 0, 0, 0, 0, 0, 0 ],
              '6': [ 0, 0, 0, 0, 0, 0 ]
            };
            break;
          }
        case 'colossal': 
          {
            instance.state.damage = {
              'L1': [ 0, 0, 0, 0, 0, 0 ],
              'L2': [ 0, 0, 0, 0, 0, 0 ],
              'L3': [ 0, 0, 0, 0, 0, 0 ],
              'L4': [ 0, 0, 0, 0, 0, 0 ],
              'L5': [ 0, 0, 0, 0, 0, 0 ],
              'L6': [ 0, 0, 0, 0, 0, 0 ],
              'R1': [ 0, 0, 0, 0, 0, 0 ],
              'R2': [ 0, 0, 0, 0, 0, 0 ],
              'R3': [ 0, 0, 0, 0, 0, 0 ],
              'R4': [ 0, 0, 0, 0, 0, 0 ],
              'R5': [ 0, 0, 0, 0, 0, 0 ],
              'R6': [ 0, 0, 0, 0, 0, 0 ]
            };
            break;
          }
        case 'warrior': 
          {
            instance.state.damage = {
              n: 0
            };
            break;
          }
        }
        _.extend(instance, model_base);
        return instance;
      };
      return factory;
    }
  ]);
