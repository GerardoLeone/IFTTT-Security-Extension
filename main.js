$(window).on('load', function() {
    updateRulesRejectedText()
})

/*
    Funzionalità bottone on off
*/
let btnPower = $('#btn-on-off');
btnPower.click(function () {

    chrome.tabs.query({}, tabs => {

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

        //Se accendo/spengo il bottone, aggiorno l'estetica
        chrome.storage.local.get('status', (response) => {
            let power = !(response.status);
            chrome.storage.local.set({status : power}, () => {
                updateBtnPowerStatus(power)
            });
        })
    })
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
    Funzionalità bottone di reset conteggio
*/
let btnResetRotating = false;
let btnReset = $('#btn-reset')
btnReset.click(function() {

    if(!btnResetRotating) {
        btnResetRotating = true;
        
        resetRulesRejected()

        $(this).addClass('rotate-360');

        setTimeout(() => {
            $(this).css('transition', 'none')
        }, 450);

        setTimeout(() => {
            $(this).removeClass('rotate-360')
        }, 500);

        setTimeout(() => {
            $(this).css('transition', 'transform 0.5s')
            btnResetRotating = false;
        }, 550);
    }
})

function resetRulesRejected()
{
    //Imposto il contatore delle regole rifiutate a 0 e salvo in locale
    chrome.storage.local.set({ rejectedRuleCounter: 0 }, () => {
        $("#rules-rejected-counter").text(0)
    });
}

/*
    Funzionalità di caricamento estetica
*/
function updateRulesRejectedText()
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
    chrome.storage.local.get('rejectedRuleCounter', (response) => {
        let counter = response.rejectedRuleCounter || 0;
        $("#rules-rejected-counter").text(counter)
    });

    //Aggiorno lo stato del bottone
    chrome.storage.local.get('status', (response) => {
        updateBtnPowerStatus(response.status)
    })
}

const URL_CREATION = "https://ifttt.com/create"