# ANGRY MOLES! (Ironhack-project-1)

<img width="25%" src="images/mole_logo.png">
The classic arcade [Whac-A-Mole](https://en.wikipedia.org/wiki/Whac-A-Mole) game, in a digital format!
Try the game on http://mohammedch.github.io/ironhack-project-1/


## Motivation

This project was done as part of the Ironhack full time web development bootcamp. It is the first out of three main projects required to finish the bootcamp. The reason Whac-A-Mole was chosen is it's simplicity. Given the time constraint of a work week, having a quick MVP is key and something that is simple makes that easier. The second reason is the scalability, meaning that it's a game where features can be easily added based on available time.



## How to play

When the game starts, moles and bombs start popping up randomly. It is played by moving the mouse and clicking on the right spots.
- The pointer is a mallet that can be used by clicking on the moles
- Every mole missed and every bomb hit is **-1 ♥**
- Every **10** moles hit you get to a new level.
- Finish level 5 to win!
- Press *escape* button to end game.



## Features/implementation details

- Moles pop at random in random spots
- Bombs pop up at random. If 5 moles popped up in a row, a bomb pop up is guaranteed
- Pause/Resume game
- Help button with guidelines
- See your current level
- Level up every number of moles
- Win on finishing level 5
- Every new level the speed increases, 1 mole/hole is added and the field of play rearranges itself accordingly
- Sounds (on hitting mole, winning or losing game, hitting bomb etc.)
- Modals (on level up, pausing, winning, ending game etc.)
- "POW" image pops up when a mole is hit
- Highscores on front page - saved to localStorage so available after refresh too
- Lives show as hearts
- Some responsiveness, although not perfect. Still doesn't work well with mobile screens
- Added player's name to highscore (not fully functional due to lack of time)


## Future features

- Testing and potential bugfixing
- Mute/Unmute button
- Manually edit game to your taste (speed, starting moles, moles added per level etc.)
- Mole animation: gradually change mole between appearing and dissappearing. Also different mole animation when hit



## Build status

The game hasn't undergone a lot of testing so it might contain some bugs. A known bug happens upon restarting the game multiple times quickly and consecutively. It is recommended to reload the browser every new game (don't worry, highscores will not dissappear :)).



## Framework used

The is a simple browser based, client side game, built using HTML, CSS and Javascript.



## How to simply adjust game for your taste

Just fork the repo, and edit the /javascript/index.js file.
The code is written in a way to minimize manual work if the game needs to be edited. With very small edits you can change the entire code. Things that can easily change, but not limited to:
- Difficulty/Speed
- Speed change per level
- Starting field
- How many moles/holes added per level, which will change the field of play
- Change moles needed to finish a level:

For example to change the difficulty/speed of the game, lower the gameSpeed variable to make the game faster. To change the starting field, change the numberOfMoles variable to the number of moles you want the game to start with.
The following function has the variables mentioned in the example above:

```
`function resetVariables() {
  `gameSpeed = 2000;
  `gameRunning = true;
  `gamePaused = false;
  `livesAtGameStart = 3;
  `livesUpdate(livesAtGameStart);
  `numberOfMoles = 8;
  `moleLocationArr = moleLocations(numberOfMoles);
  `molesArr = moleCreator(moleLocationArr);
  `popUpsWithNoBomb = 0;
  `level = 0;
  `levelUp();
  `molePointsUpdate(0);
`}
```



## Supported Browsers

The game can be played on most browsers such as Chrome, Safari, Firefox, Opera, Edge etc.
IE is not supported.



## Special thanks

Thanks to [Raymond](https://github.com/RaymondMaroun) and [Joana](https://github.com/jofariaironhack) for their guidance throughout the first 3 weeks of the bootcamp and this project.