browser.menus.create({
  id: 'fftranslate',
  title: 'FF translate',
  contexts: ["all"],
  onclick(info, tab) {
    browser.tabs.sendMessage(tab.id, 'translate');
  }
});

