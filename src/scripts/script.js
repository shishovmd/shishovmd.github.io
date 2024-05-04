const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

var fileLines = [];
var currScene = '';
var currLine = 0;

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

const flags = Array(5).fill(false);
const isAllAnimationsEnded = () => !flags.reduce((acc, flag) => flag || acc);

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
const isVisible = (id) => {
  const elem = document.getElementById(id);
  return window.getComputedStyle().visibility === 'visible';
};

const setParam = (id, param, value) => {
  const elem= document.getElementById(id);
  elem.style[param] = `${value}`;
};
const setInnerHTML = (id, text) => {
  const elem= document.getElementById(id);
  elem.innerHTML = text;
};

const animateParamChange = (id, param, i, units = '', start = 0, end = 1, speed = 0.2, runAfter = () => {}) => {
  flags[i] = true;
  const elem = document.getElementById(id);
  elem.style[param] = `${start}${units}`;

  const step = (end - start) * speed;
  const trustEnd = [end - step, end + step].sort((a, b) => a - b);
  let curr = start;

  const animation = () => {
    if (curr > trustEnd[0] && curr < trustEnd[1]) {
      elem.style[param] = `${end}${units}`;
      runAfter();
      flags[i] = false;
      return;
    }
    curr += step;
    elem.style[param] = `${curr}${units}`;
    requestAnimationFrame(animation);
  }
  animation();
};

const animateParamJump = (id, param, i, units = '', start = 0, range = 1, speed = 0.2, runAfter = () => {}) => {
  animateParamChange(id, param, i, units, start, start + range, speed, () => {
    animateParamChange(id, param, i, units, start + range, start, speed, runAfter());
  });
};

const animateLoopParamChange = (id, param, units = '', start = 0, range = 2, speed = 0.2) => {
  const elem = document.getElementById(id);
  const step = range * speed;
  let currPos = 0;
  let currStep = step;

  const animation = () => {
    if (currPos > range) currStep = -step;
    if (currPos < -range) currStep = step;
    currPos += currStep;
    elem.style[param] = `${start + currPos}${units}`;
    requestAnimationFrame(animation);
  }
  animation();
};

const animateTextIn = (id, text, i, step = 0.4, runAfter = () => {}) => {
  flags[i] = true;
  hideElem('nv-arrow');
  textSkip = false;
  setParam('nv-text-skip', 'zIndex', 1200);
  const elem = document.getElementById(id);

  let currPos = 0;
  let textPos = 0;

  const animation = () => {
    if(textSkip || currPos >= text.length) {
      textSkip = false;
      setParam('nv-text-skip', 'zIndex', 0);
      elem.innerHTML = text;
      runAfter();
      flags[i] = false;
      return;
    }
    currPos += step;
    textPos = Math.floor(currPos);
    elem.innerHTML = text.slice(0, textPos) + `<span class="hidden-text">${text.slice(textPos)}</span>`;
    requestAnimationFrame(animation);
  };
  animation();
};

const setBubble = (type) => {};

const drawScene01 = (longType, bg, chars, bubble, text) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const char1 = chars.split(';')[0];
  const char2 = chars.split(';')[1] ?? '';

  if (bg.startsWith('#')) {
    setParam('novel-screen', 'backgroundColor', bg);
  } else {
    setParam('novel-screen', 'backgroundImage', `url("./src/images/backgrounds/${bg}.png")`);
  }

  animateParamChange('nv-bubble', 'opacity', 1, '', 1, 0, 0.1);

  if(type === '0' || type === '3') {
    if(type === '0') {
      setParam('nv-char0', 'zIndex', 600);
    } else {
      setParam('nv-char0', 'zIndex', 500);
    }
    hideElem('nv-char1');
    hideElem('nv-char2');
    setParam('nv-char0', 'backgroundImage', `url("./src/images/characters/${char1.slice(0, 3)}/${char1.slice(3)}.png")`);
    showElem('nv-char0');
    animateParamJump('nv-char0', 'top', 2, 'px', 0, -10);
  } else if(type === '1' || type === '2' || type === '4') {
    if(type === '1') {
      setParam('nv-char1', 'zIndex', 600);
      animateParamJump('nv-char1', 'top', 2, 'px', 0, -10);
      setParam('nv-char2', 'zIndex', 500);
    } else if(type === '2') {
      setParam('nv-char1', 'zIndex', 500);
      setParam('nv-char2', 'zIndex', 600);
      animateParamJump('nv-char2', 'top', 2, 'px', 0, -10);
    } else {
      setParam('nv-char1', 'zIndex', 500);
      setParam('nv-char2', 'zIndex', 500);
    }
    hideElem('nv-char0');
    setParam('nv-char1', 'backgroundImage', `url("./src/images/characters/${char1.slice(0, 3)}/${char1.slice(3)}.png")`);
    setParam('nv-char2', 'backgroundImage', `url("./src/images/characters/${char2.slice(0, 3)}/${char2.slice(3)}.png")`);
    showElem('nv-char1');
    showElem('nv-char2');
  }

  if(bubble === '') {
    hideElem('nv-blackout');
    hideElem('nv-bubble');
  } else {
    showElem('nv-blackout');
    hideElem('nv-bubble');
    hideElem('nv-arrow');
    setBubble(bubble);
    setInnerHTML('nv-text', '');
    animateParamChange('nv-bubble', 'opacity', 3, '', 0, 1, 0.1);
    showElem('nv-bubble');
    animateTextIn('nv-text', text.toUpperCase(), 4, 0.4, () => {
      animateParamChange('nv-arrow', 'opacity', 5);
      showElem('nv-arrow');
    });
  }
  flags[0] = false;
};

const drawScene = (scene) => {
  setParam('nv-no-clicks', 'zIndex', 1100);
  const type = scene.split('_')[1]

  switch (type.split('-')[0]) {
    case '01':
      drawScene01(...scene.split('_').slice(1));
      break;
    default:
      console.log('Error!')
  }

  const wait = () => {
    if (isAllAnimationsEnded()) {
      setParam('nv-no-clicks', 'zIndex', 0);
      return;
    }
    requestAnimationFrame(wait);
  };
  wait();
};

const loop = () => {
  if (drawNext) {
    drawNext = false;
    setParam('nv-no-clicks', 'zIndex', 1100);
    getNextScene(() => {
      drawScene(currScene);
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
  animateLoopParamChange('nv-arrow', 'bottom', 'px', startPos, 2);
};
window.onload = animateArrow;