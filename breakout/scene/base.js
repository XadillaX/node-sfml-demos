'use strict';

class BaseScene {
  constructor(game) {
    this.game = game;
  }

  enter() {
  }

  frame(/** deltaTime, events */) {
  }

  render() {
    const { window, board, ball, bricks, fpsText } = this.game;
    window.clear();
    board.render(window);
    ball.render(window);
    bricks.render(window);
    fpsText.render(window);
    window.display();
  }
}

module.exports = BaseScene;
