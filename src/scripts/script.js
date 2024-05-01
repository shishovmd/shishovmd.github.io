const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const animFlags = Array(5).fill(false);
const isAllAnimationsEnded = () => !animFlags.reduce((acc, flag) => (acc || flag), false);

let clickWhileAnimation = false;

let prevScene = '';
let currScene = '';
let nextScene = '';

const fs = require('fs');
fs.readFile('./src/scenes/001.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
// const readFile = (file) => {
//   fetch(`./src/scenes/${file}.txt`)
//   .then(response => response.text())
//   .then(text => console.log(text))
// }
// readFile('001')
const skipAnimationOn = () => {
  const elem = document.getElementById('nv-skip-animation');
  elem.style.zIndex = '1100';
};
const skipAnimationOff = () => {
  const elem = document.getElementById('nv-skip-animation');
  elem.style.zIndex = '900';
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
  elem.style.backgroundColor= 'transparent';
};
const setBgColor = (id, color) =>{
  const elem = document.getElementById(id);
  elem.style.backgroundColor= color;
  elem.style.backgroundImage = 'none';
};

const setZIndex = (id, zIndex) => {
  const elem= document.getElementById(id);
  elem.style.zIndex = `${zIndex}`;
};

const skipAnimation = () => {
  if (!isAllAnimationsEnded()) {
    clickWhileAnimation = true;
  }
};

const animateParamChange = (id, param, i, start = 0, end = 1, speed = 0.2) => {
  animFlags[i] = true;
  const elem = document.getElementById(id);
  elem.style[param] = `${start}`;

  const step = (end - start) * speed;
  const trustEnd = [end - step, end + step].sort((a, b) => a - b);
  let curr = start;

  const animation = () => {
    if (clickWhileAnimation ||
      (curr > trustEnd[0] && curr < trustEnd[1])) {
      elem.style[param] = `${end}`;
      animFlags[i] = false;
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

const animateTextIn = (id, text, i, step = 0.4) => {
  animFlags[i] = true;
  hideElem('nv-arrow');
  const elem = document.getElementById(id);

  let currPos = 0;
  let textPos = 0;

  const animation = () => {
    if(clickWhileAnimation ||
      currPos >= text.length) {
      elem.innerHTML = text;
      animFlags[i] = false;
      animateParamChange('nv-arrow', 'opacity', i)
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
    animateTextIn('nv-text', text, 0);
    showElem('nv-bubble');
  }
};

const drawScene = (text) => {
  animFlags.forEach((_flag, i) => animFlags[i] = false);
  clickWhileAnimation = false;
  skipAnimationOn();

  drawScene01('012', '#A0B0CA', '001002;002001', '000', text);

  const offSkipAnimationAfterAllEnded = () =>{
    if (isAllAnimationsEnded()) {
      skipAnimationOff();
      clickWhileAnimation = false;
      return;
    }
    requestAnimationFrame(offSkipAnimationAfterAllEnded);
  }
  offSkipAnimationAfterAllEnded();

};

const showScene = () => {
  if (currI >= arr.length) {
    const startScreen = document.getElementById('start-screen');
    startScreen.innerHTML = 'ПЕРЕЗАГРУЗИТЕ, ЧТОБЫ ПОПРБОВАТЬ ЗАНОВО';
    startScreen.style.display = 'flex';
  }
  drawScene(arr[currI]);
  currI += 1;
}

const startDemonstration = () => {
  

  const startScreen = document.getElementById('start-screen');
  startScreen.style.display = 'none';

  showScene();  
}

const animateArrow = () => {
  const arrow = document.getElementById('nv-arrow');
  const startPos = Number(window. getComputedStyle(arrow).bottom.slice(0, -2));
  animateLoopParamChange('nv-arrow', 'bottom', startPos, 2);
};
window.onload = animateArrow;
