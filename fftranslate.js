const getTranslateUrl = text =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURI(text)}`;

const showTranslation = (selection, translated) => {
  window.alert(translated);
  // TODO show a popup instead, here are the selection bounding box coords
  const bounds = selection.getRangeAt(0).getBoundingClientRect();
  // console.log(`${bounds.left},${bounds.top} ${bounds.right},${bounds.bottom}`);
};

const onTranslate = m => {
  // console.log(`Translating: "${selectedText}"`);
  if (selectedText)
    fetch(getTranslateUrl(selectedText))
      .then(r => r.json().then(v => showTranslation(selection, v[0][0][0])))
      .catch(e => console.err(`rejected, ${e}`));
};

const hideFFTranslateButtons = () => {
  const b = document.getElementById('fftranslate-button');
  if (b) {
    b.remove();
  }
};

const onMouseDown = e => {
  if (e.target.id !== 'fftranslate-img')
    hideFFTranslateButtons();
}

const onButtonClicked = e => {
  e.preventDefault();
  onTranslate();
  hideFFTranslateButtons();
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
`;
style.appendChild(document.createTextNode(css));
head.appendChild(style);
