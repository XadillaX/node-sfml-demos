'use strict';

const path = require('path');

const { Color, Font, Sprite, Text, Texture, Vector2F } = require('sfml.js');

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Button.cpp
class Button {
  constructor(position, size, pressTextureSrc, unpressTextureSrc, text) {
    this.position = position;
    this.size = size;

    this.pressTexture = new Texture();
    this.unpressTexture = new Texture();

    this.font = new Font();
    this.font.loadFromFileSync(path.join(__dirname, 'data/ahronbd.ttf'));
    this.text = new Text(text, this.font);
    this.text.setFillColor(new Color(0, 107, 139, 0xff));

    const textRect = this.text.getLocalBounds();
    this.text.setOrigin(textRect.left + textRect.width / 2, 0);
    this.text.setPosition(
      new Vector2F(position.x + size.x / 2, position.y + size.y / 4)
    );

    this.press = false;

    this.loadPromises = [
      this.pressTexture.loadFromFile(path.join(__dirname, pressTextureSrc)),
      this.unpressTexture.loadFromFile(path.join(__dirname, unpressTextureSrc)),
    ];
  }

  async init() {
    await Promise.all(this.loadPromises);

    this.pressSprite = new Sprite(this.pressTexture);
    this.pressSprite.setPosition(this.position);
    this.pressSprite.setScale(
      new Vector2F(
        this.size.x / this.pressTexture.getSize().x,
        this.size.y / this.pressTexture.getSize().y
      )
    );

    this.unpressSprite = new Sprite(this.unpressTexture);
    this.unpressSprite.setPosition(this.position);
    this.unpressSprite.setScale(
      new Vector2F(
        this.size.x / this.unpressTexture.getSize().x,
        this.size.y / this.unpressTexture.getSize().y
      )
    );
  }

  check(mousePosition) {
    if (
      mousePosition.x > this.position.x &&
      mousePosition.x < this.position.x + this.size.x
    ) {
      if (
        mousePosition.y > this.position.y &&
        mousePosition.y < this.position.y + this.size.y
      ) {
        return true;
      }
    }

    return false;
  }

  doAction() {}

  update(mousePosition, buttonPressed) {
    if (this.check(mousePosition)) {
      if (buttonPressed) {
        this.press = true;
      } else {
        this.press = false;
        this.doAction();
      }
    } else {
      this.press = false;
    }
  }

  getSprite() {
    if (this.press) return this.pressSprite;
    return this.unpressSprite;
  }

  getText() {
    return this.text;
  }
}

module.exports = Button;
