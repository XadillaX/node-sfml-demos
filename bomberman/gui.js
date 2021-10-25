'use strict';

const path = require('path');

const {
  Color,
  RectangleShape,
  Sprite,
  Text,
  Texture,
  Vector2F,
  Vector2I,
} = require('sfml.js');

const Button = require('./button');

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/GUI.cpp
class GUI {
  async init(font, textSize, screenWidth, screenHeight, out) {
    this.rect = new RectangleShape({ x: 0, y: 0 });

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.playerOneLives = new Text('Player 1 Lives: 3', font);
    this.playerOneLives.setPosition(20, 10);
    this.playerOneLives.setFillColor(0xffffffff);
    this.playerOneLives.setScale(1.2, 1.2);

    this.playerSecondLives = new Text('Player 2 Lives: 3', font);
    this.playerSecondLives.setPosition(
      this.screenWidth - 300,
      this.screenHeight - 50
    );
    this.playerSecondLives.setFillColor(0xffffffff);
    this.playerSecondLives.setScale(1.2, 1.2);

    this.whoWin = -1;

    /**
     * @type {{ enterMenu: boolean, exit: boolean, playAgain: bool }}
     */
    this.out = out;

    this.endOfGameMenuView = false;
    this.gameGUIView = true;

    const texture = new Texture();
    await texture.loadFromFile(path.join(__dirname, 'data/frame.png'));
    const frame = new Sprite(texture);
    frame.setScale(
      texture.getSize().x / (screenWidth * 5),
      texture.getSize().y / (screenHeight * 7)
    );
    frame.setPosition(
      screenWidth / 2 - (texture.getSize().x * frame.getScale().x) / 2,
      screenHeight / 3.3 - 50
    );

    this.returnToMenuButton = new Button(
      new Vector2F(screenWidth / 2 - 150, screenHeight / 2.3 - 50),
      new Vector2I(300, 75),
      'data/pressButton.png',
      'data/unpressButton.png',
      'Return to Menu'
    );
    this.playAgainButton = new Button(
      new Vector2F(screenWidth / 2 - 150, screenHeight / 1.7 - 50),
      new Vector2I(300, 75),
      'data/pressButton.png',
      'data/unpressButton.png',
      'Play Again'
    );
    this.exitButton = new Button(
      new Vector2F(
        screenWidth / 2 - 150,
        screenHeight / 2.3 + screenHeight / 1.7 - screenHeight / 2.3 - 50
      ),
      new Vector2I(300, 75),
      'data/pressButton.png',
      'data/unpressButton.png',
      'Exit Game'
    );

    await Promise.all([
      this.returnToMenuButton.init(),
      this.playAgainButton.init(),
      this.exitButton.init(),
    ]);

    this.winnerText = new Text('Player 1 Wins!', font);
    const textRect = this.winnerText.getLocalBounds();
    this.winnerText.setOrigin(textRect.left + textRect.width / 2.0, 0);
    this.winnerText.setPosition(
      new Vector2F(screenWidth / 2, frame.getPosition().y + 20)
    );
    this.winnerText.setFillColor(new Color(0, 107, 139));
    this.winnerText.setScale(1.2, 1.2);
  }

  updateStats(players /** , mouseX, mouseY */) {
    this.endOfGameMenuView = false;
    this.gameGUIView = true;
    for (let i = 0; i < players.length; i++) {
      switch (i) {
        case 0:
          this.playerOneLives.setString(
            `Player 1 Lives: ${players[i].getRespawnsCount()}`
          );
          break;
        case 1:
          this.playerSecondLives.setString(
            `Player 2 Lives: ${players[i].getRespawnsCount()}`
          );
          break;
        default:
          break;
      }

      if (players[i].getWin()) {
        this.whoWin = i;
        this.winnerText.setString(`Player ${this.whoWin + 1} Wins!`);
        break;
      } else {
        // ??
      }
    }
  }

  updateStatsOutter(players, mouseX, mouseY) {
    this.updateStats(players, mouseX, mouseY);
    this.endOfGameMenuView = true;
    this.gameGUIView = false;
  }

  processEvent(mousePos, event) {
    if (this.endOfGameMenuView) {
      if (
        event.type === 'MouseButtonReleased' &&
        event.mouseButton.buttonStr === 'Left'
      ) {
        this.returnToMenuButton.update(mousePos, false);
        this.playAgainButton.update(mousePos, false);
        this.exitButton.update(mousePos, false);

        if (
          this.returnToMenuButton
            .getSprite()
            .getGlobalBounds()
            .contains(mousePos.x, mousePos.y)
        ) {
          this.out.playAgain = false;
          this.out.enterMenu = true;
          this.out.exit = true;
        }

        if (
          this.playAgainButton
            .getSprite()
            .getGlobalBounds()
            .contains(mousePos.x, mousePos.y)
        ) {
          this.out.playAgain = true;
          this.out.enterMenu = false;
          this.out.exit = false;
        }

        if (
          this.exitButton
            .getSprite()
            .getGlobalBounds()
            .contains(mousePos.x, mousePos.y)
        ) {
          this.out.playAgain = false;
          this.out.enterMenu = false;
          this.out.exit = true;
        }
      }

      if (
        event.type === 'MouseButtonPressed' &&
        event.mouseButton.buttonStr === 'Left'
      ) {
        this.returnToMenuButton.update(mousePos, true);
        this.playAgainButton.update(mousePos, true);
        this.exitButton.update(mousePos, true);
      }
    }
  }

  draw(window) {
    this.rect.setFillColor(new Color(255, 255, 255, 155));
    this.rect.setSize(new Vector2F(this.screenWidth, this.screenHeight));

    if (this.endOfGameMenuView) {
      window.draw(this.frame);
      window.draw(this.rect);

      window.draw(this.returnToMenuButton.getSprite());
      window.draw(this.returnToMenuButton.getText());

      window.draw(this.playAgainButton.getSprite());
      window.draw(this.playAgainButton.getText());

      window.draw(this.exitButton.getSprite());
      window.draw(this.exitButton.getText());

      window.draw(this.winnerText);
    }

    if (this.gameGUIView) {
      window.draw(this.playerOneLives);
      window.draw(this.playerSecondLives);
    }
  }
}

module.exports = GUI;
