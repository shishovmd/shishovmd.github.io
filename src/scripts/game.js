class Sapper {
  mainGridEl = document.getElementById('main_grid');
  isGameOver = false;
  gameProgress = 0;
  health = 1;
  field = {};
  fifty = true;
  seventyFive = true;
  handEvent = '';

  constructor(fieldLine, bombCount) {
      this.fieldLine = fieldLine;
      this.fieldSize = fieldLine ** 2;
      this.bombCount = bombCount;
  };

  init() {

    this.mainGridEl.style.gridTemplateColumns = `repeat(${this.fieldLine}, 25px)`;
    this.mainGridEl.style.gridTemplateRows = `repeat(${this.fieldLine}, 25px)`;
    this.mainGridEl.innerHTML = '';

    for (let i = 0; i < this.fieldSize; i++) {
      const divEl = document.createElement('div');

      divEl.className = 'closed';
      divEl.id = `cell_${i + 1}`;
      divEl.num = i + 1;

      divEl.addEventListener('click', (event) => this.lmc(event));
      divEl.addEventListener('contextmenu', (event) => this.rmc(event));

      this.mainGridEl.appendChild(divEl);
    }
  };

  lmc(event) {

    if (this.isGameOver) {
        return false;
    }

    const cellEl = event.target;
    const cell = this.field[cellEl.num];
    if (cellEl.className !== 'open' && cellEl.className !== 'flag') {
      if (cell.bomb) {
        this.health -= 1;

        if (this.health < 0) {
          this.handEvent = `loose;cell${cellEl.num}`;
          this.gameLose();
        } else {
          this.handEvent = `boom;cell${cellEl.num}`;
        }

        this.setClass(cellEl, 'bomb');
        cellEl.innerText = '*';
      } else {
        this.setClass(cellEl, 'open');
        if (cell.count) {
          this.showCount(cellEl, cell.count);
        } else {
          this.openEmpty(cellEl.num);
        }
      }
    }

    this.getProgress();

    if (this.checkWin()) {
      this.handEvent = 'win';
    }

    //console.log(Math.ceil(this.gameProgress)); // Показывает прогресс
    //console.log(this.health); // Показывает "здоровье"

    const gameData = document.getElementById('game-data');
    gameData.setAttribute('cells-closed', `${Math.floor(this.gameProgress)}`);
    gameData.setAttribute('game-event', `${this.handEvent}`);
    gameData.setAttribute('curr-health', `${this.health}`);
    gameData.onclick();
  };

  rmc(event) {
      event.preventDefault();

      if (this.isGameOver) {
          return false;
      }

      const cellEl = event.target;
      if (cellEl.className !== 'open') {
          if (cellEl.className !== 'flag') {
              this.setClass(cellEl, 'flag');
          } else {
              this.setClass(cellEl, 'closed');
          }
      }
      this.getProgress();
      if (this.checkWin()) {
          this.handEvent = 'win';
      }

      // console.log(Math.ceil(this.gameProgress)) // Показывает прогресс

      const gameData = document.getElementById('game-data');
      gameData.setAttribute('game-event', `${this.handEvent}`);
  };

  bombGenerator() {
      this.field = {};

      for (let i = 1; i <= this.fieldSize; i++) {
          this.field[i] = {};
      }

      // for (let i = 0; i < this.bombCount; i++) {
      //     const rand = Math.floor(Math.random() * ((this.fieldSize + 1) - 1) + 1);
      //     this.field[rand] = {
      //         bomb: true,
      //     };
      // }

      let i = 0;
      while (i < this.bombCount) {
          const rand = Math.floor(Math.random() * ((this.fieldSize + 1) - 1) + 1);
          if (!Object.hasOwn(this.field, this.field[rand])) {
              this.field[rand] = {
                  bomb: true,
              };
              i++;
          }
      }
  };

  calculationOfNumbers() {
      for (let i = 1; i <= this.fieldSize; i++) {
          if (this.field[i].bomb) {
              continue;
          }
          let count = 0;
          for (const num of this.getNearCells(i)) {
              if (this.field[num].bomb) {
                  count++;
              }
          }

          this.field[i].count = count;
      }
  };

  getNearCells(num) {
      const result = [];
      if (num % this.fieldLine === 0) {
          result.push(
              num - this.fieldLine - 1,
              num - this.fieldLine,
              -1,
              num - 1,
              0,
              -1,
              num + this.fieldLine - 1,
              num + this.fieldLine,
              -1,
          );
      } else if ((num + this.fieldLine - 1) % this.fieldLine === 0) {
          result.push(
              -1,
              num - this.fieldLine,
              num - this.fieldLine + 1,
              -1,
              0,
              num + 1,
              -1,
              num + this.fieldLine,
              num + this.fieldLine + 1,
          );
      } else {
          result.push(
              num - this.fieldLine - 1,
              num - this.fieldLine,
              num - this.fieldLine + 1,
              num - 1,
              0,
              num + 1,
              num + this.fieldLine - 1,
              num + this.fieldLine,
              num + this.fieldLine + 1,
          );

      }
      return result.filter((num) => num >= 1 && num <= this.fieldSize);
  };

  getCellById(id) {
      return document.getElementById(`cell_${id}`);
  };

  openEmpty(cellNum) {
      this.field[cellNum].open = true;
      for (const num of this.getNearCells(cellNum)) {
          if (this.field[num].open) {
              continue;
          }
          if (!this.field[num].bomb) {
              this.setClass(this.getCellById(num), 'open');

              if (this.field[num].count) {
                  this.showCount(this.getCellById(num), this.field[num].count);
              } else {
                  this.openEmpty(num);
              }
          }
      }
  };

  setClass(cellEl, newClass) {
      cellEl.className = newClass;
  };

  checkWin() {
      if (this.isGameOver) {
          return false;
      }
      for (let i = 1; i <= this.fieldSize; i++) {
          const cellEl = this.getCellById(i);
          if (cellEl.className === 'closed') {
              return false;
          }
      }
      this.gameWin();
      return true;
  };

  gameLose() {
      this.isGameOver = true;
      const gameData = document.getElementById('game-data');
      gameData.setAttribute('game-event', 'loose');
      gameData.onclick();
      //alert('Game over! You lose.');
      for (const cell in this.field) {
          const el = document.getElementById(`cell_${cell}`);
          if (this.field[cell].bomb) {
              this.setClass(el, 'bomb');
              el.innerText = '*';
          }
      }
  };

  gameWin() {
      this.isGameOver = true;
      const gameData = document.getElementById('game-data');
      gameData.setAttribute('game-event', 'win');
      gameData.onclick();
      //alert('Game over! Tou win');
  };

  showCount(cell, count) {
      cell.innerText = count;
      switch (count) {
          case 1:
              cell.style.color = 'blue';
              break;
          case 2:
              cell.style.color = 'green';
              break;
          case 3:
              cell.style.color = 'red';
              break;
          case 4:
              cell.style.color = 'purple';
              break;
          case 5:
              cell.style.color = 'orange';
              break;
          case 6:
              cell.style.color = 'cyan';
              break;
          case 7:
              cell.style.color = 'yellow';
              break;
          case 8:
              cell.style.color = 'black';
              break;
      }
  };

  getProgress() {
      let openCells = 0
      for (let id = 1; id < this.fieldSize; id++) {
          const cellEl = this.getCellById(id);
          if (cellEl.className === 'flag' || cellEl.className === 'open' || cellEl.className === 'bomb') {
              openCells++;
          }
      }
      this.gameProgress = openCells / (this.fieldSize - this.bombCount) * 100;

      if (this.gameProgress >= 50 && this.fifty) {
          this.health++
          this.fifty = false;
      }
      if (this.gameProgress >= 75 && this.seventyFive) {
          this.health++
          this.seventyFive = false;
      }
  };

  setCellBg(id) {

  };

  getNearArr(id) {
      const flat = [];
      for (const num of this.getNearCells(id)) {

          if (num === 0 || this.getCellById(num).className !== 'close') {
              flat.push(0);
          } else {
              flat.push(1);
          }
      }

      const result = flat.slice(0, 3);
      result[3] = flat.slice(3, 6);
      result[3][3] = flat.slice(-3);
      return result;
  };

  run() {
      this.init();
      this.bombGenerator();
      this.calculationOfNumbers();
      this.showBombs(); // Только для тестов. Показывает бомбы
  };

  showBombs() {
      for (let i = 1; i <= this.fieldSize; i++) {
          const cellEl = document.getElementById(`cell_${i}`);

          if (this.field[i].bomb) {
              cellEl.innerText = '*';
          }
      }
  }; // Только для тестов. Показывает бомбы
};

const startSapper = () => {
  const sapper = new Sapper(12, 25);
  sapper.run();
};