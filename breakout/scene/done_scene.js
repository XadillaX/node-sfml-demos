'use strict';

const BaseScene = require('./base');

class DoneScene extends BaseScene {
  enter() {
    const { ball, board } = this.game;
    ball.setDoneColor();
    board.setDoneColor();
  }

  frame(deltaTime, events) {
    for (const event of events) {
      if (event.type === 'KeyReleased' && event.key.codeStr === 'Space') {
        this.game.switchTo('ready_scene');
      }
    }
  }
}

module.exports = DoneScene;
