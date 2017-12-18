'use strict';

angular
  .module('notification.module')
  .controller('NotificationCtrl', function($scope, $rootScope, NotificationService) {
    console.log('This is Notification Controller!');

    $scope.remove = function(item) {
      var index = $rootScope.user_notifications.indexOf(item);
      $scope.user_notifications.splice(index, 1);
    }

  });

