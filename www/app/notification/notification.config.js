'use strict';

angular.module('notification.module')
  .config(function config($stateProvider) {
    $stateProvider
      .state('app.menu.notification', {
        url: '/notification',
        abstract: true,
        views: {
          'tab-notification': {
            templateUrl: 'app/notification/templates/layout.html'
          },
          'menu': {
            templateUrl: 'app/notification/templates/layout.html'
          }
        }
      })
      .state('app.menu.notification.home', {
        url: '/home',
        views: {
          'notificationContent': {
            templateUrl: 'app/notification/templates/home-noti.html',
            controller: 'NotificationCtrl'
          }
        }
      })
  });
