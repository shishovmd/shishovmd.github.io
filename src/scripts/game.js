class Sapper {
  mainGridEl = document.getElementById('main_grid');
  gameData = document.getElementById('game-data');
  isGameOver = false;
  gameProgress = 0;
  health = 1;
  field = {};
  fifty = true;
  seventyFive = true;
  handEvent = '';
  lastCell;
  firsClick = true;
  girl = document.getElementById('game-data').getAttribute('girl');

  constructor (fieldLine, bombCount) {
    this.fieldLine = fieldLine;
    this.fieldSize = fieldLine ** 2;
    this.bombCount = bombCount;
  };

  init () {

    this.mainGridEl.style.gridTemplateColumns = `repeat(${this.fieldLine}, 25px)`;
    this.mainGridEl.style.gridTemplateRows = `repeat(${this.fieldLine}, 25px)`;

    this.mainGridEl.innerHTML = '';

    for (let i = 0; i < this.fieldSize; i++) {
      const divEl = document.createElement('div');

      divEl.className = 'closed';
      divEl.id = `cell_${i + 1}`;
      divEl.num = i + 1;
      divEl.innerHTML = `<div class="frame" style="background-image: url('./src/images/interface/game/frame${this.girl}.png')"></div>`;

      divEl.addEventListener('click', (event) => this.leftMouseClick(event));
      divEl.addEventListener('contextmenu', (event) => this.rightMouseClick(event));

      this.mainGridEl.appendChild(divEl);
    }

    for (let i = 1; i <= this.fieldSize; i++) {
      this.field[i] = {};
    }
  };

  leftMouseClick (event) {

    if (this.isGameOver) {
      return false;
    }
    this.health = Number(this.gameData.getAttribute('curr-health'));

    const cellEl = event.target;
    const cell = this.field[cellEl.num];

    // Начало игры. Первое нажатие.
    if (this.firsClick) {
      const safe = this.getNearCells(cellEl.num)[1];
      safe.push(cellEl.num);

      this.bombGenerator(safe);
      this.calculationOfNumbers();
      //this.showBombs();

      this.firsClick = false;
    }

    console.log(this.health);
    if (cellEl.className !== 'open' && !cellEl.className.includes('flag') && cellEl.className !== 'bomb') {
      if (cell.bomb) {
        this.health -= 1;
        this.gameData.setAttribute('curr-health', `${this.health}`);
        console.log(this.health);
        this.lastCell = cellEl.num;

        if (this.health < 0) {
          this.handEvent = `loose;cell_${this.lastCell}`;
          this.gameLose();
        } else {
          this.handEvent = `boom;cell_${this.lastCell}`;
        }

        this.setClass(cellEl, 'bomb');
        cellEl.innerText = '*';

      } else {
        this.setClass(cellEl, 'open');
        this.lastCell = cellEl.num;
        this.handEvent = 'open';

        if (cell.count) {
          this.showCount(cellEl, cell.count);
        } else {
          this.openEmpty(this.lastCell);
        }
      }
    }

    this.getProgress();

    if (this.checkWin()) {
      this.handEvent = 'win';
    }

    // console.log(this.getNearArr(cellEl.num)); // Показывает результат GetNearArr
    // console.log(Math.ceil(this.gameProgress) + '% open'); // Показывает прогресс
    // console.log(this.health + ' health left'); // Показывает "здоровье"
    // console.log('last cell is - ' + this.lastCell); // Показывает последнюю нажатую клетку

    this.gameData.setAttribute('cells-closed', `${Math.ceil(this.gameProgress)}`);
    this.gameData.setAttribute('game-event', `${this.handEvent}`);
    this.handEvent = '';
    this.gameData.setAttribute('curr-health', `${this.health}`);
    this.gameData.onclick();
  };

  rightMouseClick (event) {
    event.preventDefault();

    if (this.isGameOver) {
      return false;
    }

    const cellEl = event.target;
    this.lastCell = cellEl.num;

    if (cellEl.className !== 'open' && cellEl.className !== 'bomb') {
      if (!cellEl.className.includes('flag')) {
        this.setClass(cellEl, `flag${this.girl}`);
      } else {
        this.setClass(cellEl, 'closed');
      }
    }

    this.getProgress();

    if (this.checkWin()) {
      this.handEvent = 'win';
    }

    this.gameData.setAttribute('game-event', `${this.handEvent}`);
    this.gameData.onclick();

    // console.log('last cell is - ' + this.lastCell); // Показывает последнюю нажатую клетку
  };

  bombGenerator (safe) {
    let i = 0;
    while (i < this.bombCount) {
      const rand = Math.floor(Math.random() * ((this.fieldSize + 1) - 1) + 1);

      if (safe.includes(rand)) {
        continue;
      }

      if (!this.field[rand].bomb) {
        this.field[rand] = {
          bomb: true,
        };
        i++;
      }
    }
  };

  calculationOfNumbers () {
    for (let i = 1; i <= this.fieldSize; i++) {
      if (this.field[i].bomb) {
        continue;
      }

      this.field[i].count = this.getNearCells(i)[1]
        .reduce((acc, num) => {
          if (this.field[num].bomb) {
            acc++;
          }
          return acc;
        }, 0);
    }
  };

  getNearCells (num) {
    const result = [];
    if (num % this.fieldLine === 0) {
      result.push(
        num - this.fieldLine,
        'empty',
        'empty',
        'empty',
        num + this.fieldLine,
        num + this.fieldLine - 1,
        num - 1,
        num - this.fieldLine - 1,
      );
    } else if ((num + this.fieldLine - 1) % this.fieldLine === 0) {
      result.push(
        num - this.fieldLine,
        num - this.fieldLine + 1,
        num + 1,
        num + this.fieldLine + 1,
        num + this.fieldLine,
        'empty',
        'empty',
        'empty',
      );
    } else {
      result.push(
        num - this.fieldLine,
        num - this.fieldLine + 1,
        num + 1,
        num + this.fieldLine + 1,
        num + this.fieldLine,
        num + this.fieldLine - 1,
        num - 1,
        num - this.fieldLine - 1,
      );
    }

    const clear = [...result]
      .map((el) => el < 0 || el > this.fieldSize
        ? 'empty'
        : el);

    return [clear, result.filter((num) => num >= 1 && num <= this.fieldSize)];
  };

  getCellById (id) {
    return document.getElementById(`cell_${id}`);
  };

  openEmpty (cellNum) {
    this.field[cellNum].open = true;

    for (const num of this.getNearCells(cellNum)[1]) {

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

  /**
   * Меняет внешний вид ячейки
   * @param {*} cellEl - HTML ячейка
   * @param {string} newClass - Новый класс для ячейки
   */
  setClass (cellEl, newClass) {
    cellEl.className = newClass;
  };

  checkWin () {
    if (this.isGameOver) {
      return false;
    }

    let openCells = 0;

    for (let i = 1; i <= this.fieldSize; i++) {
      const cellEl = this.getCellById(i);
      if (cellEl.className === 'open') {
        openCells++;
      }
    }

    if (openCells === this.fieldSize - this.bombCount) {
      this.gameWin();
      return true;
    }
  };

  gameLose () {
    this.isGameOver = true;
    //alert('Game over! You lose.');

    // for (const cell in this.field) {
    //   const el = document.getElementById(`cell_${cell}`);

    //   if (this.field[cell].bomb) {
    //     this.setClass(el, 'bomb');
    //     el.innerText = '*';
    //   }
    // }
  };

  gameWin () {
    this.isGameOver = true;
    //alert('Game over! Tou win');
  };

  showCount (cell, count) {
    cell.innerHTML = `<div class="number" style="background-image: url('./src/images/interface/game/numbers${this.girl}/${count}.png')"></div><div class="frame" style="background-image: url('./src/images/interface/game/frame${this.girl}.png')"></div>`;
  };

  getProgress () {
    let openCells = 0;

    for (let id = 1; id < this.fieldSize; id++) {
      const cellEl = this.getCellById(id);
      if (cellEl.className === 'open') {
        openCells++;
      }
    }

    this.gameProgress = openCells / (this.fieldSize - this.bombCount) * 100;

    // if (this.gameProgress >= 50 && this.fifty) {
    //   this.fifty = false;
    //   this.health++;
    // }

    // if (this.gameProgress >= 75 && this.seventyFive) {
    //   this.seventyFive = false;
    //   this.health++;
    // }
  };

  formatBgArr (arr) {
    return arr.reverse().map((item) => `url("./src/images/interface/game/${item}.png")`).join(', ');
  };

  /**
   * Устанавливает изображение на фон ячейки
   */
  setCellBg (id) {
    const el = document.getElementById(id);
    if (el.className !== 'open') {
      return;
    }
    const [t, tr, r, br, b, bl, l, tl] = this.getNearArr(Number(id.split('_')[1]));
    const imgArr = ['0'];
    if (t) {
      if (r) {
        if (b) {
          if (l) {
            imgArr.push('t-r-b-l')
            el.style.backgroundImage = this.formatBgArr(imgArr);
            return;
          }
          imgArr.push('t-r-b')
          el.style.backgroundImage = this.formatBgArr(imgArr);
          return;
        }
        if (l) {
          imgArr.push('t-r-l')
          el.style.backgroundImage = this.formatBgArr(imgArr);
          return;
        }
        if (bl) {
          imgArr.push('bl');
        }
        imgArr.push('t-r');
        el.style.backgroundImage = this.formatBgArr(imgArr);
        return;
      }
      if (l) {
        if (b) {
          imgArr.push('t-b-l')
          el.style.backgroundImage = this.formatBgArr(imgArr);
          return;
        }
        if (br) {
          imgArr.push('br');
        }
        imgArr.push('t-l');
        el.style.backgroundImage = this.formatBgArr(imgArr);
        return;
      }
      imgArr.push('t');
      if (b) {
        imgArr.push('b');
        el.style.backgroundImage = this.formatBgArr(imgArr);
        return;
      }
      if (br) {
        imgArr.push('br');
      }
      if (bl) {
        imgArr.push('bl');
      }
      el.style.backgroundImage = this.formatBgArr(imgArr);
      return;
    }
    if (r) {
      if (b) {
        if (l) {
          imgArr.push('r-b-l');
          el.style.backgroundImage = this.formatBgArr(imgArr);
          return;
        }
        if (tl) {
          imgArr.push('tl');
        }
        imgArr.push('b-r');
        el.style.backgroundImage = this.formatBgArr(imgArr);
        return;
      }
      imgArr.push('r');
      if (l) {
        imgArr.push('l');
        el.style.backgroundImage = this.formatBgArr(imgArr);
        return;
      }
      if (tl) {
        imgArr.push('tl');
      }
      if (bl) {
        imgArr.push('bl');
      }
      el.style.backgroundImage = this.formatBgArr(imgArr);
      return;
    }
    if (l) {
      if (b) {
        if (tr) {
          imgArr.push('tr');
        }
        imgArr.push('b-l');
        el.style.backgroundImage = this.formatBgArr(imgArr);
        return;
      }
      imgArr.push('l');
      if (tr) {
        imgArr.push('tr');
      }
      if (br) {
        imgArr.push('br');
      }
      el.style.backgroundImage = this.formatBgArr(imgArr);
      return;
    }
    if (b) {
      imgArr.push('b');
      if (tr) {
        imgArr.push('tr');
      }
      if (tl) {
        imgArr.push('tl');
      }
      el.style.backgroundImage = this.formatBgArr(imgArr);
      return;
    }
    if (tr) {
      imgArr.push('tr');
    }
    if (tl) {
      imgArr.push('tl');
    }
    if (br) {
      imgArr.push('br');
    }
    if (bl) {
      imgArr.push('bl');
    }
    el.style.backgroundImage = this.formatBgArr(imgArr);
    return;
  };

  /**
   * @param {number} id - id клетки
   * @returns {*[]} - Массив соседних клеток.
   * Они расположены по часовой стрелке, начиная с верхней посередине.
   * -----------
   * 8, 1, 2,
   * 7, X, 3,
   * 6, 5, 4
   */
  getNearArr (id) {
    const flat = [];

    for (const num of this.getNearCells(id)[0]) {

      if (num === 'empty' || num === 0 || this.getCellById(num).className !== 'open') {
        flat.push(1);
      } else {
        flat.push(0);
      }
    }

    return flat;
  };

  /**
   * Динамически обновляет вид открытых ячеек
   */
  updateCellBg () {
    const requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
    const updateBg = () => {
      for (let i = 1; i <= this.fieldSize; i += 1) {
        this.setCellBg(`cell_${i}`);
      }
      if (getComputedStyle(document.getElementById('date-screen')).visibility === 'visible')
      requestAnimationFrame(updateBg);
    };
    updateBg();
  };

  /**
   * Показывает бомбы
   */
  showBombs () {
    for (let i = 1; i <= this.fieldSize; i++) {
      const cellEl = document.getElementById(`cell_${i}`);
  
      if (this.field[i].bomb) {
        cellEl.innerText = '*';
      }
    }
  };
}

const startSapper = () => {
  const sapper = new Sapper(15, 36);
  sapper.init();
  sapper.updateCellBg();
};
