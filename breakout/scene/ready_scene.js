'use strict';

const BaseScene = require('./base');
const utils = require('../utils');

class ReadyScene extends BaseScene {
  enter() {
    const { ball, bricks, board } = this.game;
    ball.reset();
    bricks.reset();
    board.reset();
  }

  frame() {
    const { leftPressed, rightPressed, spacePressed } = utils.usefulKeyStates();
    if (!leftPressed && !rightPressed && !spacePressed) {
      return;
    }

    const { ball } = this.game;
    if (spacePressed || leftPressed || rightPressed) {
      if (spacePressed) {
        ball.moveVector.y = -1;
      } else if (rightPressed) {
        ball.moveVector.x = Math.sqrt(0.5);
        ball.moveVector.y = -(Math.sqrt(0.5));
      } else {
        ball.moveVector.x = -Math.sqrt(0.5);
        ball.moveVector.y = -(Math.sqrt(0.5));
      }
    }

    this.game.switchTo('play_scene');
  }
}

module.exports = ReadyScene;
