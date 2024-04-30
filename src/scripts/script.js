const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const animFlags = Array(5).fill(false);
const isAllAnimationsEnded = () => !animFlags.reduce((acc, flag) => (acc || flag), false);

let clickWhileAnimation = false;

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

const drawScene = (text) => {
  animFlags.forEach((_flag, i) => animFlags[i] = false);
  clickWhileAnimation = false;
  skipAnimationOn();

  animateTextIn('nv-text', text, 0);

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
