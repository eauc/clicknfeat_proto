'use strict';

angular.module('vassalApp.controllers')
  .controller('startCtrl', [
    '$scope',
    '$state',
    '$window',
    '$http',
    function($scope,
             $state,
             $window,
             $http) {
      console.log('init startCtrl');

      $scope.doCreateGame = function() {
        $http.post('/api/games', {}).then(function(response) {
          // console.log('create game success');
          // $scope.game = response.data;
          // console.log($scope.game);

          $state.go('game', { id: response.data.id });
        }, function(response) {
          console.log('create game error');
          console.log(response);
        });
      };

      $scope.doSearchGame = function() {
        $state.go('game', { id: $scope.search_id });
      };
      
      $scope.read_result = '';
      $scope.readBackup = function(file) {
        $scope.read_result = null;
        var reader = new $window.FileReader();
        reader.onload = function(e) {
          var data;
          try {
            data = JSON.parse(e.target.result);
            $scope.read_result = 'loaded file';
            // success_cbk_(data);
            // console.log(data);
            var game_data = _.pick(data,
                                   'messages',
                                   'commands',
                                   'models',
                                   'ruler',
                                   'selection',
                                   'layers');
            // console.log(data);
            $http.post('/api/games', game_data)
              .then(function(response) {
                // console.log('upload game success');
                // console.log(response.data);
                $state.go('game', { id: response.data.id });
              }, function(response) {
                console.log('upload game error');
                console.log(response);
              });
          }
          catch (event) {
            $scope.read_result = 'invalid file';
          }
          $scope.$apply();
        };
        reader.onerror = function(e) {
          $scope.read_result = 'error reading file';
          $scope.$apply();
        };
        reader.onabort = function(e) {
          $scope.read_result = 'abort reading file';
          $scope.$apply();
        };
        reader.readAsText(file);
      };

    }
  ]);
