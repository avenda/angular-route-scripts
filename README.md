angular-route-scripts
====================

This is a simple module for AngularJS (based on [angular-route-scripts](https://github.com/tennisgent/angular-route-styles)) that provides the ability to have route-specific JS scripts, by integrating with Angular's built-in `$routeProvider` service.

What does it do?
---------------

It allows you to declare partial-specific or route-specific scripts for your app using
Angular's built-in `$routeProvider` service.  For example, if you are already using
`$routeProvider`, you know that it allows you to easily setup your SPA routes by declaring
a `.when()` block and telling Angular what template (or templateUrl) to use for each
route, and also which controller to associate with that route.  Well, up until now, Angular
did not provide a way to add specific JS scripts that should be dynamically loaded
when the given route is hit.  This solves that problem by allowing you to do something like this:

```javascript
app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/some/route/1', {
            templateUrl: 'partials/partial1.html', 
            controller: 'Partial1Ctrl',
            js: 'js/partial1.js'
        })
        .when('/some/route/2', {
            templateUrl: 'partials/partial2.html',
            controller: 'Partial2Ctrl'
        })
        .when('/some/route/3', {
            templateUrl: 'partials/partial3.html',
            controller: 'Partial3Ctrl',
            js: ['js/partial3_1.js','js/partial3_2.js']
        })
        // more routes can be declared here
}]);
```

How to install:
---------------

**Using bower:**
> `bower install angular-route-scripts`

**OR**

**Using GitHub:**
> git clone https://github.com/avenda/angular-route-scripts

**1) Include the `route-scripts.js` file to your `index.html` file**

```html
<!-- should be added at the end of your body tag -->
<body>
    ...
    <script scr="path/to/route-scripts.js"></script>
</body>
```

**2) Declare the `'routeScripts'` module as a dependency in your main app**

```javascript
angular.module('myApp', ['ngRoute','routeScripts' /* other dependencies here */]);
```
**NOTE**: you must also include the `ngRoute` service module from angular, or at least make the
module available by adding the `angular-route.js` script
to your html page.

**NOTE:** this code also requires that your Angular app has access to the `<route-scripts>` element.  Typically this
requires that your `ng-app` directive is on the `<html>` element.  For example: `<html ng-app="myApp">`.

**3) Add your route-specific scripts to the `$routeProvider` in your app's config**

```javascript
var app = angular.module('myApp', []);
app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/some/route/1', {
            templateUrl: 'partials/partial1.html', 
            controller: 'Partial1Ctrl',
            js: 'js/partial1.js'
        })
        .when('/some/route/2', {
            templateUrl: 'partials/partial2.html',
            controller: 'Partial2Ctrl'
        })
        .when('/some/route/3', {
            templateUrl: 'partials/partial3.html',
            controller: 'Partial3Ctrl',
            js: ['js/partial3_1.js','js/partial3_2.js']
        })
        // more routes can be declared here
}]);
```
**Things to notice:**
* Specifying a JS property on the route is completely optional, as it was omitted from the `'/some/route/2'` example. If the route doesn't have a JS property, the service will simply do nothing for that route.
* You can even have multiple page-specific scripts per route, as in the `'/some/route/3'` example above, where the JS property is an **array** of relative paths to the scripts needed for that route.


How does it work?
-----------------
###Route Setup:

This config adds a custom JS property to the object that is used to setup each page's route. That object gets passed to each `'$routeChangeStart'` event as `.$$route`. So when listening to the `'$routeChangeStart'` event, we can grab the JS property that we specified and append/remove those `<script />` tags as needed.

###Custom Head Directive:

```javascript
    app.directive('routeScripts', ['$rootScope','$compile',
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
```

This directive does the following things:

* It compiles (using `$compile`) an html string that creates a set of <script /> tags for every item in the `scope.routescripts` object using `ng-repeat` and `ng-src`.
* It appends that compiled set of `<script />` elements to the `<route-scripts>` tag.
* It then uses the `$rootScope` to listen for `'$routeChangeStart'` events. For every `'$routeChangeStart'` event, it grabs the "current" `$$route` object (the route that the user is about to leave) and removes its partial-specific JS file(s) from the `<route-scripts>` tag. It also grabs the "next" `$$route` object (the route that the user is about to go to) and adds any of its partial-specific JS file(s) to the `<route-scripts>` tag.
* And the `ng-repeat` part of the compiled `<script />` tag handles all of the adding and removing of the page-specific scripts based on what gets added to or removed from the `scope.routescripts` object.