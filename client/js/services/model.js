'use strict';

angular.module('vassalApp.services')
  .factory('model', [
    function() {
      var model_base = {
        resetShow: function(game) {
          this.state.show_image = true;
          delete this.state.show_melee;
          delete this.state.show_reach;
          delete this.state.show_strike;
          delete this.state.show_aoe;
          delete this.state.show_area;
          delete this.state.show_unit;
          delete this.state.show_control;
        },
        refresh: function(game) {
          var dx, dy;
          if(this.state.show_charge) {
            dx = this.state.x - this.state.charge_x;
            dy = this.state.y - this.state.charge_y;
            this.state.charge_length = Math.sqrt(dx*dx+dy*dy);
            if(this.state.charge_max &&
               this.state.charge_max > 0 &&
               this.state.charge_length > this.state.charge_max*10) {
              dx = dx * this.state.charge_max*10 / this.state.charge_length;
              dy = dy * this.state.charge_max*10 / this.state.charge_length;
              this.state.x = this.state.charge_x + dx;
              this.state.y = this.state.charge_y + dy;
              this.state.charge_length = this.state.charge_max*10;
            }
          }
          if(this.state.show_place) {
            dx = this.state.x - this.state.place_x;
            dy = this.state.y - this.state.place_y;
            this.state.place_length = Math.sqrt(dx*dx+dy*dy);
            if(this.state.place_max &&
               this.state.place_max > 0) {
              var place_max = this.state.place_max*10 + (this.state.place_within ? 2*this.info.r : 0);
              if(this.state.place_length > place_max) {
                dx = dx * place_max / this.state.place_length;
                dy = dy * place_max / this.state.place_length;
                this.state.x = this.state.place_x + dx;
                this.state.y = this.state.place_y + dy;
                this.state.place_length = place_max;
              }
            }
          }
          this.state.x = Math.max(this.info.r, this.state.x);
          this.state.x = Math.min(game.board.width-this.info.r,
                                  this.state.x);
          this.state.y = Math.max(this.info.r, this.state.y);
          this.state.y = Math.min(game.board.height-this.info.r,
                                  this.state.y);
        },
        alignWith: function(game, x, y) {
          if(this.info.immovable) return;
          var angle = Math.atan2(x - this.state.x, this.state.y - y) * 180 / Math.PI;
          this.state.rot = angle;
        },
        moveFront: function(game, small, target) {
          if(this.info.immovable) return;
          var dl = small ? 5 : 10;
          var dx = dl * Math.sin(this.state.rot * Math.PI / 180);
          var dy = -dl * Math.cos(this.state.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
          if(target) this.alignWith(game, target.state.x, target.state.y);
        },
        moveBack: function(game, small, target) {
          if(this.info.immovable) return;
          var dl = small ? 5 : 10;
          var dx = -dl * Math.sin(this.state.rot * Math.PI / 180);
          var dy = dl * Math.cos(this.state.rot * Math.PI / 180);
          // console.log(dx + ' ' + dy);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
          if(target) this.alignWith(game, target.state.x, target.state.y);
        },
        setRotation: function(game, angle) {
          if(this.info.immovable) return;
          this.state.rot = angle;
        },
        rotateLeft: function(game, small) {
          if(this.info.immovable) return;
          var dr = small ? 5 : 10;
          this.state.rot = this.state.rot - dr;
        },
        moveLeft: function(game, small) {
          var dx, dy;
          if(this.info.immovable) return;
          var dl = small ? 1 : 10;
          this.state.x -= dl;
          if(this.state.show_charge) {
            dx = this.state.x - this.state.charge_x;
            dy = this.state.y - this.state.charge_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.charge_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          if(this.state.show_place) {
            dx = this.state.x - this.state.place_x;
            dy = this.state.y - this.state.place_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.place_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        moveUp: function(game, small) {
          var dx, dy;
          if(this.info.immovable) return;
          var dl = small ? 1 : 10;
          this.state.y -= dl;
          if(this.state.show_charge) {
            dx = this.state.x - this.state.charge_x;
            dy = this.state.y - this.state.charge_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.charge_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          if(this.state.show_place) {
            dx = this.state.x - this.state.place_x;
            dy = this.state.y - this.state.place_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.place_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        rotateRight: function(game, small) {
          if(this.info.immovable) return;
          var dr = small ? 5 : 10;
          this.state.rot = this.state.rot + dr;
        },
        moveRight: function(game, small) {
          var dx, dy;
          if(this.info.immovable) return;
          var dl = small ? 1 : 10;
          this.state.x += dl;
          if(this.state.show_charge) {
            dx = this.state.x - this.state.charge_x;
            dy = this.state.y - this.state.charge_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.charge_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          if(this.state.show_place) {
            dx = this.state.x - this.state.place_x;
            dy = this.state.y - this.state.place_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.place_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        moveDown: function(game, small) {
          var dx, dy;
          if(this.info.immovable) return;
          var dl = small ? 1 : 10;
          this.state.y += dl;
          if(this.state.show_charge) {
            dx = this.state.x - this.state.charge_x;
            dy = this.state.y - this.state.charge_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.charge_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          if(this.state.show_place) {
            dx = this.state.x - this.state.place_x;
            dy = this.state.y - this.state.place_y;
            if(Math.abs(dx) > 0 || Math.abs(dy) > 0) {
              this.state.place_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
            }
          }
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        toggle: function(game, type, val) {
          var new_val = (val === undefined) ? !this.state['show_'+type] : val;
          if(new_val) {
            this.state['show_'+type] = new_val;
          }
          else {
            delete this.state['show_'+type];
          }
        },
        toggleColor: function(game, col) {
          if(col) {
            this.state.show_color = col;
          }
          else {
            delete this.state.show_color;
          }
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
        toggleControl: function(game) {
          if(this.info.focus ||
             (this.info.fury && this.info.type !== 'beast')) {
            this.state.show_control = !this.state.show_control;
          }
        },
        setLabel: function(game, label) {
          label = label.trim();
          if(label.length <= 0) return;
          if(0 <= _.indexOf(this.state.label, label)) return;
          this.state.label.push(label);
        },
        clearLabel: function(game, index) {
          if(index >= this.state.label.length) return;
          this.state.label.splice(index, 1);
        },
        clearAllLabel: function(game) {
          this.state.label = [];
        },
        displayLabel: function() {
          return _.reduce(this.state.label, function(memo, lbl) {
            return memo + ' ' + lbl;
          }, '');
        },
        setUnit: function(game, unit) {
          this.state.unit = unit;
        },
        incrementCounter: function(game) {
          this.state.counter++;
        },
        decrementCounter: function(game) {
          this.state.counter = Math.max(0, this.state.counter-1);
        },
        incrementSouls: function(game) {
          this.state.souls++;
        },
        decrementSouls: function(game) {
          this.state.souls = Math.max(0, this.state.souls-1);
        },
        startCharge: function(game, target) {
          this.setChargeTarget(target);
          this.state.charge_x = this.state.x;
          this.state.charge_y = this.state.y;
          this.state.charge_length = 0;
          this.state.charge_rot = this.state.rot;
          this.state.show_charge = true;
        },
        setChargeTarget: function(game, target) {
          this.state.charge_target = target ? target.state.id : null;
          this.alignWithChargeTarget(game);
          if(this.state.charge_length === 0) {
            this.state.charge_rot = this.state.rot;
          }
        },
        alignWithChargeTarget: function(game) {
          if(!this.state.show_charge) return;
          if(this.state.charge_target &&
             game.models[this.state.charge_target]) {
            this.alignWith(game,
                           game.models[this.state.charge_target].state.x,
                           game.models[this.state.charge_target].state.y);
          }
          else {
            this.state.rot = this.state.charge_rot;
          }
        },
        moveChargeFront: function(game, small) {
          if(this.info.immovable) return;
          var dl = small ? 5 : 10;
          var dx =  dl * Math.sin(this.state.charge_rot * Math.PI / 180);
          var dy = -dl * Math.cos(this.state.charge_rot * Math.PI / 180);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        moveChargeBack: function(game, small, target) {
          if(this.info.immovable) return;
          var dl = small ? 5 : 10;
          if(this.state.charge_length - dl < 0) {
            this.state.x = this.state.charge_x;
            this.state.y = this.state.charge_y;
          }
          else {
            var dx = -dl * Math.sin(this.state.charge_rot * Math.PI / 180);
            var dy = dl * Math.cos(this.state.charge_rot * Math.PI / 180);
            this.state.x += dx;
            this.state.y += dy;
          }
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        rotateChargeLeft: function(game, small, target) {
          var dr = small ? 1 : 5;
          this.state.charge_rot -= dr;
          this.state.x = this.state.charge_x +
            Math.sin(this.state.charge_rot*Math.PI/180) * this.state.charge_length;
          this.state.y = this.state.charge_y -
            Math.cos(this.state.charge_rot*Math.PI/180) * this.state.charge_length;
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        rotateChargeRight: function(game, small, target) {
          var dr = small ? 1 : 5;
          this.state.charge_rot += dr;
          this.state.x = this.state.charge_x +
            Math.sin(this.state.charge_rot*Math.PI/180) * this.state.charge_length;
          this.state.y = this.state.charge_y -
            Math.cos(this.state.charge_rot*Math.PI/180) * this.state.charge_length;
          this.refresh(game);
          this.alignWithChargeTarget(game);
        },
        displayChargeLength: function() {
          return Math.round(this.state.charge_length*10)/100;
        },
        chargeTargetInRange: function(game) {
          if(!this.state.charge_target ||
             !game.models[this.state.charge_target]) return false;
          var target = game.models[this.state.charge_target];
          var dx = target.state.x - this.state.x;
          var dy = target.state.y - this.state.y;
          var dist = Math.sqrt(dx*dx+dy*dy) - target.info.r - this.info.r;
          var melee_range = this.state.show_strike ? 40 :
            (this.state.show_reach ? 20 :
             (this.state.show_melee ? 5 : 0));
          return dist <= melee_range;
        },
        endCharge: function(game) {
          this.state.charge_length = 0;
          this.state.show_charge = false;
        },
        startPlace: function(game, target) {
          if(this.info.immovable) return;
          this.state.place_x = this.state.x;
          this.state.place_y = this.state.y;
          this.state.place_length = 0;
          this.state.place_rot = this.state.rot;
          this.state.show_place = true;
        },
        setPlaceOrigin: function(game, origin) {
          if(this.info.immovable) return;
          var dx = this.state.place_x - origin.state.x;
          var dy = this.state.place_y - origin.state.y;
          var rot = Math.atan2(dx, -dy);
          this.state.place_rot = rot * 180 / Math.PI;
          this.state.x = this.state.place_x + this.state.place_length * Math.sin(rot);
          this.state.y = this.state.place_y - this.state.place_length * Math.cos(rot);
          this.refresh(game);
        },
        setPlaceTarget: function(game, target) {
          if(this.info.immovable) return;
          var dx = target.state.x - this.state.place_x;
          var dy = target.state.y - this.state.place_y;
          var rot = Math.atan2(dx, -dy);
          this.state.place_rot = rot * 180 / Math.PI;
          this.state.x = this.state.place_x + this.state.place_length * Math.sin(rot);
          this.state.y = this.state.place_y - this.state.place_length * Math.cos(rot);
          this.refresh(game);
        },
        movePlaceFront: function(game, small) {
          if(this.info.immovable) return;
          var dl = small ? 5 : 10;
          var dx =  dl * Math.sin(this.state.place_rot * Math.PI / 180);
          var dy = -dl * Math.cos(this.state.place_rot * Math.PI / 180);
          this.state.x += dx;
          this.state.y += dy;
          this.refresh(game);
        },
        movePlaceBack: function(game, small, target) {
          if(this.info.immovable) return;
          var dl = small ? 5 : 10;
          if(this.state.place_length - dl < 0) {
            this.state.x = this.state.place_x;
            this.state.y = this.state.place_y;
          }
          else {
            var dx = -dl * Math.sin(this.state.place_rot * Math.PI / 180);
            var dy = dl * Math.cos(this.state.place_rot * Math.PI / 180);
            this.state.x += dx;
            this.state.y += dy;
          }
          this.refresh(game);
        },
        rotatePlaceLeft: function(game, small, target) {
          var dr = small ? 1 : 5;
          this.state.place_rot -= dr;
          this.state.x = this.state.place_x +
            Math.sin(this.state.place_rot*Math.PI/180) * this.state.place_length;
          this.state.y = this.state.place_y -
            Math.cos(this.state.place_rot*Math.PI/180) * this.state.place_length;
          this.refresh(game);
        },
        rotatePlaceRight: function(game, small, target) {
          var dr = small ? 1 : 5;
          this.state.place_rot += dr;
          this.state.x = this.state.place_x +
            Math.sin(this.state.place_rot*Math.PI/180) * this.state.place_length;
          this.state.y = this.state.place_y -
            Math.cos(this.state.place_rot*Math.PI/180) * this.state.place_length;
          this.refresh(game);
        },
        displayPlaceLength: function() {
          return Math.round(this.state.place_length*10)/100;
        },
        deviate: function(game) {
          var deviation = game.rollDeviation(this.state.place_length/20);
          var angle = 60 * (deviation.direction-1) + this.state.place_rot;
          var dx = + deviation.distance * Math.sin(angle*Math.PI/180);
          var dy = - deviation.distance * Math.cos(angle*Math.PI/180);
          this.state.x += dx;
          this.state.y += dy;
          dx = this.state.x - this.state.place_x;
          dy = this.state.y - this.state.place_y;
          this.state.place_rot = Math.atan2(dx, -dy) * 180 / Math.PI;
          this.state.place_max = 0;
          this.refresh(game);
        },
        endPlace: function(game) {
          this.state.place_length = 0;
          this.state.show_place = false;
        },
        startDraging: function(game) {
          this.state_before_drag = _.extend({}, this.state);
        },
        draging: function(game, dx, dy) {
          if(this.info.immovable) return;
          this.state.x = this.state_before_drag.x + dx;
          this.state.y = this.state_before_drag.y + dy;
          this.refresh(game);
        },
        endDraging: function(game, dx, dy) {
          if(this.info.immovable) return;
          this.state.x = this.state_before_drag.x + dx;
          this.state.y = this.state_before_drag.y + dy;
          this.refresh(game);
        },
        toggleDamage: function(game, col, line) {
          switch(this.info.damage.type) {
          case 'beast':
          case 'gargantuan':
          case 'jack':
          case 'colossal':
            {
              var new_val;
              if(col === 'field') {
                this.state.damage.field = (this.state.damage.field === line) ?
                  0 : line;
                return;
              }
              if(undefined === line) {
                var instance = this;
                var box_in_col = _.reduce(this.info.damage[col], function(sum, n) {
                  return (n ? 1 : 0) + sum;
                }, 0);
                var damage_in_col = _.reduce(this.state.damage[col], function(sum, n) {
                  return n + sum;
                }, 0);
                new_val = damage_in_col === box_in_col ? 0 : 1;
                _.each(this.state.damage[col], function(val, i) {
                  if(instance.info.damage[col][i]) {
                    var old_val = instance.state.damage[col][i];
                    instance.state.damage[col][i] = new_val;
                    instance.state.damage.total += new_val - old_val;
                  }
                });
                break;
              }
              if(this.info.damage[col][line]) {
                if(this.info.damage[col][line]) {
                  var old_val = this.state.damage[col][line];
                  this.state.damage[col][line] = 
                    this.state.damage[col][line] === 1 ? 0 : 1;
                  new_val = this.state.damage[col][line];
                  this.state.damage.total += (new_val - old_val);
                }
              }
              break;
            }
          case 'warrior':
            {
              this.state.damage.n = 
                this.state.damage.n === col ? 0 : col;
              this.state.damage.total = this.state.damage.n;
              break;
            }
          }
        },
        resetAllDamage: function(game) {
          switch(this.info.damage.type) {
          case 'jack': 
          case 'beast': 
          case 'gargantuan': 
            {
              this.state.damage = {
                'total': 0,
                '1': Array.apply(null, new Array(this.info.damage.depth))
                  .map(Number.prototype.valueOf,0),
                '2': Array.apply(null, new Array(this.info.damage.depth))
                  .map(Number.prototype.valueOf,0),
                '3': Array.apply(null, new Array(this.info.damage.depth))
                  .map(Number.prototype.valueOf,0),
                '4': Array.apply(null, new Array(this.info.damage.depth))
                  .map(Number.prototype.valueOf,0),
                '5': Array.apply(null, new Array(this.info.damage.depth))
                  .map(Number.prototype.valueOf,0),
                '6': Array.apply(null, new Array(this.info.damage.depth))
                  .map(Number.prototype.valueOf,0),
                'field': 0
              };
              break;
            }
          case 'colossal': 
            {
              this.state.damage = {
                'total': 0,
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
                'R6': [ 0, 0, 0, 0, 0, 0 ],
                'field': 0
              };
              break;
            }
          case 'warrior': 
            {
              this.state.damage = {
                'total': 0,
                'n': 0
              };
              break;
            }
          }
        },
        effects: function() {
          var effects = [];
          if(this.state.show_blind) effects.push('B');
          if(this.state.show_corrosion) effects.push('C');
          if(this.state.show_disrupt) effects.push('D');
          if(this.state.show_fire) effects.push('F');
          if(this.state.show_kd) effects.push('K');
          if(this.state.show_stationary) effects.push('S');
          // console.log(effects);
          return effects;
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
            counter: args[1].type === 'wardude' ? (args[1].focus ? args[1].focus : args[1].fury) : 0,
            souls: 0,
            label: [],
            unit: null,
            show_image: true,
            show_counter: args[1].type === 'wardude' ||
              args[1].type === 'beast' ||
              args[1].type === 'jack',
          } : _.extend({
            id: args[0],
            x: 240,
            y: 240,
            rot: 0,
            counter: args[1].type === 'wardude' ? (args[1].focus ? args[1].focus : args[1].fury) : 0,
            souls: 0,
            label: [],
            unit: null,
            show_image: true,
            show_counter:  args[1].type === 'wardude' ||
              args[1].type === 'beast' ||
              args[1].type === 'jack',
          }, args[2])
        };
        switch(instance.info.damage.type) {
        case 'jack': 
        case 'beast': 
        case 'gargantuan': 
          {
            instance.state.damage = {
              'total': 0,
              '1': Array.apply(null, new Array(instance.info.damage.depth))
                .map(Number.prototype.valueOf,0),
              '2': Array.apply(null, new Array(instance.info.damage.depth))
                .map(Number.prototype.valueOf,0),
              '3': Array.apply(null, new Array(instance.info.damage.depth))
                .map(Number.prototype.valueOf,0),
              '4': Array.apply(null, new Array(instance.info.damage.depth))
                .map(Number.prototype.valueOf,0),
              '5': Array.apply(null, new Array(instance.info.damage.depth))
                .map(Number.prototype.valueOf,0),
              '6': Array.apply(null, new Array(instance.info.damage.depth))
                .map(Number.prototype.valueOf,0),
              'field': 0
            };
            break;
          }
        case 'colossal': 
          {
            instance.state.damage = {
              'total': 0,
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
              'R6': [ 0, 0, 0, 0, 0, 0 ],
              'field': 0
            };
            break;
          }
        case 'warrior': 
          {
            instance.state.damage = {
              'total': 0,
              'n': 0
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
