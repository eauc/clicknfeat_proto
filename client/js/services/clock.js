'use strict';

angular.module('vassalApp.services')
  .factory('clock', [
    function() {
      function time2clock() {
        var time = this.time;

        this.hour = Math.floor(time / (1000*60*60));
        time -= this.hour * 60 * 60 * 1000;

        this.minute = Math.floor(time / (1000*60));
        time -= this.minute * 60 * 1000;

        this.second = Math.floor(time / (1000));
      }
      function clock2time() {
        this.time = (((this.hour * 60) +
                      this.minute) * 60 +
                     this.second) * 1000;
      }
      return function() {
        var instance = {
          reserve: {
            hour: 1,
            minute: 0,
            second: 0,
            time: 0,
            time2clock: time2clock,
            clock2time: clock2time
          },
          left: {
            hour: 1,
            minute: 0,
            second: 0,
            time: 0,
            time2clock: time2clock,
            clock2time: clock2time
          },
          start_time: 0,
          isValid: function() {
            return this.reserve.hour >=0 &&
              this.reserve.minute >=0 &&
              this.reserve.second >=0;
          },
          start: function() {
            this.reserve.clock2time();
            this.start_time = Date.now();
            this.update();
          },
          update: function() {
            this.left.time = this.reserve.time;
            var now = Date.now();
            var time_elapsed = now - instance.start_time;
            this.left.time -= time_elapsed;
            this.left.time = Math.max(0, this.left.time);
            this.left.time2clock();
          },
          stop: function() {
            this.update();
            this.reserve.time = this.left.time;
            this.reserve.time2clock();
          }
        };
        return instance;
      };
    }
  ]);
