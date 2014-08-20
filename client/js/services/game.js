'use strict';

angular.module('vassalApp.services')
  .factory('game', [
    '$rootScope',
    '$http',
    function($scope,
             $http) {
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
              _.each(this.selection, function(model) {
                model[method_name].apply(model,
                                         [instance].concat(forward_args));
              });
            }
          },
          addToSelection: function(models) {
            _.each(models, function(model) {
              instance.selection.push(model);
              model.state.active = true;
              // $http.put('/api/games/'+this.id+
              //           '/models/'+model.state.id,
              //           model.state)
              //   .then(function(response) {
              //     console.log('put model '+model.state.id+' success')
              //   }, function(response) {
              //     console.log('get model '+model.state.id+' error '+response.status)
              //   });
            });
          },
          clearSelection: function() {
            _.each(this.selection, function(model) {
              model.state.active = false;
              // $http.put('/api/games/'+this.id+
              //           '/models/'+model.state.id,
              //           model.state)
              //   .then(function(response) {
              //     console.log('put model '+model.state.id+' success')
              //   }, function(response) {
              //     console.log('get model '+model.state.id+' error '+response.status)
              //   });
            });
            this.selection.length = 0;
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
            instance.selection.push(model);
          }
        });

        // instance.evt_source = new EventSource('/api/games/'+instance.id+
        //                                       '/models/subscribe');
        // instance.evt_source.onmessage = function(e) {
        //   var state = JSON.parse(e.data);
        //   console.log(state);
        //   instance.models[state.id].state = state;
        //   $rootScope.$apply();
        // }
        // instance.evt_source.onerror = function(e) {
        //   console.log('evtSource error');
        //   console.log(e);
        // }
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
