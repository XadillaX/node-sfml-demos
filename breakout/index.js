'use strict';

const Game = require('./game');

const game = new Game();
game.init().then(() => {
  game.run();
});
