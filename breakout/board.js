'use strict';

const path = require('path');

const {
  RectangleShape,
  Sprite,
  Texture,
} = require('sfml.js');

let Game;

class Board extends RectangleShape {
  constructor() {
    super({ x: Board.WIDTH, y: Board.HEIGHT });

    if (!Game) Game = require('./game');
    this.speed = Game.WINDOW_WIDTH;
  }

  async init() {
    this.texture = new Texture();
    await this.texture.loadFromFile(path.join(__dirname, '../arkanoid/images/paddle.png'));
    this.sprite = new Sprite(this.texture);

    const textureSize = this.texture.getSize();
    this.sprite.setScale(Board.WIDTH / textureSize.x, Board.HEIGHT / textureSize.y);

    this.reset();
  }

  reset() {
    this.moveTo(Game.WINDOW_WIDTH / 2);
    this.setAvaiableColor();
  }

  moveTo(x) {
    if (x < Board.WIDTH / 2) x = Board.WIDTH / 2;
    if (x > Game.WINDOW_WIDTH - (Board.WIDTH / 2)) x = Game.WINDOW_WIDTH - (Board.WIDTH / 2);

    this.setPosition((x - (Board.WIDTH / 2)), Board.Y_CENTER - Board.HEIGHT / 2);
    this.sprite.setPosition((x - (Board.WIDTH / 2)), Board.Y_CENTER - Board.HEIGHT / 2);
    this.x = x;
  }

  moveLeft(delta) {
    this.moveTo(this.x - delta);
  }

  moveRight(delta) {
    this.moveTo(this.x + delta);
  }

  setAvaiableColor() {
    this.sprite.setColor(0xffffffff);
  }

  setDoneColor() {
    this.sprite.setColor(0xff0000ff);
  }

  render(window) {
    window.draw(this.sprite);
  }
}

Board.WIDTH = 100;
Board.HEIGHT = 20;
Board.Y_CENTER = 710;

module.exports = Board;
