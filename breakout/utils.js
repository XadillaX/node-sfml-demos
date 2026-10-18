'use strict';

const { Keyboard } = require('sfml.js');

function usefulKeyStates() {
  let leftPressed = false;
  let rightPressed = false;
  let spacePressed = false;

  if (Keyboard.isKeyPressed(Keyboard.Key.A) || Keyboard.isKeyPressed(Keyboard.Key.Left)) {
    leftPressed = true;
  }

  if (Keyboard.isKeyPressed(Keyboard.Key.D) || Keyboard.isKeyPressed(Keyboard.Key.Right)) {
    rightPressed = true;
  }

  if (Keyboard.isKeyPressed(Keyboard.Key.Space)) {
    spacePressed = true;
  }

  if (!(leftPressed ^ rightPressed)) {  // eslint-disable-line
    leftPressed = rightPressed = false;
  }

  return {
    leftPressed,
    rightPressed,
    spacePressed,
  };
}

exports.usefulKeyStates = usefulKeyStates;
