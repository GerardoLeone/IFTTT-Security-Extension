importScripts('/firebase/firebase-app-compat.js');
importScripts('/firebase/firebase-compat.js');
importScripts('/firebase/firebase-firestore-compat.js');

try {

    const firebaseConfig = {
        apiKey: "AIzaSyD5ZjO3pHjgSTgcvL-EjKxnKnyMKAsDVBA",
        authDomain: "ifttt-cac67.firebaseapp.com",
        projectId: "ifttt-cac67",
        storageBucket: "ifttt-cac67.appspot.com",
        messagingSenderId: "432467263119",
        appId: "1:432467263119:web:104e5475be74666ae4bafa",
        measurementId: "G-KJ1C6BFH2K"
    };

    // Initialize Firebase
    /*const app = */
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

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

            let title = JSON.stringify(request.jsonOutput[MAP_KEY_TITLE]);
            let trigger = JSON.stringify(request.jsonOutput[MAP_KEY_TRIGGER])
            let action = JSON.stringify(request.jsonOutput[MAP_KEY_ACTION])

            saveRule(request.email, title, trigger, action)
            return true;
        }
        
        else if(request.action === "saveRuleCounter") {
            saveRuleCounter(request.email, request.acceptedRuleCounter, request.rejectedRuleCounter);
            return true;
        }

        else if(request.action === "registerPC") {

            console.log('REGISTER PC START')
            db.collection(request.email)
              .doc("rules")
              .get()
              .then((doc) => {
                if(doc.exists) { //L'email esiste
                    //Scrivo i dati dal DB in locale
                    const ruleData = doc.data();
                    const acceptedRuleCounter = ruleData.accepted;
                    const rejectedRuleCounter = ruleData.rejected;

                    chrome.storage.local.set({
                        acceptedRuleCounter: acceptedRuleCounter,
                        rejectedRuleCounter: rejectedRuleCounter
                    })

                    console.log('REGISTER SNAPSHOT EXISTS')
                }
                console.log('REGISTER SNAPSHOT CHECK END')
            })
            chrome.storage.local.set({registeredPC: true});
            console.log('REGISTER PC END')
            return true;
        }
    });
} catch(e) {
    console.log(e);
}

function saveRuleCounter(email, acceptedRuleCounter, rejectedRuleCounter)
{
    console.log('[SAVERULECOUNTER] email: ' + email + " | accepted: " + acceptedRuleCounter + " | rejected: " + rejectedRuleCounter)
    db.collection(email)
      .doc("rules")
      .set({
        accepted: acceptedRuleCounter,  
        rejected: rejectedRuleCounter
      })
}

function saveRule(email, title, trigger, action)
{
    console.log('[SAVERULE] title: ' + title + " | trigger: " + trigger + " | " + action + " | email: " + email);
    chrome.storage.local.get(['acceptedRuleCounter', 'rejectedRuleCounter'], (response) => {
        let newRuleId = (response.acceptedRuleCounter || 0)+1;

        console.log("regola"+newRuleId)
        db.collection(email)
          .doc("regola"+newRuleId)
          .set({
            title: title,
            trigger: trigger,
            action: action
          })

        chrome.storage.local.set({acceptedRuleCounter: newRuleId})

        saveRuleCounter(email, newRuleId, response.rejectedRuleCounter || 0)
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

const MAP_KEY_TRIGGER = "trigger"
const MAP_KEY_ACTION = "action"
const MAP_KEY_TITLE = "title"