window.onload = () => {
  document.getElementById("start-button").onclick = () => {
    resetVariables();
    startGame();
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Points: ${points}`, 10, canvas.height - 10);
    ctx.fillText(`Lives: ${lives}`, 10, canvas.height - 50);
  };
  document.getElementById("end-button").onclick = () => {
    endGame();
  };
  canvas.addEventListener("mousedown", function (e) {
    checkIfMoleIsHit(getCursorPosition(canvas, e), e);
  });
};

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

let myInterval;
function startGame() {
  hideOrShowElements("hide");
  myInterval = setInterval(() => {
    let moleIndex = randomMolePicker();
    //if random index returned above number of moles, then pop up bomb
    if (moleIndex <= molesArr.length - 1) {
      popUpMole(moleIndex);
    } else {
      moleIndex = popUpBomb();
    }
    setTimeout(() => {
      if (molesArr[moleIndex].state != "underground" && myInterval != null) {
        if (molesArr[moleIndex].state != "bomb") {
          livesUpdate(lives - 1);
        }
        hideMole(moleIndex);
      }
    }, 2000);
  }, 2000);
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

//function changes mole pic, making mole pop up
function popUpMole(moleIndex) {
  replaceMole(moleIndex, "./images/mole_1.png", "surface");
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
      hideMole(molesArr.indexOf(element));
      livesUpdate(lives - 1);
    } else if (
      cursorClickPosition.x >= element.x &&
      cursorClickPosition.x <= element.x + 83 &&
      cursorClickPosition.y >= element.y &&
      cursorClickPosition.y <= element.y + 62
    ) {
      console.log("hit");
      hideMole(molesArr.indexOf(element));
      pointsUpdate(points + 100);
      showPow(event);
    }
  });
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

function endGame() {
  clearInterval(myInterval);
  myInterval = null;
  hideOrShowElements();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  alert(`Your score was ${points}`);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//function used if game ends
function resetVariables() {
  pointsUpdate(0);
  livesUpdate(3);
  moleLocationArr = moleLocations(8);
  molesArr = moleCreator(moleLocationArr);
}

function livesUpdate(number) {
  lives = number;
  if (lives === 0) {
    endGame();
  }
  ctx.clearRect(10, canvas.height - 80, 400, 30);
  ctx.fillText(`Lives: ${lives}`, 10, canvas.height - 50);
}

function pointsUpdate(number) {
  points = number;
  ctx.clearRect(10, canvas.height - 40, 400, 30);
  ctx.fillText(`Points: ${points}`, 10, canvas.height - 10);
}
