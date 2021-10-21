'use strict';

const path = require('path');

const _ = require('lodash');
const {
  RectangleShape,
  Sprite,
  Texture,
  Vector2F,
} = require('sfml.js');

const Ball = require('./ball');
const Board = require('./board');

const textures = [];

class Brick extends RectangleShape {
  constructor(pos) {
    super({ x: Board.WIDTH, y: Board.HEIGHT });
    this.pos = new Vector2F(pos.x, pos.y);
    this.setPosition(this.pos);
    this.center = Vector2F.add(this.pos, Brick.HALF_SIZE_VECTOR);
    this.centerToRightTopVector = Vector2F.subtract(this.pos, this.center);
    this.centerToRightTopVector.x = Math.abs(this.centerToRightTopVector.x);
    this.centerToRightTopVector.y = Math.abs(this.centerToRightTopVector.y);
    this.bounds = this.getGlobalBounds();
    this.show();
  }

  show() {
    const texture = textures[_.random(0, 4, false)];
    const textureSize = texture.getSize();
    this.sprite = new Sprite(texture);
    this.sprite.setScale(Board.WIDTH / textureSize.x, Board.HEIGHT / textureSize.y);
    this.sprite.setPosition(this.pos);
    this.display = true;
  }

  hide() {
    this.display = false;
    this.sprite = null;
  }

  // Refs: https://www.zhihu.com/question/24251545/answer/27184960
  intersect(ball) {
    if (!this.display) return false;

    const p = ball.center;
    const c = this.pos;
    const h = this.centerToRightTopVector;

    const v = Vector2F.subtract(p, c);
    v.x = Math.abs(v.x);
    v.y = Math.abs(v.y);

    const u = Vector2F.subtract(v, h);
    if (u.x < 0) u.x = 0;
    if (u.y < 0) u.y = 0;

    if (u.x * u.x + u.y * u.y > Ball.RADIUS * Ball.RADIUS) {
      false;
    }

    const { x, y } = ball.pos;
    const pointCount = ball.getPointCount();
    const { bounds } = this;
    const { width: boundsX, height: boundsY } = ball.bounds;
    for (let i = 0; i < pointCount; i++) {
      const point = ball.getPoint(i);
      const { x: pointX, y: pointY } = point;
      point.x += x;
      point.y += y;

      if (bounds.contains(point)) {
        if (pointX < boundsX / 3) {
          if (pointY < boundsY / 3) {
            return 'LT';
          } else if (pointY < (boundsY / 3) * 2) {
            return 'LM';
          }

          return 'LB';
        } else if (pointX < (boundsX / 3) * 2) {
          if (pointY < boundsY / 3) {
            return 'MT';
          } else if (pointY < (boundsY / 3) * 2) {
            return 'MM';
          }

          return 'MB';
        }

        if (pointY < boundsY / 3) {
          return 'RT';
        } else if (pointY < (boundsY / 3) * 2) {
          return 'RM';
        }

        return 'RB';
      }
    }
  }
}

Brick.HALF_SIZE_VECTOR = new Vector2F(Board.WIDTH / 2, Board.HEIGHT / 2);

class Bricks {
  async init() {
    const promises = [];
    for (let i = 1; i <= 5; i++) {
      textures.push(new Texture());
      promises.push(
        textures[textures.length - 1].loadFromFile(path.join(__dirname, `../arkanoid/images/block0${i}.png`)));
    }
    await Promise.all(promises);

    this.elements = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const brick = new Brick({ x: 3 + (102 * i), y: 3 + (23 * j) });
        this.elements.push(brick);
      }
    }
  }

  reset() {
    for (const element of this.elements) {
      element.show();
    }
  }

  render(window) {
    for (const element of this.elements) {
      if (element.display) {
        window.draw(element.sprite);
      }
    }
  }

  calcIntersections(game, ball) {
    let direction = false;
    for (const element of this.elements) {
      const ret = element.intersect(ball);
      if (ret) {
        element.hide();
        direction = ret;
      }
    }

    switch (direction) {
      case 'LB':
      case 'RB':
      case 'RT':
      case 'LT': ball.moveVector.x = -ball.moveVector.x; ball.moveVector.y = -ball.moveVector.y; break;

      case 'MB':
      case 'MT': ball.moveVector.y = -ball.moveVector.y; break;

      case 'RM':
      case 'LM': ball.moveVector.x = -ball.moveVector.x; break;

      case 'MM':
      default: break;
    }
  }
}

module.exports = Bricks;
