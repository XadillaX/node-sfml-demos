'use strict';

const Bomb = require('./bomb');
const Level = require('./level');

class BombManager {
  constructor() {
    /**
     * @type {Map<string, import('./bomb')>}
     */
    this.bombs = new Map();

    /**
     * @type {import('./player')[]}
     */
    this.players = [];

    /**
     * @type {import('./ray')[]}
     */
    this.rays = [];

    /**
     * @type {import('./level')}
     */
    this.level = null;
  }

  init(level, players) {
    this.level = level;
    this.players = [];
    for (const player of players) {
      this.players.push(player);
    }

    this.bombs.clear();
    this.rays = [];
  }

  update(dt) {
    this.gatherBombInformation();
    this.handleBombKicking(dt);
    this.checkBombsAfterExplosionsCollisions();
  }

  handleBombKicking(dt) {
    for (const [ key, bomb ] of this.bombs.entries()) {
      const keySplited = key.split(',').map(k => parseInt(k));

      if (bomb.getState() === Bomb.STATE.WAITING_FOR_EXPLOSION) {
        if (
          bomb.isMoving &&
          [ Level.TILE_TYPE.NONE, Level.TILE_TYPE.NONE_WITH_SHADOW ].includes(
            this.level.getTile(
              bomb.getNextPositionInTileCoordsX(),
              bomb.getNextPositionInTileCoordsY()
            )
          )
        ) {
          bomb.setPositionX(bomb.getPositionX() + bomb.getVelocityX() * dt);
          bomb.setPositionY(bomb.getPositionY() + bomb.getVelocityY() * dt);

          if (
            this.level.getTile(
              bomb.getPositionInTileCoordinatesX(),
              bomb.getPositionInTileCoordinatesY()
            ) === Level.TILE_TYPE.BOMB
          ) {
            this.level.destroyTile(
              bomb.getPositionInTileCoordinatesX(),
              bomb.getPositionInTileCoordinatesY(),
              false
            );
          }
        } else {
          bomb.fixPosition();
          bomb.stopMoving();
          this.level.setTileAsBomb(
            bomb.getPositionInTileCoordinatesX(),
            bomb.getPositionInTileCoordinatesY()
          );
        }
      }

      for (const player of this.players) {
        if (
          player.isCollidingWithBomb() &&
          player.getBombCollidingWithCoordinates().x === keySplited[0] &&
          player.getBombCollidingWithCoordinates().y === keySplited[1]
        ) {
          bomb.setMoveDirection(player.getSideBombCollidingWith());
          player.setIsCollidingWithBomb(false);
          player.setSideBombCollidingWith(0, 0);
        }
      }

      for (const player of this.players) {
        if (bomb.isMoving) {
          if (
            player.isTileCollidingInAxisX(
              bomb.getNextPositionInTileCoordsX()
            ) &&
            player.isTileCollidingInAxisY(bomb.getNextPositionInTileCoordsY())
          ) {
            bomb.stopMoving();
          }
        }
      }
    }

    this.bombs.clear();
  }

  checkBombsAfterExplosionsCollisions() {
    for (const ray of this.rays) {
      for (const player of this.players) {
        if (ray.isCollision(player)) {
          player.onBombCollision();
        }
      }
    }
    this.rays = [];
  }

  gatherBombInformation() {
    for (const player of this.players) {
      if (player.hasBomb()) {
        this.bombs.set(
          `${player.getBomb().getPositionInTileCoordinatesX()},${player
            .getBomb()
            .getPositionInTileCoordinatesY()}`,
          player.getBomb()
        );
      }

      if (player.isBombExplosion()) {
        for (let i = 0; i < 4; i++) {
          this.rays.push(player.getRay(i));
        }
      }
    }
  }
}

module.exports = BombManager;
