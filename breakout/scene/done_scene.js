'use strict';

const { Keyboard } = require('sfml.js');

const BaseScene = require('./base');

class DoneScene extends BaseScene {
  enter() {
    const { ball, board } = this.game;
    ball.setDoneColor();
    board.setDoneColor();
  }

  frame(deltaTime, events) {
    for (const event of events) {
      if (event.kind === 'KeyReleased' && event.data.code === Keyboard.Key.Space) {
        this.game.switchTo('ready_scene');
      }
    }
  }
}

module.exports = DoneScene;
