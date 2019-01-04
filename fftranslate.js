const getTranslateUrl = text =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURI(text)}`;

const showTranslation = (selection, translated) => {
  window.alert(translated);
  // TODO show a popup instead, here are the selection bounding box coords
  const bounds = selection.getRangeAt(0).getBoundingClientRect();
  console.log(`${bounds.left},${bounds.top} ${bounds.right},${bounds.bottom}`);
};

const onTranslate = m => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText)
    fetch(getTranslateUrl(selectedText))
      .then(r => r.json().then(v => showTranslation(selection, v[0][0][0])))
      .catch(e => console.err(`rejected, ${e}`));
};

const onButtonClicked = e => {
  e.preventDefault();
  onTranslate();
};

const onSelect = s => {
  setTimeout(() => {
    const bounds = window.getSelection().getRangeAt(0).getBoundingClientRect();
    const absoluteLeft = bounds.left + window.scrollX;
    const absoluteTop = bounds.top + window.scrollY;

    const div = document.createElement('div');
    div.id = 'fftranslate-button';
    div.style.cssText = `top: ${absoluteTop - 32}px; left: ${absoluteLeft}px;`;
    div.onclick = onButtonClicked;

    const img = document.createElement('img');
    img.id = 'fftranslate-img';
    img.src = browser.extension.getURL('img/button.png');
    div.appendChild(img);
    document.body.appendChild(div);
  }, 300);
};

const hideFFTranslateButtons = () => {
  const b = document.getElementById('fftranslate-button');
  if (b) b.remove();
};

browser.runtime.onMessage.addListener(onTranslate);
document.onselectstart = onSelect;
document.onclick = hideFFTranslateButtons;

const head = document.getElementsByTagName('head')[0];
const style = document.createElement('style');
style.type = 'text/css';
const css = `
  #fftranslate-button {
    position: absolute;
    line-height: 0;
    box-shadow: 0 3px 6px #ccc;
    z-index: 9999;
  }
  #fftranslate-button:hover {
    cursor: pointer;
  }
  #fftranslate-img {
    width: 32px;
    height: 32px;
  }
`;
style.appendChild(document.createTextNode(css));
head.appendChild(style);
