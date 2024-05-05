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

const flags = Array(6).fill(false);
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
  const elem = document.getElementById(id);
  elem.style[param] = `${value}`;
};
const getParamValue = (id, param) => {
  const elem = document.getElementById(id);
  return window.getComputedStyle(elem)[param];
};
const setInnerHTML = (id, text) => {
  const elem= document.getElementById(id);
  elem.innerHTML = text;
};
const setChar = (id, char) => {
  const elem = document.getElementById(id);
  const [dir, emot] = char.split('-');
  elem.style.backgroundImage = `url("./src/images/characters/${dir}/${emot}.png")`;
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

const drawScene00 = (longType, bg) => {
  if (bg.startsWith('#')) {
    setParam('novel-screen', 'backgroundColor', bg);
    setParam('novel-screen', 'backgroundImage', 'none');
  } else {
    setParam('novel-screen', 'backgroundImage', `url("./src/images/backgrounds/${bg}.png")`);
    setParam('novel-screen', 'backgroundColor', 'transparent');
  }
  drawNext = true;
};

const drawScene01 = (longType, chars, bubble, text) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');
  let charToJump = 'hidden-elem';

  if (char2 === '') {
    hideElem('nv-char1');
    hideElem('nv-char2');
    setChar('nv-char0', char1);
    showElem('nv-char0');
  } else {
    hideElem('nv-char0');
    setChar('nv-char1', char1);
    setChar('nv-char2', char2);
    showElem('nv-char1');
    showElem('nv-char2');
  }
  
  if(type === '0' || type === '1' || type === '2') {
    if (type === '0') {
      charToJump = 'nv-char0';
      setParam('nv-char0', 'zIndex', 600);
    } else {
      if(type === '1') {
        charToJump = 'nv-char1';
        setParam('nv-char1', 'zIndex', 600);
        setParam('nv-char2', 'zIndex', 500);
      } else if(type === '2') {
        charToJump = 'nv-char2';
        setParam('nv-char1', 'zIndex', 500);
        setParam('nv-char2', 'zIndex', 600);
      }
    }
  } else if(type === '3') {
    setParam('nv-char0', 'zIndex', 500);
    setParam('nv-char1', 'zIndex', 500);
    setParam('nv-char2', 'zIndex', 500);
  }

  if(bubble === '') {
    hideElem('nv-blackout');
    drawNext = true;
    flags[0] = false; 
  } else {
    if(char1 === '000-000') {
      hideElem('nv-blackout');
    } else {
      showElem('nv-blackout');
    }
    setBubble(bubble);
    setInnerHTML('nv-text', '');
    animateParamJump(charToJump, 'top', 1, 'px', 0, -10, 0.15, () => {
      animateParamChange('nv-bubble', 'opacity', 2, '', 0, 1, 0.1);
      showElem('nv-bubble');
      animateTextIn('nv-text', text.toUpperCase(), 3, 0.4, () => {
        animateParamChange('nv-arrow', 'opacity', 4);
        showElem('nv-arrow');
        flags[0] = false;
      });
    });
  }
};

const drawScene02 = (longType, blackout) => {
  flags[0] = true;
  const type = longType.split('-')[1];

  if (blackout.startsWith('#')) {
    setParam('nv-effects', 'backgroundColor', blackout);
    setParam('nv-effects', 'backgroundImage', 'none');
  } else {
    setParam('nv-effects', 'backgroundImage', `url("./src/images/backgrounds/${blackout}.png")`);
    setParam('nv-effects', 'backgroundColor', 'transparent');
  }

  if (type === '0') {
    setParam('nv-effects', 'opacity', '0');
    showElem('nv-effects');
    animateParamChange('nv-effects', 'opacity', 1, '', 0, 1, 0.03, () => {
      drawNext = true;
      flags[0] = false;
    });
  } else if (type === '1') {
    animateParamChange('nv-effects', 'opacity', 1, '', 1, 0, 0.03, () => {
      drawNext = true;
      flags[0] = false;
      setParam('nv-effects', 'opacity', '0');
      hideElem('nv-effects');
    });
  } 
};

const drawScene03 = (longType, chars) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');

  hideElem('nv-blackout');

  if (type === '0') {
    hideElem('nv-char0');
    hideElem('nv-char1');
    hideElem('nv-char2');
  }
  if (char2 === '') {
    setChar('nv-char0', char1);
  } else {
    setChar('nv-char1', char1);
    setChar('nv-char2', char2);
  }

  if (type === '0') {
    if (char2 === '') {
      setParam('nv-char0', 'opacity', '0');
      showElem('nv-char0');
      animateParamChange('nv-char0', 'opacity', 1, '', 0, 1, 0.05, () => {
        drawNext = true;
        flags[0] = false;
      });
    } else {
      setParam('nv-char1', 'opacity', '0');
      setParam('nv-char2', 'opacity', '0');
      showElem('nv-char1');
      showElem('nv-char2');
      animateParamChange('nv-char1', 'opacity', 1, '', 0, 1, 0.05);
      animateParamChange('nv-char2', 'opacity', 2, '', 0, 1, 0.05, () => {
        drawNext = true;
        flags[0] = false;
      });
    }
  } else {
    if (char2 === '') {
      setParam('nv-char0', 'opacity', '1');
      showElem('nv-char0');
      animateParamChange('nv-char0', 'opacity', 1, '', 1, 0, 0.05, () => {
        hideElem('nv-char0');
        setParam('nv-char0', 'opacity', '1');
        drawNext = true;
        flags[0] = false;
      });
    } else {
      setParam('nv-char1', 'opacity', '0');
      setParam('nv-char2', 'opacity', '0');
      showElem('nv-char1');
      showElem('nv-char2');
      animateParamChange('nv-char1', 'opacity', 1, '', 1, 0, 0.05, () => {
        hideElem('nv-char1');
        setParam('nv-char1', 'opacity', '1');
      });
      animateParamChange('nv-char2', 'opacity', 2, '', 1, 0, 0.05, () => {
        hideElem('nv-char2');
        setParam('nv-char2', 'opacity', '1');
        drawNext = true;
        flags[0] = false;
      });
    }
  }
};

const drawScene04 = (longType, chars) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');

  hideElem('nv-blackout');
  hideElem('nv-char1');
  hideElem('nv-char2');
  setChar('nv-char1', char1);
  setChar('nv-char2', char2);

  const goesToChar = type === '0' ? 'nv-char2' : 'nv-char1';
  const comesInChar = type === '0' ? 'nv-char1' : 'nv-char2';
  const start = Number(getParamValue('nv-char0', 'left').replace('px', ''));
  const end = Number(getParamValue((type === '0' ? 'nv-char2' : 'nv-char1'), 'left').replace('px', ''));
  setChar('nv-char0', (type === '0' ? char2 : char1));
  showElem('nv-char0');
  animateParamChange('nv-char0', 'left', 1, 'px', start, end, 0.05, () => {
    showElem(goesToChar);
    hideElem('nv-char0');
    setParam('nv-char0', 'left', `${start}px`);
    setParam(comesInChar, 'opacity', '0');
    showElem(comesInChar);
    animateParamChange(comesInChar, 'opacity', 2, '', 0, 1, 0.05, () => {
      drawNext = true;
      flags[0] = false;
    });
  });
};

const drawScene05 = (longType, chars) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');

  hideElem('nv-blackout');
  setChar('nv-char1', char1);
  setChar('nv-char2', char2);
  showElem('nv-char1');
  showElem('nv-char2');

  const goesOutChar = type === '0' ? 'nv-char1' : 'nv-char2';
  const movesChar = type === '0' ? 'nv-char2' : 'nv-char1';
  const start = Number(getParamValue((type === '0' ? 'nv-char2' : 'nv-char1'), 'left').replace('px', ''));
  const end = Number(getParamValue('nv-char0', 'left').replace('px', ''));
  hideElem('nv-char0');
  setChar('nv-char0', (type === '0' ? char2 : char1));
  animateParamChange(goesOutChar, 'opacity', 1, '', 1, 0, 0.05, () => {
    hideElem(goesOutChar);
    setParam(goesOutChar, 'opacity', '1');
    animateParamChange(movesChar, 'left', 1, 'px', start, end, 0.05, () => {
      showElem('nv-char0');
      hideElem(movesChar);
      setParam(movesChar, 'left', `${start}px`);
      drawNext = true;
      flags[0] = false;
    });
  });
};

const drawScene = (scene) => {
  setParam('nv-no-clicks', 'zIndex', 1100);
  const type = scene.split('_')[1]

  animateParamChange('nv-bubble', 'opacity', 1, '', 1, 0, 0.1, () => {
    hideElem('nv-bubble');
    hideElem('nv-arrow');
    switch (type.split('-')[0]) {
      case '00':
        drawScene00(...scene.split('_').slice(1));
        break;
      case '01':
        drawScene01(...scene.split('_').slice(1));
        break;
      case '02':
        drawScene02(...scene.split('_').slice(1));
        break;
      case '03':
        drawScene03(...scene.split('_').slice(1));
        break;
      case '04':
        drawScene04(...scene.split('_').slice(1));
        break;
      case '05':
        drawScene05(...scene.split('_').slice(1));
        break;
      default:
        console.log('Error!')
    }
  });

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
  setZoom();
  if (drawNext) {
    drawNext = false;
    setParam('nv-no-clicks', 'zIndex', 1100);
    getNextScene(() => {
      drawScene(currScene);
    });
  }
  requestAnimationFrame(loop);
};

const setZoom = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const zoom = Math.min((width / 800), (height/450));
  setParam('screen', 'zoom', zoom.toFixed(2));
};

const animateArrow = () => {
  const arrow = document.getElementById('nv-arrow');
  const startPos = Number(window.getComputedStyle(arrow).bottom.slice(0, -2));
  animateLoopParamChange('nv-arrow', 'bottom', 'px', startPos, 2);
};

const startDemonstration = () => {
  setZoom();
  animateArrow();
  const startScreen = document.getElementById('start-screen');
  hideElem('nv-bubble');
  readFile('001', () => { 
    currScene = fileLines[currLine];
    drawNext = true;
    loop();
    hideElem('start-screen');
    startScreen.style.zIndex = '-10';
  });
}


window.onload = startDemonstration;