'use strict';

angular.module('vassalApp.services')
  .factory('game', [
    '$rootScope',
    '$http',
    '$window',
    '$q',
    'model',
    'template',
    'command',
    'user',
    'twoPlayerClock',
    function($rootScope,
             $http,
             $window,
             $q,
             model,
             template,
             command,
             user,
             twoPlayerClock) {

      var model_base = model({});
      var game_source = null;

      function modelInCircle(model, circle) {
        var dx = circle.x - model.state.x;
        var dy = circle.y - model.state.y;
        return Math.sqrt(dx*dx + dy*dy) <= (model.info.r + circle.r);
      }
      function modelWithinFlag(model, flag) {
        var f_r = $rootScope.factions.list.scenario.models.flags[flag.type].r;
        var dx = flag.x - model.state.x;
        var dy = flag.y - model.state.y;
        return Math.sqrt(dx*dx + dy*dy) <= (model.info.r + 40 + f_r);
      }
      function modelInRectangle(model, rect) {
        var dx, dy;
        if(model.state.x >= rect.x - rect.width/2 &&
           model.state.x <= rect.x + rect.width/2 &&
           model.state.y >= rect.y - rect.height/2 &&
           model.state.y <= rect.y + rect.height/2) return true;
        if(model.state.x + model.info.r >= rect.x - rect.width/2 &&
           model.state.x < rect.x - rect.width/2) {
          dx = rect.x - rect.width/2 - model.state.x;
          dy = Math.sqrt(model.info.r*model.info.r - dx*dx);
          return model.state.y + dy >= rect.y - rect.height/2 &&
            model.state.y - dy <= rect.y + rect.height/2;
        }
        if(model.state.x - model.info.r <= rect.x + rect.width/2 &&
           model.state.x > rect.x + rect.width/2) {
          dx = rect.x + rect.width/2 - model.state.x;
          dy = Math.sqrt(model.info.r*model.info.r - dx*dx);
          return model.state.y + dy >= rect.y - rect.height/2 &&
            model.state.y - dy <= rect.y + rect.height/2;
        }
        if(model.state.y + model.info.r >= rect.y - rect.height/2 &&
           model.state.y < rect.y - rect.height/2) {
          dy = rect.y - rect.height/2 - model.state.y;
          dx = Math.sqrt(model.info.r*model.info.r - dy*dy);
          return model.state.x + dx >= rect.x - rect.width/2 &&
            model.state.x - dx <= rect.x + rect.width/2;
        }
        if(model.state.y - model.info.r <= rect.y + rect.height/2 &&
           model.state.y > rect.y + rect.height/2) {
          dy = rect.y + rect.height/2 - model.state.y;
          dx = Math.sqrt(model.info.r*model.info.r - dy*dy);
          return model.state.x + dx >= rect.x - rect.width/2 &&
            model.state.x - dx <= rect.x + rect.width/2;
        }
        return false;
      }

      var factory = function(data) {
        
        var instance = {
          loading: true,
          clock: null,
          scenario: null,
          contestingModels: function() {
            if(!instance.scenario) return [];
            return _.filter(instance.models, function(model) {
              var contesting = _.reduce(instance.scenario.circle, function(mem, c) {
                return mem || modelInCircle(model, c);
              }, false);
              contesting = contesting || _.reduce(instance.scenario.flags, function(mem, f) {
                return mem || modelWithinFlag(model, f);
              }, contesting);
              contesting = contesting || _.reduce(instance.scenario.rect, function(mem, r) {
                return mem || modelInRectangle(model, r);
              }, contesting);
              return contesting;
            }).map(function(model) { return model.state.id; });
          },
          new_model_id: 0,
          models: {},
          createModel: function(options) {
            var new_models = [];
            _.each(options, function(option) {
              var state = _.omit(option, 'info');
              var new_model = model(instance.new_model_id++,
                                    option.info, state);
              new_model.refresh(instance);
              instance.models[new_model.state.id] = new_model;
              new_models.push(new_model);
            });
            return new_models;
          },
          drop_bin: {},
          selection: [],
          update_selection: [],
          onSelection: function(method_name) {
            if(_.isFunction(model_base[method_name])) {
              var forward_args = Array.prototype.slice.call(arguments, 1);
              _.each(this.selection, function(id) {
                instance.models[id][method_name].apply(instance.models[id],
                                                       [instance].concat(forward_args));
              });
            }
          },
          addToSelection: function(model_ids) {
            this.selection = _.uniq(this.selection.concat(model_ids));
          },
          removeFromSelection: function(model_ids) {
            this.selection = _.without.apply(_, [this.selection].concat(model_ids));
          },
          setSelection: function(model_ids) {
            this.clearSelection();
            this.addToSelection(model_ids);
          },
          clearSelection: function() {
            this.selection.length = 0;
          },
          dropModels: function(ids) {
            this.selection = _.without.apply(_, [this.selection].concat(ids));
            this.update_selection = _.without.apply(_, [this.update_selection].concat(ids));
            _.each(ids, function(id) {
              if(_.has(instance.models, id)) {
                instance.drop_bin[id] = instance.models[id];
                delete instance.models[id];
              }
            });
          },
          restoreFromDropBin: function(ids) {
            _.each(ids, function(id) {
              if(_.has(instance.drop_bin, id)) {
                instance.models[id] = instance.drop_bin[id];
                delete instance.drop_bin[id];
              }
            });
          },
          templates: {
            aoe: {},
            spray: {},
            wall: {},
            active: null,
          },
          createTemplate: function(options) {
            var temp = template(options);
            this.templates[temp.type][temp.stamp] = temp;
            this.templates.active = temp;
            return temp;
          },
          replay_commands: [],
          new_commands: [],
          commands: [],
          chat_commands: [],
          newChat: function(chat_msg) {
            var new_cmd = command('sendMsg', 'chat', chat_msg);
            new_cmd.do_not_log = true;
            new_cmd.user = user.name;
            new_cmd.execute(this);

            this.new_commands.push(new_cmd);
            $http.post('/api/games/public/'+instance.public_id+'/chat', new_cmd)
              .then(function(response) {
                // console.log('send cmd success');
              }, function(response) {
                console.log('send chat cmd error');
                console.log(response);
              });
          },
          newCommand: function(new_cmd) {
            new_cmd.user = user.name;
            new_cmd.execute(this);
            if(!instance.id) return;
            this.new_commands.push(new_cmd);
            $http.post('/api/games/'+instance.id+'/commands', new_cmd)
              .then(function(response) {
                // console.log('send cmd success');
              }, function(response) {
                console.log('send cmd error');
                console.log(response);
              });
          },
          undoCommand: function(index) {
            if(index >= this.commands.length) return;
            return $http.put('/api/games/'+this.id+'/commands/undo',
                             { stamp: this.commands[index].stamp })
              .then(function(response) {
                // console.log('send undo cmd success');
                return response;
              }, function(response) {
                console.log('send undo cmd error');
                console.log(response);
                return $q.reject(response);
              });
          },
          undoLastCommand: function() {
            if(this.commands.length <= 0) return;
            this.undoCommand(this.commands.length-1);
          },
          undoAllCommands: function(left) {
            if(undefined === left) return this.undoAllCommands(this.commands.length);
            if(left <= 0) return;
            this.undoCommand(left-1).then(function() {
              left--;
              instance.undoAllCommands(left);
            });
          },
          _undoCommandUpTo: function(stamp, left) {
            if(this.commands.length <= 0) return;
            if(this.commands[left-1].stamp === stamp) return;
            this.undoCommand(left-1).then(function() {
              left--;
              instance._undoCommandUpTo(stamp, left);
            });
          },
          undoCommandUpTo: function(stamp) {
            var cmd = _.find(this.commands, function(cmd) {
              return cmd.stamp === stamp;
            });
            if(!cmd) return;
            this._undoCommandUpTo(stamp, this.commands.length);
          },
          replayCommand: function(index) {
            if(index >= this.replay_commands.length) return;
            var replay = this.replay_commands[index];
            return $http.post('/api/games/'+instance.id+'/commands', replay)
              .then(function(response) {
                console.log('send replay cmd success');
                return response;
              }, function(response) {
                console.log('send replay cmd error');
                console.log(response);
                return $q.reject(response);
              });
          },
          replayNextCommand: function() {
            if(0 >= this.replay_commands.length) return;
            this.replayCommand(this.replay_commands.length-1);
          },
          replayAllCommands: function(left) {
            if(undefined === left) return this.replayAllCommands(this.replay_commands.length);
            if(left <= 0) return;
            this.replayCommand(left-1).then(function() {
              left--;
              instance.replayAllCommands(left);
            });
          },
          _replayCommandUpTo: function(stamp, left) {
            if(this.replay_commands.length <= 0) return;
            var stop = (this.replay_commands[left-1].stamp === stamp);
            this.replayCommand(left-1).then(function() {
              if(stop) return;
              left--;
              instance._replayCommandUpTo(stamp, left);
            });
          },
          replayCommandUpTo: function(stamp) {
            var cmd = _.find(this.replay_commands, function(cmd) {
              return cmd.stamp === stamp;
            });
            if(!cmd) return;
            this._replayCommandUpTo(stamp, this.replay_commands.length);
          },
          updateCommand: function(new_cmd) {
            if( _.find(this.commands, function(cmd) { return cmd.stamp === new_cmd.stamp; })) {
              console.log('cmd udpate : already in commands queue');
              return;
            }
            var find_cmd = _.findWhere(this.new_commands, { stamp: new_cmd.stamp });
            var index;
            if(find_cmd) {
              index = _.indexOf(this.new_commands, find_cmd);
              if(!find_cmd.do_not_log) {
                this.commands.push(find_cmd);
              }
              this.new_commands.splice(index, 1);
              console.log('cmd udpate : validate new command');
              if(new_cmd.type === 'sendMsg' &&
                 new_cmd.msg_type === 'chat') {
                instance.chat_commands.push(new_cmd);
                return;
              }
              return;
            }
            find_cmd = _.findWhere(this.replay_commands, { stamp: new_cmd.stamp });
            if(find_cmd) {
              find_cmd.redo(this);
              index = _.indexOf(this.replay_commands, find_cmd);
              this.commands.push(find_cmd);
              this.replay_commands.splice(index, 1);
              console.log('cmd udpate : validate replay command');
              return;
            }
            console.log('cmd udpate : execute new command');
            if(new_cmd.type === 'sendMsg' &&
               new_cmd.msg_type === 'chat') {
              instance.chat_commands.push(new_cmd);
              $rootScope.$broadcast('game_chat', new_cmd);
              return;
            }
            new_cmd.redo(this);
            if(!new_cmd.do_not_log) {
              this.commands.push(new_cmd);
            }
          },
          rollDie: function(sides) {
            var n = sides || 6;
            var rand = Math.random();
            var die_float = rand * n + 1;
            return die_float >> 0;
          },
          rollDice: function(nb_dice, sides) {
            var dice = [];
            _.times(nb_dice, function() {
              dice.push(instance.rollDie(sides));
            });
            var total = _.reduce(dice, function(t, d) {
              return t+d;
            }, 0);
            var msg_text = 'd'+(sides||6)+JSON.stringify(dice)+' = '+total;
            this.newCommand(command('sendMsg', 'dice', msg_text));
          },
          rollDeviation: function(dist_max) {
            var direction = instance.rollDie();
            var distance = Math.min(instance.rollDie(), dist_max ? dist_max : 6);
            var text = 'AoE deviation : direction '+direction+', distance '+distance+'"';
            this.newCommand(command('sendMsg', 'dice', text));
            return {
              direction: direction,
              distance: distance*10,
            };
          },
          layers: {
            board: true,
            terrain: true,
            deployment: false,
            scenario: true,
            models: true,
            templates: true,
            view_controls: true
          },
          board: {
            info: null,
            window: {
              width: 800,
              height: 800
            },
            width: 480,
            height: 480,
            zoom: {
              factor: 1.0,
              cx: 0,
              cy: 0,
              flipped: false,
            },
            refreshZoom: function() {
              var cont = document.getElementById('canvas-container');
              this.zoom.cx = (cont.scrollLeft + this.window.width/2) / this.zoom.factor;
              this.zoom.cy = (cont.scrollTop + this.window.height/2) / this.zoom.factor;
            },
            refreshView: function() {
              var zoom = this.zoom;
              var win = this.window;
              window.setTimeout(function() {
                var cont = document.getElementById('canvas-container');
                cont.scrollLeft = (zoom.cx * zoom.factor - win.width/2);
                cont.scrollTop = (zoom.cy * zoom.factor - win.height/2);
              }, 0);
            },
            reset: function() {
              this.zoom.factor = 1;
            },
            zoomIn: function() {
              this.refreshZoom();
              this.zoom.factor *= 1.5;
              this.refreshView();
            },
            zoomOut: function() {
              this.refreshZoom();
              this.zoom.factor = Math.max(1.0, this.zoom.factor / 1.5);
              this.refreshView();
            },
            moveLeft: function() {
              var cont = document.getElementById('canvas-container');
              cont.scrollLeft = (cont.scrollLeft - 50);
            },
            moveUp: function() {
              var cont = document.getElementById('canvas-container');
              cont.scrollTop = (cont.scrollTop - 50);
            },
            moveRight: function() {
              var cont = document.getElementById('canvas-container');
              cont.scrollLeft = (cont.scrollLeft + 50);
            },
            moveDown: function() {
              var cont = document.getElementById('canvas-container');
              cont.scrollTop = (cont.scrollTop + 50);
            },
          },
          ruler: {
            state: {
              x1: 0, y1: 0,
              x2: 100, y2: 100,
              length: 90,
              range: 0,
              active: false
            },
            origin: null,
            target: null,
            cmd: undefined,
            sendStateCmd: function() {
              if(!this.cmd) {
                this.cmd = command('setRuler', this.state);
              }
              instance.newCommand(this.cmd);
              this.cmd = undefined;
            },
            setActive: function(active) {
              if(this.state.active != active) {
                var previous = this.state.active;
                if(!this.cmd) {
                  this.cmd = command('setRuler', this.state);
                }
                this.state.active = active;
                if(!(previous === 'draging' && !active)) {
                  instance.newCommand(this.cmd);
                }
                else {
                  this.cmd.undo(instance);
                }
              }
              this.cmd = undefined;
            },
            startDraging: function(x, y) {
              this.cmd = command('setRuler', this.state);
              this.setStart(x, y);
              this.state.active = true;
            },
            endDraging: function(x, y) {
              this.setEnd(x, y);
              this.refresh();
              this.sendStateCmd();
            },
            setStart: function(x, y) {
              this.state.length = '';
              this.state.x1 = x;
              this.state.y1 = y;
              this.state.x2 = x;
              this.state.y2 = y;
            },
            setEnd: function(x, y) {
              this.state.x2 = x;
              this.state.y2 = y;
            },
            refresh: function() {
              var dx = this.state.x2-this.state.x1;
              var dy = this.state.y2-this.state.y1;
              this.state.length = Math.sqrt( dx*dx + dy*dy );
              this.state.length = ((this.state.length * 10 + 0.5) >> 0) / 100;
            }
          },
          los: {
            state: {
              x1: 0, y1: 0,
              x2: 100, y2: 100,
              active: false
            },
            setActive: function(active) {
              this.state.active = active;
              this.state.model_active = active;
            },
            startDraging: function(x, y) {
              this.setStart(x, y);
              this.state.active = true;
            },
            endDraging: function(x, y) {
              this.setEnd(x, y);
            },
            setStart: function(x, y) {
              this.state.x1 = x;
              this.state.y1 = y;
              this.state.x2 = x;
              this.state.y2 = y;
            },
            setEnd: function(x, y) {
              this.state.x2 = x;
              this.state.y2 = y;
            },
            setOrigin: function(model) {
              this.state.origin = model.state.id;
              delete this.state.target;
            },
            setTarget: function(model) {
              this.state.target = model.state.id;
              if(!this.state.origin) return;
              var x1 = instance.models[this.state.origin].state.x;
              var y1 = instance.models[this.state.origin].state.y;
              var r1 = instance.models[this.state.origin].info.r;
              var x2 = instance.models[this.state.target].state.x;
              var y2 = instance.models[this.state.target].state.y;
              var r2 = instance.models[this.state.target].info.r;
              var dx = x2 - x1;
              var dy = y2 - y1;
              var rad = Math.atan2(dx, -dy);
              var dist = Math.sqrt(dx*dx + dy*dy);
              var dr = Math.abs(r1 - r2);
              var drad = Math.asin(dr/dist) * (r1 >= r2 ? 1 : -1);
              this.state.ot1_x1 = x1 + Math.sin(rad+Math.PI/2-drad) * r1;
              this.state.ot1_y1 = y1 - Math.cos(rad+Math.PI/2-drad) * r1;
              this.state.ot1_x2 = x2 + Math.sin(rad+Math.PI/2-drad) * r2;
              this.state.ot1_y2 = y2 - Math.cos(rad+Math.PI/2-drad) * r2;
              this.state.ot2_x1 = x1 + Math.sin(rad-Math.PI/2+drad) * r1;
              this.state.ot2_y1 = y1 - Math.cos(rad-Math.PI/2+drad) * r1;
              this.state.ot2_x2 = x2 + Math.sin(rad-Math.PI/2+drad) * r2;
              this.state.ot2_y2 = y2 - Math.cos(rad-Math.PI/2+drad) * r2;
              var dx1 = this.state.ot1_x2 - this.state.ot1_x1;
              var dy1 = this.state.ot1_y2 - this.state.ot1_y1;
              var d1 = Math.sqrt(dx1*dx1 + dy1*dy1);
              var u1_x = dx1 / d1;
              var u1_y = dy1 / d1;
              // console.log(d1);
              var dx2 = this.state.ot2_x2 - this.state.ot2_x1;
              var dy2 = this.state.ot2_y2 - this.state.ot2_y1;
              var d2 = Math.sqrt(dx2*dx2 + dy2*dy2);
              var u2_x = dx2 / d2;
              var u2_y = dy2 / d2;
              // console.log(d2);
              this.state.intervs = _.filter(instance.models, function(model) {
                if(instance.los.state.target === model.state.id ||
                   instance.los.state.origin === model.state.id ||
                   r2 > model.info.r) return false;
                var m_dx = model.state.x - instance.los.state.ot1_x1;
                var m_dy = model.state.y - instance.los.state.ot1_y1;
                var vect_prod = u1_y * m_dx - u1_x * m_dy;
                var scal_prod = u1_x * m_dx + u1_y * m_dy;
                // console.log(model.info.name, model.info.r, vect_prod, scal_prod);
                var m_l1 = (vect_prod + model.info.r >= 0 &&
                            scal_prod + model.info.r >= 0 &&
                            scal_prod - model.info.r <= d1);

                m_dx = model.state.x - instance.los.state.ot2_x1;
                m_dy = model.state.y - instance.los.state.ot2_y1;
                vect_prod = u2_y * m_dx - u2_x * m_dy;
                scal_prod = u2_x * m_dx + u2_y * m_dy;
                // console.log(model.info.name, model.info.r, vect_prod, scal_prod);
                var m_l2 = (vect_prod - model.info.r <= 0 &&
                            scal_prod + model.info.r >= 0 &&
                            scal_prod - model.info.r <= d2);
                return m_l1 && m_l2;
              }).map(function(model) { return model.state.id; });
              // console.log(this.state.intervs);
              this.computeLos();
            },
            toggleInterveningModel: function(model) {
              if(_.find(this.state.intervs, function(i) { return i === model.state.id; })) {
                this.state.intervs = _.without(this.state.intervs, model.state.id);
              }
              else {
                this.state.intervs.push(model.state.id);
              }
              this.computeLos();
            },
            computeLos: function() {
              var x1 = instance.models[this.state.origin].state.x;
              var y1 = instance.models[this.state.origin].state.y;
              var r1 = instance.models[this.state.origin].info.r;
              var x2 = instance.models[this.state.target].state.x;
              var y2 = instance.models[this.state.target].state.y;
              var r2 = instance.models[this.state.target].info.r;
              var dx = x2 - x1;
              var dy = y2 - y1;
              var rad = Math.atan2(dx, -dy);
              var dist = Math.sqrt(dx*dx + dy*dy);
              var dr = Math.abs(r1 - r2);
              var drad = Math.asin(dr/dist) * (r1 >= r2 ? 1 : -1);

              instance.los.state.darkness = instance.los.state.darkness || [];
              instance.los.state.darkness.length = 0;
              instance.los.state.shadows = instance.los.state.shadows || [];
              instance.los.state.shadows.length = 0;
              _.each(this.state.intervs, function(id) {
                var model = instance.models[id];
                if(!model) return;
                console.log(model.info.name);

                x2 = model.state.x;
                y2 = model.state.y;
                r2 = model.info.r;
                dx = x2 - x1;
                dy = y2 - y1;
                rad = Math.atan2(dx, -dy);
                dist = Math.sqrt(dx*dx + dy*dy);
                dr = Math.abs(r1 - r2);
                drad = Math.asin(dr/dist) * (r1 >= r2 ? 1 : -1);

                var l1_x1, l1_x2;
                var l1_y1, l1_y2;
                var l1_dx, l1_dy, l1_d;
                var l1_ux, l1_uy;
                l1_x1 = x1 + Math.sin(rad+Math.PI/2-drad) * r1;
                l1_y1 = y1 - Math.cos(rad+Math.PI/2-drad) * r1;
                l1_x2 = x2 + Math.sin(rad+Math.PI/2-drad) * r2;
                l1_y2 = y2 - Math.cos(rad+Math.PI/2-drad) * r2;
                l1_dx = l1_x2 - l1_x1;
                l1_dy = l1_y2 - l1_y1;
                l1_d = Math.sqrt(l1_dx*l1_dx + l1_dy*l1_dy);
                l1_ux = l1_dx / l1_d;
                l1_uy = l1_dy / l1_d;

                var l2_x1, l2_y1;
                var l2_x2, l2_y2;
                var l2_dx, l2_dy, l2_d;
                var l2_ux, l2_uy;
                l2_x1 = x1 + Math.sin(rad-Math.PI/2+drad) * r1;
                l2_y1 = y1 - Math.cos(rad-Math.PI/2+drad) * r1;
                l2_x2 = x2 + Math.sin(rad-Math.PI/2+drad) * r2;
                l2_y2 = y2 - Math.cos(rad-Math.PI/2+drad) * r2;
                l2_dx = l2_x2 - l2_x1;
                l2_dy = l2_y2 - l2_y1;
                l2_d = Math.sqrt(l2_dx*l2_dx + l2_dy*l2_dy);
                l2_ux = l2_dx / l2_d;
                l2_uy = l2_dy / l2_d;

                var l1_x3, l1_y3;
                var l2_x3, l2_y3;
                var vector_product = l2_ux * l1_uy - l2_uy * l1_ux;
                var l12_dx, l12_dy, l12_d;
                var l12_ux, l12_uy;
                var alpha, beta;
                var a, b;
                if(vector_product < 0) {
                  l12_dx = l2_x2 - l1_x2;
                  l12_dy = l2_y2 - l1_y2;
                  l12_d = Math.sqrt(l12_dx*l12_dx + l12_dy*l12_dy);
                  l12_ux = l12_dx / l12_d;
                  l12_uy = l12_dy / l12_d;
                  alpha = Math.acos(l12_ux * l1_ux + l12_uy * l1_uy);
                  beta = Math.acos(-l12_ux * l2_ux - l12_uy * l2_uy);
                  a = l12_d * Math.sin(alpha) / Math.sin(alpha+beta);
                  b = l12_d * Math.sin(beta) / Math.sin(alpha+beta);
                  a = Math.min(800, a);
                  b = Math.min(800, b);
                  l1_x3 = l1_x2 + l1_ux * b;
                  l1_y3 = l1_y2 + l1_uy * b;
                  l2_x3 = l2_x2 + l2_ux * a;
                  l2_y3 = l2_y2 + l2_uy * a;
                }
                else {
                  l1_x3 = l1_x2 + l1_ux * 800;
                  l1_y3 = l1_y2 + l1_uy * 800;
                  l2_x3 = l2_x2 + l2_ux * 800;
                  l2_y3 = l2_y2 + l2_uy * 800;
                }
                instance.los.state.darkness.push({
                  x1: l1_x2, y1: l1_y2,
                  x2: l1_x3, y2: l1_y3,
                  x3: l2_x3, y3: l2_y3,
                  x4: l2_x2, y4: l2_y2
                });

                var rad_inf = rad-Math.PI/2+drad;
                var rad_sup = rad+Math.PI/2-drad;
                var rad_inc = (rad_sup - rad_inf) / 180;
                var ray_orig, ray_interv;
                var ray_rad, ray_drad;
                var ray_dx, ray_dy, ray_d;

                for(ray_orig = rad_sup ; ray_orig > rad_inf ; ray_orig -= rad_inc) {
                  l1_x1 = x1 + Math.sin(ray_orig) * r1;
                  l1_y1 = y1 - Math.cos(ray_orig) * r1;
                  ray_dx = model.state.x - l1_x1;
                  ray_dy = model.state.y - l1_y1;
                  ray_d = Math.sqrt(ray_dx*ray_dx + ray_dy*ray_dy);
                  ray_rad = Math.atan2(ray_dx, -ray_dy);
                  ray_drad = Math.acos(r2 / ray_d);
                  l1_x2 = x2 + Math.sin(ray_rad+Math.PI-ray_drad) * r2;
                  l1_y2 = y2 - Math.cos(ray_rad+Math.PI-ray_drad) * r2;

                  l1_dx = l1_x2 - l1_x1;
                  l1_dy = l1_y2 - l1_y1;
                  l1_d = Math.sqrt(l1_dx*l1_dx + l1_dy*l1_dy);
                  l1_ux = l1_dx / l1_d;
                  l1_uy = l1_dy / l1_d;

                  ray_interv = false;
                  _.each(instance.los.state.intervs, function(id) {
                    var other = instance.models[id];
                    if(!other) return;
                    if(model.state.id === other.state.id) return;
                    var m_dx = other.state.x - l1_x1;
                    var m_dy = other.state.y - l1_y1;
                    var vect_prod = l1_uy * m_dx - l1_ux * m_dy;
                    var scal_prod = l1_ux * m_dx + l1_uy * m_dy;
                    ray_interv = ray_interv || 
                      (Math.abs(vect_prod) < other.info.r &&
                       scal_prod + other.info.r >= 0 &&
                       scal_prod - other.info.r <= l1_d);
                  });
                  if(!ray_interv) break;
                }
                for(ray_orig = rad_inf ; ray_orig < rad_sup ; ray_orig += rad_inc) {
                  l2_x1 = x1 + Math.sin(ray_orig) * r1;
                  l2_y1 = y1 - Math.cos(ray_orig) * r1;
                  ray_dx = model.state.x - l2_x1;
                  ray_dy = model.state.y - l2_y1;
                  ray_d = Math.sqrt(ray_dx*ray_dx + ray_dy*ray_dy);
                  ray_rad = Math.atan2(ray_dx, -ray_dy);
                  ray_drad = Math.acos(r2 / ray_d);
                  l2_x2 = x2 + Math.sin(ray_rad-Math.PI+ray_drad) * r2;
                  l2_y2 = y2 - Math.cos(ray_rad-Math.PI+ray_drad) * r2;

                  l2_dx = l2_x2 - l2_x1;
                  l2_dy = l2_y2 - l2_y1;
                  l2_d = Math.sqrt(l2_dx*l2_dx + l2_dy*l2_dy);
                  l2_ux = l2_dx / l2_d;
                  l2_uy = l2_dy / l2_d;

                  ray_interv = false;
                  _.each(instance.los.state.intervs, function(id) {
                    var other = instance.models[id];
                    if(!other) return;
                    if(model.state.id === other.state.id) return;
                    var m_dx = other.state.x - l2_x1;
                    var m_dy = other.state.y - l2_y1;
                    var vect_prod = l2_uy * m_dx - l2_ux * m_dy;
                    var scal_prod = l2_ux * m_dx + l2_uy * m_dy;
                    ray_interv = ray_interv || 
                      (Math.abs(vect_prod) < other.info.r &&
                       scal_prod + other.info.r >= 0 &&
                       scal_prod - other.info.r <= l2_d);
                  });
                  if(!ray_interv) break;
                }
                vector_product = l2_ux * l1_uy - l2_uy * l1_ux;
                if(vector_product < 0) {
                  l12_dx = l2_x2 - l1_x2;
                  l12_dy = l2_y2 - l1_y2;
                  l12_d = Math.sqrt(l12_dx*l12_dx + l12_dy*l12_dy);
                  l12_ux = l12_dx / l12_d;
                  l12_uy = l12_dy / l12_d;
                  alpha = Math.acos(l12_ux * l1_ux + l12_uy * l1_uy);
                  beta = Math.acos(-l12_ux * l2_ux - l12_uy * l2_uy);
                  a = l12_d * Math.sin(alpha) / Math.sin(alpha+beta);
                  b = l12_d * Math.sin(beta) / Math.sin(alpha+beta);
                  a = Math.min(800, a);
                  b = Math.min(800, b);
                  l1_x3 = l1_x2 + l1_ux * b;
                  l1_y3 = l1_y2 + l1_uy * b;
                  l2_x3 = l2_x2 + l2_ux * a;
                  l2_y3 = l2_y2 + l2_uy * a;
                }
                else {
                  l1_x3 = l1_x2 + l1_ux * 800;
                  l1_y3 = l1_y2 + l1_uy * 800;
                  l2_x3 = l2_x2 + l2_ux * 800;
                  l2_y3 = l2_y2 + l2_uy * 800;
                }
                instance.los.state.shadows.push({
                  x1: l1_x2, y1: l1_y2,
                  x2: l1_x3, y2: l1_y3,
                  x3: l2_x3, y3: l2_y3,
                  x4: l2_x2, y4: l2_y2
                });
              });
              // console.log(instance.los.state.darkness);
              // console.log(instance.los.state.shadows);
              this.state.model_active = true;
            }
          },
          save_url: null,
          generateBackup: function() {
            // console.log('generate backup file');
            var old_url = this.save_url;
            this.save_url = null;
            if (old_url !== null) {
              $window.URL.revokeObjectURL(old_url);
            }
            var string = JSON.stringify(this);
            var blob = new $window.Blob([string], {type: 'text/plain'});
            var url = $window.URL.createObjectURL(blob);
            var today = Date.now();
            this.save_name = 'game_' + today + '.txt';
            this.save_url = url;
          },
        };

        _.deepExtend(instance, data);
        instance.clock = twoPlayerClock(instance.clock);
        // if(data.ruler) instance.ruler.state = data.ruler.state;
        // if(data.selections) instance.selection = data.selection;
        // if(data.layers) instance.layers = data.layers;

        _.each(instance.models, function(mod) {
          model(mod);
        });

        instance.replay_commands = _.map(instance.replay_commands, function(cmd) {
          return command(cmd);
        });
        var cmds = instance.commands;
        instance.commands = [];
        _.each(cmds, function(cmd) {
          instance.updateCommand(command(cmd));
        });

        function openCmdSource() {

          var url = '/api/games/'+
              (!instance.id ? 'public/' : '')+
              (!instance.id ? instance.public_id : instance.id)+
              '/commands/subscribe';
          if(user.wall ||
             instance.commands.length > 0) {
            url += '?';
          }
          if(user.wall) {
            url += 'close=true';
            if(instance.commands.length > 0) {
              url += '&';
            }
          }
          if(instance.commands.length > 0) {
              url += 'last=' + _.last(instance.commands).stamp;
          }
          console.log('open cmd source', url);
          if(game_source) game_source.close();
          game_source = new EventSource(url);
          game_source.onmessage = function(e) {
            // console.log('cmd event');
            // console.log(e);
            var data = JSON.parse(e.data);
            // console.log(data);
            var new_cmd;
            if(_.isArray(data.slice)) {
              _.each(data.slice, function(cmd) {
                new_cmd = command(cmd);
                // console.log(cmd);
                instance.updateCommand(new_cmd);
              });
              if(!data.more) {
                console.log('apply cmds');
                instance.loading = false;
                $rootScope.$apply();
              }
            }
            else {
              new_cmd = command(data);
              // console.log(cmd);
              instance.updateCommand(new_cmd);
              instance.loading = false;
              $rootScope.$apply();
            }
          };
          game_source.addEventListener('undo', function(e) {
            // console.log('cmd undo event');
            // console.log(e);
            var data = JSON.parse(e.data);
            // console.log(data);
            // var cmd = command(data);
            // console.log(cmd);
            if(data.stamp === _.last(instance.commands).stamp) {
              var cmd = instance.commands.pop();
              cmd.undo(instance);
              instance.replay_commands.push(cmd);
            }
            $rootScope.$apply();
          });
          game_source.addEventListener('game', function(e) {
            console.log('cmd game event',e);
            var data = JSON.parse(e.data);
            instance.player1 = data.player1;
            instance.player2 = data.player2;
            $rootScope.$apply();
          });
          game_source.onerror = function(e) {
            if(e.target.readyState === e.target.CLOSED) {
              console.log('cmd source error', e);
              window.alert('The connection with the server is lost\n'+
                           'Save your game, then try to reload the page.\n');
              return;
            }
            game_source.close();
            openCmdSource();
          };

        }
        openCmdSource();

        return instance;
      };
      return factory;
    }
  ]);
