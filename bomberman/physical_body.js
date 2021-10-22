'use strict';

const BODY_POSITION_STATE = {
  ON_SINGLE_TILE: 0,
  ON_TWO_TILES_HORIZONTAL: 1,
  ON_TWO_TILES_VERTICAL: 2,
  ON_FOUR_TILES: 3,
};

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/PhysicalBody.cpp
class PhysicalBody {
  constructor() {
    this.sizeX = 0;
    this.sizeY = 0;
    this.posX = 0;
    this.posY = 0;
    this.vX = 0;
    this.vY = 0;
    this.movementX = 0;
    this.movementY = 0;

    this.movableBodyInfo = {
      state: BODY_POSITION_STATE.ON_SINGLE_TILE,
      upBond: 0,
      downBound: 0,
      leftBound: 0,
      rightBound: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  setVelocity(x, y) {
    this.vX = x;
    this.vY = y;
  }

  setSize(x, y) {
    this.sizeX = x;
    this.sizeY = y;
  }

  isCollision(x, y, sizeX, sizeY) {
    if (x instanceof PhysicalBody) {
      return this.isCollision(
        x.getPositionX(),
        x.getPositionY(),
        x.getSizeX(),
        x.getSizeY()
      );
    }

    return (
      !(this.posY + this.sizeY / 2 < y - sizeY / 2) &&
      !(this.posY - this.sizeY / 2 > y + sizeY / 2) &&
      !(this.posX + this.sizeX / 2 < x - sizeX / 2) &&
      !(this.posX - this.sizeX / 2 > x + sizeX / 2)
    );
  }

  getPositionX() {
    return this.posX;
  }

  getPositionY() {
    return this.posY;
  }

  getSizeX() {
    return this.sizeX;
  }

  getSizeY() {
    return this.sizeY;
  }

  getVelocityX() {
    return this.vX;
  }

  getVelocityY() {
    return this.vY;
  }

  setPositionX(x) {
    this.posX = x;
  }

  setPositionY(y) {
    this.posY = y;
  }

  setMovementX(x) {
    this.movementX = x;
  }

  setMovementY(y) {
    this.movementY = y;
  }
}

PhysicalBody.BODY_POSITION_STATE = BODY_POSITION_STATE;

module.exports = PhysicalBody;
