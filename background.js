chrome.runtime.onInstalled.addListener(() => {
    console.log('L\'estensione è stata installata o aggiornata.');
  });
  
  chrome.tabs.onActivated.addListener((tab) => {
    console.log('La scheda attiva è stata cambiata.');
    // Puoi eseguire altre azioni qui...
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Messaggio ricevuto:', message);
    // Puoi eseguire altre azioni qui...
  });

  self.addEventListener('fetch', function(event) {
    const requestUrl = new URL(event.request.url);

    console.log('L url richiesto è ' + requestUrl)
  });