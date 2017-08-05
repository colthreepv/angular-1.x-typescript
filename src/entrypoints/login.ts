import '../../styles/index.scss';

import * as angular from 'angular';

import { HelloWorldConfig } from '../login/components/hello-world';
// import api from '../shared/api';
import { HomeConfig } from '../login/index';

// import http from '../shared/http';
// import ngMessages from 'angular-messages';
// import uiRouter from 'angular-ui-router';

// import { apiValidation, formApi } from '../shared/form-api';


// const directives = { apiValidation, formApi };
// const factories = { http, api };

// if (process.env.NODE_ENV === 'development') Error.stackTraceLimit = Infinity;
const app = angular.module('login', []);

app.component('helloWorld', new HelloWorldConfig());

// angular.forEach(factories, (factory, name) => app.factory(name, factory));
// angular.forEach(directives, (directive, name) => app.directive(name, directive));
app
  .config(config)
  .run(run);

if (process.env.NODE_ENV === 'production') app.config(performance);

function run () {
  console.log('angular-login is running');
}

function performance ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}

/* @ngInject */
function config ($locationProvider) {
  $locationProvider.html5Mode(true);
  // $urlMatcherFactoryProvider.strictMode(false);
  // $stateProvider.state(HomeConfig);
}

angular.bootstrap(document, ['login'], {
  strictDi: true
});
