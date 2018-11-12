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

const onSelect = s => {
  setTimeout(() => {
    const bounds = window.getSelection().getRangeAt(0).getBoundingClientRect();
    const absoluteLeft = bounds.left + window.scrollX;
    const absoluteTop = bounds.top + window.scrollY;
    const url = browser.extension.getURL('img/button.png');
    console.log('left: ' + absoluteLeft + ', top: ' + absoluteTop);
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = `position:absolute;width:32px;height:32px;top:${absoluteTop - 32}px;left:${absoluteLeft}px`;
    document.body.appendChild(img);
  }, 500);
};

browser.runtime.onMessage.addListener(onTranslate);
window.onselectstart = onSelect;

console.log('loaded!');
