const changeBubble1 = () => {
  const el = document.getElementById('nv-bubble');
  el.style.justifyContent = 'start';
  el.style.height = '300px';
  el.style.width = '200px';
  el.style.backgroundColor = '#FFFFFF'
  const text = document.getElementById('nv-text');
  text.innerHTML = 'Вариант 1'.toUpperCase();

}

const changeBubble2 = () => {
  const el = document.getElementById('nv-bubble');
  el.style.justifyContent = 'end';
  el.style.height = '200px';
  el.style.width = '200px';
  el.style.backgroundColor = '#FFFFFF'
  const text = document.getElementById('nv-text');
  text.innerHTML = 'Вариант 2'.toUpperCase();
    
}

const changeBubble3 = () => {
  const el = document.getElementById('nv-bubble');
  el.style.justifyContent = 'start';
  el.style.height = '200px';
  el.style.width = '300px';
  el.style.backgroundColor = '#678590'
  const text = document.getElementById('nv-text');
  text.innerHTML = 'Вариант 3'.toUpperCase();
}