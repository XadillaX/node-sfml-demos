'use strict';

const {
  Mouse,
  RectangleShape,
  Vector2F,
} = require('sfml.js');

class Slider {
  constructor(
    orientation,
    beltBeginPosition,
    beltLength,
    beltThickness,
    sliderBeginXPosition,
    sliderLength,
    sliderThickness,
    grasperThickness,
    beltColor,
    sliderColor,
    sliderAfterGrasperColor,
    grasperColor
  ) {
    this.value = 0;
    this.sliderOrient = orientation;

    this.oldMousePositionX = 0;
    this.oldMousePositionY = 0;
    this.mouseButtonPressed = false;

    this.belt = new RectangleShape({ x: 0, y: 0 });
    this.slider = new RectangleShape({ x: 0, y: 0 });
    this.sliderAfterGrasper = new RectangleShape({ x: 0, y: 0 });
    this.grasper = new RectangleShape({ x: 0, y: 0 });

    switch (orientation) {
      case 'horizontal': {
        this.belt.setPosition(beltBeginPosition);
        this.belt.setSize(new Vector2F(beltLength, beltThickness));

        this.slider.setPosition(sliderBeginXPosition, beltBeginPosition.y + beltThickness / 2 - sliderThickness / 2);
        this.slider.setSize(new Vector2F(sliderLength, sliderThickness));

        this.grasper.setPosition(sliderBeginXPosition, this.slider.getPosition().y);
        this.grasper.setSize(new Vector2F(grasperThickness, sliderThickness));

        this.sliderAfterGrasper.setPosition(sliderBeginXPosition, beltBeginPosition.y + beltThickness / 2 - sliderThickness / 2);
        this.sliderAfterGrasper.setSize(new Vector2F(sliderLength, sliderThickness));

        break;
      }

      case 'vertical': {
        this.belt.setPosition(beltBeginPosition);
        this.belt.setSize(new Vector2F(beltThickness, beltLength));

        this.slider.setPosition(beltBeginPosition.x + beltThickness / 2 - sliderThickness / 2, sliderBeginXPosition);
        this.slider.setSize(new Vector2F(sliderThickness, sliderLength));

        this.grasper.setPosition(this.slider.getPosition().x, this.slider.getPosition().y);
        this.grasper.setSize(Vector2F(sliderThickness, grasperThickness));

        this.sliderAfterGrasper.setPosition(beltBeginPosition.x + beltThickness / 2 - sliderThickness / 2, this.slider.getPosition().y);
        this.sliderAfterGrasper.setSize(Vector2F(sliderThickness, sliderLength));

        break;
      }

      default: break;
    }

    this.belt.setFillColor(beltColor);
    this.slider.setFillColor(sliderColor);
    this.grasper.setFillColor(grasperColor);
    this.sliderAfterGrasper.setFillColor(sliderAfterGrasperColor);
  }

  draw(window) {
    window.draw(this.belt);
    window.draw(this.slider);
    window.draw(this.sliderAfterGrasper);
    window.draw(this.grasper);
  }

  setValue(value) {
    let grasperOldXPos = 0;
    let newX = 0;
    let grasperOldYPos = 0;
    let newY = 0;
    switch (this.sliderOrient) {
      case 'horizontal': {
        grasperOldXPos = this.grasper.getPosition().x;
        newX = this.slider.getPosition().x - this.grasper.getSize().x / 2 + (this.slider.getSize().x * value);
        this.grasper.setPosition(newX, this.grasper.getPosition().y);
        this.sliderAfterGrasper.setPosition(this.grasper.getPosition().x, this.sliderAfterGrasper.getPosition().y);
        this.sliderAfterGrasper.setSize(
          new Vector2F(
            this.sliderAfterGrasper.getSize().x - (this.grasper.getPosition().x - grasperOldXPos),
            this.sliderAfterGrasper.getSize().y));
        break;
      }

      case 'vertical': {
        grasperOldYPos = this.grasper.getPosition().y;
        newY = this.slider.getPosition().y - this.grasper.getSize().y / 2 + (this.slider.getSize().y * value);
        this.grasper.setPosition(this.grasper.getPosition().x, newY);
        this.sliderAfterGrasper.setPosition(this.sliderAfterGrasper.getPosition().x, this.grasper.getPosition().y);
        this.sliderAfterGrasper.setSize(
          new Vector2F(
            this.sliderAfterGrasper.getSize().x,
            this.sliderAfterGrasper.getSize().y - (this.grasper.getPosition().y - grasperOldYPos)));
        break;
      }

      default: break;
    }
  }

  getValue() {
    return this.value;
  }

  update(mousePosI, event) {
    const mousePos = new Vector2F(mousePosI.x, mousePosI.y);
    if (this.grasper.getGlobalBounds().contains(mousePos) || this.mouseButtonPressed) {
      if (event.type === 'MouseButtonPressed') {
        if (event.mouseButton.buttonStr === 'Left') {
          this.oldMousePositionX = mousePos.x;
          this.oldMousePositionY = mousePos.y;
          this.mouseButtonPressed = true;
        }
      } else if (event.type === 'MouseButtonReleased') {
        if (event.mouseButton.buttonStr === 'Left') {
          this.mouseButtonPressed = false;
        }
      } else if (event.type === 'MouseMoved' && Mouse.isButtonPressed('Left')) {
        if (this.sliderOrient === 'horizontal') {
          if (
            this.grasper.getPosition().x + event.mouseMove.x - this.oldMousePositionX + this.grasper.getSize().x <=
              this.slider.getPosition().x + this.slider.getSize().x &&
            this.grasper.getPosition().x + event.mouseMove.x - this.oldMousePositionX >= this.slider.getPosition().x) {
            const grasperOldXPos = this.grasper.getPosition().x;
            this.grasper.setPosition(this.grasper.getPosition().x + event.mouseMove.x - this.oldMousePositionX, this.grasper.getPosition().y);
            this.sliderAfterGrasper.setPosition(this.grasper.getPosition().x, this.sliderAfterGrasper.getPosition().y);
            this.sliderAfterGrasper.setSize(
              new Vector2F(
                this.sliderAfterGrasper.getSize().x - (this.grasper.getPosition().x - grasperOldXPos),
                this.sliderAfterGrasper.getSize().y));
            this.oldMousePositionX = event.mouseMove.x;
            this.value = (this.grasper.getPosition().x - (this.grasper.getSize().x / 2) - this.slider.getPosition().x) / this.slider.getSize().x;
          }
        } else if (this.sliderOrient === 'vertical') {
          if (
            this.grasper.getPosition().y + event.mouseMove.y - this.oldMousePositionY + this.grasper.getSize().y <=
              this.slider.getPosition().y + this.slider.getSize().y &&
            this.grasper.getPosition().y + event.mouseMove.y - this.oldMousePositionY >= this.slider.getPosition().y) {
            const grasperOldYPos = this.grasper.getPosition().y;
            this.grasper.setPosition(this.grasper.getPosition().x, this.grasper.getPosition().y + event.mouseMove.y - this.oldMousePositionY);
            this.sliderAfterGrasper.setPosition(this.sliderAfterGrasper.getPosition().x, this.grasper.getPosition().y);
            this.sliderAfterGrasper.setSize(
              new Vector2F(
                this.sliderAfterGrasper.getSize().x,
                this.sliderAfterGrasper.getSize().y - (this.grasper.getPosition().y - grasperOldYPos)));
            this.oldMousePositionY = event.mouseMove.y;
            this.value = (this.grasper.getPosition().y + (this.grasper.getSize().y / 2) - this.slider.getPosition().y) / this.slider.getSize().y;
          }
        }
      }
    }
  }
}

module.exports = Slider;
