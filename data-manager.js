importScripts('/firebase/firebase-app-compat.js');
importScripts('/firebase/firebase-compat.js');
importScripts('/firebase/firebase-database-compat.js');

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
    const db = firebase.database(app);

    var ref = db.ref(); //Riferimento al DB

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

        else if(request.action === "saveData") {

            //Prendo l'email registrata in locale
            chrome.storage.local.get(['email', 'rejectedRuleCounter', 'status'], function(result) {
                let email = result.email;
                let firebaseEmail = convertPointsToCommas(email);
                let rejectedRuleCounter = result.rejectedRuleCounter;
                let btnStatus = result.status;

                //ref.child(firebaseEmail).child('serverResponse').set(serverResponse)
                ref.child(firebaseEmail).child('rejectedRuleCounter').set(rejectedRuleCounter)
                ref.child(firebaseEmail).child('status').set(btnStatus);

            })
            return true;
        }

        else if(request.action === "registerPC") {

            console.log("EMAIL DEBUG: "+ request.email)
            ref.child(request.email).once("value")
            .then((snapshot) => {
                console.log("EXISTS DEBUG: " + snapshot.exists());
                if (snapshot.exists()) { //L'email esiste
                    //Scrivo i dati dal DB in locale
                    const emailData = snapshot.val(); // Ottieni l'oggetto dati dell'email
                    const status = emailData.status;
                    const rejectedRuleCounter = emailData.rejectedRuleCounter;

                    chrome.storage.local.set({
                        status: status,
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

function convertPointsToCommas(inputString) {
    return inputString.replace(/\./g, ',');
}

function convertCommasToPoints(inputString) {
    return inputString.replace(/,/g, '.');
}