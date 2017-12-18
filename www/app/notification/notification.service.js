'use strict';



angular
  .module('notification.module')
  .service('NotificationService', function ($rootScope) {

    this.AddNotification = function (message) {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd<10) {
        dd = '0'+dd
      }

      if(mm<10) {
        mm = '0'+mm
      }

      today = dd+ '/' + mm + '/' + yyyy;


      $rootScope.user_notifications.unshift(
        {
          message: message,
          time: today
        });
    }

  })
