/*
    Funzionalità content script:
    Le funzionalità del content script vengono definite quando la pagina carica per la prima volta perchè devo caricare i dati (più precisamente lo stato del bottone)
    e decidere se eseguire le azioni di check della sicurezza dei dati o meno.
*/
$(window).on('load', function() {
    let url = window.location.href;
    console.log(url)
    if(url === URL_CREATION)
    {
        chrome.runtime.sendMessage({ action: 'resetServerResponse' }); //al primo caricamento della pagina, resetto il messaggio sulla sicurezza
        chrome.runtime.sendMessage({ action: 'isBtnStatusOn'}, function(response) {
            let btnStatus = response
            console.log("status: "+ btnStatus)

            pageTitle = "None";

            jsonOutput = {}

            if(btnStatus) //Se il bottone è acceso
            {
                // Seleziona l'elemento header
                const headerElement = $('header')[0];

                // Crea un observer per rilevare l'aggiunta e le modifiche dei nodi
                const observer = new MutationObserver(function(mutationsList, observer) {
                    for (const mutation of mutationsList) {
                        for (const addedNode of mutation.addedNodes) {
                            // Verifica se l'elemento aggiunto è un h1
                            if (addedNode.tagName === 'H1') {
                                pageTitle = $(addedNode).text();
                            }
                        }
                        
                        // Verifica se il nodo modificato è un TextNode (cambio testo)
                        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
                            // Verifica se il nodo padre è un h1
                            if (mutation.target.parentNode.tagName === 'H1') {
                                pageTitle = $(mutation.target.parentNode).text();

                            }
                        }

                        if(pageTitle === PAGE_TITLE_REVIEW) { //TODO: Appena arrivo nella Review, devo effettuare la chiamata Ajax al server passando i parametri acquisiti dalla regola.
                            //TODO: un altro modo per prendere parametri è sicuramente quello di selezionarli uno a uno (per esempio usare il selettore "input, textarea, selection" ecc..)
    
                            $(document).on('DOMSubtreeModified', '.preview__cta___mwtgs button', function() {
    
                                $(this).prop("disabled", true);
                                $(this).hide();
                                
                                $(".preview__cta___mwtgs").html("<button class='button-primary' id='btn-finish'>Finish</button>")
                            })
                        }

                    }
                });

                // Configura l'observer per rilevare l'aggiunta e le modifiche dei nodi
                const observerConfig = {
                    childList: true,
                    subtree: true,
                    characterData: true, // Rileva le modifiche al testo dei nodi
                };

                // Avvia l'observer sull'elemento header
                observer.observe(headerElement, observerConfig);

                $(document).on('click', 'form input[type="submit"][role="button"]', function() {
                    switch(pageTitle)
                    {
                        case PAGE_TITLE_COMPLETE_TRIGGER_FIELDS:   
                        case PAGE_TITLE_EDIT_TRIGGER_FIELDS:
                            jsonOutput[MAP_KEY_TRIGGER] = fetchInputs();
                            console.log('MAP_KEY_TRIGGER:')
                            console.log(jsonOutput)
                        break;

                        case PAGE_TITLE_COMPLETE_ACTION_FIELDS:
                        case PAGE_TITLE_EDIT_ACTION_FIEDLS:
                            jsonOutput[MAP_KEY_ACTION] = fetchInputs();
                            console.log('MAP_KEY_ACTION:')
                            console.log(jsonOutput)
                        break;                 
                    }
                })

                $(document).on('click', '#btn-finish', function(){ //se clicco sul pulsante di fine, mando il json al server esterno

                    //Prendo alla fine il titolo
                    jsonOutput[MAP_KEY_TITLE] = $("div.growing-text-area div").text()
            

                    console.log(jsonOutput)
                    /*$.ajax({
                        url: 'external-server-url',
                        type: 'POST',
                        data: JSON.stringify(jsonOutput), //Converto l'oggetto JSON in una stringa JSON
                        success: function(response) {
                            // La risposta dal server è stata ricevuta con successo
                            console.log(response);
                        },
                        error: function(error) {
                            // Si è verificato un errore durante la richiesta
                            console.log(error);
                        }
                    });*/
                    
                    //TODO: mando la richiesta al server:
                
                    /*
                    //Se la regola è sicura:
                    
                    $(".preview__cta___mwtgs button").click()
                    
                    */
            
                    //Se la regola non è sicura (dunque il server mi passa una stringa con i problemi):
            
                    let serverResponse  = "Ci sono problemi in questa regola perchè i parametri non sono sicuri e dovresti risolvere.";
                    chrome.runtime.sendMessage({ 
                        action: 'notifySecurityProblem', 
                        serverResponseMsg: serverResponse
                    });
            
                })
            }
        })
    } else if(url === URL_EXPLORE) {
        var accountDropdown = $('.account-dropdown');

        // Seleziona il div figlio con l'attributo "data-react-class" e "data-react-props" specifici
        var targetDiv = accountDropdown.find('div[data-react-class="App.Comps.UnifiedProfileDropdown"]');

        // Ottieni l'attributo "data-react-props"
        var dataReactProps = targetDiv.attr('data-react-props');

        // Decodifica la stringa JSON nell'oggetto JavaScript
        var propsObject = JSON.parse(dataReactProps);

        // Estrai l'email dall'oggetto propsObject
        var email = propsObject.email; //TODO: rendere globale

        console.log(email); // Stampa l'email nella console

        //TODO: controllare che succede se non è loggato

        chrome.storage.local.set({email: email}, () => {
            
            //TODO: se registered è false, prendere i dati dal DB e portarli in locale, se registered è true, lavorare solo in locale
            chrome.storage.local.get("registeredPC", (response) => {
                if(!response.registeredPC) //Se non è registrato, quindi è la prima volta che usa questo pc per questa estensione, deve caricare i dati (se l'email è registrata)
                {   
                    let firebaseEmail = convertPointsToCommas(email);
                    chrome.runtime.sendMessage({
                        action: 'registerPC', //Verifico che l'email esista
                        email: firebaseEmail
                    })
                }
            })

        });
    }

});

function fetchInputs()
{
    var jsonObj = {};

    // Selezionare tutti gli elementi <li> con classe "field"
    $('form li.field').each(function() {
        var label = $(this).find('span.field-name.label').text();

        // Selezionare tutti gli elementi :input all'interno dello span con classe "input"
        var inputs = $(this).find('span.input :input:not(button):not(input[type="submit"])');

        // Creare un array per memorizzare i valori degli input
        var inputValues = [];

        // Scorrere tutti gli input
        inputs.each(function() {
            var inputValue = $(this).val();
            inputValues.push(inputValue);
        });

        // Aggiungere il valore dell'input alla lista corrispondente nel JSON
        jsonObj[label] = inputValues;
        //console.log('JSONOBJ: ')
        //console.log(jsonObj)
    });
    return jsonObj;
}

const PAGE_TITLE_CREATE = "Create"
const PAGE_TITLE_CHOOSE_SERVICE = "Choose a service"

const PAGE_TITLE_CHOOSE_TRIGGER = "Choose a trigger"
const PAGE_TITLE_COMPLETE_TRIGGER_FIELDS = "Complete trigger fields"
const PAGE_TITLE_EDIT_TRIGGER_FIELDS = "Edit trigger fields"

const PAGE_TITLE_CHOOSE_ACTION = "Choose an action"
const PAGE_TITLE_COMPLETE_ACTION_FIELDS = "Complete action fields"
const PAGE_TITLE_EDIT_ACTION_FIEDLS = "Edit action fields"

const PAGE_TITLE_REVIEW = "Review and finish"

const MAP_KEY_TRIGGER = "trigger"
const MAP_KEY_ACTION = "action"
const MAP_KEY_TITLE = "title"

const URL_CREATION = "https://ifttt.com/create"
const URL_EXPLORE = "https://ifttt.com/explore"

function convertPointsToCommas(inputString) {
    return inputString.replace(/\./g, ',');
}

function convertCommasToPoints(inputString) {
    return inputString.replace(/,/g, '.');
}