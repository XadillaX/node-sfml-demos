'use strict';

const fs = require('fs');

const MAGIC_HEADER = 'BOMBERMAN_LEVEL';

const TILE_TYPE = {
  NONE: 0,
  NONE_WITH_SHADOW: 1,
  WEAK_WALL: 2,
  DOUBLE_WEAK_WALL: 3,
  INDESTRUCTIBLE_WALL: 4,
  DOUBLE_INDESTRUCTIBLE_WALL: 5,
  HALF_INDESTRUCTIBLE_WALL: 6,
  BOMB: 7,
  COUNT: 8,
};

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Level.cpp
class Level {
  constructor() {
    this.version = 1.0;
    this.destroyableTilesKey = 0;
    this.data = [];
  }

  async loadFromFile(filename) {
    const content = await fs.promises.readFile(filename, 'utf8');
    const lines = content.split('\n').filter(l => l);
    if (!lines.length) return false;

    if (lines[0] !== MAGIC_HEADER) {
      return false;
    }

    const version = parseFloat(lines[1]);
    if (version !== this.version) {
      return false;
    }

    let temp = lines[2]
      .split(' ')
      .map(s => s.trim())
      .filter(s => s);
    this.width = parseInt(temp[0]);
    this.height = parseInt(temp[1]);

    this.data = [];
    for (let i = 0; i < this.height; i++) {
      const arr = [];
      temp = lines[3 + i]
        .split(' ')
        .map(s => s.trim())
        .filter(s => s);
      for (let j = 0; j < this.width; j++) {
        arr.push(parseInt(temp[j]));
      }
      this.data.push(arr);
    }

    return true;
  }

  getTile(x, y) {
    return this.data[y][x];
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  destroyTile(x, y /** , destroyTexture */) {
    if (this.data[y][x] <= TILE_TYPE.NONE_WITH_SHADOW) {
      return false;
    }

    if (
      this.data[y - 1][x] >= TILE_TYPE.WEAK_WALL &&
      this.data[y - 1][x] !== TILE_TYPE.BOMB
    ) {
      this.data[y][x] = TILE_TYPE.NONE_WITH_SHADOW;
      this.view.changeTileTexture(x, y, TILE_TYPE.NONE_WITH_SHADOW);
    } else {
      this.data[y][x] = TILE_TYPE.NONE;
      this.view.changeTileTexture(x, y, TILE_TYPE.NONE);
    }

    if (this.data[y + 1][x] === TILE_TYPE.NONE_WITH_SHADOW) {
      this.data[y + 1][x] = TILE_TYPE.NONE;
      this.view.changeTileTexture(x, y + 1, TILE_TYPE.NONE);
    }

    if (this.data[y - 1][x] === TILE_TYPE.DOUBLE_WEAK_WALL) {
      this.data[y - 1][x] = TILE_TYPE.WEAK_WALL;
      this.view.changeTileTexture(x, y - 1, TILE_TYPE.WEAK_WALL);
    }

    if (this.data[y - 1][x] === TILE_TYPE.DOUBLE_INDESTRUCTIBLE_WALL) {
      this.data[y - 1][x] = TILE_TYPE.INDESTRUCTIBLE_WALL;
      this.view.changeTileTexture(x, y - 1, TILE_TYPE.INDESTRUCTIBLE_WALL);
    }

    if (this.data[y - 1][x] === TILE_TYPE.HALF_INDESTRUCTIBLE_WALL) {
      this.data[y - 1][x] = TILE_TYPE.INDESTRUCTIBLE_WALL;
      this.view.changeTileTexture(x, y - 1, TILE_TYPE.INDESTRUCTIBLE_WALL);
    }
  }

  setTileAsBomb(x, y) {
    this.data[y][x] = TILE_TYPE.BOMB;
  }

  setTileAsDestroyable(x, y) {
    this.data[y][x] = TILE_TYPE.WEAK_WALL;
  }

  setLevelView(view) {
    this.view = view;
  }
}

Level.TILE_TYPE = TILE_TYPE;

module.exports = Level;
