const getTranslateUrl = text =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURI(text)}`;

const onTranslate = m => {
  const selected = window.getSelection().toString().trim();
  if (selected)
    fetch(getTranslateUrl(selected))
      .then(r => r.json().then(v => window.alert(v[0][0][0])))
      .catch(e => console.err(`rejected, ${e}`));
};

browser.runtime.onMessage.addListener(onTranslate);

console.log('loaded!');
