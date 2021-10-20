'use strict';

const path = require('path');

const {
  Color,
  Font,
  Text,
} = require('sfml.js');

class FPSText extends Text {
  constructor() {
    const font = new Font();
    font.loadFromFile(path.join(__dirname, 'font.ttf'));

    super('帧率：0', font, 20);

    this.setPosition(10, 250);
    this.setColor(new Color(0xff, 0x78, 0x00, 0xff));
  }

  calcFPS(dt) {
    this.setString(`帧率：${(1000 / dt.asMilliseconds()).toFixed(0)}`);
  }

  render(window) {
    window.draw(this);
  }
}

module.exports = FPSText;
