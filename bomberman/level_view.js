'use strict';

const { Sprite } = require('sfml.js');

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/LevelView.cpp
class LevelView {
  setLevel(level, atlas) {
    this.atlas = atlas;
    this.tileSize = atlas.getCellSizeX();
    this.data = [];
    for (let y = 0; y < level.getHeight(); y++) {
      const arr = [];
      for (let x = 0; x < level.getWidth(); x++) {
        const sprite = new Sprite();
        arr.push(sprite);
        atlas.setSpriteTextureByIndex(sprite, level.getTile(x, y));
        sprite.setPosition(x * this.tileSize, y * this.tileSize);
      }

      this.data.push(arr);
    }
  }

  draw(window) {
    for (let y = 0; y < this.data.length; y++) {
      for (let x = 0; x < this.data[y].length; x++) {
        window.draw(this.data[y][x]);
      }
    }
  }

  changeTileTexture(x, y, tileNumber) {
    this.atlas.setSpriteTextureByIndex(this.data[y][x], tileNumber);
  }
}

module.exports = LevelView;
