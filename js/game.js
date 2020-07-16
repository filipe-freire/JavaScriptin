const generateRandomNumber = (lower, upper) => {
  return Math.floor(Math.random() * (upper + 1 - lower)) + lower;
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.startButton = document.getElementById('startGame');

    this.player = new Player(this);
    this.bullet = new Bullet(this);
    this.screenText = new Screentext(this);
    // Highscores for after game over
    this.highscore = [];
    // Enemies
    this.enemiesArr = [];
    this.bossArr = [];
    // Powerups
    this.powerupsArr = [];
    // Bullets
    this.bullets = [];
    // Game Over
    this.isRunning = true;
    this.isPaused = false;
    this.setKeyBindings();
    // ---- Sounds ----
    this.sounds = new Sounds(this);
  }

  playMusic() {
    this.sounds.gameMusic.play();
  }

  togglePause() {
    if (!this.isPaused) {
      this.startButton.innerHTML = 'Start';
      this.isPaused = true;
    } else if (this.isPaused) {
      this.startButton.innerHTML = 'Pause';
      this.isPaused = false;
    }
  }

  setKeyBindings() {
    window.addEventListener('keydown', event => {
      const key = event.key;
      switch (key) {
        case 'ArrowUp':
          if (!this.isPaused) {
            event.preventDefault();
            this.player.y -= 10;
            break;
          }
        case 'ArrowDown':
          if (!this.isPaused) {
            event.preventDefault();
            this.player.y += 10;
            break;
          }
        case 'b':
          if (!this.isPaused) {
            event.preventDefault();
            if (this.bullet.bulletsLeft > 0) {
              this.bullet.bulletsLeft--;
              //console.log(this.bullet.bulletsLeft);
              const bullet = new Bullet(this);
              this.bullets.push(bullet);
              //console.log(this.bullets);
              this.sounds.fireBulletSound.play();
            } else {
              //console.log("You're out of bullets!");
            }
            break;
          }
        case 'q':
          event.preventDefault();
          this.togglePause();
      }
    });
  }

  runLogic() {
    this.player.runLogic();

    // push a new enemy into the enemiesArr whenever one is taken out of the game
    // Add New Levels here
    switch (this.screenText.level) {
      case 1:
        console.log(this.screenText.level);
        if (this.enemiesArr.length < 10) {
          const enemy = new Enemy(
            this,
            generateRandomNumber(1000, 2000),
            generateRandomNumber(0, 450),
            50,
            50,
            generateRandomNumber(3, 5), //2.5, 4)
            generateRandomNumber(0, 4)
          );
          this.enemiesArr.push(enemy);
        }
        break;
      case 2:
        console.log(this.screenText.level);

        if (this.enemiesArr.length < 15) {
          const enemy = new Enemy(
            this,
            generateRandomNumber(1000, 2000),
            generateRandomNumber(0, 450),
            50,
            50,
            generateRandomNumber(3, 4.8), //2.5, 4)
            generateRandomNumber(0, 4)
          );
          this.enemiesArr.push(enemy);
        }
        break;
      case 3:
        console.log(this.screenText.level);

        if (this.enemiesArr.length < 20) {
          const enemy = new Enemy(
            this,
            generateRandomNumber(1000, 2000),
            generateRandomNumber(0, 450),
            50,
            50,
            generateRandomNumber(3, 4.8), //2.5, 4)
            generateRandomNumber(0, 4)
          );
          this.enemiesArr.push(enemy);
        }
        break;
      case 4:
        console.log(this.screenText.level);

        if (this.enemiesArr.length < 40) {
          const enemy = new Enemy(
            this,
            generateRandomNumber(1000, 2000),
            generateRandomNumber(0, 450),
            50,
            50,
            generateRandomNumber(1.3, 2), //2.5, 4)
            generateRandomNumber(0, 4)
          );
          this.enemiesArr.push(enemy);
        }
        break;
      case 5:
        console.log(this.screenText.level);

        if (this.enemiesArr.length < 80) {
          const enemy = new Enemy(
            this,
            generateRandomNumber(1000, 2500),
            generateRandomNumber(0, 450),
            50,
            50,
            generateRandomNumber(2, 3), //2.5, 4)
            generateRandomNumber(0, 4)
          );
          this.enemiesArr.push(enemy);
        }
        break;
      case 6: // ADD BOSS BATTLE
        if (this.screenText.bossBattleX > -1000) {
          this.screenText.bossBattleWarningDisplay();
        }

        if (this.enemiesArr.length < 1 && this.bossArr.length < 1) {
          const enemy = new Enemy(
            this,
            generateRandomNumber(1000, 1200),
            generateRandomNumber(0, 450),
            200,
            200,
            1.5, //2.5, 4)
            5
          );
          this.bossArr.push(enemy);
        }
        break;
    }

    // BOSS
    for (let boss of this.bossArr) {
      boss.runLogic();

      const intersectingWithPlayer = boss.checkIntersection(this.player);

      // check collision with player
      if (intersectingWithPlayer || boss.x <= 0) {
        this.sounds.enemyHitsPlayerSound.play();
        this.player.health = 0; //
      }

      // check collision with bullet
      if (this.bullets.length > 0) {
        this.bullets.forEach(bullet => {
          const index = this.bullets.indexOf(bullet);
          const intersectingWithBullet = boss.checkIntersection(bullet);

          if (intersectingWithBullet) {
            this.sounds.bulletHittingEnemy.play();
            this.bullets.splice(index, 1);
            this.bullet.bulletBossCounter++;
          }
          if (this.bullet.bulletBossCounter === 30) {
            const index = this.bossArr.indexOf(boss);
            this.bossArr.splice(index, 1);
            this.screenText.level++;
          }
        });
      }
    }

    if (this.screenText.level === 7) {
      // add GameOver
    }

    for (let enemy of this.enemiesArr) {
      enemy.runLogic();

      const intersectingWithPlayer = enemy.checkIntersection(this.player);

      // check collision with player
      if (intersectingWithPlayer) {
        this.sounds.enemyHitsPlayerSound.play();
        const index = this.enemiesArr.indexOf(enemy);
        this.enemiesArr.splice(index, 1);
        this.player.health -= 20;
      }

      // check collision with bullet
      if (this.bullets.length > 0) {
        const intersectingWithBullet = enemy.checkIntersection(this.bullets[0]);
        // console.log(intersectingWithBullet);
        if (intersectingWithBullet) {
          this.sounds.bulletHittingEnemy.play();
          this.screenText.enemiesEliminated += 1;
          const index = this.enemiesArr.indexOf(enemy);
          this.enemiesArr.splice(index, 1);
        }
      }

      // eleminate enemy from array if it goes off canvas
      if (enemy.x + enemy.width < 0) {
        const index = this.enemiesArr.indexOf(enemy);
        this.enemiesArr.splice(index, 1);
      }
    }

    // Powerup

    for (let powerup of this.powerupsArr) {
      powerup.runLogic();

      const intersectingWithPlayer = powerup.checkIntersection(this.player);
      if (intersectingWithPlayer) {
        this.sounds.playerPicksPowerup.play();
        const index = this.powerupsArr.indexOf(powerup);
        this.powerupsArr.splice(index, 1);
        // depending on the image src, give the player different abilities (ex increase movement speed, shield)
        this.bullet.bulletsLeft += 1;
      }

      // check collision with bullet
      if (this.bullets.length > 0) {
        const intersectingWithBullet = powerup.checkIntersection(this.bullets[0]);
        // console.log(intersectingWithBullet);
        if (intersectingWithBullet) {
          this.sounds.bulletHittingEnemy.play();
          const index = this.powerupsArr.indexOf(powerup);
          this.powerupsArr.splice(index, 1);
        }
      }

      if (powerup.x + powerup.width < 0) {
        const index = this.powerupsArr.indexOf(powerup);
        this.powerupsArr.splice(index, 1);
      }
    }

    // pushes a new powerup
    if (this.powerupsArr.length < 3) {
      const powerup = new Powerup(
        this,
        generateRandomNumber(1000, 1500),
        generateRandomNumber(0, 450),
        50,
        50,
        generateRandomNumber(3, 4.8), //2.5, 4)
        generateRandomNumber(0, 3)
      );
      this.powerupsArr.push(powerup);
    }

    // Bullet
    if (this.bullets.length > 0) {
      for (let bullet of this.bullets) {
        const index = this.bullets.indexOf(bullet);
        bullet.runLogic();
        //eleminate if it goes off canvas
        if (bullet.x > 1000) {
          this.bullets.splice(index, 1);
        }
      }
    }

    this.screenText.increaseLevel();

    // Game Over
    if (this.player.health <= 0) {
      this.sounds.gameMusic.pause();
      this.isRunning = false;
    }

    // Update Score
    const interval = setInterval(this.screenText.incrementScore(), 1000);
  }

  clean() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  paint() {
    this.player.paint();
    this.screenText.paint();
    for (let enemy of this.enemiesArr) {
      enemy.paint();
    }

    for (let boss of this.bossArr) {
      boss.paint();
    }

    for (let powerup of this.powerupsArr) {
      powerup.paint();
    }
    if (this.bullets.length > 0) {
      for (let bullet of this.bullets) {
        bullet.paint();
      }
    }
  }

  loop() {
    // Run logic
    if (!this.isPaused) {
      this.runLogic();
    }

    // Erase
    this.clean();

    // Paint
    this.paint();

    if (this.isRunning) {
      setTimeout(() => {
        this.loop();
      }, 1000 / 60);
    } else {
      this.sounds.gameOverSound.play();
      this.screenText.printScore(); // writes message to the gameOverMessage | may need to be deleted after changing game over mechanism
      this.highscore.push([this.screenText.score, this.screenText.enemiesEliminated]);
      alert(this.screenText.gameOverMessage);
    }
  }
}