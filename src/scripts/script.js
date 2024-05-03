const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

let fileLines = [];
let prevScene = '';
let currScene = '';
let nextScene = '';
let currLine = 0;

const readFile = (name, runAfter = () => {}) => {
  fileReaded = false;
  fetch(`./src/scenes/${name}.txt`)
  .then(response => response.text())
  .then(text => { 
    fileLines = text.split('\n').map((line) => line.trim());
    runAfter();
  });
};

const getNextScene = (runAfter = () => {}) => {
  const nextScenePath = currScene.split('_')[0];
  if (nextScenePath === '') {
    currLine += 1;
    currScene = fileLines[currLine];
    runAfter();
    return;
  }
  if (nextScenePath.includes(';')) {
    readFile(nextScenePath.split(';')[0], () => {
      currLine = Number(nextScenePath.split(';')[1]);
      currScene = fileLines[currLine];
      runAfter();
    });
    return;
  }
  currLine = Number(nextScenePath);
  currScene = fileLines[currLine];
  runAfter();
};

let flag1 = false;
let flag2 = false;
let flag3 = false;
const isAllAnimationsEnded = () => !(flag1 || flag2 || flag3);

let textSkip = false;
const skipTextAnimation = () => {
  textSkip = true;
};

let drawNext = false;
const drawNextScene = () => {
  drawNext = true;
};



const showElem = (id) => {
  const elem = document.getElementById(id);
  elem.style.visibility = 'visible';
};
const hideElem = (id) => {
  const elem = document.getElementById(id);
  elem.style.visibility = 'hidden';
};

const setBgImg = (id, imgPath) =>{
  const elem = document.getElementById(id);
  elem.style.backgroundImage = `url("${imgPath}")`;
};
const setBgColor = (id, color) =>{
  const elem = document.getElementById(id);
  elem.style.backgroundColor= color;
};

const setZIndex = (id, zIndex) => {
  const elem= document.getElementById(id);
  elem.style.zIndex = `${zIndex}`;
};

const animateParamChange = (id, param, flag, start = 0, end = 1, speed = 0.2) => {
  flag = true;
  const elem = document.getElementById(id);
  elem.style[param] = `${start}`;

  const step = (end - start) * speed;
  const trustEnd = [end - step, end + step].sort((a, b) => a - b);
  let curr = start;

  const animation = () => {
    if (curr > trustEnd[0] && curr < trustEnd[1]) {
      elem.style[param] = `${end}`;
      flag = false;
      return;
    }
    curr += step;
    elem.style[param] = `${curr}`;
    requestAnimationFrame(animation);
  }
  animation();
};

const animateLoopParamChange = (id, param, start = 0, range = 2, speed = 0.2) => {
  const elem = document.getElementById(id);
  const step = range * speed;
  let currPos = 0;
  let currStep = step;

  const animation = () => {
    if (currPos > range) currStep = -step;
    if (currPos < -range) currStep = step;
    currPos += currStep;
    elem.style[param] = `${start + currPos}px`;
    requestAnimationFrame(animation);
  }
  animation();
};

const animateTextIn = (id, text, flag, step = 0.4) => {
  flag = true;
  hideElem('nv-arrow');
  textSkip = false;
  setZIndex('nv-text-skip', 1200);
  const elem = document.getElementById(id);

  let currPos = 0;
  let textPos = 0;

  const animation = () => {
    if(textSkip || currPos >= text.length) {
      textSkip = false;
      setZIndex('nv-text-skip', 0);
      elem.innerHTML = text;
      flag = false;
      animateParamChange('nv-arrow', 'opacity', flag)
      showElem('nv-arrow');
      return;
    }
    currPos += step;
    textPos = Math.floor(currPos);
    elem.innerHTML = text.slice(0, textPos) + `<span class="hidden-text">${text.slice(textPos)}</span>`;
    requestAnimationFrame(animation);
  };
  animation();
};

const arr = [
  'пример текста 1',
  'второй пример текста',
  'пример текста номер три',
].map((str) => str.toUpperCase());
let currI = 0;

const setBubble = (type) => {};

const drawScene01 = (type, bg, chars, bubble, text) => {
  const char1 = chars.split(';')[0];
  const char2 = chars.split(';')[1] ?? '';

  if (bg.startsWith('#')) {
    setBgColor('novel-screen', bg);
  } else {
    setBgImg('novel-screen', `./src/images/backgrounds/${bg}.png`);
  }

  if(type[2] === '0' || type[2] === '3') {
    if(type[2] === '0') {
      setZIndex('nv-char0', 600);
    } else {
      setZIndex('nv-char0', 500);
    }
    hideElem('nv-char1');
    hideElem('nv-char2');
    setBgImg('nv-char0', `./src/images/characters/${char1.slice(0, 3)}/${char1.slice(3)}.png`);
    showElem('nv-char0');
  } else if(type[2] === '1' || type[2] === '2' || type[2] === '4') {
    if(type[2] === '1') {
      setZIndex('nv-char1', 600);
      setZIndex('nv-char2', 500);
    } else if(type[2] === '2') {
      setZIndex('nv-char1', 500);
      setZIndex('nv-char2', 600);
    } else {
      setZIndex('nv-char1', 500);
      setZIndex('nv-char2', 500);
    }
    hideElem('nv-char0');
    setBgImg('nv-char1', `./src/images/characters/${char1.slice(0, 3)}/${char1.slice(3)}.png`);
    setBgImg('nv-char2', `./src/images/characters/${char2.slice(0, 3)}/${char2.slice(3)}.png`);
    showElem('nv-char1');
    showElem('nv-char2');
  }

  if(bubble === '') {
    hideElem('nv-blackout');
    hideElem('nv-bubble');
  } else {
    showElem('nv-blackout');
    setBubble(bubble);
    animateTextIn('nv-text', text, flag1);
    showElem('nv-bubble');
  }
};

const drawScene = (text) => {
  setZIndex('nv-no-clicks', 1100);
  drawScene01('012', '#A0B0CA', '001002;002001', '000', text);
  const wait = () => {
    if (isAllAnimationsEnded) {
      setZIndex('nv-no-clicks', 0);
      return;
    }
    requestAnimationFrame(wait);
  };
  wait();
};

const loop = () => {
  if (drawNext) {
    drawNext = false;
    getNextScene(() => {
      drawScene(currScene.split('_')[5].toUpperCase());
    });
  }
  requestAnimationFrame(loop);
};

const startDemonstration = () => {
  

  const startScreen = document.getElementById('start-screen');
  startScreen.style.display = 'none';
  readFile('001', () => { 
    currScene = fileLines[currLine];
    drawNext = true;
    loop(); 
  });

   
}



const animateArrow = () => {
  const arrow = document.getElementById('nv-arrow');
  const startPos = Number(window.getComputedStyle(arrow).bottom.slice(0, -2));
  animateLoopParamChange('nv-arrow', 'bottom', startPos, 2);
};
window.onload = animateArrow;