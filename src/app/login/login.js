angular.module('myApp.login', [
    'ui.router'
])

    .config(function($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'login/login.tpl.html'
            });
    })
    .value('test', 4)
;