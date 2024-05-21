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
    lastCell; // Последняя открытая ячейка
    firsClick = true;
  
    constructor (fieldLine, bombCount) {
      this.fieldLine = fieldLine;
      this.fieldSize = fieldLine ** 2;
      this.bombCount = bombCount;
    };
  
    init () {
  
      this.mainGridEl.style.gridTemplateColumns = `repeat(${this.fieldLine}, 25px)`;
      this.mainGridEl.style.gridTemplateRows = `repeat(${this.fieldLine}, 25px)`;
  
      this.mainGridEl.innerHTMLn = '';
  
      for (let i = 0; i < this.fieldSize; i++) {
        const divEl = document.createElement('div');
  
        divEl.className = 'closed';
        divEl.id = `cell_${i + 1}`;
        divEl.num = i + 1;
  
        divEl.addEventListener('click', (event) => this.lmc(event));
        divEl.addEventListener('contextmenu', (event) => this.rmc(event));
  
        this.mainGridEl.appendChild(divEl);
      }
  
      for (let i = 1; i <= this.fieldSize; i++) {
        this.field[i] = {};
      }
    };
  
    lmc (event) {
  
      if (this.isGameOver) {
        return false;
      }
  
      const cellEl = event.target;
      const cell = this.field[cellEl.num];
  
      if (this.firsClick) {
        const safe = this.getNearCells(cellEl.num);
        safe.push(cellEl.num);
  
        this.bombGenerator(safe);
        this.calculationOfNumbers();
        this.showBombs();
  
        this.firsClick = false;
      }
  
      if (cellEl.className !== 'open' && cellEl.className !== 'flag') {
        if (cell.bomb) {
          this.health -= 1;
  
          this.lastCell = cellEl.num; // in progress
  
          if (this.health < 0) {
            this.handEvent = `loose;cell${this.lastCell}`;
            this.gameLose();
          } else {
            this.handEvent = `boom;cell${this.lastCell}`;
          }
  
          this.setClass(cellEl, 'bomb');
          cellEl.innerText = '*';
  
        } else {
          this.setClass(cellEl, 'open');
  
          this.lastCell = cellEl.num; // in progress
  
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
  
      console.log(Math.ceil(this.gameProgress) + '% open'); // Показывает прогресс
      console.log(this.health + ' health left'); // Показывает "здоровье"
      console.log('last cell is - ' + this.lastCell); // Показывает последнюю тыкнутую клетку
  
      this.gameData.setAttribute('cells-closed', `${Math.ceil(this.gameProgress)}`);
      this.gameData.setAttribute('event', `${this.handEvent}`);
      this.gameData.setAttribute('curr-health', `${this.health}`);
      // this.gameData.onclick();
    };
  
    rmc (event) {
      event.preventDefault();
  
      if (this.isGameOver) {
        return false;
      }
  
      const cellEl = event.target;
  
      this.lastCell = cellEl.num; // in progress
  
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
  
      this.gameData.setAttribute('event', `${this.handEvent}`);
  
      console.log('last cell is - ' + this.lastCell); // Показывает последнюю тыкнутую клетку
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
        let count = 0;
        for (const num of this.getNearCells(i)) {
          if (this.field[num].bomb) {
            count++;
          }
        }
  
        this.field[i].count = count;
      }
    };
  
    getNearCells (num) {
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
  
    getCellById (id) {
      return document.getElementById(`cell_${id}`);
    };
  
    openEmpty (cellNum) {
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
  
    /**
     * Меняет внешний вид ячейки
     * @param {*} cellEl - HTML ячейка
     * @param {string} newClass - Новый класс для ячейки
     */
    setClass (cellEl, newClass) {
      cellEl.className = newClass;
      if (newClass === 'open') {
        const currId = cellEl.id;
        this.setCellBg(currId);
      }
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
      alert('Game over! You lose.');
      for (const cell in this.field) {
        const el = document.getElementById(`cell_${cell}`);
        if (this.field[cell].bomb) {
          this.setClass(el, 'bomb');
          el.innerText = '*';
        }
      }
    };
  
    gameWin () {
      this.isGameOver = true;
      alert('Game over! Tou win');
    };
  
    showCount (cell, count) {
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
  
    getProgress () {
      let openCells = 0;
      for (let id = 1; id < this.fieldSize; id++) {
        const cellEl = this.getCellById(id);
        if (cellEl.className === 'flag' || cellEl.className === 'open') {
          openCells++;
        }
      }
      this.gameProgress = openCells / (this.fieldSize - this.bombCount) * 100;
  
      if (this.gameProgress >= 50 && this.fifty) {
        this.health++;
        this.fifty = false;
      }
      if (this.gameProgress >= 75 && this.seventyFive) {
        this.health++;
        this.seventyFive = false;
      }
    };
  
    setCellBg (id) {
        console.log(id);
        const arr = this.getNearArr(id);
        const el = document.getElementById(id);
        //el.style.backgroundImage = 'url("../images/interface/game/t-r-b-l.png")';
        console.log(arr[2]);
    };
  
    getNearArr (id) {
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
  const sapper = new Sapper(12, 25);
  sapper.init();
};