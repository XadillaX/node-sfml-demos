'use strict';

const {
  Clock,
  Color,
  Sprite,
  Time: { seconds },
  Vector2I,
} = require('sfml.js');

const Animator = require('./animator');
const Bomb = require('./bomb');
const PhysicalBody = require('./physical_body');

const TILE_SIZE = 64;

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Player.cpp
class Player extends PhysicalBody {
  constructor() {
    super();

    this.win = false;
    this._isCollidingWithBomb = false;
    this.isAlive = true;
    this.bomb = null;
    this.canBeDamaged = true;
    this.sprite = new Sprite();
    this.respawnSafeTime = seconds(0);
    this.respawnClock = new Clock();

    this.bombCollidingWithLevelCoords = new Vector2I(0, 0);
    this.sideBombCollidingWith = new Vector2I(0, 0);
    this.respawnPosition = new Vector2I(0, 0);
  }

  setAnimator(animator, width, height) {
    this.sprite.setOrigin(width / 2, height / 2);
    this.setSize(width, height);
    this.animator = animator;
    this.animator.setSprite(this.sprite);
    this.sprite.setPosition(3 * TILE_SIZE + width, 5 * TILE_SIZE + height);
  }

  setRespawns(hp) {
    this.respawns = this.maxNumberOfRespawns = hp;
  }

  increaseRespawns(val) {
    this.respawns += val;
  }

  decreaseRespawns(val) {
    this.respawns -= val;
  }

  getRespawnsCount() {
    return this.respawns;
  }

  onMoveKeyPressed(x, y) {
    const speed = 150;
    this.setVelocity(x * speed, y * speed);
  }

  setAfterRespawnSafeTime(value) {
    this.respawnSafeTime = seconds(value);
  }

  hasBomb() {
    return (
      this.bomb !== null &&
      this.bomb.getState() === Bomb.STATE.WAITING_FOR_EXPLOSION
    );
  }

  getBomb() {
    return this.bomb;
  }

  onActionKeyPressed() {
    if (this.bomb !== null) return;

    if (this.sprite.getColor().toInteger() !== 0xffffffff) {
      this.bomb = new Bomb(true);
    } else {
      this.bomb = new Bomb();
    }

    this.bombAnimator = new Animator();
    this.bombAnimator.addAnimationState(
      'waitingForExplosion',
      this.bombTextureAtlas,
      0,
      this.bombTextureAtlas.getCount() - 1
    );
    this.bomb.setAnimator(this.bombAnimator);
    this.bomb.setUpRay(this.bombRayTextureAtlas);
    this.bomb.setDetonationTime(seconds(3.108));
    this.bomb.setRayOnScreenTime(seconds(0.9));
    this.bomb.setPosition(this.getPositionX(), this.getPositionY());
    this.bomb.setLevel(this.level);
    this.level.setTileAsBomb(
      this.getPositionX() / TILE_SIZE,
      this.getPositionY() / TILE_SIZE
    );
  }

  setUpBomb(atlasBomb, atlasRay) {
    this.bombTextureAtlas = atlasBomb;
    this.bombRayTextureAtlas = atlasRay;
  }

  setLevel(level) {
    this.level = level;
  }

  update(dt) {
    this.animator.animate(dt);
    if (this.movementX !== 0 && this.movementY !== 0) {
      this.movementX /= 1.41;
      this.movementY /= 1.41;
    }

    this.managePlayersTextureDirection();
    this.setPositionX(this.getPositionX() + this.movementX);
    this.setPositionY(this.getPositionY() + this.movementY);
    this.sprite.setPosition(this.getPositionX(), this.getPositionY());

    if (this.bomb !== null) {
      this.bomb.update(dt);

      if (this.bomb.getState() === Bomb.STATE.EXPLODING) {
        this.level.destroyTile(
          this.bomb.getPositionInTileCoordinatesX(),
          this.bomb.getPositionInTileCoordinatesY(),
          false
        );
      }

      if (this.bomb.getState() === Bomb.STATE.EXPLODED) {
        this.bomb = null;
      }
    }

    if (
      this.respawns > 0 &&
      this.respawns < this.maxNumberOfRespawns &&
      this.respawnClock.getElapsedTime().asSeconds() >=
        this.respawnSafeTime.asSeconds()
    ) {
      this.canBeDamaged = true;
    } else if (this.respawns <= 0 && this.isAlive) {
      this.endGame();
      this.isAlive = false;
    } else {
      this.isAlive = true;
    }
  }

  managePlayersTextureDirection() {
    const x = this.movementX;
    const y = this.movementY;

    if (x === 0 && y === 0) {
      this.animator.pause();
      return;
    }

    let targetState;
    if (x < 0) targetState = 'WEST';
    else if (x > 0) targetState = 'EAST';

    if (y < 0) targetState = 'NORTH';
    else if (y > 0) targetState = 'SOUTH';

    if (
      !(
        this.animator.getActiveState() === targetState ||
        targetState + '_WITH_BOMB' === this.animator.getActiveState()
      ) ||
      (this.animator.getActiveState().length > 5 && this.bomb !== null) ||
      (this.animator.getActiveState().length <= 5 && this.bomb === null)
    ) {
      if (this.bomb === null) {
        targetState += '_WITH_BOMB';
      }

      this.animator.changeActiveState(targetState);
    }

    this.animator.play();
  }

  isTileCollidingInAxisX(x) {
    return (
      x === this.getPositionInTilesCoordsX() ||
      x === this.movableBodyInfo.leftBound ||
      x === this.movableBodyInfo.rightBound
    );
  }

  isTileCollidingInAxisY(y) {
    return (
      y === this.getPositionInTilesCoordsY() ||
      y === this.movableBodyInfo.upBond ||
      y === this.movableBodyInfo.downBound
    );
  }

  draw(window) {
    if (this.bomb) {
      this.bomb.draw(window);
    }

    window.draw(this.sprite);
  }

  endGame() {
    this.vX = this.vY = 0;
  }

  onBombCollision() {
    if (this.canBeDamaged) {
      this.respawn();
    }
  }

  isBombExplosion() {
    return this.bomb && this.bomb.getState() === Bomb.STATE.EXPLODING;
  }

  setColor(i) {
    if (i) {
      this.sprite.setColor(new Color(243, 197, 48));
      return;
    }
  }

  getRay(side) {
    return this.bomb.getRayPhysicalBody(side);
  }

  getIsAlive() {
    return this.isAlive;
  }

  getPositionInTilesCoordsX() {
    return parseInt(this.getPositionX() / TILE_SIZE);
  }

  getPositionInTilesCoordsY() {
    return parseInt(this.getPositionY() / TILE_SIZE);
  }

  isCollidingWithBomb() {
    return this._isCollidingWithBomb;
  }

  setIsCollidingWithBomb(val) {
    this._isCollidingWithBomb = val;
  }

  getSideBombCollidingWith() {
    return new Vector2I(this.sideBombCollidingWith);
  }

  setSideBombCollidingWith(x, y) {
    const vec = new Vector2I(x, y);
    if (x || y) {
      this.bombCollidingWithLevelCoords = new Vector2I(
        this.getPositionX() / TILE_SIZE + x,
        this.getPositionY() / TILE_SIZE + y
      );
    } else {
      this.bombCollidingWithLevelCoords = new Vector2I(0, 0);
    }
    this.sideBombCollidingWith = vec;
  }

  getBombCollidingWithCoordinates() {
    return new Vector2I(this.bombCollidingWithLevelCoords);
  }

  setWin(val) {
    this.win = val;
  }

  getWin() {
    return this.win;
  }

  setRespawnPosition(x, y) {
    this.respawnPosition.x = x;
    this.respawnPosition.y = y;
  }

  setAlive() {
    this.isAlive = true;
    this.canBeDamaged = true;
  }

  deleteBomb() {
    this.bomb = null;
  }

  spawn() {
    this.setPositionX(this.respawnPosition.x * TILE_SIZE + TILE_SIZE / 2);
    this.setPositionY(this.respawnPosition.y * TILE_SIZE + TILE_SIZE / 2);
  }

  respawn() {
    this.canBeDamaged = false;
    this.spawn();
    this.respawns--;
    this.respawnClock.restart();
  }
}

module.exports = Player;
