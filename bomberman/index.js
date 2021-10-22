'use strict';

const Menu = require('./menu');

const menu = new Menu(12 * 64, 10 * 64);
menu.init().then(() => {
  menu.run();
});
