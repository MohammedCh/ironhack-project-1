// ----EVENT LISTENERS----
window.onload = () => {
  setCanvasSize(); //responsive size
  checkIfNewHighscore(); //show highscores on front page

  document.getElementById("start-button").onclick = () => {
    startGame();

    canvas.addEventListener("mousedown", function (e) {
      checkIfHelpAsked(getCursorPosition(canvas, e));
      checkIfGamePaused(getCursorPosition(canvas, e));
      checkIfMoleIsHit(getCursorPosition(canvas, e), e);
    });

    modalCloseBtns = document.getElementsByClassName("modal-btn");
    for (const btn of modalCloseBtns) {
      btn.addEventListener("click", () => resumeGame());
    }
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && gameRunning) {
      endGame();
    }
  });
};

// ----CLASSES----
class Mole {
  constructor(x, y, imgSrc, state) {
    this.x = x;
    this.y = y;
    this.state = state;

    const moleImg = new Image();
    moleImg.src = imgSrc;
    moleImg.addEventListener("load", () => {
      this.moleImg = moleImg;
      this.draw();
    });
  }
  draw() {
    ctx.drawImage(this.moleImg, this.x, this.y, 83, 62);
  }
  clear() {
    ctx.clearRect(this.x, this.y, 83, 62);
  }
}

class sound {
  constructor(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
      this.sound.play();
    };
    this.stop = function () {
      this.sound.pause();
    };
  }
}

// ----VARIABLES----
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let moleLocationArr; //array with where moles should be placed on the screen
let molesArr; //array that contains the Moles
let gameRunning; //boolean showing whether the game is running
let popUpsWithNoBomb; //counter for consecutive moles popping up (no bombs)
let gameSpeed; //miliseconds that decrease per level increasing the speed of the game
let previousMoleIndex; //holds index of last popped up mole location
let molePoints; //counter for how many moles were hit
let lives; //lives counter
let livesAtGameStart;
let level; //level of the game
let molesToNextLevel; //number of moles required to finish a level
let gamePaused; //boolean showing whether the game is paused or not
let numberOfMoles; //number of total moles/holes on screen

// ----FUNCTIONS----
//function used when game starts
function resetVariables() {
  gameSpeed = 2000;
  gameRunning = true;
  gamePaused = false;
  livesAtGameStart = 3;
  livesUpdate(livesAtGameStart);
  numberOfMoles = 8;
  moleLocationArr = moleLocations(numberOfMoles);
  molesArr = moleCreator(moleLocationArr);
  popUpsWithNoBomb = 0;
  level = 0;
  levelUp();
  molePointsUpdate(0);
}

// moleLocations returns an array of objects each containing the
// x and y coordinates of where moles should be on the canvas
function moleLocations(numOfMoles) {
  const arr = [];
  if (numberOfMoles % 3 === 0) {
    for (let j = 2; j < 5; j++) {
      for (let k = 2; k < 2 + numberOfMoles / 3; k++) {
        arr.push({
          x: (canvas.width / 6.5) * j,
          y: (canvas.height / 5.5) * k - canvas.height / 6,
        });
      }
    }
    return arr;
  } else if (numberOfMoles % 5 === 0) {
    for (let j = 2; j < 4; j++) {
      for (let k = 2; k < 2 + numberOfMoles / 2; k++) {
        arr.push({
          x: (canvas.width / 8.5) * k,
          y: (canvas.height / 6) * j,
        });
      }
    }
    return arr;
  } else if (numberOfMoles > 10) {
    const radius = 160;
    const radius2 = 60;
    const step = (2 * Math.PI) / 9;
    const step2 = (2 * Math.PI) / (numberOfMoles - 9);
    let angle = 0;

    for (let i = 0; i < 9; i++) {
      arr.push({
        x: canvas.width / 2 + radius * Math.cos(angle), //aranges them in circular format
        y: canvas.height / 3 + radius * Math.sin(angle),
      });
      angle += step;
    }
    angle = 0;
    for (let i = 0; i < numberOfMoles - 9; i++) {
      arr.push({
        x: canvas.width / 2 + radius2 * Math.cos(angle), //aranges them in circular format
        y: canvas.height / 3 + radius2 * Math.sin(angle),
      });
      angle += step2;
    }
    return arr;
  } else {
    const radius = 140;
    const step = (2 * Math.PI) / numOfMoles;
    let angle = 0;

    for (let i = 0; i < numOfMoles; i++) {
      arr.push({
        x: canvas.width / 2 + radius * Math.cos(angle), //aranges them in circular format
        y: canvas.height / 3 + radius * Math.sin(angle),
      });
      angle += step;
    }
  }
  return arr;
}

// moleCreator creates the mole objects on the canvas based on the
// array of mole locations received, also returns array of moles
function moleCreator(moleLocArr) {
  let arr = [];
  for (let i = 0; i < moleLocArr.length; i++) {
    const mole = new Mole(
      moleLocArr[i].x,
      moleLocArr[i].y,
      "./images/mole_hole.png"
    );
    arr.push(mole);
  }
  return arr;
}

function startGame() {
  initializeGame();
  //delay at start of game
  window.requestTimeout(() => startPoppingUp(), 1000);
}
//function that does all things that have to happen at start of the game once
function initializeGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resetVariables();
  hideOrShowElements("hide");
  const questionMarkImg = new Image();
  questionMarkImg.src = "./images/questionMark.png";
  questionMarkImg.addEventListener("load", () => {
    ctx.drawImage(questionMarkImg, canvas.width - 52, 0, 50, 50);
  });
  const playPause = new Image();
  playPause.src = "./images/playPause.png";
  playPause.addEventListener("load", () => {
    ctx.drawImage(playPause, canvas.width - 110, 0, 50, 50);
  });
}

//this function hides or shows elements on the UI upon starting the game
function hideOrShowElements(hideOrShow) {
  const toHide = document.querySelectorAll(".to-hide");
  const toShow = document.querySelectorAll(".to-show");

  if (hideOrShow === "hide") {
    toHide.forEach((el) => (el.style.display = "none"));
    toShow.forEach((el) => el.removeAttribute("style"));
  } else {
    toHide.forEach((el) => el.removeAttribute("style"));
    toShow.forEach((el) => (el.style.display = "none"));
  }
}

// function that keeps the moles popping up while game is running
function startPoppingUp() {
  let moleIndex = randomMolePicker();
  //if below guarantees there is a bomb after 5 no bombs
  if (popUpsWithNoBomb > 5 && !gamePaused && gameRunning) {
    moleIndex = popUpBomb();
    popUpsWithNoBomb = 0;

    //if random index returned is lower the number of moles, then pop up a mole
  } else if (moleIndex <= molesArr.length - 1 && !gamePaused && gameRunning) {
    popUpMole(moleIndex);
    popUpsWithNoBomb += 1;

    //else if above number of moles, then pop up bomb instead
  } else if (!gamePaused && gameRunning) {
    moleIndex = popUpBomb();
  }
  if (!gamePaused && gameRunning)
    window.requestTimeout(() => {
      if (molesArr[moleIndex].state != "underground") {
        if (molesArr[moleIndex].state != "bomb") {
          livesUpdate(lives - 1);
        }
        hideMole(moleIndex);
      }
    }, gameSpeed);
  if (gameRunning && !gamePaused) {
    window.requestTimeout(() => {
      requestAnimationFrame(startPoppingUp);
    }, gameSpeed);
  }
}

//function replaces a single mole (img) with another
function replaceMole(moleIndex, imgSrc, state) {
  molesArr[moleIndex].clear();
  molesArr[moleIndex] = new Mole(
    molesArr[moleIndex].x,
    molesArr[moleIndex].y,
    imgSrc,
    state
  );
}

//returns a random mole index based on the mole array created earlier
function randomMolePicker() {
  //totalMoles is +1 the indices, but not deducted because of formula below. See next line comments for more info
  //also adding 1 every 5 moles, which will be the bombs
  let totalMoles = molesArr.length + Math.floor(molesArr.length / 5);
  let randomMoleIndex = Math.floor(Math.random() * totalMoles); //Math.random() * (max - min + 1) + min
  //The while loop in the next lines guarantees that the same index isn't picked twice
  //this was causing a bug where the game was hiding an already hidden-through-hit mole
  while (randomMoleIndex === previousMoleIndex) {
    randomMoleIndex = Math.floor(Math.random() * totalMoles);
  }
  previousMoleIndex = randomMoleIndex;
  return randomMoleIndex;
}

//function changes mole pic, making mole pop up
function popUpMole(moleIndex) {
  replaceMole(moleIndex, "./images/mole_1.png", "surface");
  playSound("./sounds/pop.ogg");
}
//function changes mole pic, making a bomb pop up, returns index where bomb popped up
function popUpBomb() {
  let randomIndex = randomMolePicker();
  while (randomIndex > molesArr.length - 1) {
    randomIndex = randomMolePicker();
  }
  replaceMole(randomIndex, "./images/mole_bomb.png", "bomb");
  return randomIndex;
}
//function changes to hole pic, making mole hide
function hideMole(moleIndex) {
  replaceMole(moleIndex, "./images/mole_hole.png", "underground");
}

//returns an object with {x:, y:} of canvas coordinates of where the mouse clicked
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: x, y: y };
}

//checks if there is a mole popping up at the location the mouse clicks
function checkIfMoleIsHit(cursorClickPosition, event) {
  if (!gamePaused) {
    molesArr.forEach((element) => {
      if (
        cursorClickPosition.x >= element.x &&
        cursorClickPosition.x <= element.x + 83 &&
        cursorClickPosition.y >= element.y &&
        cursorClickPosition.y <= element.y + 62 &&
        element.state === "bomb"
      ) {
        console.log("kaboom");
        playSound("./sounds/explosion.mp3");
        hideMole(molesArr.indexOf(element));
        livesUpdate(lives - 1);
      } else if (
        cursorClickPosition.x >= element.x &&
        cursorClickPosition.x <= element.x + 83 &&
        cursorClickPosition.y >= element.y &&
        cursorClickPosition.y <= element.y + 62 &&
        element.state === "surface"
      ) {
        console.log("hit");
        requestTimeout(() => molePointsUpdate(molePoints + 1), 10);
        hideMole(molesArr.indexOf(element));
        showPow(event);
      }
    });
  }
}

function checkIfHelpAsked(cursorClickPosition) {
  if (
    cursorClickPosition.x >= canvas.width - 52 &&
    cursorClickPosition.x <= canvas.width &&
    cursorClickPosition.y >= 0 &&
    cursorClickPosition.y <= 50
  ) {
    const myModal = new bootstrap.Modal(
      document.getElementById("guidelinesModal"),
      {
        keyboard: false,
      }
    );
    pauseGame();
    myModal.show();
  }
}

function checkIfGamePaused(cursorClickPosition) {
  if (
    cursorClickPosition.x >= canvas.width - 110 &&
    cursorClickPosition.x <= canvas.width - 52 &&
    cursorClickPosition.y >= 0 &&
    cursorClickPosition.y <= 50
  ) {
    if (!gamePaused) {
      triggerModal("Game paused", `Click on the OK button to resume`);
    }
  }
}
//shows the popup image with "pow" where the mouse hits a mole
function showPow(event) {
  const popup = document.getElementById("popup");
  popup.style.cssText = `position: absolute; top: ${
    event.pageY - 100
  }px; left: ${event.pageX - 80}px`;
  window.requestTimeout(() => {
    popup.setAttribute("style", "display:none");
  }, 250);
  playSound("./sounds/hit.wav");
}

//called when game ends either when player dies, wins, or presses escape button
function endGame(wonGameBoolean) {
  if (wonGameBoolean) {
    triggerModal(
      "You won!",
      "Congratulations!!! You have completed the game! :)"
    );
    playSound("./sounds/win.wav");
    playSound("./sounds/yes.wav");
  } else {
    triggerModal("Game ended", `Your score was ${molePoints}`);
    playSound("./sounds/endGame.wav");
  }
  checkIfNewHighscore();
  gameRunning = false;
  hideOrShowElements();
}

//updating lives of remaining and ending game if 0
function livesUpdate(number) {
  if (!gamePaused) {
    lives = number;
  }
  if (lives === 0) {
    endGame();
    return;
  }
  let livesText = "";
  for (let i = 0; i < lives; i++) {
    livesText = livesText + "♥";
  }
  ctx.font = "60px Arial";
  ctx.fillStyle = "red";
  ctx.clearRect(canvas.width - 120, canvas.height - 50, 110, 50);
  ctx.fillText(`${livesText}`, canvas.width - 120, canvas.height - 10);
}

//a function that updates a player's points or moles hit
function molePointsUpdate(number) {
  molePoints = number;
  if (molePoints === molesToNextLevel) {
    levelUp();
    if (level === 6) {
      return;
    }
    triggerModal("Level Up!", `Congrats, you are now in level ${level}!`);
    ctx.clearRect(0, 0, canvas.width - 110, canvas.height - 100);
    numberOfMoles++;
    moleLocationArr = moleLocations(numberOfMoles);
    molesArr = moleCreator(moleLocationArr);
  }
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.clearRect(10, canvas.height - 38, 200, 29);
  ctx.fillText(
    `Moles: ${molePoints} / ${molesToNextLevel}`,
    10,
    canvas.height - 10
  );
}

function playSound(url) {
  const mySound = new sound(url);
  mySound.play();
}

function levelUp() {
  level++;
  if (level === 6) {
    endGame(true);
    return;
  }
  molesToNextLevel = level * 3;
  gameSpeed -= 200;
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.clearRect(10, canvas.height - 69, 200, 29);
  ctx.fillText(`Level: ${level}`, 10, canvas.height - 40);
}

function pauseGame() {
  gamePaused = true;
}
function resumeGame() {
  gamePaused = false;
  //set delay before hiding moles, otherwise player can miss them after pause
  molesArr.forEach((e) => {
    if (e.state === "surface" || e.state === "bomb") {
      window.requestTimeout(() => {
        hideMole(molesArr.indexOf(e));
      }, 2000);
    }
  });
  window.requestTimeout(() => {
    startPoppingUp();
  }, 2000);
}

//functions that creates popups
function triggerModal(title, content) {
  pauseGame();
  document.getElementById("staticBackdropLabel").innerHTML = title;
  document.getElementById("modalBody").innerHTML = content;
  const myModal = new bootstrap.Modal(
    document.getElementById("staticBackdrop")
  );
  myModal.show();
}

//functions called at endGame() that checks and updates highscores
function checkIfNewHighscore() {
  const orderedList = document.getElementById("highscores");
  const list = orderedList.children;
  const listParent = orderedList.parentElement;
  localStorageStr = JSON.parse(localStorage.getItem("highscores")); //retrieve from local storage
  let arr = [];
  console.log(JSON.parse(localStorage.getItem("highscores")))
  //if null then create arr with 0 values, else take values from localStorage
  if (JSON.parse(localStorage.getItem("highscores"))[0] === null) {
    arr = [0, 0, 0];
  } else {
    arr = Array.from(localStorageStr);
  }

  //if last element of (sorted) array is smaller than molePoints then update
  if (molePoints > arr[arr.length - 1]) {
    arr[arr.length - 1] = molePoints;
  }

  //sort array in descending format
  arr
    .sort(function (a, b) {
      return a - b;
    })
    .reverse();

  console.log(arr);
  //add to localStorage
  localStorage.setItem("highscores", JSON.stringify(arr));

  //update highscore on html
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != 0) list[i].innerHTML = arr[i] + " moles";
  }
  if (arr[0] != 0) listParent.style = "display: block";
}

function setCanvasSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width >= 769) {
    canvas.setAttribute("width", "750px");
    canvas.setAttribute("height", "500px");
    return;
  }
  if (width >= 481) {
    canvas.setAttribute("width", "500px");
    canvas.setAttribute("height", "500px");
    return;
  }
}

// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function (fn, delay) {
  if (
    !window.requestAnimationFrame &&
    !window.webkitRequestAnimationFrame &&
    !(
      window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame
    ) && // Firefox 5 ships without cancel support
    !window.oRequestAnimationFrame &&
    !window.msRequestAnimationFrame
  )
    return window.setTimeout(fn, delay);

  var start = new Date().getTime(),
    handle = new Object();

  function loop() {
    var current = new Date().getTime(),
      delta = current - start;

    delta >= delay ? fn.call() : (handle.value = requestAnimFrame(loop));
  }

  handle.value = requestAnimFrame(loop);
  return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function (handle) {
  window.cancelAnimationFrame
    ? window.cancelAnimationFrame(handle.value)
    : window.webkitCancelAnimationFrame
    ? window.webkitCancelAnimationFrame(handle.value)
    : window.webkitCancelRequestAnimationFrame
    ? window.webkitCancelRequestAnimationFrame(
        handle.value
      ) /* Support for legacy API */
    : window.mozCancelRequestAnimationFrame
    ? window.mozCancelRequestAnimationFrame(handle.value)
    : window.oCancelRequestAnimationFrame
    ? window.oCancelRequestAnimationFrame(handle.value)
    : window.msCancelRequestAnimationFrame
    ? window.msCancelRequestAnimationFrame(handle.value)
    : clearTimeout(handle);
};
