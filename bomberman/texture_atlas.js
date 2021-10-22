'use strict';

const { IntRect, Texture } = require('sfml.js');

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/TextureAtlas.cpp
class TextureAtlas {
  constructor() {
    this.count = 0;
    this.cellWidth = this.cellHeight = 0;
    this.rows = this.columns = 0;
  }

  async loadFromFile(filename) {
    try {
      this.texture = new Texture();
      await this.texture.loadFromFile(filename);
    } catch (e) {
      console.error(e);

      this.count = 0;
      this.cellWidth = this.cellHeight = 0;
      this.rows = this.columns = 0;
      return false;
    }

    this.count = 1;
    this.cellWidth = this.texture.getSize().x;
    this.cellHeight = this.texture.getSize().y;
    this.rows = this.columns = 1;
    return true;
  }

  trimByGrid(cellSizeX, cellSizeY) {
    if (this.cellWidth % cellSizeX !== 0 || this.cellHeight % cellSizeY !== 0) {
      return false;
    }

    this.rows = this.cellWidth / cellSizeX;
    this.columns = this.cellHeight / cellSizeY;

    this.count = this.rows * this.columns;
    this.cellWidth = cellSizeX;
    this.cellHeight = cellSizeY;

    return true;
  }

  getCount() {
    return this.count;
  }

  getCellSizeX() {
    return this.cellWidth;
  }

  getCellSizeY() {
    return this.cellHeight;
  }

  setSpriteTextureByIndex(sprite, index) {
    if (this.count === 0 || index >= this.count) {
      return;
    }

    const x = (index % this.rows) * this.cellWidth;
    const y = parseInt(index / this.rows) * this.cellHeight;

    sprite.setTexture(this.texture);
    sprite.setTextureRect(new IntRect(x, y, this.cellWidth, this.cellHeight));
  }
}

module.exports = TextureAtlas;
