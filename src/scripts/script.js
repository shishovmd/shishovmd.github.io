const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const blockScreen = () => { 
  const el = document.getElementById('nv-click-protection');
  el.style.zIndex = '1100';
}
const freeScreen = () => {
  const el = document.getElementById('nv-click-protection');
  el.style.zIndex = '900';
}

const show = (id) => {
  const el = document.getElementById(id);
  el.style.opacity = '0';

  let opacity = 0;
  const step = 0.1;

  const animation = () => {
    opacity += step;
    el.style.opacity = `${opacity}`;
    if (opacity < 1) requestAnimationFrame(animation);
    if (opacity >= 1) freeScreen();
  }
  animation();
};
const hide = (id) => {
  const el = document.getElementById(id);
  el.style.opacity = '1';

  let opacity = 0;
  const step = -0.1;

  const animation = () => {
    opacity += step;
    el.style.opacity = `${opacity}`;
    if (opacity > 0) requestAnimationFrame(animation);
  }
  animation();
};

const animateArrow = () => {
  let arrowPos = 0;
  let arrowStep = 0.5;

  const arrow = document.getElementById('nv-arrow');
  const arrowStartPos = Number(window.getComputedStyle(arrow).bottom.slice(0, -2));

  const arrowAnimation = () => {
    if (arrowPos > 2) arrowStep = -0.5;
    if (arrowPos < -2) arrowStep = 0.5;
    arrowPos += arrowStep;
    arrow.style.bottom = `${arrowPos + arrowStartPos}px`;
    requestAnimationFrame(arrowAnimation);
  }
  arrowAnimation();
}
const showArrow = () => {
  show('nv-arrow');
  const arrow = document.getElementById('nv-arrow');
  arrow.style.display = 'flex';
}
const hideArrow = () => {
  const arrow = document.getElementById('nv-arrow');
  arrow.style.display = 'none';
}

const showText = (text) => {
  hideArrow();

  let currPos = 0;
  let step = 0.4;
  let textPos = 0;

  const textEl = document.getElementById('nv-text');

  const textAnimation = () => {
    currPos += step;
    textPos = Math.floor(currPos);
    textEl.innerHTML = text.slice(0, textPos) + `<span id="hidden-text">${text.slice(textPos)}</span>`;
    if(currPos <= text.length) {
      requestAnimationFrame(textAnimation);
    }
    if(currPos >= text.length) {
      showArrow();
    }
  };
  textAnimation();
};

const changeBubble1 = () => {
  const el = document.getElementById('nv-bubble');
  el.style.justifyContent = 'start';
  el.style.height = '300px';
  el.style.width = '200px';
}

const changeBubble2 = () => {
  const el = document.getElementById('nv-bubble');
  el.style.justifyContent = 'end';
  el.style.height = '200px';
  el.style.width = '200px';
}

const changeBubble3 = () => {
  const el = document.getElementById('nv-bubble');
  el.style.justifyContent = 'start';
  el.style.height = '200px';
  el.style.width = '300px';
}



const arr = [
  'пример текста 1',
  'второй пример текста',
  'пример текста номер три',
].map((str) => str.toUpperCase());
let currI = 0;

const drawScene = (text) => {
  blockScreen();
  if(currI === 0) changeBubble1();
  if(currI === 1) changeBubble2();
  if(currI === 2) changeBubble3();
  showText(text);
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
  animateArrow();

  const startScreen = document.getElementById('start-screen');
  startScreen.style.display = 'none';

  showScene();  
}
