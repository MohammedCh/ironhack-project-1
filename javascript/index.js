window.onload = () => {
  document.getElementById("start-button").onclick = () => {
    startGame();
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        endGame();
      }
    });

    canvas.addEventListener("mousedown", function (e) {
      checkIfHelpAsked(getCursorPosition(canvas, e));
      checkIfMoleIsHit(getCursorPosition(canvas, e), e);
    });
  };
};

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

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// moleLocations returns an array of objects each containing the
// x and y coordinates of where moles should be on the canvas
function moleLocations(numOfMoles) {
  const radius = 150;
  const step = (2 * Math.PI) / numOfMoles;
  let angle = 0;
  const arr = [];

  for (let i = 0; i < numOfMoles; i++) {
    arr.push({
      x: canvas.width / 2 + radius * Math.cos(angle), //aranges them in circular format
      y: canvas.height / 3 + radius * Math.sin(angle),
    });
    angle += step;
  }
  return arr;
}
let moleLocationArr;

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
// TODO remove const and the arr return from above if not used
let molesArr;

let gameRunning;
function startGame() {
  initializeGame();
  setTimeout(() => {
    startPoppingUp();
  }, 1000);
}

//function that does all things that have to happen at start of the game once
function initializeGame() {
  resetVariables();
  hideOrShowElements("hide");
  const questionMarkImg = new Image();
  questionMarkImg.src = "/images/questionMark.png";
  questionMarkImg.addEventListener("load", () => {
    ctx.drawImage(questionMarkImg, canvas.width - 50, 0, 50, 50);
  });
}

let popUpsWithNoBomb;
// function that keeps the moles popping up while game is running
function startPoppingUp() {
  let moleIndex = randomMolePicker();
  //if below guarantees there is a bomb after 5 no bombs
  if (popUpsWithNoBomb > 5) {
    moleIndex = popUpBomb();
    popUpsWithNoBomb = 0;

    //if random index returned is lower the number of moles, then pop up a mole
  } else if (moleIndex <= molesArr.length - 1) {
    popUpMole(moleIndex);
    popUpsWithNoBomb += 1;

    //else if above number of moles, then pop up bomb instead
  } else {
    moleIndex = popUpBomb();
  }
  setTimeout(() => {
    if (molesArr[moleIndex].state != "underground") {
      if (molesArr[moleIndex].state != "bomb") {
        livesUpdate(lives - 1);
      }
      hideMole(moleIndex);
    }
  }, 2000);
  setTimeout(() => {
    if (gameRunning) requestAnimationFrame(startPoppingUp);
  }, gameSpeed);
}

let gameSpeed;

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

//function changes mole pic, making mole pop up
function popUpMole(moleIndex) {
  replaceMole(moleIndex, "./images/mole_1.png", "surface");
  playSound("/sounds/pop.ogg");
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

//returns a random mole index based on the mole array created earlier
function randomMolePicker() {
  //totalMoles is +1 the indices, but not deducted because of formula below. See next line comments for more info
  //also adding 1 every 5 moles, which will be the bombs
  totalMoles = molesArr.length + Math.floor(molesArr.length / 5);
  randomMoleIndex = Math.floor(Math.random() * totalMoles); //Math.random() * (max - min + 1) + min
  return randomMoleIndex;
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
  molesArr.forEach((element) => {
    if (
      cursorClickPosition.x >= element.x &&
      cursorClickPosition.x <= element.x + 83 &&
      cursorClickPosition.y >= element.y &&
      cursorClickPosition.y <= element.y + 62 &&
      element.state === "bomb"
    ) {
      console.log("kaboom");
      playSound("/sounds/explosion.mp3");
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
      hideMole(molesArr.indexOf(element));
      pointsUpdate(points + 100);
      showPow(event);
    }
  });
}

function checkIfHelpAsked(cursorClickPosition) {
  if (
    cursorClickPosition.x >= canvas.width - 50 &&
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
    myModal.show();
  }
}

//shows the popup image with "pow" where the mouse hits a mole
function showPow(event) {
  const popup = document.getElementById("popup");
  popup.style.cssText = `position: absolute; top: ${
    event.pageY - 100
  }px; left: ${event.pageX - 80}px`;
  setTimeout(() => {
    popup.setAttribute("style", "display:none");
  }, 250);
  playSound("/sounds/hit.wav");
}

let points;

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

let lives;

function endGame(wonGameBoolean) {
  if (wonGameBoolean) {
    triggerModal(
      "You won!",
      "Congratulations!!! You have completed the game! :)"
    );
    playSound("/sounds/win.wav");
    playSound("/sounds/yes.wav");
  } else {
    triggerModal("Game ended", `Your score was ${points}`);
    playSound("/sounds/endGame.wav");
  }
  gameRunning = false;
  hideOrShowElements();
}

//function used if game ends
function resetVariables() {
  gameRunning = true;
  pointsUpdate(0);
  livesAtGameStart = 3;
  livesUpdate(livesAtGameStart);
  moleLocationArr = moleLocations(8);
  molesArr = moleCreator(moleLocationArr);
  popUpsWithNoBomb = 0;
  level = 1;
  gameSpeed = 2000;
}

let livesAtGameStart;

function livesUpdate(number) {
  lives = number;
  if (lives === 0) {
    endGame();
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

function pointsUpdate(number) {
  points = number;
  if (
    points === 1000 ||
    points === 2000 ||
    points === 3000 ||
    points === 4000
  ) {
    levelUp();
    triggerModal("Level Up!", `Congrats, you are now in level ${level}!`);
  }
  if (points === 5000) {
    endGame(true);
  }
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.clearRect(10, canvas.height - 40, 400, 30);
  ctx.fillText(`Points: ${points}`, 10, canvas.height - 10);
}

function playSound(url) {
  const mySound = new sound(url);
  mySound.play();
}

let level;
function levelUp() {
  level++;
  console.log(level);
  gameSpeed -= 300;
}

function triggerModal(title, content) {
  document.getElementById("staticBackdropLabel").innerHTML = title;
  document.getElementById("modalBody").innerHTML = content;
  const myModal = new bootstrap.Modal(
    document.getElementById("staticBackdrop"),
    {
      keyboard: false,
    }
  );
  myModal.show();
}
