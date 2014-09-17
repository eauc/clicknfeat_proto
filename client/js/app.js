'use strict';

angular.module('vassalApp.services', []);
//   .value('version', '0.1');
// angular.module('vassalApp.filters', []);
angular.module('vassalApp.controllers', []);
// angular.module('vassalApp.directives', []);
angular.module('vassalApp', [
  'ui.router',
  'vassalApp.controllers',
  // 'vassalApp.filters',
  'vassalApp.services',
  // 'vassalApp.directives'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('start', {
        url: '/',
        templateUrl: 'partials/start.html',
        controller: 'startCtrl',
        data: {}
      })
      .state('game', {
        url: '/game/:visibility/:id',
        templateUrl: 'partials/game.html',
        controller: 'gameCtrl',
        data: {}
      });
  }
]).config([
  '$compileProvider',
  function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
]);
