importScripts('/firebase/firebase-app-compat.js');
importScripts('/firebase/firebase-compat.js');
importScripts('/firebase/firebase-firestore-compat.js');

try {

    const firebaseConfig = {
        apiKey: "AIzaSyC9be1y9aJp_FgZt_r1cbInYn0At5RjuSc",
        authDomain: "ifttt-7d462.firebaseapp.com",
        databaseURL: "https://ifttt-7d462-default-rtdb.firebaseio.com/",
        projectId: "ifttt-7d462",
        storageBucket: "ifttt-7d462.appspot.com",
        messagingSenderId: "1015752439290",
        appId: "1:1015752439290:web:5e5c8dc3628dde68672043",
        measurementId: "G-PQWGJ3V3WN"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    var db = app.firestore();

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        if (request.action === 'notifySecurityProblem') {
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

        else if(request.action === "saveRule") {
            saveRule(email, request.title, request.trigger, request.action)
            return true;
        }

        else if(request.action === "saveRuleCounter") {
            saveRuleCounter(request.email, request.acceptedRuleCounter, request.rejectedRuleCounter);
            return true;
        }

        else if(request.action === "registerPC") {

            db.collection(request.email)
              .get()
              .then((snapshot) => {
                if(snapshot.exists) { //L'email esiste
                    //Scrivo i dati dal DB in locale
                    const ruleData = snapshot.data().rules;
                    const acceptedRuleCounter = ruleData.accepted;
                    const rejectedRuleCounter = ruleData.rejected;

                    chrome.storage.local.set({
                        acceptedRuleCounter: acceptedRuleCounter,
                        rejectedRuleCounter: rejectedRuleCounter
                    })
                }

            })
            chrome.storage.local.set({registeredPC: true});
            return true;
        }
    });
} catch(e) {
    console.log(e);
}

function saveRuleCounter(email, acceptedRuleCounter, rejectedRuleCounter)
{
    db.collection(email)
      .doc("rules")
      .update({
        accepted: acceptedRuleCounter,  
        rejected: rejectedRuleCounter
      })
}

function saveRule(email, title, trigger, action)
{
    chrome.storage.local.get(['acceptedRuleCounter', 'rejectedRuleCounter'], (response) => {
        let newRuleId = (response.acceptedRuleCounter)+1;

        db.collection(email)
          .doc("regola"+newRuleId)
          .update({
            title: title,
            trigger: trigger,
            action: action
          })

        chrome.storage.local.set({acceptedRuleCounter: newRuleId})

        saveRuleCounter(email, newRuleId, response.rejectedRuleCounter)
    })
}

/*
    Quando si chiudono tutte le schede (chiusura browser o manuale) deve salvare i dati nel DB
*/
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('[ONREMOVED DEBUG] ENTRO')
    chrome.storage.local.get('status', (response) => {
        if (chrome.runtime.lastError) {
            console.error('[ONREMOVED ERROR] Errore nell\'accesso ai dati di stato: ' + chrome.runtime.lastError);
            return;
        }
        
        console.log('[ONREMOVED DEBUG] STATUS: ' + response.status)
        if (response.status) { // Se è ON
            chrome.tabs.query({ url: "https://ifttt.com/*" }, function(tabs) {
                if (chrome.runtime.lastError) {
                    console.error('[ONREMOVED ERROR] Errore nell\'accesso alle schede: ' + chrome.runtime.lastError);
                    return;
                }
                
                console.log('[ONREMOVED DEBUG] LENGTH: ' + tabs.length)
                if (tabs.length === 0) {
                    chrome.storage.local.get(['email', 'acceptedRuleCounter', 'rejectedRuleCounter'], function(result) {
                        saveRuleCounter(result.email, result.acceptedRuleCounter, result.rejectedRuleCounter);
                    });
                }
            });
        }
    });
});