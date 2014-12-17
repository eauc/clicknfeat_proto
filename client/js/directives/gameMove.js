'use strict';

angular.module('vassalApp.directives')
  .directive('gameMove', function() {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        function($scope) {
        }
      ],
      link: function(scope, iElement, iAttrs) {
        iElement[0].onmousemove = function(event) {
          scope.doSelectMove(event);
        };
      }
    };
  });
