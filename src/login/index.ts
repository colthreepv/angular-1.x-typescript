import { IComponentController, IComponentOptions } from 'angular';

/* @ngInject */
class HomeController implements IComponentController {
  loginFailed = false;
  loginRecaptcha = false;

  lgn = {
    username: 'mrgamer',
    password: null
  };
  lgnMore = {
    connecting: false,
    promise: null, // login Promise to handle errors

    unlock: false, // boolean to activate unlock input
    unlockCode: null,
    unlockBaseInfo: null
  };

  constructor (public $window, public $interval, public api) {}

  toggleLoading () { this.lgnMore.connecting = !this.lgnMore.connecting; }

  connect () {
    this.toggleLoading();
    const connectWnd = this.$window.open('/ad/', 'connectWnd', 'resizable,status,width=980,height=800');


    const checkPopup = this.$interval(() => {
      try {
        if (connectWnd && connectWnd.closed) popupClosed();
      } catch (e) {}
    }, 100);

    const popupClosed = () => {
      this.$interval.cancel(checkPopup); // stop looping, please!
      this.toggleLoading();
    };
  };
}

export class HomeConfig implements IComponentOptions {
  name = 'home';
  url = '/login';
  template = require('./index.html');
  controller = HomeController;
  controllerAs = '$ctrl';
}
