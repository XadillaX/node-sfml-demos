'use strict';

const {
  CircleShape,
  Vector2F,
} = require('sfml.js');

const Board = require('./board');

let Game;

class Ball extends CircleShape {
  constructor() {
    super(Ball.RADIUS);

    if (!Game) Game = require('./game');

    this.speed = Game.WINDOW_WIDTH / 2;
    this.reset();
  }

  reset() {
    this.moveVector = new Vector2F(0, 0);
    this.moveTo(new Vector2F(Game.WINDOW_WIDTH / 2, Ball.ORIG_Y));
    this.setAvaiableColor();
  }

  moveTo(vec) {
    this.center = vec;
    this.pos = new Vector2F(this.center.x - Ball.RADIUS, this.center.y - Ball.RADIUS);
    this.setPosition(this.pos);
    this.bounds = this.getLocalBounds();
  }

  setDoneColor() {
    this.setFillColor(0xff0000ff);
  }

  normalFly(game, deltaTimeSeconds, board) {
    let x = this.center.x + (this.moveVector.x * this.speed * deltaTimeSeconds);
    let y = this.center.y + (this.moveVector.y * this.speed * deltaTimeSeconds);

    if (x < Ball.RADIUS) {
      x = Ball.RADIUS;
      this.moveVector.x = -this.moveVector.x;
    } else if (x > Game.WINDOW_WIDTH - Ball.RADIUS) {
      x = Game.WINDOW_WIDTH - Ball.RADIUS;
      this.moveVector.x = -this.moveVector.x;
    }

    if (y < Ball.RADIUS) {
      y = Ball.RADIUS;
      this.moveVector.y = -this.moveVector.y;
    } else if (y >= Ball.ORIG_Y && y - Ball.ORIG_Y <= Math.max(5, y - this.center.y)) {
      if (x >= board.x - Board.WIDTH / 2 && x <= board.x + Board.WIDTH / 2) {
        // hit board
        const deltaXRate = Math.abs(x - board.x) / (Board.WIDTH / 2);
        const vectorY = Math.sqrt((1 - deltaXRate));
        this.moveVector.y = -vectorY;
        this.moveVector.x = x < board.x ? -deltaXRate : deltaXRate;
      }
    }

    if (y - Ball.ORIG_Y > Math.max(5, y - this.center.y) && this.moveVector.y > 0) {
      game.switchTo('done_scene');
    }

    this.moveTo(new Vector2F(x, y));
  }

  setAvaiableColor() {
    this.setFillColor(0xffffffff);
  }

  render(window) {
    window.draw(this);
  }
}

Ball.RADIUS = 12;
Ball.ORIG_Y = Board.Y_CENTER - Board.HEIGHT / 2 - Ball.RADIUS + 2;

module.exports = Ball;
