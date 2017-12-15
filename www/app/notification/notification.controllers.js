'use strict';

angular
  .module('notification.module')
  .controller('NotificationCtrl', function($scope, $rootScope) {
    console.log('This is Notification Controller!');

    $scope.shika = function () {
      $rootScope.user_notifications.unshift(
        {
          title:'Some Title'+($rootScope.user_notifications.length +1),
          description: 'Some description',
          time: 'July 13, 2014 11:13:00'
        }
      );
    };

    $scope.show = function () {
      console.log($rootScope.user_notifications);
    };

  });

