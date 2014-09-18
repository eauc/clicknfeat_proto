'use strict';

angular.module('vassalApp.controllers')
  .controller('importBoxCtrl', [
    '$scope',
    '$window',
    function($scope,
             $window) {
      console.log('init importBoxCtrl');

      $scope.readModelFile = function(file) {
        $scope.modes.goTo('default', $scope);
        $scope.read_result = [];
        var reader = new $window.FileReader();
        reader.onload = function(e) {
          $scope.read_result.push('loaded file');
          try {
            var data = JSON.parse(e.target.result);
          }
          catch(err) {
            $scope.read_result.push('invalid file format');
          }
          $scope.modes['model_create'].info = data;
          $scope.modes.goTo('model_create', $scope);
          $scope.$apply();
        };
        reader.onerror = function(e) {
          $scope.read_result = ['error reading file'];
          $scope.$apply();
        };
        reader.onabort = function(e) {
          $scope.read_result = ['abort reading file'];
          $scope.$apply();
        };
        reader.readAsText(file);
      };

      var file_input = document.getElementById('import-model-file');
      file_input.onchange = function() {
        $scope.readModelFile(file_input.files[0]);
      };
    }
  ])
  .controller('importFKBoxCtrl', [
    '$scope',
    '$window',
    function($scope,
             $window) {
      console.log('init importFKBoxCtrl');

      $scope.fk_read_result = [];
      $scope.fk_read_string = '';
      function importFKList(data) {
        // console.log(data);
        var lines = data.match(/[^\r\n]+/g);
        $scope.modes['model_create'].info = [];
        // console.log(lines);
        var nb_created = 0;
        var unit_number = _.filter($scope.game.models, function(model) {
          return model.state.unit;
        }).reduce(function(max, model) {
          return Math.max(max, model.state.unit);
        }, 0);
        var previous_unit = null;
        var global_offset_x = 0;
        var global_offset_y = 0;
        _.each(lines, function(line) {
          if(line.match(/^(System:|Faction:|Casters:|Points:|Tiers:)/)) {
            return;
          }
          line = line.replace(/^\s*/,'');
          if(line.length === 0) return;
          var reset_unit = true;
          var match = line.match(/^\*+ /);
          if(match) {
            reset_unit = false;
            line = line.replace(/^\*+ /,'');
          }
          var repeat = 1;
          var match = line.match(/^(\d+) /);
          if(match) {
            repeat = match[1] >> 0;
            line = line.replace(/^\d+ /,'');
          }                
          match = line.match(/\((\d+)\s.+?\)/i);
          if(match) {
            repeat = (match[1] >> 0);
          }                
          var size = 1;
          match = line.match(/\(leader and (\d+) grunts?\)/i);
          if(match) {
            size = (match[1] >> 0) + 1;
          }                
          line = line.replace(/\s*\(.+\)\s*$/,'');
          // console.log(line);
          var known_entry = _.isObject($scope.factions.fk_keys[line]);
          match = line.match(/Krielstone Bearer and (\d+) Stone Scribes/i);
          if(match) {
            known_entry = true;
            size = (match[1] >> 0) + 1;
            line = "Krielstone Bearer and Stone Scribes";
          }
          match = line.match(/Troll Whelps/i);
          if(match) {
            repeat = 5;
          }
          match = line.match(/Rangers/i);
          if(match) {
            size = 6;
          }
          if(known_entry) {
            // console.log(size);
            _.times(repeat, function() {
              var nb_created_in_unit = 0;
              var entries = $scope.factions.fk_keys[line];
              var nb_entries = _.keys(entries).length;
              var is_unit = (nb_entries > 1 || size > 1);
              if(entries.grunt) {
                if(is_unit &&
                   reset_unit) {
                  unit_number++;
                }
                var mid_size = Math.ceil(size/2);
                var unit_step = 2.5*entries.grunt.r;
                var max_offset_x = 0;
                if(entries.leader) {
                  var offset_x = unit_step/2;
                  var offset_y = global_offset_y;
                  max_offset_x = Math.max(max_offset_x, offset_x);
                  $scope.modes['model_create'].info.push({
                    info: entries.leader,
                    offset_x: global_offset_x + offset_x,
                    offset_y: offset_y,
                    show_leader: true,
                    unit: is_unit ? unit_number : undefined
                  });
                  nb_created_in_unit++;
                  size--;
                }
                _.times(size, function(n) {
                  var offset_x = 0;
                  var offset_y = 0;
                  if(size <= 5) {
                    offset_x = nb_created_in_unit*unit_step+unit_step/2;
                    offset_y = global_offset_y;
                  }
                  else {
                    offset_x = (nb_created_in_unit % mid_size)*unit_step+unit_step/2;
                    offset_y = global_offset_y + ((nb_created_in_unit >= mid_size) ? unit_step : 0);
                  }
                  max_offset_x = Math.max(max_offset_x, offset_x);
                  $scope.modes['model_create'].info.push({
                    info: entries.grunt,
                    offset_x: global_offset_x + offset_x,
                    offset_y: offset_y,
                    show_leader: (size > 1 && nb_created_in_unit === 0),
                    unit: is_unit ? unit_number : undefined
                  });
                  nb_created_in_unit++;
                });
                global_offset_x += max_offset_x + unit_step/2;
                if(global_offset_x > 360) {
                  global_offset_x = 0;
                  global_offset_y = 55;
                }
                previous_unit = entries.grunt.unit;
              }
              entries = _.omit(entries, 'grunt', 'leader');
              if(_.keys(entries).length > 0) {
                _.each(entries, function(entry) {
                  if((is_unit || entry.unit) &&
                     reset_unit &&
                     nb_created_in_unit === 0) {
                    unit_number++;
                  }
                  $scope.modes['model_create'].info.push({
                    info: entry,
                    offset_x: global_offset_x + 1.25*entry.r,
                    offset_y: global_offset_y,
                    unit: (is_unit || entry.unit) ? unit_number : undefined
                  });
                  global_offset_x += 2.5*entry.r;
                  if(global_offset_x > 360) {
                    global_offset_x = 0;
                    global_offset_y = 55;
                  }
                  nb_created_in_unit++;
                  previous_unit = entry.unit;
                });
              }
              nb_created += nb_created_in_unit;
            });
          }
          else {
            $scope.fk_read_result.push('!!! unknown model \"'+line+'\"');
          }
        });
        // console.log(modes['model_create'].info);
        if(nb_created > 0) $scope.modes.goTo('model_create', $scope);
      }
      $scope.readFKFile = function(file) {
        $scope.modes.goTo('default', $scope);
        $scope.fk_read_result = [];
        var reader = new $window.FileReader();
        reader.onload = function(e) {
          $scope.fk_read_result.push('loaded file');
          var data = e.target.result;
          importFKList(data);
          $scope.$apply();
        };
        reader.onerror = function(e) {
          $scope.fk_read_result = ['error reading file'];
          $scope.$apply();
        };
        reader.onabort = function(e) {
          $scope.fk_read_result = ['abort reading file'];
          $scope.$apply();
        };
        reader.readAsText(file);
      };
      $scope.readFKString = function(file) {
        $scope.modes.goTo('default', $scope);
        $scope.fk_read_result = [];
        importFKList($scope.fk_read_string);
      };

      var file_input = document.getElementById('import-fk-file');
      file_input.onchange = function() {
        $scope.readFKFile(file_input.files[0]);
      };

    }
  ]);
