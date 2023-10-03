$(window).on('load', function() {
    updateRulesCounterText()

    //Reset rules details
    $("#rule-details").hide()

    chrome.storage.local.get('email', (response) => {
        let email = response.email;
        if(!email)
            $("#txt-email").text("Nessuna email collegata.")
        else
            $("#txt-email").text(email);
    })
})

/*
    Funzionalità bottone on off
*/
let btnPower = $('#btn-on-off');
btnPower.click(function () {

    chrome.tabs.query({}, tabs => {

        //Se sono nella pagina di creazione (login già effettuato quindi) non devo poter accendere/spegnere l'estensione
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            // Controlla se l'URL della scheda corrente corrisponde all'URL specificato
            if (tab.url === URL_CREATION) {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/nfy_exclamation.png",
                    title: "Attenzione!",
                    message: "Uscire dalla creazione regola per spegnere l'estensione.",
                }, () => {})
                return;
            }
        }

        //Controllo tutte le schede aperte, se c'è la pagina explore la salvo
        var tabId = -1;
        for(var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            if(tab.url === URL_EXPLORE) {
                tabId = tab.id;
                break;
            }
        }

        //Se accendo/spengo il bottone, aggiorno l'estetica
        chrome.storage.local.get('status', (response) => {
            let power = !(response.status);
            chrome.storage.local.set({status : power}, () => {
                updateBtnPowerStatus(power)
            })

            if(power) //Creo una tab nell'url explore (fondamentale per la registrazione dell'email, vedi content.js)
                chrome.tabs.create({ url: URL_EXPLORE, active: true });
            else //Quando spengo l'estensione, salvo i dati nel DB
            {
                chrome.storage.local.get(['email', 'acceptedRuleCounter', 'rejectedRuleCounter'], function(result) {
                    chrome.runtime.sendMessage({
                        action: 'saveRuleCounter',
                        email: result.email,
                        acceptedRuleCounter: result.acceptedRuleCounter,
                        rejectedRuleCounter: result.rejectedRuleCounter
                    })
                })
            }

        });

    })
});

/*
    Funzionalità bottone "Perchè?"
*/
let btnDetails = $("#btn-details");
let ruleDetails = $("#rule-details");
let ruleDetailsText = $("#rule-details-text");
let animationDuration = 500; // Durata dell'animazione in millisecondi
btnDetails.click(function() {
    let height = ruleDetails.height();

    if (height === 0) {
        // Non è espanso, esegui l'animazione per espandere il div
        ruleDetails.show(); // Mostra il div
        let autoHeight = ruleDetailsText.height(); // Altezza dinamica del contenuto
        ruleDetails.height(0); // Imposta l'altezza iniziale a 0

        chrome.storage.local.get('serverResponse', (response) => {
            let serverResponse = response.serverResponse;
            ruleDetails.animate({ height: autoHeight }, animationDuration, function () {
                // L'animazione è stata completata
                ruleDetails.height("auto"); // Imposta l'altezza su "auto" dopo l'animazione
                btnDetails.text("Mostra meno");
                ruleDetailsText.addClass("visible");
                ruleDetailsText.text(serverResponse);
            });
        });
    } else {
        // È espanso, esegui l'animazione per contrarre il div
        ruleDetails.animate({ height: 0 }, animationDuration, function () {
            // L'animazione è stata completata
            ruleDetails.hide(); // Nascondi il div
            btnDetails.text("Perché?");
            ruleDetailsText.removeClass("visible");
            ruleDetailsText.text("");
        });
    }
});


//Funzione per aggiornare estetica bottone
function updateBtnPowerStatus(status)
{
    if(status)
    {
        btnPower.addClass('btn-on');
        btnPower.removeClass('btn-off');
    } else {
        btnPower.addClass('btn-off');
        btnPower.removeClass('btn-on');

        chrome.storage.local.set({ serverResponse: '' });
        $("#rule-alert").hide();
        $("#rule-no-alert").show();
    }
}

/*
    Funzionalità di caricamento estetica
*/
function updateRulesCounterText()
{
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url;

        if(url === URL_CREATION)
        {
            //Sono nella pagina di creazione, allora aggiorno il serverResponse
            chrome.storage.local.get('serverResponse', (response) => {
                let responseText = response.serverResponse || ""; // Se l'intero non è ancora stato salvato, inizia da 0
                if(responseText.length > 0)
                {
                    $("#rule-alert").show();
                    $("#rule-no-alert").hide();
                } else {
                    $("#rule-alert").hide();
                    $("#rule-no-alert").show();
                }
            });

        } else {
            //Sono in una pagina esterna alla creazione, allora imposto il serverResponse dicendo che non ci sono problemi di sicurezza
            $("#rule-alert").hide();
            $("#rule-no-alert").show();
        }
    });

    //Aggiorno il counter
    chrome.storage.local.get(['rejectedRuleCounter', 'acceptedRuleCounter'], (response) => {
        let rejectedCounter = response.rejectedRuleCounter || 0;
        let acceptedCounter = response.acceptedRuleCounter || 0;
        $("#rules-rejected-counter").text(rejectedCounter)
        $("#rules-accepted-counter").text(acceptedCounter)
    });

    //Aggiorno lo stato del bottone
    chrome.storage.local.get('status', (response) => {
        updateBtnPowerStatus(response.status)
    })
}

const URL_CREATION = "https://ifttt.com/create"
const URL_EXPLORE = "https://ifttt.com/explore"