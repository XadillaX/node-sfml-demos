'use strict';

const BaseScene = require('./base');
const utils = require('../utils');

class PlayScene extends BaseScene {
  frame(deltaTime) {
    const { ball, board, bricks } = this.game;
    const { leftPressed, rightPressed } = utils.usefulKeyStates();
    const deltaX = board.speed * deltaTime.asSeconds();

    if (leftPressed) {
      board.moveLeft(deltaX);
    } else if (rightPressed) {
      board.moveRight(deltaX);
    }

    ball.normalFly(this.game, deltaTime.asSeconds(), board);

    if (!(this.game.currentScene instanceof PlayScene)) {
      return;
    }

    bricks.calcIntersections(this.game, ball);
  }
}

module.exports = PlayScene;
