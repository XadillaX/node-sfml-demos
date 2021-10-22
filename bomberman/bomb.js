'use strict';

const {
  Clock,
  Color,
  Sprite,
  Time: { milliseconds },
  Vector2I,
} = require('sfml.js');

const Animator = require('./animator');
const Level = require('./level');
const PhysicalBody = require('./physical_body');
const Ray = require('./ray');

const MAX_RAY_SIZE = 4;
const SPEED = 20;
const TILE_SIZE = 64;

const STATE = {
  WAITING_FOR_EXPLOSION: 0,
  EXPLODING: 1,
  EXPLODED: 2,
};

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Bomb.cpp
class Bomb extends PhysicalBody {
  constructor(setColor) {
    super();

    this.positionInTilesCoordsX = 0;
    this.positionInTilesCoordsY = 0;
    this.direction = new Vector2I(0, 0);

    this.setColor = setColor;
    this.state = STATE.WAITING_FOR_EXPLOSION;
    this.isMoving = false;

    this.detonationClock = new Clock();
    this.detonationClock.restart();
    this.detonationTime = milliseconds(0);
    this.rayOnScreenTime = milliseconds(0);

    this.tilesToDeleteAfterExplosion = [];
    this.rays = [];
    for (let i = 0; i < 4; i++) {
      this.rays.push(null);
    }

    this.sprite = new Sprite();
    if (setColor) {
      this.sprite.setColor(new Color(243, 197, 48));
    }
  }

  draw(window) {
    window.draw(this.sprite);
    if (this.state === STATE.EXPLODING) {
      for (let i = 0; i < this.rays.length; i++) {
        this.rays[i].draw(window);
      }
    }
  }

  explode() {
    for (let i = 0; i < this.rays.length; i++) {
      this.rays[i] = new Ray(i);
      const animator = new Animator();
      animator.addAnimationState(
        'explosion',
        this.rayTextureAtlas,
        0,
        this.rayTextureAtlas.getCount() - 1
      );
      this.rays[i].setAnimator(animator);
      this.rays[i].setPosition(this.getPositionX(), this.getPositionY());
      this.rays[i].setRaySpriteSize(this.getRaySizeAfterCollisions(i));
    }
  }

  fixPosition() {
    this.setPositionX(this.positionInTilesCoordsX * TILE_SIZE + TILE_SIZE / 2);
    this.setPositionY(this.positionInTilesCoordsY * TILE_SIZE + TILE_SIZE / 2);
  }

  isObjectInRay(physicalBody) {
    if (this.rays[0] === null) return false;

    if (this.state === STATE.EXPLODING) {
      if (this.isCollision(this)) {
        return true;
      }
    }

    for (let i = 0; i < this.rays.length; i++) {
      if (this.rays[i]?.isCollision(physicalBody)) {
        return true;
      }
    }

    return false;
  }

  stopMoving() {
    this.isMoving = false;
  }

  update(dt) {
    this.animator.animate(dt);
    this.sprite.setPosition(this.getPositionX(), this.getPositionY());
    this.positionInTilesCoordsX = parseInt(this.getPositionX() / TILE_SIZE);
    this.positionInTilesCoordsY = parseInt(this.getPositionY() / TILE_SIZE);

    if (
      this.detonationClock.getElapsedTime().asSeconds() >=
        this.detonationTime.asSeconds() &&
      this.state < STATE.EXPLODING
    ) {
      this.fixPosition();
      this.level.destroyTile(
        this.positionInTilesCoordsX,
        this.positionInTilesCoordsY,
        false
      );
      this.state = STATE.EXPLODING;
    } else if (
      this.detonationClock.getElapsedTime().asSeconds() >=
        this.detonationClock.asSeconds() + this.rayOnScreenTime.asSeconds() &&
      this.state < STATE.EXPLODING
    ) {
      this.state = STATE.EXPLODED;
      for (let i = 0; i < this.tilesToDeleteAfterExplosion.length; i++) {
        this.level.destroyTile(
          this.tilesToDeleteAfterExplosion[i][0],
          this.tilesToDeleteAfterExplosion[i][1]
        );
      }
    }

    if (this.state === STATE.EXPLODING) {
      for (let i = 0; i < this.rays.length; i++) {
        this.rays[i].update(dt);
      }
    }
  }

  getNextPositionInTileCoordsX() {
    return this.positionInTilesCoordsX + this.direction.x;
  }

  getNextPositionInTileCoordsY() {
    return this.positionInTilesCoordsY + this.direction.y;
  }

  getPositionInTileCoordinatesX() {
    return this.positionInTilesCoordsX;
  }

  getPositionInTileCoordinatesY() {
    return this.positionInTilesCoordsY;
  }

  getRayPhysicalBody(side) {
    return this.rays[side];
  }

  getRaySizeAfterCollisions(side) {
    let size = 0;
    switch (side) {
      case Ray.SIDE.UP: {
        for (let i = 1; i <= MAX_RAY_SIZE; i++) {
          if (
            this.level.getTile(
              this.positionInTilesCoordsX,
              this.positionInTilesCoordsY - i
            ) <= Level.TILE_TYPE.NONE_WITH_SHADOW
          ) {
            size = i;
          } else {
            break;
          }
        }

        if (
          size !== MAX_RAY_SIZE &&
          this.positionInTilesCoordsY - size - 1 >= 0 &&
          (this.level.getTile(
            this.positionInTilesCoordsX,
            this.positionInTilesCoordsY - size - 1
          ) === Level.TILE_TYPE.WEAK_WALL ||
            this.level.getTile(
              this.positionInTilesCoordsX,
              this.positionInTilesCoordsY - size - 1
            ) === Level.TILE_TYPE.DOUBLE_WEAK_WALL)
        ) {
          this.tilesToDeleteAfterExplosion.push([
            this.positionInTilesCoordsX,
            this.positionInTilesCoordsY - ++size,
          ]);
        }

        break;
      }

      case Ray.SIDE.DOWN: {
        for (let i = 1; i <= MAX_RAY_SIZE; i++) {
          if (
            this.level.getTile(
              this.positionInTilesCoordsX,
              this.positionInTilesCoordsY + i
            ) <= Level.TILE_TYPE.NONE_WITH_SHADOW
          ) {
            size = i;
          } else {
            break;
          }
        }

        if (
          size !== MAX_RAY_SIZE &&
          this.positionInTilesCoordsY + size + 1 < this.level.getHeight() &&
          (this.level.getTile(
            this.positionInTilesCoordsX,
            this.positionInTilesCoordsY + size + 1
          ) === Level.TILE_TYPE.WEAK_WALL ||
            this.level.getTile(
              this.positionInTilesCoordsX,
              this.positionInTilesCoordsY + size + 1
            ) === Level.TILE_TYPE.DOUBLE_WEAK_WALL)
        ) {
          this.tilesToDeleteAfterExplosion.push([
            this.positionInTilesCoordsX,
            this.positionInTilesCoordsY + ++size,
          ]);
        }

        break;
      }

      case Ray.SIDE.LEFT: {
        for (let i = 1; i <= MAX_RAY_SIZE; i++) {
          if (
            this.level.getTile(
              this.positionInTilesCoordsX - i,
              this.positionInTilesCoordsY
            ) <= Level.TILE_TYPE.NONE_WITH_SHADOW
          ) {
            size = i;
          } else {
            break;
          }
        }

        if (
          size !== MAX_RAY_SIZE &&
          [
            Level.TILE_TYPE.WEAK_WALL,
            Level.TILE_TYPE.DOUBLE_WEAK_WALL,
          ].includes(
            this.level.getTile(
              this.positionInTilesCoordsX - size - 1,
              this.positionInTilesCoordsY
            )
          )
        ) {
          this.tilesToDeleteAfterExplosion.push([
            this.positionInTilesCoordsX - ++size,
            this.positionInTilesCoordsY,
          ]);
        }

        break;
      }

      case Ray.SIDE.RIGHT: {
        for (let i = 1; i <= MAX_RAY_SIZE; i++) {
          if (
            this.level.getTile(
              this.positionInTilesCoordsX + i,
              this.positionInTilesCoordsY
            ) <= Level.TILE_TYPE.NONE_WITH_SHADOW
          ) {
            size = i;
          } else {
            break;
          }
        }

        if (
          size !== MAX_RAY_SIZE &&
          [
            Level.TILE_TYPE.WEAK_WALL,
            Level.TILE_TYPE.DOUBLE_WEAK_WALL,
          ].includes(
            this.level.getTile(
              this.positionInTilesCoordsX + size + 1,
              this.positionInTilesCoordsY
            )
          )
        ) {
          this.tilesToDeleteAfterExplosion.push([
            this.positionInTilesCoordsX + ++size,
            this.positionInTilesCoordsY,
          ]);
        }

        break;
      }

      default:
        break;
    }
  }

  getState() {
    return this.state;
  }

  setAnimator(animator, width, height) {
    const w = width;
    const h = height;
    this.animator = animator;
    this.animator.setSprite(this.sprite);
    this.animator.setDelayBetweenFrames(1);
    this.animator.changeActiveState('waitingForExplosion');
    this.sprite.setOrigin(w / 2, h / 2);
  }

  setDetonationTime(time) {
    this.detonationTime = time;
  }

  setLevel(level) {
    this.level = level;
  }

  setMoveDirection(direction) {
    this.setVelocity(SPEED * direction.x, SPEED * direction.y);
    this.direction = direction;
    this.isMoving = true;
  }

  setPosition(x, y) {
    x = this.positionInTilesCoordsX = x / TILE_SIZE;
    y = this.positionInTilesCoordsY = y / TILE_SIZE;
    this.setPositionX(x * TILE_SIZE + TILE_SIZE / 2);
    this.setPositionY(y * TILE_SIZE + TILE_SIZE / 2);
  }

  setRayOnScreenTime(time) {
    this.rayOnScreenTime = time;
  }

  setUpRay(atlas) {
    this.rayTextureAtlas = atlas;
  }
}

Bomb.STATE = STATE;

module.exports = Bomb;
