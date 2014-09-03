'use strict';

angular.module('vassalApp.services')
  .factory('game', [
    '$rootScope',
    '$http',
    '$window',
    'model',
    'template',
    'command',
    'message',
    function($rootScope,
             $http,
             $window,
             model,
             template,
             command,
             message) {

      var model_base = model({});

      var factory = function(data) {
        
        var instance = {
          new_model_id: 0,
          models: {},
          createModel: function(options) {
            var new_models = []
            _.each(options, function(option) {
              var new_model = model(instance.new_model_id++,
                                    option.info, {
                                      x: option.x,
                                      y: option.y,
                                      show_leader: option.show_leader,
                                      unit: option.unit
                                    });
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
            active: null,
          },
          createTemplate: function(options) {
            var temp = template(options);
            this.templates[temp.type][temp.stamp] = temp;
            this.templates.active = temp;
            return temp;
          },
          new_commands: [],
          commands: [],
          newCommand: function(new_cmd) {
            new_cmd.execute(this);
            this.new_commands.push(new_cmd);
            $http.post('/api/games/'+instance.id+'/commands', new_cmd)
              .then(function(response) {
                // console.log('send cmd success');
              }, function(response) {
                console.log('send cmd error');
                console.log(response);
              });
          },
          undoLastCommand: function() {
            if(this.commands.length <= 0) return;
            $http.put('/api/games/'+this.id+'/commands/undo',
                      { stamp: _.last(this.commands).stamp })
              .then(function(response) {
                // console.log('send undo cmd success');
              }, function(response) {
                console.log('send undo cmd error');
                console.log(response);
              });
          },
          updateCommand: function(new_cmd) {
            if( _.find(this.commands, function(cmd) { return cmd.stamp === new_cmd.stamp; })) {
              // console.log('cmd udpate : already in commands queue');
              return;
            }
            var find_cmd = _.findWhere(this.new_commands, { stamp: new_cmd.stamp });
            if(find_cmd) {
              var index = _.indexOf(this.new_commands, find_cmd);
              this.commands.push(find_cmd);
              this.new_commands.splice(index, 1);
              // console.log('cmd udpate : validate new command');
              return;
            }
            // console.log('cmd udpate : execute new command');
            new_cmd.redo(this);
            this.commands.push(new_cmd);
          },
          new_messages: [],
          messages: [],
          newMessage: function(new_msg) {
            this.new_messages.push(new_msg);
            $http.post('/api/games/'+instance.id+'/messages', new_msg)
              .then(function(response) {
                // console.log('send msg success');
              }, function(response) {
                console.log('send msg error');
                console.log(response);
              });
          },
          updateMessage: function(new_msg) {
            if( _.find(this.messages, function(msg) { return msg.stamp === new_msg.stamp; })) {
              // console.log('msg udpate : already in messages queue');
              return;
            }
            var find_msg = _.findWhere(this.new_messages, { stamp: new_msg.stamp });
            if(find_msg) {
              var index = _.indexOf(this.new_messages, find_msg);
              this.messages.push(find_msg);
              this.new_messages.splice(index, 1);
              // console.log('msg udpate : validate new message');
              return;
            }
            // console.log('msg udpate : add new message');
            this.messages.push(new_msg);
          },
          rollDie: function(sides) {
            var n = sides || 6;
            var rand = Math.random();
            var die_float = rand * n + 1;
            return die_float >> 0;
          },
          rollDice: function(nb_dice, sides) {
            var text = '';
            var total = 0;
            _.times(nb_dice, function() {
              var die = instance.rollDie(sides);
              total += die;
              text += die + ' ';
            });
            text += '('+total+')';
            var msg = message('dice', text);
            this.newMessage(msg);
          },
          rollDeviation: function(dist_max) {
            var direction = instance.rollDie();
            var distance = Math.min(instance.rollDie(), dist_max ? dist_max : 6);
            var msg = message('dice', 'AoE deviation : direction '+direction+
                              ', distance '+distance+'"');
            this.newMessage(msg);
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
            templates: true
          },
          board: {
            width: 480,
            height: 480,
            zoom: {
              factor: 1.0,
              cx: 240,
              cy: 240,
            },
            refreshZoom: function() {
              var cont = document.getElementById('canvas-container');
              this.zoom.cx = (cont.scrollLeft + 400) / this.zoom.factor;
              this.zoom.cy = (cont.scrollTop + 400) / this.zoom.factor;
            },
            refreshView: function() {
              var zoom = this.zoom;
              setTimeout(function() {
                var cont = document.getElementById('canvas-container');
                cont.scrollLeft = (zoom.cx * zoom.factor - 400);
                cont.scrollTop = (zoom.cy * zoom.factor - 400);
              }, 0);
            },
            reset: function() {
              this.zoom.factor = 1.;
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

        instance.id = data.id
        instance.new_model_id = data.new_model_id
        instance.models = data.models
        instance.commands = data.commands
        instance.messages = data.messages

        if(data.ruler) instance.ruler.state = data.ruler.state;
        if(data.selections) instance.selection = data.selection;
        if(data.layers) instance.layers = data.layers;

        _.each(instance.models, function(mod) {
          model(mod);
        });
        // var new_model;
        // if(_.keys(instance.models).length === 0) {
        //   _.times(20, function(i) {
        //     new_model = model(3*i,
        //                       $rootScope.factions.cygnar.models.jacks.hammersmith,
        //                       {
        //                         x: 200,
        //                         y: 20+20*i,
        //                         rot: -30,
        //                         show_reach: true,
        //                       });
        //     instance.models[new_model.state.id] = new_model;
        //     new_model = model(3*i+1,
        //                       $rootScope.factions.cygnar.models.jacks.grenadier,
        //                       {
        //                         x: 240,
        //                         y: 20+20*i,
        //                         rot: 0
        //                       });
        //     instance.models[new_model.state.id] = new_model;
        //     new_model = model(3*i+2,
        //                       $rootScope.factions.cygnar.models.solos.stormwall_pod,
        //                       {
        //                         x: 280,
        //                         y: 20+20*i,
        //                         rot: 30,
        //                         show_melee: true,
        //                       });
        //     instance.models[new_model.state.id] = new_model;
        //   });
        // }

        var cmds = instance.commands;
        instance.commands = [];
        _.each(cmds, function(cmd) {
          instance.updateCommand(command(cmd));
        });

        instance.cmd_source = new EventSource('/api/games/'+instance.id+
                                              '/commands/subscribe');
        instance.cmd_source.onmessage = function(e) {
          // console.log('cmd event');
          // console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          var cmd = command(data);
          // console.log(cmd);
          if(cmd) instance.updateCommand(cmd);
          $rootScope.$apply();
        };
        instance.cmd_source.addEventListener('undo', function(e) {
          // console.log('cmd undo event');
          // console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          // var cmd = command(data);
          // console.log(cmd);
          if(data.stamp === _.last(instance.commands).stamp) {
            instance.commands.pop().undo(instance);
          }
          $rootScope.$apply();
        });
        instance.cmd_source.onerror = function(e) {
          console.log('cmd source error');
          console.log(e);
        };

        instance.msg_source = new EventSource('/api/games/'+instance.id+
                                              '/messages/subscribe');
        instance.msg_source.onmessage = function(e) {
          // console.log('msg event');
          // console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          var msg = message(data);
          // console.log(msg);
          if(msg) instance.updateMessage(msg);
          $rootScope.$apply();
        };
        instance.msg_source.onerror = function(e) {
          console.log('msg source error');
          console.log(e);
        };
        // _.each(selected_model, function(model) {
        //   console.log(model.state);
        //   $http.put('/api/games/'+$scope.game.id+
        //             '/models/'+model.state.id,
        //             model.state)
        //     .then(function(response) {
        //       console.log('put model '+model.state.id+' success')
        //     }, function(response) {
        //       console.log('put model '+model.state.id+' error '+response.status)
        //     });
        // });

        return instance;
      };
      return factory;
    }
  ]);
