'use strict';

const {
  RectangleShape,
} = require('sfml.js');

let Game;

class Board extends RectangleShape {
  constructor() {
    super({ x: Board.WIDTH, y: Board.HEIGHT });

    if (!Game) Game = require('./game');
    this.speed = Game.WINDOW_WIDTH;
  }

  reset() {
    this.moveTo(Game.WINDOW_WIDTH / 2);
    this.setAvaiableColor();
  }

  moveTo(x) {
    if (x < Board.WIDTH / 2) x = Board.WIDTH / 2;
    if (x > Game.WINDOW_WIDTH - (Board.WIDTH / 2)) x = Game.WINDOW_WIDTH - (Board.WIDTH / 2);

    this.setPosition((x - (Board.WIDTH / 2)), Board.Y_CENTER - Board.HEIGHT / 2);
    this.x = x;
  }

  moveLeft(delta) {
    this.moveTo(this.x - delta);
  }

  moveRight(delta) {
    this.moveTo(this.x + delta);
  }

  setAvaiableColor() {
    this.setFillColor(0xffffffff);
  }

  setDoneColor() {
    this.setFillColor(0xff0000ff);
  }

  render(window) {
    window.draw(this);
  }
}

Board.WIDTH = 100;
Board.HEIGHT = 20;
Board.Y_CENTER = 710;

module.exports = Board;
