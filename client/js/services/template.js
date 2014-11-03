'use strict';

angular.module('vassalApp.services')
  .value('template_base', {
    refresh: function(game) {
      this.x = Math.max(0, this.x);
      this.x = Math.min(game.board.width,
                        this.x);
      this.y = Math.max(0, this.y);
      this.y = Math.min(game.board.height,
                        this.y);
    },
    reset: function(game, x, y, rot) {
      this.origin = null;
      this.set(game, x, y, rot);
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
      this.x += dx;
      this.y += dy;
      this.refresh(game);
    },
    moveBack: function(game, small) {
      var dl = small ? 1 : 10;
      var dx = -dl * Math.sin(this.rot * Math.PI / 180);
      var dy = dl * Math.cos(this.rot * Math.PI / 180);
      this.x += dx;
      this.y += dy;
      this.refresh(game);
    },
    rotateLeft: function(game, small) {
      var dr = small ? this.drot[0] : this.drot[1];
      this.rot = this.rot - dr;
      this.refresh(game);
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
      var dr = small ? this.drot[0] : this.drot[1];
      this.rot = this.rot + dr;
      this.refresh(game);
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
      this.origin = null;
    },
    toggleSize: function(game, size) {
      this.size = size;
    },
    startDraging: function(game) {
      this.startDraging.ref = _.deepCopy(this);
    },
    draging: function(game, dx, dy) {
      this.x = this.startDraging.ref.x + dx;
      this.y = this.startDraging.ref.y + dy;
      this.refresh(game);
    },
    overlappingModels: function(game) {
      return [];
    },
    setLabel: function(game, label) {
      label = label.trim();
      if(label.length <= 0) return;
      if(!this.label) this.label = [];
      if(0 <= _.indexOf(this.label, label)) return;
      this.label.push(label);
    },
    clearLabel: function(game, index) {
      if(index >= this.label.length) return;
      this.label.splice(index, 1);
    },
    clearAllLabel: function(game) {
      this.label = [];
    },
    displayLabel: function() {
      return _.reduce(this.label, function(memo, lbl) {
        return memo + ' ' + lbl;
      }, '');
    }
  })
  .factory('template_aoe', [
    'template_base',
    function(template_base) {
      var aoe_base = _.defaults({
        type: 'aoe',
        drot: [ 10, 60 ],
        refresh: function(game) {
          if(this.origin &&
             game.models[this.origin]) {
            var origin_model = game.models[this.origin];
            var dx = this.x - origin_model.state.x;
            var dy = -(this.y - origin_model.state.y);
            this.rot = Math.atan2(dx, dy) * 180 / Math.PI;

            var dist = Math.sqrt(dx*dx + dy*dy);
            this.max_deviation = (((dist / 2)*10)>>0)/100;
          }
          else {
            this.max_deviation = 6;
          }
          template_base.refresh.apply(this, Array.prototype.slice.call(arguments));
        },
        reset: function(game, x, y, rot, max_dev) {
          template_base.reset.apply(this, Array.prototype.slice.call(arguments));
          this.max_deviation = max_dev ? max_dev : 6;
        },
        rotateLeft: function(game, small) {
          this.origin = null;
          this.max_deviation = 6;
          template_base.rotateLeft.apply(this, Array.prototype.slice.call(arguments));
        },
        rotateRight: function(game, small) {
          this.origin = null;
          this.max_deviation = 6;
          template_base.rotateRight.apply(this, Array.prototype.slice.call(arguments));
        },
        overlappingModels: function(game) {
          var instance = this;
          return _.filter(game.models, function(model) {
            var dx = instance.x - model.state.x;
            var dy = instance.y - model.state.y;
            return Math.sqrt(dx*dx + dy*dy) <= (instance.size*5) + model.info.r;
          }).map(function(model) { return model.state.id; });
        }
      }, template_base);
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
  .factory('template_spray', [
    'template_base',
    function(template_base) {
      var spray_base = _.defaults({
        type: 'spray',
        drot: [2, 12],
        max_deviation: 6,
        refresh: function(game) {
          if(this.origin &&
             game.models[this.origin]) {
            var origin_model = game.models[this.origin];
            this.x = origin_model.state.x +
              origin_model.info.r * Math.sin(this.rot*Math.PI/180);
            this.y = origin_model.state.y -
              origin_model.info.r * Math.cos(this.rot*Math.PI/180);
          }
          template_base.refresh.apply(this, Array.prototype.slice.call(arguments));
        },
        moveFront: function(game, small) {
          this.origin = null;
          template_base.moveFront.apply(this, Array.prototype.slice.call(arguments));
        },
        moveBack: function(game, small) {
          this.origin = null;
          template_base.moveBack.apply(this, Array.prototype.slice.call(arguments));
        },
        moveLeft: function(game, small) {
          this.origin = null;
          template_base.moveLeft.apply(this, Array.prototype.slice.call(arguments));
        },
        moveUp: function(game, small) {
          this.origin = null;
          template_base.moveUp.apply(this, Array.prototype.slice.call(arguments));
        },
        moveRight: function(game, small) {
          this.origin = null;
          template_base.moveRight.apply(this, Array.prototype.slice.call(arguments));
        },
        moveDown: function(game, small) {
          this.origin = null;
          template_base.moveDown.apply(this, Array.prototype.slice.call(arguments));
        },
        startDraging: function(game) {
          this.origin = null;
          template_base.startDraging.apply(this, Array.prototype.slice.call(arguments));
        },
        draging: function(game, dx, dy) {
          this.origin = null;
          template_base.draging.apply(this, Array.prototype.slice.call(arguments));
        }
      }, template_base);
      var factory = function(data) {
        _.extend(data, spray_base);
        if(undefined === data.stamp) {
          data.stamp = Date.now();
        }
        return data;
      };
      return factory;
    }
  ])
  .factory('template_wall', [
    'template_base',
    function(template_base) {
      var wall_base = _.defaults({
        type: 'wall',
        drot: [2, 12]
      }, template_base);
      var factory = function(data) {
        _.extend(data, wall_base);
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
    'template_spray',
    'template_wall',
    function(template_aoe,
             template_spray,
             template_wall) {
      var factories = {
        aoe: template_aoe,
        spray: template_spray,
        wall: template_wall,
      };
      var factory = function(options) {
        if(_.isFunction(factories[options.type])) {
          return factories[options.type](options);
        }
      };
      return factory;
    }
  ]);
