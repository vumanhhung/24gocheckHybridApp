'use strict';

angular.module('options.module')
  .config(function config($stateProvider) {
    $stateProvider
      .state('app.menu.options', {
        url: '/options',
        abstract: true,
        views: {
          'tab-options': {
            templateUrl: 'app/options/templates/layout.html'
          },
          'menu': {
            templateUrl: 'app/options/templates/layout.html'
          }
        }
      })
      .state('app.menu.options.home', {
        url: '/home',
        views: {
          'optionsContent': {
            templateUrl: 'app/options/templates/home-op.html',
            controller: 'OptionsCtrl'
          }
        }
      })
  });
