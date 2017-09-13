﻿'use strict';

/**
* @ngdoc directive
* @name starter.directive:stringToNumber
* @description
* Converts a string of a `ng-model` to a number
*/
angular.module('starter')
   .directive('stringToNumber', function () {
       return {
           require: 'ngModel',
           link: function (scope, element, attrs, ngModel) {
               ngModel.$parsers.push(function (value) {
                   return '' + value;
               });
               ngModel.$formatters.push(function (value) {
                   return parseFloat(value, 10);
               });
           }
       };
   });
