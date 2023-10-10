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
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        if (request.action === 'notifySecurityProblem') {

            //Caso in cui non ci sono ingredients
            if(!request.jsonOutput[MAP_KEY_TRIGGER][MAP_KEY_INGREDIENT])
                request.jsonOutput[MAP_KEY_TRIGGER][MAP_KEY_INGREDIENT] = "Empty"

            if(!request.jsonOutput[MAP_KEY_ACTION][MAP_KEY_INGREDIENT])
                request.jsonOutput[MAP_KEY_ACTION][MAP_KEY_INGREDIENT] = "Empty"

            saveRule(request.email, request.jsonOutput)

            // Salva i dati ricevuti nell'archivio di storage locale
            chrome.storage.local.set({ serverResponse: request.serverResponseMsg }, () => {
                chrome.storage.local.get(['rejectedRuleCounter', 'acceptedRuleCounter'], (response) => {
                
                    let counter = response.rejectedRuleCounter || 0;
                    counter++;
                
                    chrome.storage.local.set({ rejectedRuleCounter: counter }, () => {

                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "icons/nfy_exclamation.png",
                            title: "Attenzione!",
                            message: "È stato rilevato un problema di sicurezza nella tua regola, pertanto ne è stata impedita la creazione.",
                        }, () => {})

                        saveRuleCounter(request.email, response.acceptedRuleCounter, counter);

                    });
                });
            });

        }

        else if(request.action === "isBtnStatusOn") { //Modifica lo status del bottone
            chrome.storage.local.get("status", (response) => {
                sendResponse(response.status)
            })
            return true;
        }

        else if(request.action === "saveRule") {

            //Caso in cui non ci sono ingredients
            if(!request.jsonOutput[MAP_KEY_TRIGGER][MAP_KEY_INGREDIENT])
                request.jsonOutput[MAP_KEY_TRIGGER][MAP_KEY_INGREDIENT] = "Empty"

            if(!request.jsonOutput[MAP_KEY_ACTION][MAP_KEY_INGREDIENT])
                request.jsonOutput[MAP_KEY_ACTION][MAP_KEY_INGREDIENT] = "Empty"
            
            saveRule(request.email, request.jsonOutput)

            chrome.storage.local.get(['rejectedRuleCounter', 'acceptedRuleCounter'], (response) => {
            
                let counter = response.acceptedRuleCounter || 0;
                counter++;
            
                chrome.storage.local.set({ acceptedRuleCounter: counter }, () => {
                    saveRuleCounter(request.email, counter, response.rejectedRuleCounter);
                });
            });
            return true;
        }
        
        else if(request.action === "saveRuleCounter") {
            saveRuleCounter(request.email, request.acceptedRuleCounter, request.rejectedRuleCounter);
            return true;
        }

        else if(request.action === "registerPC") {

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
    let accepted = acceptedRuleCounter || 0;
    let rejected = rejectedRuleCounter || 0;

    db.collection(email)
      .doc("rules")
      .set({
        accepted: accepted,  
        rejected: rejected
      })
}

function saveRule(email, json)
{
    chrome.storage.local.get(['acceptedRuleCounter', 'rejectedRuleCounter'], (response) => {
        let newRuleId = (response.acceptedRuleCounter || 0)+(response.rejectedRuleCounter || 0)+1;

        db.collection(email)
          .doc("regola"+newRuleId)
          .set(json)
    })
}

/*
    Quando si chiudono tutte le schede (chiusura browser o manuale) deve salvare i dati nel DB
*/
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    
    chrome.storage.local.get('status', (response) => {
        if (chrome.runtime.lastError) {
            console.error('[ONREMOVED ERROR] Errore nell\'accesso ai dati di stato: ' + chrome.runtime.lastError);
            return;
        }
        
        if (response.status) { // Se è ON
            chrome.tabs.query({ url: "https://ifttt.com/*" }, function(tabs) {
                if (chrome.runtime.lastError) {
                    console.error('[ONREMOVED ERROR] Errore nell\'accesso alle schede: ' + chrome.runtime.lastError);
                    return;
                }
                
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

const MAP_KEY_CHANNEL = "channel"
const MAP_KEY_DESC = "desc"
const MAP_KEY_INGREDIENT = "ingredient"