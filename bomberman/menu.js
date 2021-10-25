'use strict';

const path = require('path');

const {
  Clock,
  Color,
  Font,
  Keyboard,
  Mouse,
  RenderWindow,
  Sprite,
  Text,
  Texture,
  Vector2F,
  Vector2I,
  VideoMode,
} = require('sfml.js');

const Button = require('./button');
const Game = require('./game');
const Slider = require('./slider');

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Menu.cpp
class Menu {
  constructor(width, height) {
    this.clock = new Clock();
    this.windowWidth = width;
    this.windowHeight = height;

    this.window = new RenderWindow(
      new VideoMode(width, height, 32),
      'Bomberman',
      RenderWindow.Style.Close
    );
    this.window.setFramerateLimit(60);

    this.exit = false;
    this._options = false;
    this.credits = false;

    this.buttons = [];

    this.font = new Font();
    this.font.loadFromFile(path.join(__dirname, 'data/micross.ttf'));
    this.gameVersion = new Text('Public 1.0.1', this.font);
    this.gameVersion.setFillColor(new Color(32, 32, 32, 128));
    this.gameVersion.setScale(0.6, 0.6);

    this.optionsText = [];
    for (let i = 0; i < 4; i++) {
      const text = new Text(' ', this.font, 25);
      this.optionsText.push(text);
      text.setFillColor(new Color(0, 107, 139));
      text.setStyle(Text.Style.Bold);
    }

    this.optionsText[0].setString('HP PER GAME:');
    this.optionsText[2].setString('2');
    this.optionsText[1].setString('VOLUME LEVEL:');
    this.optionsText[3].setString('60%');

    this.optionsText[0].setPosition(160, 180);
    this.optionsText[2].setPosition(400, 180);
    this.optionsText[1].setPosition(160, 260);
    this.optionsText[3].setPosition(385, 260);

    this.playerSlider = new Slider(
      'horizontal',
      new Vector2F(460, 180),
      100,
      30,
      470,
      80,
      20,
      10,
      new Color(0, 148, 154),
      new Color(229, 229, 229),
      new Color(160, 160, 160),
      new Color(255, 255, 255)
    );
    this.playerSlider.setValue(0.4);
    this.playerLives = 3;

    this.volumnSlider = new Slider(
      'horizontal',
      new Vector2F(460, 260),
      100,
      30,
      470,
      80,
      20,
      10,
      new Color(0, 148, 154),
      new Color(229, 229, 229),
      new Color(160, 160, 160),
      new Color(255, 255, 255)
    );
    this.volumnSlider.setValue(0.6);
    this.volumn = 60;
  }

  async init() {
    this.buttons = [
      new Button(
        new Vector2F(this.windowWidth / 2 - 150, this.windowHeight / 2.3 - 50),
        new Vector2I(300, 75),
        'data/pressButton.png',
        'data/unpressButton.png',
        'START'
      ),
      new Button(
        new Vector2F(this.windowWidth / 2 - 150, this.windowHeight / 1.7 - 50),
        new Vector2I(300, 75),
        'data/pressButton.png',
        'data/unpressButton.png',
        'OPTIONS'
      ),
      new Button(
        new Vector2F(
          this.windowWidth / 2 - 150,
          this.windowHeight / 1.7 + 100 - 50
        ),
        new Vector2I(300, 75),
        'data/pressButton.png',
        'data/unpressButton.png',
        'CREDITS'
      ),
      new Button(
        new Vector2F(
          this.windowWidth / 2 - 150,
          this.windowHeight / 1.7 + 200 - 50
        ),
        new Vector2I(300, 75),
        'data/pressButton.png',
        'data/unpressButton.png',
        'EXIT'
      ),
    ];
    this.optionReturnButton = new Button(
      new Vector2F(25, this.windowHeight - 100),
      new Vector2I(300, 75),
      'data/pressButton.png',
      'data/unpressButton.png',
      'RETURN TO MENU'
    );

    await Promise.all(this.buttons.map(button => button.init()));
    await this.optionReturnButton.init();

    let texture = new Texture();
    await texture.loadFromFile(path.join(__dirname, 'data/menuBackground.png'));
    this.backgroundSprite = new Sprite(texture);
    this.backgroundSprite.setScale(
      new Vector2F(
        this.windowWidth / texture.getSize().x,
        this.windowHeight / texture.getSize().y
      )
    );

    texture = new Texture();
    await texture.loadFromFile(path.join(__dirname, 'data/menuPiGames.png'));
    texture.setSmooth(true);
    this.pigamesLogoSprite = new Sprite(texture);
    this.pigamesLogoSprite.setScale(
      new Vector2F(
        this.windowHeight / texture.getSize().y / 8,
        this.windowHeight / texture.getSize().y / 8
      )
    );

    texture = new Texture();
    await texture.loadFromFile(path.join(__dirname, 'data/menuLogo.png'));
    texture.setSmooth(true);
    this.gameLogoSprite = new Sprite(texture);
    this.gameLogoSprite.setScale(
      new Vector2F(
        this.windowHeight / texture.getSize().y / 7,
        this.windowHeight / texture.getSize().y / 7
      )
    );
    this.gameLogoSprite.setPosition(
      new Vector2F(
        this.windowWidth / 2 -
          (texture.getSize().x * this.gameLogoSprite.getScale().x) / 2,
        this.windowHeight / 5 - 30
      )
    );

    const textRect = this.gameVersion.getLocalBounds();
    this.gameVersion.setPosition(
      this.gameLogoSprite.getPosition().x +
        texture.getSize().x * this.gameLogoSprite.getScale().x -
        textRect.width * 0.8,
      this.gameLogoSprite.getPosition().y +
        texture.getSize().y * this.gameLogoSprite.getScale().y
    );

    texture = new Texture();
    await texture.loadFromFile(path.join(__dirname, 'data/credits.png'));
    this.creditsSprite = new Sprite(texture);
  }

  async run() {
    this.clock.restart();
    if (this.exit) return;

    this.draw();
    await this.processEvents();
    if (this._options) {
      this.options();
    }

    setImmediate(this.run.bind(this));
  }

  options() {
    this.volumn = parseInt(this.volumnSlider.getValue() * 100);
    if (this.volumnSlider.getValue() === 0) {
      this.volumnSlider.setValue(0.6);
      this.volumn = 60;
    } else if (this.volumn < 10) {
      this.volumn = 0;
    } else if (this.volumn > 87) {
      this.volumn = 100;
    }
    this.optionsText[3].setString(`${this.volumn}%`);

    this.playerLives = this.playerSlider.getValue() * 5;
    if (this.playerSlider.getValue() === 0) {
      this.playerSlider.setValue(0.4);
      this.playerLives = 2;
    } else if (this.playerLives < 0.6) {
      this.playerLives = 0;
    } else if (this.playerLives >= 4.5) {
      this.playerLives = 5;
    }
    this.playerLives = parseInt(this.playerLives) + 1;
    this.optionsText[2].setString(`${this.playerLives}`);
  }

  draw() {
    this.window.clear(0xffffffff);
    this.window.draw(this.backgroundSprite);

    if (this.credits) {
      this.window.draw(this.creditsSprite);
      this.window.display();
      return;
    }

    if (this._options) {
      this.window.draw(this.optionReturnButton.getSprite());
      this.window.draw(this.optionReturnButton.getText());
      this.playerSlider.draw(this.window);
      this.volumnSlider.draw(this.window);

      for (const text of this.optionsText) {
        this.window.draw(text);
      }

      this.window.display();
      return;
    }

    this.window.draw(this.pigamesLogoSprite);
    this.window.draw(this.gameLogoSprite);
    this.window.draw(this.gameVersion);

    for (const button of this.buttons) {
      this.window.draw(button.getSprite());
      this.window.draw(button.getText());
    }

    this.window.display();
  }

  async processEvents() {
    let event;
    const mouseI = Mouse.getPosition(this.window);
    const mouse = new Vector2F(mouseI.x, mouseI.y);

    while ((event = this.window.pollEvent())) {
      if (event.type === 'Closed') {
        this.exit = true;
        break;
      }

      if (this._options) {
        this.playerSlider.update(Mouse.getPosition(this.window), event);
        this.volumnSlider.update(Mouse.getPosition(this.window), event);

        if (
          event.type === 'MouseButtonReleased' &&
          event.mouseButton.buttonStr === 'Left' &&
          !this.credits
        ) {
          this.optionReturnButton.update(Mouse.getPosition(this.window), false);
          if (
            this.optionReturnButton
              .getSprite()
              .getGlobalBounds()
              .contains(mouse)
          ) {
            this._options = false;
          }
        }
      } else if (
        event.type === 'MouseButtonReleased' &&
        event.mouseButton.buttonStr === 'Left' &&
        !this.credits
      ) {
        for (const button of this.buttons) {
          button.update(Mouse.getPosition(this.window), false);
        }

        if (this.buttons[0].getSprite().getGlobalBounds().contains(mouse)) {
          console.log('Start!');
          const game = new Game(this.window);
          await game.init(this.volumn, this.volumn, this.playerLives);
          this.exit = !(await game.run());
          return;
        } else if (
          this.buttons[1].getSprite().getGlobalBounds().contains(mouse)
        ) {
          this._options = true;
        } else if (
          this.buttons[2].getSprite().getGlobalBounds().contains(mouse)
        ) {
          this.credits = true;
        } else if (
          this.buttons[3].getSprite().getGlobalBounds().contains(mouse)
        ) {
          this.exit = true;
        }
      }

      if (
        event.type === 'MouseButtonPressed' &&
        event.mouseButton.buttonStr === 'Left' &&
        !this.credits
      ) {
        if (this._options) {
          this.optionReturnButton.update(Mouse.getPosition(this.window), true);
          break;
        }

        for (const button of this.buttons) {
          button.update(Mouse.getPosition(this.window), true);
        }
      }

      if (this.credits) {
        if (event.type === 'KeyPressed') {
          this.credits = false;
        }
      }

      if (this._options) {
        if (Keyboard.isKeyPressed('Escape')) {
          this._options = false;
        }
      }
    }
  }
}

module.exports = Menu;
