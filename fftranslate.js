const BTN_IMG_SIZE = 32;
const BTN_IMG_PADDING = 2;
const BTN_SIZE = BTN_IMG_SIZE + 2 * BTN_IMG_PADDING;
let selection;
let selectedText;
let mouseDownEvent;
let translating;

const getTranslateUrl = text =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURI(
    text
  )}`;

const showTranslation = (selection, translated) => {
  // window.alert(translated);
  hide("button");
  const bounds = selection.getRangeAt(0).getBoundingClientRect();
  const top = bounds.top + window.scrollY;
  const bottom = bounds.bottom + window.scrollY;
  const left = bounds.left + window.scrollX;

  const div = document.createElement("div");
  div.id = "fftranslate-popup";
  div.innerHTML = translated;
  // add the (invisible) popup to the DOM to measure it...
  div.style.cssText = "opacity: 0;";
  document.body.appendChild(div);

  // so that we can center it with the selection
  const w = div.offsetWidth;
  const h = div.offsetHeight;
  const over = top - h >= window.scrollY;
  // ...making it visible at the same time
  div.style.cssText = `opacity: 1; top: ${over ? top - h : bottom + 10}px;
    left: ${Math.max(0, left + (bounds.right - bounds.left) / 2 - w / 2)}px;
  `;
};

const onTranslate = m => {
  // console.log(`Translating: "${selectedText}"`);
  translating = true;
  const url = getTranslateUrl(selectedText);
  if (selectedText)
    fetch(url)
      .then(r =>
        r.json().then(v => {
          // google splits the translated text into sentences, for some reason...
          const translated = v[0]
            .map(t => t[0])
            .reduce((acc, cur) => `${acc} ${cur}`, "");
          showTranslation(selection, translated);
        })
      )
      .catch(e => console.err(`rejected, ${e}`));
};

const hide = partialId => {
  const b = document.getElementById(`fftranslate-${partialId}`);
  if (b) b.remove();
  if (partialId === "popup") translating = false;
};

const onMouseDown = e => {
  mouseDownEvent = e;
  if (e.target.id !== "fftranslate-img") hide("button");
  if (e.target.id !== "fftranslate-popup") hide("popup");
};

const onButtonClicked = e => {
  e.preventDefault();
  onTranslate();
  hide("button");
};

const showButton = e => {
  // don't show the button again if we're showing the popup already
  if (translating) return;

  const { pageX, pageY } = e;
  selection = window.getSelection();
  const range = selection.getRangeAt(0);

  // check if something was indeed selected
  if (range.startOffset - range.endOffset === 0) return;

  selectedText = selection.toString().trim();

  const bounds = range.getBoundingClientRect();
  const absoluteTop = bounds.top + window.scrollY;
  const absoluteBottom = bounds.bottom + window.scrollY;
  const absoluteLeft = bounds.left + window.scrollX;
  const absoluteRight = bounds.right + window.scrollX;
  const selectingUp = pageY < mouseDownEvent.pageY;

  // some black magic to try and stick the button as close to the cursor as
  // possible, unless the cursor gets away from the selection
  const buttonTop = Math.max(
    window.scrollY,
    selectingUp
      ? Math.max(absoluteTop, pageY) - BTN_SIZE
      : Math.min(absoluteBottom, pageY)
  );

  const buttonLeft =
    pageX < absoluteLeft
      ? Math.max(window.scrollX, Math.max(pageX, absoluteLeft) - BTN_SIZE)
      : Math.min(absoluteRight, pageX);

  const div = document.createElement("div");
  div.id = "fftranslate-button";
  div.style.cssText = `top: ${buttonTop}px; left: ${buttonLeft}px;`;
  div.onclick = onButtonClicked;

  const img = document.createElement("img");
  img.id = "fftranslate-img";
  img.src = browser.extension.getURL("img/button.png");
  div.appendChild(img);
  document.body.appendChild(div);
};

browser.runtime.onMessage.addListener(onTranslate);
document.onmousedown = onMouseDown;
// delay showButton(), lest we get the stale selection on win.getSelection()
document.onmouseup = e => setTimeout(() => showButton(e), 50);

const head = document.getElementsByTagName("head")[0];
const style = document.createElement("style");
style.type = "text/css";
const css = `
  #fftranslate-button {
    position: absolute;
    line-height: 0;
    box-shadow: 0 3px 6px #ccc;
    border-radius: ${BTN_IMG_SIZE / 2}px;
    z-index: 9999;
  }
  #fftranslate-button:hover {
    cursor: pointer;
  }
  #fftranslate-img {
    width: ${BTN_IMG_SIZE}px;
    height: ${BTN_IMG_SIZE}px;
    background-color: white;
    padding: ${BTN_IMG_PADDING}px;
    border-radius: ${BTN_IMG_SIZE / 2}px;
  }
  #fftranslate-popup {
    position: absolute;
    z-index: 9999;
    background-color: #fcfcfc;
    border: 1px solid #ddd;
    padding: 1em;
    font-size: larger;
    max-width: 600px;
  }
`;
style.appendChild(document.createTextNode(css));
head.appendChild(style);
