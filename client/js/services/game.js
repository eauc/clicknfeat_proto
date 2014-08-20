'use strict';

angular.module('vassalApp.services')
  .factory('game', [
    '$rootScope',
    '$http',
    'command',
    'message',
    function($rootScope,
             $http,
             command,
             message) {
      var model_base = {
        moveLeft: function(game, rotate) {
          if(rotate) {
            this.state.rot = this.state.rot - 30;
          }
          else {
            this.state.x = Math.max(-(this.img.height/2)+this.img.r,
                                    this.state.x - 10);
          }
        },
        moveUp: function(game, rotate) {
          this.state.y = Math.max(-(this.img.height/2)+this.img.r,
                                  this.state.y - 10);
        },
        moveRight: function(game, rotate) {
          if(rotate) {
            this.state.rot = this.state.rot + 30;
          }
          else {
            this.state.x = Math.min(game.board.width
                                    -(this.img.height/2)
                                    -this.img.r,
                                    this.state.x + 10);
          }
        },
        moveDown: function(game, rotate) {
          this.state.y = Math.min(game.board.height
                                  -(this.img.width/2)
                                  -this.img.r,
                                  this.state.y + 10);
        }
      };

      var factory = function(data) {
        
        var instance = {
          selection: [],
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
            _.each(this.selection, function(id) {
              instance.models[id].state.active = true;
            });
          },
          setSelection: function(model_ids) {
            this.clearSelection();
            this.addToSelection(model_ids);
          },
          clearSelection: function() {
            _.each(this.selection, function(id) {
              instance.models[id].state.active = false;
            });
            this.selection.length = 0;
          },
          new_commands: [],
          commands: [],
          newCommand: function(new_cmd) {
            new_cmd.execute(this);
            this.new_commands.push(new_cmd);
            $http.post('/api/games/'+instance.id+'/commands', new_cmd)
              .then(function(response) {
                console.log('send cmd success');
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
                console.log('send undo cmd success');
              }, function(response) {
                console.log('send undo cmd error');
                console.log(response);
              });
          },
          updateCommand: function(new_cmd) {
            if( _.find(this.commands, function(cmd) { return cmd.stamp === new_cmd.stamp; })) {
              console.log('cmd udpate : already in commands queue');
              return;
            }
            var find_cmd = _.findWhere(this.new_commands, { stamp: new_cmd.stamp });
            if(find_cmd) {
              var index = _.indexOf(this.new_commands, find_cmd);
              this.commands.push(find_cmd);
              this.new_commands.splice(index, 1);
              console.log('cmd udpate : validate new command');
              return;
            }
            console.log('cmd udpate : execute new command');
            new_cmd.redo(this);
            this.commands.push(new_cmd);
          },
          new_messages: [],
          messages: [],
          newMessage: function(new_msg) {
            this.new_messages.push(new_msg);
            $http.post('/api/games/'+instance.id+'/messages', new_msg)
              .then(function(response) {
                console.log('send msg success');
              }, function(response) {
                console.log('send msg error');
                console.log(response);
              });
          },
          updateMessage: function(new_msg) {
            if( _.find(this.messages, function(msg) { return msg.stamp === new_msg.stamp; })) {
              console.log('msg udpate : already in messages queue');
              return;
            }
            var find_msg = _.findWhere(this.new_messages, { stamp: new_msg.stamp });
            if(find_msg) {
              var index = _.indexOf(this.new_messages, find_msg);
              this.messages.push(find_msg);
              this.new_messages.splice(index, 1);
              console.log('msg udpate : validate new message');
              return;
            }
            console.log('msg udpate : add new message');
            this.messages.push(new_msg);
          },
          rollDie: function() {
            var rand = Math.random();
            var die_float = rand * 6 + 1;
            return die_float >> 0;
          },
          rollDice: function(nb_dice) {
            var text = '';
            var total = 0;
            _.times(nb_dice, function() {
              var die = instance.rollDie();
              total += die;
              text += die + ' ';
            });
            text += '('+total+')';
            var msg = message('dice', text);
            this.newMessage(msg);
          },
          board: {
            width: 480,
            height: 480,
            zoom: {
              factor: 1.0,
              cx: 240,
              cy: 240
            },
            view: {
              x: 0,
              y: 0,
              width: 480,
              height: 480
            },
            refreshView: function() {
              this.view.width = this.width / this.zoom.factor;
              this.view.height = this.height / this.zoom.factor;
              this.view.x = this.zoom.cx - this.view.width / 2;
              this.view.y = this.zoom.cy - this.view.height / 2;
            },
            zoomIn: function() {
              this.zoom.factor *= 2;
              this.refreshView();
            },
            zoomOut: function() {
              this.zoom.factor /= 2;
              this.refreshView();
            },
            moveLeft: function() {
              this.zoom.cx = Math.max(this.view.width/2,
                                      this.zoom.cx-10);
              this.refreshView();
            },
            moveUp: function() {
              this.zoom.cy = Math.max(this.view.height/2,
                                      this.zoom.cy-10);
              this.refreshView();
            },
            moveRight: function() {
              this.zoom.cx = Math.min(this.width - this.view.width/2,
                                      this.zoom.cx+10);
              this.refreshView();
            },
            moveDown: function() {
              this.zoom.cy = Math.min(this.height - this.view.height/2,
                                      this.zoom.cy+10);
              this.refreshView();
            },
          },
        };

        _.extend(instance, data);

        _.each(instance.models, function(model) {
          _.extend(model, model_base);
          if(model.state.active) {
            instance.selection.push(model.state.id);
          }
        });
        var cmds = instance.commands;
        instance.commands = [];
        _.each(cmds, function(cmd) {
          instance.updateCommand(command(cmd));
        });

        instance.evt_source = new EventSource('/api/games/'+instance.id+
                                              '/commands/subscribe');
        instance.evt_source.onmessage = function(e) {
          console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          var cmd = command(data);
          console.log(cmd);
          if(cmd) instance.updateCommand(cmd);
          $rootScope.$apply();
        };
        instance.evt_source.addEventListener('undo', function(e) {
          console.log('undo event');
          console.log(e);
          var data = JSON.parse(e.data);
          console.log(data);
          // var cmd = command(data);
          // console.log(cmd);
          if(data.stamp === _.last(instance.commands).stamp) {
            instance.commands.pop().undo(instance);
          }
          $rootScope.$apply();
        });
        instance.evt_source.onerror = function(e) {
          console.log('evtSource error');
          console.log(e);
        };

        instance.cmd_source = new EventSource('/api/games/'+instance.id+
                                              '/commands/subscribe');
        instance.cmd_source.onmessage = function(e) {
          console.log('cmd event');
          console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          var cmd = command(data);
          console.log(cmd);
          if(cmd) instance.updateCommand(cmd);
          $rootScope.$apply();
        };
        instance.cmd_source.addEventListener('undo', function(e) {
          console.log('cmd undo event');
          console.log(e);
          var data = JSON.parse(e.data);
          console.log(data);
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
          console.log('msg event');
          console.log(e);
          var data = JSON.parse(e.data);
          // console.log(data);
          var msg = message(data);
          console.log(msg);
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
