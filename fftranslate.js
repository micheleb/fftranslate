const getTranslateUrl = text =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURI(text)}`;

const showTranslation = (selection, translated) => {
  // window.alert(translated);
  const bounds = selection.getRangeAt(0).getBoundingClientRect();
  const top = bounds.top + window.scrollY;
  const bottom = bounds.bottom + window.scrollY;
  const left = bounds.left + window.scrollX;
  const div = document.createElement('div');
  div.id = 'fftranslate-popup';
  div.innerHTML = translated;
  div.style.cssText = 'top: -9999px; left: 9999px; max-width: ${bounds.right - bounds.left}px';
  document.body.appendChild(div);
  const w = div.offsetWidth;
  const h = div.offsetHeight;
  const over = top - h >= window.scrollY;
  console.log(`left: ${left}, w: ${w}, b.r: ${bounds.right}, b.l: ${bounds.left}`);
  div.style.cssText = `top: ${over ? top - h : bottom + 10}px;
    left: ${left + (bounds.right - bounds.left) / 2 - w / 2}px;
  `;
  console.log(`${bounds.left},${bounds.top} ${bounds.right},${bounds.bottom}`);
  hide('button');
};

const onTranslate = m => {
  // console.log(`Translating: "${selectedText}"`);
  if (selectedText)
    fetch(getTranslateUrl(selectedText))
      .then(r => r.json().then(v => showTranslation(selection, v[0][0][0])))
      .catch(e => console.err(`rejected, ${e}`));
};

const hide = partialId => {
  const b = document.getElementById(`fftranslate-${partialId}`);
  if (b) {
    b.remove();
  }
};

const onMouseDown = e => {
  if (e.target.id !== 'fftranslate-img')
    hide('button');
  if (e.target.id !== 'fftranslate-popup')
    hide('popup');
}

const onButtonClicked = e => {
  e.preventDefault();
  onTranslate();
  hide('button');
};

const showButton = () => {

  selection = window.getSelection();
  const range = selection.getRangeAt(0);

  if (range.startOffset - range.endOffset === 0) {
    return;
  }

  selectedText = selection.toString().trim();

  const bounds = range.getBoundingClientRect();
  const absoluteLeft = bounds.left + window.scrollX;
  const absoluteTop = bounds.top + window.scrollY;
  const buttonTop = Math.max(window.scrollY, absoluteTop - 40);

  const div = document.createElement('div');
  div.id = 'fftranslate-button';
  div.style.cssText = `top: ${buttonTop}px; left: ${absoluteLeft}px;`;
  div.onclick = onButtonClicked;

  const img = document.createElement('img');
  img.id = 'fftranslate-img';
  img.src = browser.extension.getURL('img/button.png');
  div.appendChild(img);
  document.body.appendChild(div);
}

var selection;
var selectedText;
browser.runtime.onMessage.addListener(onTranslate);
document.onmousedown = onMouseDown;
document.onmouseup = showButton;

const head = document.getElementsByTagName('head')[0];
const style = document.createElement('style');
style.type = 'text/css';
const css = `
  #fftranslate-button {
    position: absolute;
    line-height: 0;
    box-shadow: 0 3px 6px #ccc;
    border-radius: 16px;
    z-index: 9999;
  }
  #fftranslate-button:hover {
    cursor: pointer;
  }
  #fftranslate-img {
    width: 32px;
    height: 32px;
    background-color: white;
    padding: 2px;
    border-radius: 16px;
  }
  #fftranslate-popup {
    position: absolute;
    z-index: 9999;
    background-color: #fcfcfc;
    border: 1px solid #ddd;
    padding: 1em;
  }
`;
style.appendChild(document.createTextNode(css));
head.appendChild(style);
