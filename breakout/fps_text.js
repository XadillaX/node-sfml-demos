'use strict';

const path = require('path');

const {
  Color,
  Font,
  Text,
  Vector2f,
} = require('sfml.js');

class FPSText extends Text {
  constructor() {
    const font = new Font();

    super({ string: '帧率：0', font, characterSize: 20 });

    this.fontLoaded = font.openFromFile(path.join(__dirname, 'font.ttf'));
    this.setPosition(new Vector2f(10, 250));
    this.setFillColor(new Color(0xff, 0x78, 0x00, 0xff));
  }

  calcFPS(dt) {
    this.setString(`帧率：${(1000 / dt.asMilliseconds()).toFixed(0)}`);
  }

  render(window) {
    window.draw(this);
  }
}

module.exports = FPSText;
