'use strict';

angular.module('vassalApp.services')
  .factory('twoPlayerClock', [
    'clock',
    '$timeout',
    function(clock,
             $timeout) {
      return function(data) {
        var timeout;
        var update_instance = function() {
          instance.update();
        };
        var instance = {
          state: 'stopped',
          active_player: 'player1',
          clocks: {
            player1: clock(),
            player2: clock()
          },
          isValid: function() {
            return this.clocks.player1.isValid() &&
              this.clocks.player2.isValid();
          },
          start: function() {
            if('stopped' === this.state &&
               this.isValid()) {
              this.clocks['player1'].start();
              this.clocks['player2'].start();
              this.state = 'running';
              timeout = $timeout(update_instance, 1000);
              return true;
            }
            return false;
          },
          stop: function() {
            $timeout.cancel(timeout);
            if('running' === this.state) {
              this.state = 'stopped';
              this.clocks[this.active_player].stop();
              return true;
            }
            return false;
          },
          update: function() {
            if('running' === this.state) {
              this.clocks[this.active_player].update();
              timeout = $timeout(update_instance, 1000);
            }
          },
          switchPlayer: function() {
            if('running' == this.state) {
              this.clocks[this.active_player].stop();
            }
            this.active_player =
              (this.active_player == 'player1') ?
              'player2' : 'player1';
            if('running' == this.state) {
              this.clocks[this.active_player].start();
            }
          },
          updateReserve: function(other) {
            _.deepExtend(this.clocks['player1'].reserve,
                         other.clocks['player1'].reserve);
            _.deepExtend(this.clocks['player2'].reserve,
                         other.clocks['player2'].reserve);
          },
          checkForPlayerSwitch: function(other) {
            if(this.active_player != other.active_player) {
              this.active_player = other.active_player;
              this.clocks['player1'].start();
              this.clocks['player2'].start();
            }
          },
          checkForStateChange: function(other) {
            if(this.state != other.state) {
              this.state = other.state;
              if(other.state == 'running') {
                this.clocks['player1'].start();
                this.clocks['player2'].start();
                timeout = $timeout(update_instance, 1000);
              }
            }
          },
          checkForUpdate: function(other) {
            this.updateReserve(other);
            this.checkForPlayerSwitch(other);
            this.checkForStateChange(other);
          }
        };
        if(_.isObject(data)) {
          _.deepExtend(instance, data);
        }
        if('running' === instance.state) {
          timeout = $timeout(update_instance, 1000);
        }
        return instance;
      };
    }
  ]);
