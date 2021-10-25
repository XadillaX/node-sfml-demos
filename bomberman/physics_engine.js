'use strict';

const Level = require('./level');
const PhysicalBody = require('./physical_body');

const TILE_SIZE = 64;

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/PhysicsEngine.cpp
class PhysicsEngine {
  constructor() {
    /**
     * @type {import('./level')}
     */
    this.level = null;

    /**
     * @type {import('./physical_body')[]}
     */
    this.physicalLevel = [];

    /**
     * @type {import('./player')[]}
     */
    this.players = [];
  }

  init(level, players) {
    this.level = level;
    this.players = [];
    for (const player of players) {
      this.players.push(player);
    }

    this.physicalLevel = [];
    for (let i = 0; i < this.level.getHeight(); i++) {
      const arr = [];
      this.physicalLevel.push(arr);
    }

    for (let y = 0; y < this.physicalLevel.length; y++) {
      for (let x = 0; x < this.level.getWidth(); x++) {
        const physicalLevel = new PhysicalBody();
        physicalLevel.setPositionX(x * TILE_SIZE + TILE_SIZE / 2);
        physicalLevel.setPositionY(y * TILE_SIZE + TILE_SIZE / 2);
        physicalLevel.setSize(TILE_SIZE, TILE_SIZE);
        this.physicalLevel[y].push(physicalLevel);
      }
    }
  }

  setBodyPositionInfo(key) {
    const player = this.players[key];

    player.movableBodyInfo.centerX = parseInt(
      player.getPositionX() / TILE_SIZE
    );
    player.movableBodyInfo.centerY = parseInt(
      player.getPositionY() / TILE_SIZE
    );

    player.movableBodyInfo.upBond = parseInt(
      parseInt(player.getPositionY() - player.getSizeY() / 2) / TILE_SIZE
    );
    player.movableBodyInfo.downBound = parseInt(
      parseInt(player.getPositionY() + player.getSizeY() / 2) / TILE_SIZE
    );
    player.movableBodyInfo.leftBound = parseInt(
      parseInt(player.getPositionX() - player.getSizeX() / 2) / TILE_SIZE
    );
    player.movableBodyInfo.rightBound = parseInt(
      parseInt(player.getPositionX() + player.getSizeX() / 2) / TILE_SIZE
    );

    if (
      player.movableBodyInfo.upBond === player.movableBodyInfo.downBound &&
      player.movableBodyInfo.rightBound === player.movableBodyInfo.leftBound
    ) {
      player.movableBodyInfo.state =
        PhysicalBody.BODY_POSITION_STATE.ON_SINGLE_TILE;
    } else if (
      player.movableBodyInfo.upBond !== player.movableBodyInfo.downBound &&
      player.movableBodyInfo.rightBound === player.movableBodyInfo.leftBound
    ) {
      player.movableBodyInfo.state =
        PhysicalBody.BODY_POSITION_STATE.ON_TWO_TILES_VERTICAL;
    } else if (
      player.movableBodyInfo.upBond === player.movableBodyInfo.downBound &&
      player.movableBodyInfo.rightBound !== player.movableBodyInfo.leftBound
    ) {
      player.movableBodyInfo.state =
        PhysicalBody.BODY_POSITION_STATE.ON_TWO_TILES_HORIZONTAL;
    } else {
      player.movableBodyInfo.state =
        PhysicalBody.BODY_POSITION_STATE.ON_FOUR_TILES;
    }
  }

  update(dt) {
    for (let i = 0; i < this.players.length; i++) {
      this.setBodyPositionInfo(i);
      const player = this.players[i];

      player.setMovementX(0);
      player.setMovementY(0);

      const movementX = player.getVelocityX() * dt;
      const movementY = player.getVelocityY() * dt;
      if (movementX === 0 && movementY === 0) continue;

      const bodyAfterXMovement = new PhysicalBody(player);
      const bodyAfterYMovement = new PhysicalBody(player);

      bodyAfterXMovement.setPositionX(player.getPositionX() + movementX);
      bodyAfterYMovement.setPositionY(player.getPositionY() + movementY);

      let moveInXAxis = true;
      let moveInYAxis = true;

      switch (player.movableBodyInfo.state) {
        case PhysicalBody.BODY_POSITION_STATE.ON_SINGLE_TILE: {
          if (
            moveInYAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX,
              player.movableBodyInfo.centerY - 1
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterYMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY - 1][
                player.movableBodyInfo.centerX
              ]
            )
          ) {
            if (
              this.level.getTile(
                player.movableBodyInfo.centerX,
                player.movableBodyInfo.centerY - 1
              ) === Level.TILE_TYPE.BOMB
            ) {
              player.setSideBombCollidingWith(0, -1);
              player.setIsCollidingWithBomb(true);
            }

            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY - 1][
                player.movableBodyInfo.centerX
              ]
            );
            moveInYAxis = false;
          } else if (
            moveInYAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX,
              player.movableBodyInfo.centerY + 1
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterYMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY + 1][
                player.movableBodyInfo.centerX
              ]
            )
          ) {
            if (
              this.level.getTile(
                player.movableBodyInfo.centerX,
                player.movableBodyInfo.centerY + 1
              ) === Level.TILE_TYPE.BOMB
            ) {
              player.setSideBombCollidingWith(0, 1);
              player.setIsCollidingWithBomb(true);
            }

            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY + 1][
                player.movableBodyInfo.centerX
              ]
            );
            moveInYAxis = false;
          }

          if (
            moveInXAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX - 1,
              player.movableBodyInfo.centerY
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX - 1
              ]
            )
          ) {
            if (
              this.level.getTile(
                player.movableBodyInfo.centerX - 1,
                player.movableBodyInfo.centerY
              ) === Level.TILE_TYPE.BOMB
            ) {
              player.setSideBombCollidingWith(-1, 0);
              player.setIsCollidingWithBomb(true);
            }
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX - 1
              ]
            );
            moveInXAxis = false;
          } else if (
            moveInXAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX + 1,
              player.movableBodyInfo.centerY
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX + 1
              ]
            )
          ) {
            if (
              this.level.getTile(
                player.movableBodyInfo.centerX + 1,
                player.movableBodyInfo.centerY
              ) === Level.TILE_TYPE.BOMB
            ) {
              player.setSideBombCollidingWith(1, 0);
              player.setIsCollidingWithBomb(true);
            }
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX + 1
              ]
            );
            moveInXAxis = false;
          }

          break;
        }

        case PhysicalBody.BODY_POSITION_STATE.ON_TWO_TILES_HORIZONTAL: {
          let additionalTileXCoord;
          if (
            player.movableBodyInfo.leftBound === player.movableBodyInfo.centerX
          ) {
            additionalTileXCoord = player.movableBodyInfo.rightBound;
          } else {
            additionalTileXCoord = player.movableBodyInfo.leftBound;
          }

          if (
            moveInYAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX,
              player.movableBodyInfo.centerY - 1
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterYMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY - 1][
                player.movableBodyInfo.centerX
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY - 1][
                player.movableBodyInfo.centerX
              ]
            );
            moveInYAxis = false;
          } else if (
            moveInYAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX,
              player.movableBodyInfo.centerY + 1
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterYMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY + 1][
                player.movableBodyInfo.centerX
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY + 1][
                player.movableBodyInfo.centerX
              ]
            );
            moveInYAxis = false;
          }

          if (
            moveInYAxis &&
            this.level.getTile(
              additionalTileXCoord,
              player.movableBodyInfo.centerY - 1
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterYMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY - 1][
                additionalTileXCoord
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY - 1][
                additionalTileXCoord
              ]
            );
            moveInYAxis = false;
          } else if (
            moveInYAxis &&
            this.level.getTile(
              additionalTileXCoord,
              player.movableBodyInfo.centerY + 1
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterYMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY + 1][
                additionalTileXCoord
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY + 1][
                additionalTileXCoord
              ]
            );
            moveInYAxis = false;
          }

          break;
        }

        case PhysicalBody.BODY_POSITION_STATE.ON_TWO_TILES_VERTICAL: {
          let additionalTileYCoord;
          if (
            player.movableBodyInfo.upBond === player.movableBodyInfo.centerY
          ) {
            additionalTileYCoord = player.movableBodyInfo.downBound;
          } else {
            additionalTileYCoord = player.movableBodyInfo.upBond;
          }

          if (
            moveInXAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX - 1,
              player.movableBodyInfo.centerY
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX - 1
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX - 1
              ]
            );
            moveInXAxis = false;
          } else if (
            moveInXAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX + 1,
              player.movableBodyInfo.centerY
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX + 1
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.centerY][
                player.movableBodyInfo.centerX + 1
              ]
            );
            moveInXAxis = false;
          }

          if (
            moveInXAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX - 1,
              additionalTileYCoord
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[additionalTileYCoord][
                player.movableBodyInfo.centerX - 1
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[additionalTileYCoord][
                player.movableBodyInfo.centerX - 1
              ]
            );
            moveInXAxis = false;
          } else if (
            moveInXAxis &&
            this.level.getTile(
              player.movableBodyInfo.centerX + 1,
              additionalTileYCoord
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[additionalTileYCoord][
                player.movableBodyInfo.centerX + 1
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[additionalTileYCoord][
                player.movableBodyInfo.centerX + 1
              ]
            );
            moveInXAxis = false;
          }

          break;
        }

        case PhysicalBody.BODY_POSITION_STATE.ON_FOUR_TILES: {
          if (
            this.level.getTile(
              player.movableBodyInfo.leftBound,
              player.movableBodyInfo.upBond
            ) !== Level.TILE_TYPE.BOMB &&
            this.level.getTile(
              player.movableBodyInfo.leftBound,
              player.movableBodyInfo.upBond
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.upBond][
                player.movableBodyInfo.leftBound
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.upBond][
                player.movableBodyInfo.leftBound
              ]
            );
            moveInXAxis = false;
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.upBond][
                player.movableBodyInfo.leftBound
              ]
            );
            moveInYAxis = false;
          } else if (
            this.level.getTile(
              player.movableBodyInfo.rightBound,
              player.movableBodyInfo.upBond
            ) !== Level.TILE_TYPE.BOMB &&
            this.level.getTile(
              player.movableBodyInfo.rightBound,
              player.movableBodyInfo.upBond
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.upBond][
                player.movableBodyInfo.rightBound
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.upBond][
                player.movableBodyInfo.rightBound
              ]
            );
            moveInXAxis = false;
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.upBond][
                player.movableBodyInfo.rightBound
              ]
            );
            moveInYAxis = false;
          } else if (
            this.level.getTile(
              player.movableBodyInfo.leftBound,
              player.movableBodyInfo.downBound
            ) !== Level.TILE_TYPE.BOMB &&
            this.level.getTile(
              player.movableBodyInfo.leftBound,
              player.movableBodyInfo.downBound
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.downBound][
                player.movableBodyInfo.leftBound
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.downBound][
                player.movableBodyInfo.leftBound
              ]
            );
            moveInXAxis = false;
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.downBound][
                player.movableBodyInfo.leftBound
              ]
            );
            moveInYAxis = false;
          } else if (
            this.level.getTile(
              player.movableBodyInfo.rightBound,
              player.movableBodyInfo.downBound
            ) !== Level.TILE_TYPE.BOMB &&
            this.level.getTile(
              player.movableBodyInfo.rightBound,
              player.movableBodyInfo.downBound
            ) > Level.TILE_TYPE.NONE_WITH_SHADOW &&
            bodyAfterXMovement.isCollision(
              this.physicalLevel[player.movableBodyInfo.downBound][
                player.movableBodyInfo.rightBound
              ]
            )
          ) {
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisX(
              player,
              this.physicalLevel[player.movableBodyInfo.downBound][
                player.movableBodyInfo.rightBound
              ]
            );
            moveInXAxis = false;
            PhysicsEngine.setBodyPositionNextToAnotherBodyInAxisY(
              player,
              this.physicalLevel[player.movableBodyInfo.downBound][
                player.movableBodyInfo.rightBound
              ]
            );
            moveInYAxis = false;
          }

          break;
        }

        default:
          break;
      }

      if (moveInXAxis) {
        player.setMovementX(movementX);
      }
      if (moveInYAxis) {
        player.setMovementY(movementY);
      }
    }
  }

  /**
   * Set body position next to another body in axis Y
   * @param {import('./physical_body')} body The body
   * @param {import('./physical_body')} tile The tile
   */
  static setBodyPositionNextToAnotherBodyInAxisY(body, tile) {
    if (body.getPositionY() > tile.getPositionY()) {
      body.setPositionY(
        tile.getPositionY() + tile.getSizeY() / 2 + body.getSizeY() / 2 + 0.1
      );
    } else {
      body.setPositionY(
        tile.getPositionY() - tile.getSizeY() / 2 - body.getSizeY() / 2 - 0.1
      );
    }
  }

  /**
   * Set body position next to another body in axis X
   * @param {import('./physical_body')} body The body
   * @param {import('./physical_body')} tile The tile
   */
  static setBodyPositionNextToAnotherBodyInAxisX(body, tile) {
    if (body.getPositionX() > tile.getPositionX()) {
      body.setPositionX(
        tile.getPositionX() + tile.getSizeX() / 2 + body.getSizeX() / 2 + 0.1
      );
    } else {
      body.setPositionX(
        tile.getPositionX() - tile.getSizeX() / 2 - body.getSizeX() / 2 - 0.1
      );
    }
  }
}

module.exports = PhysicsEngine;
