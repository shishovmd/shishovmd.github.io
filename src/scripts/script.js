const requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const findFirstIndex = (subStr, arr) => {
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].split('_')[0].trim() === subStr) {
      return i;
    }
  }
};

let fileLines = [];
let currScene = '';
let currLine = 0;
let customNextScenePath = '';

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
  let nextScenePath;
  if (customNextScenePath !== '') {
    nextScenePath = customNextScenePath.trim();
    customNextScenePath = '';
  } else {
    nextScenePath = currScene.split('_')[1].trim();
  }

  if (nextScenePath === '') {
    currLine += 1;
    currScene = fileLines[currLine];
    runAfter();
    return;
  }
  if (nextScenePath.includes(';')) {
    readFile(nextScenePath.split(';')[1], () => {
      currLine = findFirstIndex(nextScenePath.split(';')[0], fileLines);
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

const animateParamChangeNoFlags = (id, param, units = '', start = 0, end = 1, speed = 0.2, runAfter = () => {}) => {
  const elem = document.getElementById(id);
  elem.style[param] = `${start}${units}`;

  const step = (end - start) * speed;
  const trustEnd = [end - step, end + step].sort((a, b) => a - b);
  let curr = start;

  const animation = () => {
    if (curr > trustEnd[0] && curr < trustEnd[1]) {
      elem.style[param] = `${end}${units}`;
      runAfter();
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
  setParam('nv-text-skip', 'zIndex', 2100);
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

const setBubble = (id, type) => {};

const drawScene00 = (longType, bg, chars) => {
  flags[0] = true;
  const [char1, char2] = chars.split(';');
  
  setBg('novel-screen', bg);

  hideElem('nv-blackout');
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
    setBubble('nv-bubble', bubble);
    setInnerHTML('nv-text', '');
    animateParamJump(charToJump, 'top', 1, 'px', 0, -10, 0.15);
    animateParamChange('nv-bubble', 'opacity', 2, '', 0, 1, 0.1);
    showElem('nv-bubble');
    animateTextIn('nv-text', text.toUpperCase(), 3, 0.4, () => {
      animateParamChange('nv-arrow', 'opacity', 4);
      showElem('nv-arrow');
      flags[0] = false;
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

const drawScene06 = (longType, scene1, scene2, scene3) => {
  const endScene06 = () => {
    flags[1] =  true;
    animateParamChange('nv-choice-head', 'right', 3, 'px', -18.75, -480, 0.05);
    animateParamChange('nv-choice-hand', 'bottom', 4, 'px', 0, -200, 0.07);
    animateParamChange('nv-variants', 'left', 2, 'px', -18.75, -600, 0.05);
    animateParamChange('nv-choice-bg', 'opacity', 5, '', 1, 0, 0.1, () => {
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
  animateParamChange('nv-choice-bg', 'opacity', 5, '', 0, 1, 0.1)
  setParam('nv-choice', 'zIndex', '1000');
  showElem('nv-choice');
  animateParamChange('nv-variants', 'left', 1, 'px', -600, 0, 0.05, () => {
    animateParamChange('nv-variants', 'left', 2, 'px', 0, -18.75, 0.05);
  });
  animateParamChange('nv-choice-head', 'right', 3, 'px', -480, 0, 0.05, () => {
    animateParamChange('nv-choice-head', 'right', 4, 'px', 0, -18.75, 0.05, () => {
      animateParamChange('nv-choice-hand', 'bottom', 5, 'px', -200, 0, 0.07);
    });
  });
  flags[0] = false;
};


const drawBoom = (id, runAfter = () => {}) => {
  runAfter();

};

let positiveOutcomeWay = '';
let neutralOutcomeWay = '';
let negativeOutcomeWay = '';

let needsToOpen = 0;
let posAnswer = '';
let negAnswer = '';
let cellsOpened = 0;
let gameEvent = '';
let currHealth = 0;
const getGameData = () => {
  const gameData = document.getElementById('game-data');
  cellsOpened = Number(gameData.getAttribute('cells-closed'));
  gameEvent = gameData.getAttribute('game-event');
  currHealth = Number(gameData.getAttribute('curr-health'));
  console.log(currHealth, gameEvent, cellsOpened)
  if (gameEvent === 'win') {
    customNextScenePath = posAnswer;
    drawNext = true;
    return;
  }
  if (gameEvent.split(';')[0] === 'boom') {
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
  if (cellsOpened >= needsToOpen) {
    console.log(posAnswer);
    customNextScenePath = posAnswer;
    drawNext = true;
    return;
  }
};

const drawScene07 = (longType, ...data) => {
  flags[0] = true;
  if (gameEvent === 'win') {
    if (currHealth >= 2) {
      customNextScenePath = positiveOutcomeWay;
    } else {
      customNextScenePath = neutralOutcomeWay;
    }
  } else if (gameEvent === 'loose') {
    customNextScenePath = negativeOutcomeWay;
    console.log(customNextScenePath);
  }
  gameEvent = '';
  const type = longType.split('-')[1];

  setParam('dt-text2', 'display', 'block');
  setParam('dt-text3', 'display', 'none');

  if (type === '0') {
    const [char1, char2] = data[0].split(';');
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
    animateParamChange('dt-bg', 'opacity', 5, '', 0, 1, 0.1);
    setParam('date-screen', 'zIndex', '1000');
    showElem('date-screen');
    document.getElementById('start-game').onclick();
    animateParamChange('dt-char1', 'left', 1, 'px', -400, -180, 0.05, () => {
      animateParamChange('dt-char1', 'left', 2, 'px', -180, -200, 0.05);
    });
    animateParamChange('dt-char2', 'right', 3, 'px', -400, -180, 0.05, () => {
      animateParamChange('dt-char2', 'right', 4, 'px', -180, -200, 0.05, () => {
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
    hideElem(idHideArrow);
    setChar(idChar, char);
    animateParamChange(idBubble, 'opacity', 1, '', 1, 0, 0.1, () => {
      hideElem(idArrow);
      if (text === '') {
        setInnerHTML(idText, '');
        hideElem(idBubble);
        drawNext = true;
        flags[0] = false;
      } else {
        setBubble(idBubble, bubble);
        setInnerHTML(idText, '');
        animateParamJump(idChar, 'top', 2, 'px', 0, -10, 0.15);
        animateParamChange(idBubble, 'opacity', 3, '', 0, 1, 0.1);
        showElem(idBubble);
        animateTextIn(idText, text.toUpperCase(), 4, 0.4, () => {
          animateParamChange(idArrow, 'opacity', 5);
          showElem(idArrow);
          flags[0] = false;
        });
      }
    });
  } else if (type === '3') {
    const bubble = data[0];
    dateLines = data[1].toUpperCase().split('/');
    hideElem('dt-arrow1');
    hideElem('dt-arrow2');
    setParam('dt-text2', 'display', 'none');
    setParam('dt-text3', 'display', 'block');
  } else if (type === '4') {
    console.log(data);
    needsToOpen = Number(data[0]);
    posAnswer = data[1];
    negAnswer = data[2];
    hideElem('dt-arrow1');
    hideElem('dt-arrow2');
    hideElem('dt-blackout');
    setParam('dt-blackout', 'zIndex', '0');
    setParam('date-screen', 'zIndex', '2500');
  } else if (type === '5') {
    animateParamChange('dt-bubble1', 'opacity', 1, '', 1, 0, 0.1, () => {
      hideElem('dt-bubble1');
    });
    animateParamChange('dt-bubble2', 'opacity', 2, '', 1, 0, 0.1, () => {
      hideElem('dt-bubble2');
    });
    hideElem('dt-blackout');
    animateParamChange('dt-char2', 'right', 3, 'px', -200, -400, 0.05)
    animateParamChange('dt-char1', 'left', 4, 'px', -200, -400, 0.05, () => {
      hideElem('date-screen');
      setParam('date-screen', 'zIndex', '0');
      drawNext = true;
      flags[0] = false;
    });
  }
};


const drawScene99 = (longType) => {
  flags[0] = true;
  const type = longType.split('-')[1];
  if (type === '0') {
    animateParamChange('days-screen', 'opacity', 1, '', 1, 0, 0.03, () => {
      setParam('days-screen', 'z-index', 0);
      hideElem('days-screen');
      drawNext = true;
      flags[0] = false;
    });
  } else if (type === '1') {
    setParam('days-screen', 'z-index', '2100');
    showElem('days-screen');
    animateParamChange('days-screen', 'opacity', 1, '', 0, 1, 0.03);
  }
};

const drawScene = (scene) => {
  setParam('nv-no-clicks', 'zIndex', 2000);
  const type = scene.split('_')[2].trim()

  animateParamChange('nv-bubble', 'opacity', 1, '', 1, 0, 0.1, () => {
    hideElem('nv-bubble');
    hideElem('nv-arrow');
    switch (type.split('-')[0]) {
      case '00':
        drawScene00(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '01':
        drawScene01(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '02':
        drawScene02(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '03':
        drawScene03(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '04':
        drawScene04(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '05':
        drawScene05(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '06':
        drawScene06(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '07':
        drawScene07(...scene.split('_').slice(2).map((item) => item.trim()));
        break;
      case '99':
        drawScene99(...scene.split('_').slice(2).map((item) => item.trim()));
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

let zoom = 1;
const setZoom = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  zoom = Math.min((width / 800), (height/450));
  //setParam('screen', 'transform', `scale(${zoom.toFixed(2)})`);
  setParam('screen', 'zoom', `${(zoom * 100).toFixed(2)}%`);
};

const handMove = (e) => {
  let offset = document.getElementById('screen').getBoundingClientRect();
  var x = (e.pageX - offset.left) / zoom;
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
      console.log(currScene);
      drawScene(currScene);
    });
  }
  requestAnimationFrame(loop);
};

const animateArrow = (id) => {
  const arrow = document.getElementById(id);
  const startPos = Number(window.getComputedStyle(arrow).bottom.slice(0, -2));
  animateLoopParamChange(id, 'bottom', 'px', startPos, 2);
};


const makeCalendar = () => {
  const container = document.getElementById('calendar');
}

const hideStartScreen = () => {
  //анимация
  setParam('start-screen', 'display', 'none');
  setParam('start-screen', 'zIndex', '-100');
}

const startDay = (file) => {
  readFile(file, () => {
    currLine = 0;
    currScene = fileLines[0];
    drawScene(currScene);
  });
};

const startDemonstration = () => {
  loop();
  animateArrow('nv-arrow');
  animateArrow('dt-arrow1');
  animateArrow('dt-arrow2');
  animateParamChangeNoFlags('protector', 'opacity', '', 1, 0, 0.03, () => {
    setParam('protector', 'display', 'none');
    setParam('protector', 'zIndex', '-100');
    animateParamChangeNoFlags('st-text', 'opacity', '', 0, 0.5, 0.05, () => {
      animateLoopParamChange('st-text', 'opacity', '', 0.5, 0.5, 0.06);
    });
  })
}

window.onload = startDemonstration;