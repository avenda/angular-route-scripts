/**
 * Created by Victor Avendano on 1/10/15.
 * avenda@gmail.com
 */
 'use strict';
(function(){

    var mod = angular.module('routeScripts', ['ngRoute']);

    mod.directive('routeScripts', ['$rootScope','$compile',
        function($rootScope, $compile){
          return {
            restrict: 'A',
            link: function (scope, element) {
              var html = '<script ng-src="{{jsUrl}}" ng-repeat="(routeCtrl, jsUrl) in routeScripts"></script>';
              element.append($compile(html)(scope));
              scope.routeScripts = {};
              $rootScope.$on('$routeChangeStart', function (e, next, current) {
                  if(current && current.$$route && current.$$route.js){
                    if(!Array.isArray(current.$$route.js)){
                        current.$$route.js = [current.$$route.js];
                    }
                    angular.forEach(current.$$route.js, function(script){
                        delete scope.routeScripts[script];
                    });
                  }
                  if(next && next.$$route && next.$$route.js){
                    if(!Array.isArray(next.$$route.js)){
                        next.$$route.js = [next.$$route.js];
                    }
                    angular.forEach(next.$$route.js, function(script){
                        scope.routeScripts[script] = script;
                    });
                  }       
              });
            }
          };          
        }
    ]);

})();