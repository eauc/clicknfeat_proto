'use strict';

angular.module('vassalApp.directives')
  .directive('boardMove', function() {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        function($scope) {
        }
      ],
      link: function(scope, iElement, iAttrs) {
        iElement[0].onmousedown = function(event) {
          scope.doSelectStart(event);
        };
        iElement[0].onmousemove = function(event) {
          scope.doSelectMove(event);
        };
        iElement[0].onmouseup = function(event) {
          scope.doSelectStop(event);
          scope.$apply();
        };
      }
    };
  })
  .directive('modelMove', function() {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        function($scope) {
        }
      ],
      link: function(scope, iElement, iAttrs) {
        iElement[0].onmousedown = function(event) {
          scope.onModelMouseDown(event, scope.model);
        };
        iElement[0].onmouseup = function(event) {
          scope.doSelectStop(event, scope.model);
          scope.$apply();
        };
      }
    };
  })
  .directive('templateMove', function() {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        function($scope) {
        }
      ],
      link: function(scope, iElement, iAttrs) {
        iElement[0].onmousedown = function(event) {
          scope.onTemplateMouseDown(event, scope.tp);
        };
        iElement[0].onmouseup = function(event) {
          scope.doSelectStop(event);
          scope.$apply();
        };
      }
    };
  });
