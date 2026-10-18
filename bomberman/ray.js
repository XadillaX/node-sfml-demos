'use strict';

const { degrees, IntRect, Sprite, Vector2f, Vector2i } = require('sfml.js');
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
    this.sprite = null;
  }

  setAnimator(animator, texture) {
    if (!this.sprite) this.sprite = new Sprite(texture);
    this.animator = animator;
    this.animator.setSprite(this.sprite);
    this.animator.setDelayBetweenFrames(0.1);
    this.animator.changeActiveState('explosion');
  }

  getSide() {
    return this.side;
  }

  setRaySpriteSize(size) {
    this.size = size;
    this.sprite.setTextureRect(
      new IntRect(new Vector2i(0, 0), new Vector2i(this.size * TILE_SIZE, TILE_SIZE))
    );
    this.sprite.setOrigin(new Vector2f(0, this.sprite.getGlobalBounds().size.y / 2));

    switch (this.side) {
      case SIDE.UP: {
        this.sprite.setPosition(
          new Vector2f(
            this.sprite.getPosition().x,
            this.sprite.getPosition().y - TILE_SIZE / 2
          )
        );
        this.sprite.setRotation(degrees(270));
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
          new Vector2f(
            this.sprite.getPosition().x,
            this.sprite.getPosition().y + TILE_SIZE / 2
          )
        );
        this.sprite.setRotation(degrees(90));
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
          new Vector2f(
            this.sprite.getPosition().x - TILE_SIZE / 2,
            this.sprite.getPosition().y
          )
        );
        this.sprite.setRotation(degrees(180));
        this.setSize(TILE_SIZE * size, TILE_SIZE);
        this.setPositionX(this.getPositionX() - (TILE_SIZE * size) / 2);
        break;
      }

      case SIDE.RIGHT: {
        this.setPositionX(
          parseInt(this.getPositionX() / TILE_SIZE) * TILE_SIZE
        );
        this.sprite.setPosition(
          new Vector2f(
            this.sprite.getPosition().x + TILE_SIZE / 2,
            this.sprite.getPosition().y
          )
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
    this.sprite.setPosition(new Vector2f(x, y));
    this.setPositionX(x);
    this.setPositionY(y);
  }

  update(/** dt */) {
    //
  }

  draw(window) {
    window.draw(this.sprite);
  }
}

Ray.SIDE = SIDE;

module.exports = Ray;
