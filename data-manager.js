chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.action === 'saveData') {
        // Salva i dati ricevuti nell'archivio di storage locale
        chrome.storage.local.set({ serverResponse: request.serverResponseMsg }, () => {
            chrome.storage.local.get('rejectedRuleCounter', (response) => {
            
                let counter = response.rejectedRuleCounter || 0;
                counter++;
            
                chrome.storage.local.set({ rejectedRuleCounter: counter }, () => {

                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icons/nfy_exclamation.png",
                        title: "Attenzione!",
                        message: "È stato rilevato un problema di sicurezza nella tua regola, pertanto ne è stata impedita la creazione.",
                    }, () => {})

                });
            });
        });

    }
    else if(request.action === 'resetServerResponse') //Resetta il serverResponse (vedi content.js)
        chrome.storage.local.set({ serverResponse : "" })

    else if(request.action === "isBtnStatusOn") { //Modifica lo status del bottone
        chrome.storage.local.get("status", (response) => {
            sendResponse(response.status)
        })
        return true;
    }
});