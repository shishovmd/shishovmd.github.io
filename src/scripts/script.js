const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const findFirstIndex = (subStr, arr) => {
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i][0] === subStr) {
      return i;
    }
  }
};

let fileLines = [];
let currScene = [];
let currLine = 0;
let customNextScenePath = '';

const readFile = (name, runAfter = () => {}) => {
  fileReaded = false;
  fetch(`./src/scenes/${name}.txt`)
  .then(response => response.text())
  .then(text => { 
    fileLines = text.split('\n').map((line) => line.split('_').map((item) => item.trim()));
    runAfter();
  });
};

const getNextScene = (runAfter = () => {}) => {
  let nextScenePath;
  if (customNextScenePath !== '') {
    nextScenePath = customNextScenePath;
    customNextScenePath = '';
  } else {
    nextScenePath = currScene[1];
  }

  if (nextScenePath === '') {
    currLine += 1;
    currScene = fileLines[currLine];
    runAfter();
    return;
  }
  if (nextScenePath.includes(';')) {
    readFile(nextScenePath.split(';')[0], () => {
      currLine = findFirstIndex(nextScenePath.split(';')[1], fileLines);
      currScene = fileLines[currLine];
      runAfter();
    });
    return;
  }
  currLine = findFirstIndex(nextScenePath, fileLines);
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
setBg = (id, bg) => {
  const elem = document.getElementById(id);
  if (bg.startsWith('#')) {
    elem.style.backgroundColor = bg;
    elem.style.backgroundImage = 'none';
  } else {
    elem.style.backgroundImage = `url("./src/images/backgrounds/${bg}.png")`;
    elem.style.backgroundColor = 'transparent';
  }
}

const animateParamChange = (id, param, i, units = '', start = 0, end = 1, time = 1, runAfter = () => {}) => {
  flags[i] = true;
  const elem = document.getElementById(id);
  elem.style[param] = `${start}${units}`;

  let currPos = start;
  let startTime = performance.now();
  let timeDiff = 0;

  const animation = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= time * 1000) {
      elem.style[param] = `${end}${units}`;
      runAfter();
      flags[i] = false;
      return;
    }
  
    currPos = start + (end - start) * (timeDiff / (time * 1000));
    elem.style[param] = `${currPos}${units}`;
    requestAnimationFrame(animation);
  }
  animation();
};

const animateParamChangeNoFlags = (id, param, units = '', start = 0, end = 1, time = 1, runAfter = () => {}) => {
  const elem = document.getElementById(id);
  elem.style[param] = `${start}${units}`;

  let currPos = start;
  let startTime = performance.now();
  let timeDiff = 0;

  const animation = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= time * 1000) {
      elem.style[param] = `${end}${units}`;
      runAfter();
      return;
    }
  
    currPos = start + (end - start) * (timeDiff / (time * 1000));
    elem.style[param] = `${currPos}${units}`;
    requestAnimationFrame(animation);
  }
  animation();
};

const animateParamJump = (id, param, i, units = '', start = 0, range = 1, time = 1, runAfter = () => {}) => {
  flags[i] = true;
  const elem = document.getElementById(id);
  elem.style[param] = `${start}${units}`;

  let currPos = start;
  let startTime = performance.now();
  let timeDiff = 0;

  const animation2 = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= (time / 2) * 1000) {
      elem.style[param] = `${start}${units}`;
      runAfter();
      flags[i] =  false;
      return;
    }
  
    currPos = (start + range) + (- range) * (timeDiff / ((time / 2) * 1000));
    elem.style[param] = `${currPos}${units}`;
    requestAnimationFrame(animation2);
  }

  const animation1 = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= (time / 2) * 1000) {
      elem.style[param] = `${start+range}${units}`;
      startTime = performance.now();
      animation2();
      return;
    }
  
    currPos = start + range * (timeDiff / ((time / 2) * 1000));
    elem.style[param] = `${currPos}${units}`;
    requestAnimationFrame(animation1);
  }

  animation1();
};

const animateParamJumpNoFlags = (id, param, units = '', start = 0, range = 1, time = 1, runAfter = () => {}) => {
  const elem = document.getElementById(id);
  elem.style[param] = `${start}${units}`;

  let currPos = start;
  let startTime = performance.now();
  let timeDiff = 0;

  const animation2 = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= (time / 2) * 1000) {
      elem.style[param] = `${start}${units}`;
      runAfter();
      return;
    }
  
    currPos = (start + range) + (- range) * (timeDiff / ((time / 2) * 1000));
    elem.style[param] = `${currPos}${units}`;
    requestAnimationFrame(animation2);
  }

  const animation1 = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= (time / 2) * 1000) {
      elem.style[param] = `${start+range}${units}`;
      startTime = performance.now();
      animation2();
      return;
    }
  
    currPos = start + range * (timeDiff / ((time / 2) * 1000));
    elem.style[param] = `${currPos}${units}`;
    requestAnimationFrame(animation1);
  }

  animation1();
};

const animateLoopParamChange = (id, param, units = '', start = 0, end = 2, time = 1) => {
  const elem = document.getElementById(id);
  let currStart = start;
  let currEnd = end;
  let tmp;

  let currPos = start;
  let startTime = performance.now();
  let timeDiff = 0;

  const animation = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= time * 1000) {
      elem.style[param] = `${currEnd}${units}`;
      startTime = performance.now();
      tmp = currEnd;
      currEnd = currStart;
      currStart = tmp;
    } else {
      currPos = currStart + (currEnd - currStart) * (timeDiff / (time * 1000));
      elem.style[param] = `${currPos}${units}`;
    }
    requestAnimationFrame(animation);
  }
  animation();
};

const animateTextIn = (id, text, i, speed = 50, runAfter = () => {}) => {
  flags[i] = true;
  hideElem('nv-arrow');
  textSkip = false;
  setParam('nv-text-skip', 'zIndex', 2100);
  const elem = document.getElementById(id);

  let prewTime = performance.now();
  let currTime = performance.now();
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
    currTime = performance.now();
    currPos += speed * (currTime - prewTime) / 1000;
    prewTime = currTime;
    textPos = Math.floor(currPos);
    elem.innerHTML = text.slice(0, textPos) + `<span class="hidden-text">${text.slice(textPos)}</span>`;
    requestAnimationFrame(animation);
  };
  animation();
};

const setBubble = (bubbleId, textId, longType) => {
  const bubble = document.getElementById(bubbleId);
  const text = document.getElementById(textId);
  const [type, top, left] = longType.split(';').map((item) => item.trim());
  bubble.style.top = `${42.2 + Number(top)}px`;
  bubble.style.left = `${252.5 + Number(left)}px`;
  const size = type[0];

  if (type.split('-')[1] === '00') {
    bubble.style.backgroundImage = 'none';
  } else {
    bubble.style.backgroundImage = `url("./src/images/bubbles/${type}.png")`;
  }

  if (size === '1') {
    text.style.width = '115px';
  } else if (size === '2') {
    text.style.width = '145px';
  } else if (size === '3') {
    text.style.width = '185px';
  }
};

const drawScene00 = (longType, bg, chars) => {
  flags[0] = true;
  const [char1, char2] = chars.split(';');
  
  setBg('novel-screen', bg);

  hideElem('nv-blackout');
  hideElem('nv-bubble');
  if (char1 === '') {
    hideElem('nv-char0');
    hideElem('nv-char1');
    hideElem('nv-char1');
  } else if (char2 === '') {
    setChar('nv-char0', char1);
    showElem('nv-char0');
    hideElem('nv-char1');
    hideElem('nv-char2');
  } else {
    hideElem('nv-char0');
    setChar('nv-char1', char1);
    showElem('nv-char1');
    setChar('nv-char2', char2);
    showElem('nv-char2');
  }
  drawNext = true;
  flags[0] = false;
};

const drawScene01 = (longType, bg, chars, bubble, text) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');
  let charToJump = 'hidden-elem';

  setBg('novel-screen', bg);
  animateParamChange('nv-bubble', 'opacity', 1, '', 1, 0, 0.2, () => {
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
    setBubble('nv-bubble', 'nv-text', bubble);
    setInnerHTML('nv-text', '');
    animateParamJump(charToJump, 'top', 1, 'px', 0, -10, 0.2);
    animateParamChange('nv-bubble', 'opacity', 2, '', 0, 1, 0.2);
    showElem('nv-bubble');
    animateTextIn('nv-text', text.toUpperCase(), 3, 30, () => {
      animateParamChange('nv-arrow', 'opacity', 4, '', 0, 1, 0.1);
      showElem('nv-arrow');
      flags[0] = false;
    });
  }

 });
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
    animateParamChange('nv-effects', 'opacity', 1, '', 0, 1, 0.7, () => {
      drawNext = true;
      flags[0] = false;
    });
  } else if (type === '1') {
    animateParamChange('nv-effects', 'opacity', 1, '', 1, 0, 0.7, () => {
      drawNext = true;
      flags[0] = false;
      setParam('nv-effects', 'opacity', '0');
      hideElem('nv-effects');
    });
  } else if (type === '2') {
    drawNext = true;
    flags[0] = false;
    setParam('nv-effects', 'opacity', '0');
    hideElem('nv-effects');
  }
};

const drawScene03 = (longType, bg, chars) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');

  setBg('novel-screen', bg);
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
      animateParamChange('nv-char0', 'opacity', 1, '', 0, 1, 0.2, () => {
        drawNext = true;
        flags[0] = false;
      });
    } else {
      setParam('nv-char1', 'opacity', '0');
      setParam('nv-char2', 'opacity', '0');
      showElem('nv-char1');
      showElem('nv-char2');
      animateParamChange('nv-char1', 'opacity', 1, '', 0, 1, 0.2);
      animateParamChange('nv-char2', 'opacity', 2, '', 0, 1, 0.2, () => {
        drawNext = true;
        flags[0] = false;
      });
    }
  } else {
    if (char2 === '') {
      setParam('nv-char0', 'opacity', '1');
      showElem('nv-char0');
      animateParamChange('nv-char0', 'opacity', 1, '', 1, 0, 0.2, () => {
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
      animateParamChange('nv-char1', 'opacity', 1, '', 1, 0, 0.2, () => {
        hideElem('nv-char1');
        setParam('nv-char1', 'opacity', '1');
      });
      animateParamChange('nv-char2', 'opacity', 2, '', 1, 0, 0.2, () => {
        hideElem('nv-char2');
        setParam('nv-char2', 'opacity', '1');
        drawNext = true;
        flags[0] = false;
      });
    }
  }
};

const drawScene04 = (longType, bg, chars) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');
  
  setBg('novel-screen', bg);
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
  animateParamChange('nv-char0', 'left', 1, 'px', start, end, 0.5, () => {
    showElem(goesToChar);
    hideElem('nv-char0');
    setParam('nv-char0', 'left', `${start}px`);
    setParam(comesInChar, 'opacity', '0');
    showElem(comesInChar);
    animateParamChange(comesInChar, 'opacity', 2, '', 0, 1, 0.2, () => {
      drawNext = true;
      flags[0] = false;
    });
  });
};

const drawScene05 = (longType, bg, chars) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  const [char1, char2] = chars.split(';');

  setBg('novel-screen', bg);
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
  animateParamChange(goesOutChar, 'opacity', 1, '', 1, 0, 0.2, () => {
    hideElem(goesOutChar);
    setParam(goesOutChar, 'opacity', '1');
    animateParamChange(movesChar, 'left', 1, 'px', start, end, 0.5, () => {
      showElem('nv-char0');
      hideElem(movesChar);
      setParam(movesChar, 'left', `${start}px`);
      drawNext = true;
      flags[0] = false;
    });
  });
};

const drawScene06 = (longType, scene1, scene2, scene3) => {
  const endScene06 = () => {
    flags[1] =  true;
    animateParamChange('nv-choice-head', 'right', 3, 'px', -18.75, -480, 0.4);
    animateParamChange('nv-variants', 'left', 2, 'px', -18.75, -600, 0.4);
    animateParamChange('nv-choice-hand', 'bottom', 4, 'px', 0, -200, 0.2);
    animateParamChange('nv-choice-bg', 'opacity', 5, '', 1, 0, 0.4, () => {
      hideElem('nv-choice');
      setParam('nv-choice', 'zIndex', '-1000');
      //setParam('html', 'cursor', 'default');
      drawNext = true;
    });
    flags[1] = false;
  };

  flags[0] = true;
  //setParam('html', 'cursor', 'none');
  if (scene3 === '') {
    setParam('nv-var3', 'display', 'none');
  } else {
    setParam('nv-var3', 'display', 'flex');
    setInnerHTML('nv-var3-txt', scene3.split('/')[1].toUpperCase());
    document.getElementById('nv-var3').onclick = () => {
      customNextScenePath = scene3.split('/')[0];
      endScene06();
    };
  }

  document.getElementById('nv-var1').onclick = () => {
    customNextScenePath = scene1.split('/')[0];
    endScene06();
  };
  document.getElementById('nv-var2').onclick = () => {
    customNextScenePath = scene2.split('/')[0];
    endScene06();
  };

  setInnerHTML('nv-var1-txt', scene1.split('/')[1].toUpperCase());
  setInnerHTML('nv-var2-txt', scene2.split('/')[1].toUpperCase());

  setParam('nv-variants', 'left', '-600px');
  setParam('nv-choice-hand', 'bottom', '-200px');
  setParam('nv-choice-head', 'right', '-400px');
  animateParamChange('nv-choice-bg', 'opacity', 5, '', 0, 1, 0.4)
  setParam('nv-choice', 'zIndex', '1000');
  showElem('nv-choice');
  animateParamChange('nv-variants', 'left', 1, 'px', -600, 0, 0.4, () => {
    animateParamChange('nv-variants', 'left', 2, 'px', 0, -18.75, 0.2);
  });
  animateParamChange('nv-choice-head', 'right', 3, 'px', -480, 0, 0.4, () => {
    animateParamChange('nv-choice-head', 'right', 4, 'px', 0, -18.75, 0.2, () => {
      animateParamChange('nv-choice-hand', 'bottom', 5, 'px', -200, 0, 0.2);
    });
  });
  flags[0] = false;
};


const drawBoom = (id, runAfter = () => {}) => {
  const animation = () => {
    if (i > 15) {
      cell.innerHTML = '';
      setParam('dt-bubble1', 'zIndex', '2650');
      setParam('dt-bubble2', 'zIndex', '2650');
      runAfter();
      setParam('nv-no-clicks', 'zIndex', '1000');
      return;
    }
    currTime = performance.now();
    if ( (currTime - prewTime) > nextFrame) {
      boom.style.backgroundImage = `url("./src/images/interface/game/boom${girl}/${i}.png")`;
      i += 1;
      prewTime = currTime;
    }
    requestAnimationFrame(animation);
  }

  setParam('nv-no-clicks', 'zIndex', '2600');
  setParam('dt-effects', 'opacity', '1');
  showElem('dt-effects');
  setParam('dt-bubble1', 'zIndex', '3000');
  setParam('dt-bubble2', 'zIndex', '3000');
  const girl = document.getElementById('game-data').getAttribute('girl');
  let nextFrame = 84;
  let i = 1;
  const cell = document.getElementById(id);
  cell.innerHTML = '<div id="dt-boom"></div>';
  const boom = document.getElementById('dt-boom');
  let prewTime = performance.now();
  let currTime = performance.now();
    animation();
    animateParamJumpNoFlags('dt-game', 'top', 'px', 0, 30, 0.2, () => {
      animateParamChangeNoFlags('dt-effects', 'opacity', '', 1, 0, 1.5, () => {
        hideElem('dt-effects');
      });
      animateParamJumpNoFlags('dt-game', 'top', 'px', 0, 10, 0.5);
    });
    

};

let positiveOutcomeWay = '';
let neutralOutcomeWay = '';
let negativeOutcomeWay = '';

let stepsAmount = 0;
let currGameStep = 0;
let needsToOpen = 0;
let posAnswer = '';
let negAnswer = '';
let cellsOpened = 0;
let gameEvent = '';
let currHealth = 0;
let bombsOpened = 0;
const getGameData = () => {
  const gameData = document.getElementById('game-data');
  cellsOpened = Number(gameData.getAttribute('cells-closed'));
  gameEvent = gameData.getAttribute('game-event');
  currHealth = Number(gameData.getAttribute('curr-health'));
  if (gameEvent === 'win') {
    customNextScenePath = posAnswer;
    drawNext = true;
    return;
  }
  if (gameEvent.split(';')[0] === 'boom') {
    bombsOpened += 1;
    drawBoom(gameEvent.split(';')[1], () => {
      customNextScenePath = negAnswer;
      drawNext = true;
    });
      return;
  }
  if (gameEvent.split(';')[0] === 'loose') {
    drawBoom(gameEvent.split(';')[1], () => {
      customNextScenePath = negAnswer;
      gameEvent = 'loose';
      drawNext = true;
    });
    return;
  }
  if (cellsOpened >= needsToOpen && gameEvent === 'open') {
    customNextScenePath = posAnswer;
    drawNext = true;
    return;
  }
};

const drawScene07 = (longType, ...data) => {
  flags[0] = true;
  const type = longType.split('-')[1];

  setParam('dt-text2', 'display', 'block');

  if (type === '0') {
    gameEvent = '';
    const [char1, char2] = data[0].split(';');
    bombsOpened = 0;
    document.getElementById('game-data').setAttribute('curr-health', '1');
    positiveOutcomeWay = data[1];
    neutralOutcomeWay = data[2];
    negativeOutcomeWay = data[3];
    hideElem('dt-blackout');
    hideElem('dt-bubble1');
    hideElem('dt-bubble2');
    setParam('dt-char1', 'left', '-400px');
    setParam('dt-char2', 'right', '-400px');
    setChar('dt-char1', char1);
    setChar('dt-char2', char2);
    animateParamChange('dt-bg', 'opacity', 5, '', 0, 1, 0.5);
    setParam('date-screen', 'zIndex', '1000');
    showElem('date-screen');
    document.getElementById('start-game').onclick();
    animateParamChange('dt-char1', 'left', 1, 'px', -400, -80, 0.4, () => {
      animateParamChange('dt-char1', 'left', 2, 'px', -80, -100, 0.2);
    });
    animateParamChange('dt-char2', 'right', 3, 'px', -400, -80, 0.4, () => {
      animateParamChange('dt-char2', 'right', 4, 'px', -80, -100, 0.2, () => {
        drawNext = true;
        flags[0] = false;
      });
    });
  } else if (type === '1' || type === '2') {
    setParam('date-screen', 'zIndex', '1000');
    setParam('dt-blackout', 'zIndex', 'initial');
    showElem('dt-blackout');
    const idChar = type === '1' ? 'dt-char1' : 'dt-char2';
    const idBubble = type === '1' ? 'dt-bubble1' : 'dt-bubble2';
    const idText = type === '1' ? 'dt-text1' : 'dt-text2';
    const idArrow = type === '1' ? 'dt-arrow1' : 'dt-arrow2';
    const idHideArrow = type === '1' ? 'dt-arrow2' : 'dt-arrow1';
    const [char, bubble, text] = data;
    const [char1, char2] = char.split(';');
    hideElem(idHideArrow);
    setChar('dt-char1', char1);
    setChar('dt-char2', char2);
    animateParamChange('dt-bubble1', 'opacity', 1, '', 1, 0, 0.2, () => {
      hideElem('dt-bubble1');
    });
    animateParamChange('dt-bubble2', 'opacity', 2, '', 1, 0, 0.2, () => {
      hideElem('dt-bubble2');
      hideElem(idArrow);
      if (text === '') {
        setInnerHTML(idText, '');
        hideElem(idBubble);
        drawNext = true;
        flags[0] = false;
      } else {
        setBubble(idBubble, idText, bubble);
        setInnerHTML(idText, '');
        animateParamJump(idChar, 'top', 2, 'px', 0, -10, 0.2);
        animateParamChange(idBubble, 'opacity', 3, '', 0, 1, 0.2);
        showElem(idBubble);
        animateTextIn(idText, text.toUpperCase(), 4, 30, () => {
          animateParamChange(idArrow, 'opacity', 5, '', 0, 1, 0.1);
          showElem(idArrow);
          flags[0] = false;
        });
      }
    });
  } else if (type === '3') {
    const gameData = document.getElementById('game-data');
    currHealth = Number(gameData.getAttribute('curr-health'));
    gameData.setAttribute('curr-health', `${currHealth + 1}`);
    drawNext = true;
  } else if (type === '4') {
    needsToOpen = Number(data[0]);
    posAnswer = data[1];
    negAnswer = data[2];
    hideElem('dt-arrow1');
    hideElem('dt-arrow2');
    hideElem('dt-blackout');
    setParam('dt-blackout', 'zIndex', '0');
    setParam('date-screen', 'zIndex', '2500');
  } else if (type === '5') {
    if (gameEvent !== 'win' && gameEvent !== 'loose') {
      drawNext = true;
      flags[0] = false;
      return;
    }
    if (gameEvent === 'win') {
      if (bombsOpened <= 0) {
        customNextScenePath = positiveOutcomeWay;
      } else {
        customNextScenePath = neutralOutcomeWay;
      }
    } else if (gameEvent === 'loose') {
      customNextScenePath = negativeOutcomeWay;
    }
    animateParamChange('dt-bubble1', 'opacity', 1, '', 1, 0, 0.2, () => {
      hideElem('dt-bubble1');
    });
    animateParamChange('dt-bubble2', 'opacity', 2, '', 1, 0, 0.2, () => {
      hideElem('dt-bubble2');
    });
    hideElem('dt-blackout');
    animateParamChange('dt-char2', 'right', 3, 'px', -200, -400, 0.5)
    animateParamChange('dt-char1', 'left', 4, 'px', -200, -400, 0.5, () => {
      hideElem('date-screen');
      setParam('date-screen', 'zIndex', '0');
      drawNext = true;
      flags[0] = false;
    });
  } else if (type === '6') {
    setParam('date-screen', 'zIndex', '1000');
    setParam('dt-blackout', 'zIndex', 'initial');
    showElem('dt-blackout');
    const [char, bubble, text] = data;
    const [char1, char2] = char.split(';');
    hideElem('dt-arrow1');
    hideElem('dt-arrow2');
    setChar('dt-char1', char1);
    setChar('dt-char2', char2);
    animateParamChange('dt-bubble1', 'opacity', 1, '', 1, 0, 0.2, () => {
      hideElem('dt-bubble1');
    });
    animateParamChange('dt-bubble2', 'opacity', 2, '', 1, 0, 0.2, () => {
      hideElem('dt-bubble2');
      if (text === '') {
        setInnerHTML('dt-text1', '');
        hideElem('dt-bubble1');
        drawNext = true;
        flags[0] = false;
      } else {
        setBubble('dt-bubble1', 'dt-text1', bubble);
        setInnerHTML('dt-text1', '');
        animateParamChange('dt-bubble1', 'opacity', 3, '', 0, 1, 0.2);
        showElem('dt-bubble1');
        animateTextIn('dt-text1', text.toUpperCase(), 4, 30, () => {
          animateParamChange('dt-arrow1', 'opacity', 5, '', 0, 1, 0.1);
          showElem('dt-arrow1');
          flags[0] = false;
        });
      }
    });
  }
};

const drawScene08 = (longType) => {
  flags[0] =  true;
  animateParamJump('novel-screen', 'top', 1, 'px', 0, 30, 0.2, () => {
    animateParamJump('novel-screen', 'top', 2, 'px', 0, 10, 0.5, () => {
      drawNext = true;
      flags[0] = false;
    });
  });  
}

const animateLoopCircle = (id) => {
  let nextFrame = 160;
  let i = 1;
  const elem = document.getElementById(id);
  let prewTime = performance.now();
  let currTime = performance.now();
  const animation = () => {
    if (document.getElementById('days-screen').style.visibility === 'hidden') {
      return;
    }
    if (i > 3) {
      i = 1;
    }
    currTime = performance.now();
    if ( (currTime - prewTime) > nextFrame) {
      elem.style.backgroundImage = `url("./src/images/interface/days-screen/circle00${i}.png")`;
      i += 1;
      prewTime = currTime;
    }
    requestAnimationFrame(animation);
  }
  animation();
};

const setClockTime = () => {
  const setNumbers = (arr) => {
    for(let i = 1; i <= 4; i += 1) {
      const elem = document.getElementById(`number${i}`);
      elem.style.backgroundImage = `url("./src/images/interface/days-screen/numbers/${arr[i - 1]}.png")`;
    }
  };

  let prewTime = '';
  let currTime = '';
  let date;
  const animation = () => {    
    if (document.getElementById('days-screen').style.visibility === 'hidden') {
      return;
    }
    date = new Date();
    currTime = date.toString().split(' ')[4].slice(0, 5);
    if (currTime !== prewTime) {
      setNumbers(currTime.replace(':', '').split(''));
      prewTime = currTime;
    }
    requestAnimationFrame(animation);
  }
  animation();
}

const drawScene99 = (longType) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  if (type === '0') {
    animateParamChange('days-screen', 'opacity', 1, '', 1, 0, 0.7, () => {
      setParam('days-screen', 'z-index', 0);
      hideElem('days-screen');
      hideElem('days-bubble');
      drawNext = true;
      flags[0] = false;
    });
  } else if (type === '1') {
    setBubble('days-bubble', 'days-text', '1-06;-100;52');
    setInnerHTML('days-text', '');
    setParam('days-screen', 'z-index', '2100');
    animateParamChange('days-screen', 'opacity', 1, '', 0, 1, 0.7, () => {
      animateParamChangeNoFlags('days-bubble', 'opacity', '', 0, 1, 0.2);
      showElem('days-bubble');
      animateTextIn('days-text', 'Выберите день, чтобы начать.'.toUpperCase(), 3, 30);
    });
    showElem('days-screen');
    animateLoopCircle('c1');
    setClockTime();
  }
};

const drawScene = (scene) => {

  setParam('nv-no-clicks', 'zIndex', 2000);
  const type = scene[2];

    hideElem('nv-bubble');
    hideElem('nv-arrow');
    switch (type.split('-')[0]) {
      case '00':
        drawScene00(...scene.slice(2));
        break;
      case '01':
        drawScene01(...scene.slice(2));
        break;
      case '02':
        drawScene02(...scene.slice(2));
        break;
      case '03':
        drawScene03(...scene.slice(2));
        break;
      case '04':
        drawScene04(...scene.slice(2));
        break;
      case '05':
        drawScene05(...scene.slice(2));
        break;
      case '06':
        drawScene06(...scene.slice(2));
        break;
      case '07':
        drawScene07(...scene.slice(2));
        break;
      case '08':
        drawScene08(...scene.slice(2));
        break;
      case '99':
        drawScene99(...scene.slice(2));
        break;
      default:
        drawNext = true;
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

let zoom = 1.6;
const setZoom = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  zoom = Math.min((width / 800), (height/450));
  //setParam('screen', 'transform', `scale(${zoom.toFixed(2)})`);
  setParam('screen', 'zoom', `${(zoom * 100).toFixed(2)}%`);
};

const handMove = (e) => {
  let offset = document.getElementById('screen').getBoundingClientRect();
  var x = (e.pageX - (offset.left) * zoom) / zoom;
  const hand = document.getElementById('nv-choice-hand');
  hand.style.left = `${x - 52}px`;
}
document.addEventListener('mousemove', (e) => {
  handMove(e);
});

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

const animateArrow = (id) => {
  const arrow = document.getElementById(id);
  const startPos = Number(window.getComputedStyle(arrow).bottom.slice(0, -2));
  animateLoopParamChange(id, 'bottom', 'px', startPos - 2, startPos + 2, 0.25);
};

const hideStartScreen = () => {
  setParam('st-click', 'display', 'none');

   const animationBoom = () => {
    if (i >= boomArr.length - 1) {
      setParam('novel-screen', 'background-color', '#ffffff');
      animateParamChangeNoFlags('start-screen', 'opacity', '', 1, 0, 0.7, () => {
        startDay('menu');
        setParam('start-screen', 'display', 'none');
        setParam('start-screen', 'zIndex', '-100');
        setParam('st-image-keeper','background', 'none');
        setParam('st-flame', 'display', 'none');
      });
      
      return;
    }
    currTimeI = performance.now();
    if ( (currTimeI - prewTimeI) > nextFrame) {
      boom.style.backgroundImage = `url("./src/images/interface/start/boom1/${boomArr[i]}.png")`;
      i += 1;
      prewTimeI = currTimeI;
      if (boomArr[i] === 9) {
        animateParamJumpNoFlags('start-screen', 'bottom', 'px', 0, -30, 0.2, () => {
          animateParamJumpNoFlags('start-screen', 'bottom', 'px', 0, -10, 0.5);
        });
      }
    }
    requestAnimationFrame(animationBoom);
  }

  const animationFlame = () => {
    if (j >= flameArr.length - 1) {
      
      return;
    }
    currTimeJ = performance.now();
    if ( (currTimeJ - prewTimeJ) > nextFrame) {
      flame.style.backgroundImage = `url("./src/images/interface/start/flame2/${flameArr[j]}.png")`;
      j += 1;
      prewTimeJ = currTimeJ;
      if (j === 2) {
        
      }
    }
    requestAnimationFrame(animationFlame);
  }

  const boomArr = [1, 2, 2, 2, 2, 3, 4, 6, 6, 6, 6, 8, 3, 3, 3, 3, 3, 9, 10, 11, 12, 13, 14, 14];
  const flameArr = [-1, 0, 1, 2, 3, 4, 6, 6, 6];
  let nextFrame = 84;
  let i = 0;
  let j = 0;
  let prewTimeI = performance.now();
  let currTimeI = performance.now();
  let prewTimeJ = performance.now();
  let currTimeJ = performance.now();
  const boom = document.getElementById('st-boom');
  const flame = document.getElementById('st-flame');
  animationBoom();
};

const animateLoopColorChange = (id, param, start = '00 00 00', end = 'ff ff ff', time = 1) => {
  const elem = document.getElementById(id);
  const parseStart = start.split(' ').map((item) => parseInt(item, 16));
  const parseEnd = end.split(' ').map((item) => parseInt(item, 16));
  let currStart = parseStart;
  let currEnd = parseEnd;
  let tmp;

  let currPos = [...parseStart];
  let startTime = performance.now();
  let timeDiff = 0;

  const animation = () => {
    timeDiff = performance.now() - startTime;

    if (timeDiff >= time * 1000) {
      elem.style[param] = `rgb(${currEnd.join(' ')})`;
      startTime = performance.now();
      tmp = currEnd;
      currEnd = currStart;
      currStart = tmp;
    } else {
      for (let i = 0; i < currPos.length; i += 1){
        currPos[i] = currStart[i] + (currEnd[i] - currStart[i]) * (timeDiff / (time * 1000));
      }
      elem.style[param] = `rgb(${currPos.join(' ')})`;
      console.log(currPos)
    }
    requestAnimationFrame(animation);
  }
  animation();
};

const startDay = (file) => {
  readFile(file, () => {
    currLine = 0;
    currScene = fileLines[0];
    drawScene(currScene);
  });
};

const startDemonstration = () => {
  hideElem('days-screen');
  loop();
  animateArrow('nv-arrow');
  animateArrow('dt-arrow1');
  animateArrow('dt-arrow2');
  //animateLoopColorChange('st-text', 'color', 'ff ff ff', 'e7 4e 7d', 1);
  animateParamChangeNoFlags('protector', 'opacity', '', 1, 0, 0.5, () => {
    setParam('protector', 'display', 'none');
    setParam('protector', 'zIndex', '-100');
    // animateParamChangeNoFlags('st-text', 'opacity', '', 0, 1, 0.5, () => {
    //   animateLoopParamChange('st-text', 'opacity', '', 1, 0, 0.5);
    // });
  });
}

window.onload = startDemonstration;