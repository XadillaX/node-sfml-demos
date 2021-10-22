'use strict';

class Game {
  constructor(window) {
    this.window = window;

    const windowSize = window.getSize();
    this.windowWidth = windowSize.x;
    this.windowHeight = windowSize.y;
  }
}

module.exports = Game;
