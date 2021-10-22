'use strict';

const { IntRect, Sprite } = require('sfml.js');
const PhysicalBody = require('./physical_body');

const TILE_SIZE = 64;
const SIDE = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Ray.cpp
class Ray extends PhysicalBody {
  constructor(side) {
    super();

    this.side = side;
    this.sprite = new Sprite();
  }

  setAnimator(animator) {
    this.animator = animator;
    this.animator.setSprite(this.sprite);
    this.animator.setDelayBetweenFrames(0.1);
    this.animator.shangeActiveState('explosion');
  }

  getSide() {
    return this.side;
  }

  setRaySpriteSize(size) {
    this.size = size;
    this.sprite.setTextureRect(
      new IntRect(0, 0, this.size * TILE_SIZE, TILE_SIZE)
    );
    this.sprite.setOrigin(0, this.sprite.getGlobalBounds().height / 2);
    this.sprite.getTexture(); // ?

    switch (this.size) {
      case SIDE.UP: {
        this.sprite.setPosition(
          this.sprite.getPosition().x,
          this.sprite.getPosition().y - TILE_SIZE / 2
        );
        this.sprite.setRotation(270);
        this.setSize(TILE_SIZE, TILE_SIZE * size + TILE_SIZE);
        this.setPositionY(
          parseInt(this.getPositionY() / TILE_SIZE) * TILE_SIZE
        );
        this.setPositionY(
          this.getPositionY() - (TILE_SIZE * size + TILE_SIZE) / 2 + TILE_SIZE
        );
        break;
      }

      case SIDE.DOWN: {
        this.setPositionY(
          parseInt(this.getPositionY() / TILE_SIZE) * TILE_SIZE
        );
        this.sprite.setPosition(
          this.sprite.getPosition().x,
          this.sprite.getPosition().y + TILE_SIZE / 2
        );
        this.sprite.setRotation(90);
        this.setSize(TILE_SIZE, TILE_SIZE * size);
        this.setPositionY(
          this.getPositionY() + TILE_SIZE + (TILE_SIZE * size) / 2
        );
        break;
      }

      case SIDE.LEFT: {
        this.setPositionX(
          parseInt(this.getPositionX() / TILE_SIZE) * TILE_SIZE
        );
        this.sprite.setPosition(
          this.sprite.getPosition().x - TILE_SIZE / 2,
          this.sprite.getPosition().y
        );
        this.sprite.setRotation(180);
        this.setSize(TILE_SIZE * size, TILE_SIZE);
        this.setPositionX(this.getPositionX() - (TILE_SIZE * size) / 2);
        break;
      }

      case SIDE.RIGHT: {
        this.setPositionX(
          parseInt(this.getPositionX() / TILE_SIZE) * TILE_SIZE
        );
        this.sprite.setPosition(
          this.sprite.getPosition().x + TILE_SIZE / 2,
          this.sprite.getPosition().y
        );
        this.setSize(TILE_SIZE * size, TILE_SIZE);
        this.setPositionX(
          this.getPositionX() + TILE_SIZE + (TILE_SIZE * size) / 2
        );
        break;
      }

      default:
        break;
    }
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
    this.setPositionX(x);
    this.setPositionY(y);
  }

  update(/** dt */) {
    // Empty
  }

  draw(window) {
    window.draw(this.sprite);
  }
}

Ray.SIDE = SIDE;

module.exports = Ray;
