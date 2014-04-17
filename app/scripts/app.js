'use strict';

angular.module('marcEditorApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/schema', {
        templateUrl: 'views/schema.html',
        controller: 'SchemaCtrl'
      })
      .when('/options', {
        templateUrl: 'views/options.html',
        controller: 'OptionsCtrl'
      })
      .when('/forms', {
        templateUrl: 'views/forms.html',
        controller: 'FormsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
