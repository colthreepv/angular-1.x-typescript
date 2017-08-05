import { IComponentController, IComponentOptions, ILogService } from 'angular';

const template = `<h1>Hello World {{ $ctrl.name }}!`;

export class HelloWorldController implements IComponentController {
  public static $inject = ['$log']
  name = 'Yahooowlss';
  constructor (public $log: ILogService) {}
  $onInit () {
    this.$log.info('hi!');
  }
}

export class HelloWorldConfig implements IComponentOptions {
  name = 'helloWorld';
  controller = HelloWorldController;
  template = template;
}
