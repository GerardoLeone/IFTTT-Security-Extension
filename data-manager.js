importScripts('/firebase/firebase-app-compat.js');
importScripts('/firebase/firebase-compat.js');
importScripts('/firebase/firebase-database-compat.js');

try {

    const firebaseConfig = {
        apiKey: "AIzaSyC9be1y9aJp_FgZt_r1cbInYn0At5RjuSc",
        authDomain: "ifttt-7d462.firebaseapp.com",
        databaseURL: "https://ifttt-7d462-default-rtdb.firebaseio.com",
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

        if (request.action === 'saveData') {

            setServerResponse(request.serverResponseMsg).then( () => {

                getRejectedRuleCounter().then(response => {
                    let counter = response.val() || 0;
                    counter++;

                    setRejectedRuleCounter(counter).then( () => {

                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "icons/nfy_exclamation.png",
                            title: "Attenzione!",
                            message: "È stato rilevato un problema di sicurezza nella tua regola, pertanto ne è stata impedita la creazione.",
                        }, () => {})

                    })
                })

            })
        }
        
        else if(request.action === 'resetServerResponse') { //Resetta il serverResponse (vedi content.js)
            setServerResponse("")
            return true;
        }

        else if(request.action === 'resetRejectedRuleCounter') {
            setRejectedRuleCounter(0).then( () => {
                sendResponse();
            })
            return true;
        }

        else if(request.action === "isBtnStatusOn") { //Modifica lo status del bottone
            getStatus().then(response => {
                sendResponse(response.val())
            })
            return true;
        }

        else if(request.action === "setStatus") {
            setStatus(request.status).then(() => {
                console.log('setStatus')
                sendResponse();
            })
            return true;
        }

        else if(request.action === "getStatus") {
            getStatus().then(response => {
                console.log('getStatus')
                sendResponse(response.val());
            })
            return true;
        }

        else if(request.action === "getServerResponse") {
            getServerResponse().then(response => {
                sendResponse(response.val());
            })
            return true;
        }

        else if(request.action === "getRejectedRuleCounter") {
            getRejectedRuleCounter().then(response => {
                sendResponse(response.val());
            })
            return true;
        }
    });

    // Per aggiornare una singola proprietà all'interno di un nodo esistente
    function setServerResponse(value) {
        return ref.child('serverResponse').set(value);
    }

    function setRejectedRuleCounter(value) {
        return ref.child('rejectedRuleCounter').set(value);
    }

    function setStatus(value) {
        return ref.child('status').set(value);
    }

    // Per ottenere il valore di una specifica proprietà
    function getServerResponse() {
        return ref.child('serverResponse').once('value');
    }

    function getRejectedRuleCounter() {
        return ref.child('rejectedRuleCounter').once('value');
    }

    function getStatus() {
        return ref.child('status').once('value');
    }

} catch(e) {
    //Errore stampato
    console.log(e);
}