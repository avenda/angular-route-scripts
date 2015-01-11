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
            restrict: 'E',
            link: function (scope, element) {
              var html = '<script ng-src="{{script}}" ng-repeat="script in routeScripts"></script>';
              element.append($compile(html)(scope));
              scope.routeScripts = [];
              $rootScope.$on('$routeChangeStart', function (e, next, current) {
                  if(current && current.$$route && current.$$route.js){
                    if(!Array.isArray(current.$$route.js)){
                        current.$$route.js = [current.$$route.js];
                    }
                    current.$$route.js.forEach(function(script, index){
                      scope.routeScripts.splice(index, 1);
                    });
                  }
                  if(next && next.$$route && next.$$route.js){
                    if(!Array.isArray(next.$$route.js)){
                        next.$$route.js = [next.$$route.js];
                    }
                    next.$$route.js.forEach(function(script, index){
                      scope.routeScripts.push(script);
                    });
                  }       
              });
            }
          };          
        }
    ]);

})();