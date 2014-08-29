'use strict';

angular.module('vassalApp.controllers')
  .controller('importBoxCtrl', [
    '$scope',
    '$window',
    function($scope,
             $window) {
      console.log('init importBoxCtrl');

      $scope.fk_read_result = [];
      $scope.fk_read_string = '';
      function importFKList(data) {
        // console.log(data);
        var lines = data.match(/[^\r\n]+/g);
        $scope.modes['model_create'].info = [];
        // console.log(lines);
        var i = 0;
        var global_offset_x = 0;
        var global_offset_y = 0;
        _.each(lines, function(line) {
          if(line.match(/^(System:|Faction:|Casters:|Points:|Tiers:)/)) {
            return;
          }
          line = line.replace(/^\s*/,'');
          if(line.length === 0) return;
          line = line.replace(/^\*+ /,'');
          var size = 1;
          var match = line.match(/^(\d+) /);
          if(match) {
            size = match[1] >> 0;
            line = line.replace(/^\d+ /,'');
          }                
          match = line.match(/\((\d+)\s.+?\)/i);
          if(match) {
            size = (match[1] >> 0);
          }                
          match = line.match(/\(leader and (\d+) grunts?\)/i);
          if(match) {
            size = (match[1] >> 0) + 1;
          }                
          line = line.replace(/\s*\(.+\)\s*$/,'');
          // console.log(line);
          if(_.isArray($scope.factions.fk_keys[line]) &&
             $scope.factions.fk_keys[line].length > 0) {
            // console.log(size);

            if($scope.factions.fk_keys[line].length > 1) {
              _.each($scope.factions.fk_keys[line], function(id) {
                $scope.modes['model_create'].info.push({
                  info: id,
                  offset_x: global_offset_x + 1.25*$scope.factions.fk_keys[line][0].r,
                  offset_y: global_offset_y
                });
                global_offset_x += 2.5*$scope.factions.fk_keys[line][0].r;
                if(global_offset_x > 360) {
                  global_offset_x = 0;
                  global_offset_y = 55;
                }
                i++;
              });
            }
            else {
              var mid_size = Math.ceil(size/2);
              var unit_step = 2.5*$scope.factions.fk_keys[line][0].r;
              var max_offset_x = 0;
              _.times(size, function(n) {
                var offset_x = 0;
                var offset_y = 0;
                if(size <= 5) {
                  offset_x = n*unit_step+unit_step/2;
                  offset_y = global_offset_y;
                }
                else {
                  offset_x = (i%mid_size)*unit_step+unit_step/2;
                  offset_y = global_offset_y + ((n >= mid_size) ? unit_step : 0);
                }
                max_offset_x = Math.max(max_offset_x, offset_x);
                $scope.modes['model_create'].info.push({
                  info: $scope.factions.fk_keys[line][0],
                  offset_x: global_offset_x + offset_x,
                  offset_y: offset_y,
                  show_leader: (size > 1 && n === 0)
                });
                i++;
              });
              global_offset_x += max_offset_x + unit_step/2;
              if(global_offset_x > 360) {
                global_offset_x = 0;
                global_offset_y = 55;
              }
            }
          }
          else {
            $scope.fk_read_result.push('!!! unknown model \"'+line+'\"');
          }
        });
        // console.log(modes['model_create'].info);
        if(i > 0) $scope.modes.goTo('model_create', $scope);
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
